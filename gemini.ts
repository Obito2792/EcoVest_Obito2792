import { GoogleGenAI } from "@google/genai";

// Vertex AI mode instead of a plain Gemini Developer API key: newly-issued
// "AQ."-format API keys currently hit an account-level Google bug where the
// free tier is either locked at limit:0 or rejected outright with a 401
// ACCESS_TOKEN_TYPE_UNSUPPORTED error (see Google AI Developer forum threads
// on "AQ. key" issues, July 2026). Vertex AI auth uses a real service-account
// credential (OAuth2 under the hood via Application Default Credentials),
// which sidesteps that bug entirely. GOOGLE_APPLICATION_CREDENTIALS in
// .env.local points at the downloaded service-account JSON key file.
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash-001";
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = process.env.GCP_LOCATION || "us-central1";

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!PROJECT_ID) {
    throw new Error(
      "GCP_PROJECT_ID is not set. Add it to .env.local (the project ID from your service-account JSON file) to enable Gemini-powered features."
    );
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS is not set. Add it to .env.local as the absolute path to your downloaded service-account JSON key file."
    );
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      vertexai: true,
      project: PROJECT_ID,
      location: LOCATION,
    });
  }
  return cachedClient;
}

function extractRetryDelaySeconds(err: unknown): number | null {
  const message = err instanceof Error ? err.message : String(err);
  const match = message.match(/"retryDelay":"(\d+(?:\.\d+)?)s"/);
  return match ? Number(match[1]) : null;
}

function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("429") || message.toLowerCase().includes("too many requests");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls Gemini (via Vertex AI) with a single prompt and returns the plain-text
 * response. Thin wrapper so every API route shares one place to swap models,
 * add retries, or adjust generation config.
 *
 * Retries once on a 429 (rate limit / quota) using the server's suggested
 * `retryDelay` when present, since these are usually transient bursts rather
 * than a fully exhausted quota. If the retry also fails, throws a short,
 * user-facing message instead of the raw Google error blob.
 */
export async function generateText(
  prompt: string,
  opts: { temperature?: number; maxOutputTokens?: number } = {}
): Promise<string> {
  const ai = getClient();
  const config = {
    temperature: opts.temperature ?? 0.4,
    maxOutputTokens: opts.maxOutputTokens ?? 500,
  };

  async function call(): Promise<string> {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config,
    });
    const text = result.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    return text.trim();
  }

  try {
    return await call();
  } catch (err) {
    if (!isRateLimitError(err)) throw err;

    const suggestedDelayMs = extractRetryDelaySeconds(err);
    // Cap the wait so a single chat message never hangs for a long backend
    // suggested delay — a few seconds is worth trying, longer isn't.
    const waitMs = Math.min(suggestedDelayMs ? suggestedDelayMs * 1000 : 4000, 8000);
    await sleep(waitMs);

    try {
      return await call();
    } catch {
      throw new Error(
        "Gemini's rate limit is temporarily exhausted for this model. Wait a minute and try again."
      );
    }
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS);
}
