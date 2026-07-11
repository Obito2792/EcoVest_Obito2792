import { GoogleGenAI } from "@google/genai";

// Vertex AI mode instead of a plain Gemini Developer API key: newly-issued
// "AQ."-format API keys currently hit an account-level Google bug where the
// free tier is either locked at limit:0 or rejected outright with a 401
// ACCESS_TOKEN_TYPE_UNSUPPORTED error (see Google AI Developer forum threads
// on "AQ. key" issues, July 2026). Vertex AI auth uses a real service-account
// credential (OAuth2 under the hood via Application Default Credentials).
//
// Two ways to supply that credential, checked in this order:
//  1. GCP_SERVICE_ACCOUNT_KEY — the *entire contents* of the downloaded
//     service-account JSON key, pasted as one env var. This is the only
//     option that works on Vercel (and other serverless hosts), since there
//     is no persistent local file to point at.
//  2. GOOGLE_APPLICATION_CREDENTIALS — an absolute path to that same JSON
//     file on disk. Only works for local dev (`npm run dev`), where the file
//     actually exists on your machine.
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = process.env.GCP_LOCATION || "us-central1";

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!PROJECT_ID) {
    throw new Error(
      "GCP_PROJECT_ID is not set. Add it to your environment (the project ID from your service-account JSON file) to enable Gemini-powered features."
    );
  }

  const inlineKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
  const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!inlineKey && !keyFilePath) {
    throw new Error(
      "No Google Cloud credentials found. Set GCP_SERVICE_ACCOUNT_KEY (the full service-account JSON key, as one env var — required on Vercel) or GOOGLE_APPLICATION_CREDENTIALS (a local file path, for `npm run dev` only)."
    );
  }

  if (!cachedClient) {
    let credentials: Record<string, unknown> | undefined;
    if (inlineKey) {
      try {
        credentials = JSON.parse(inlineKey);
      } catch {
        throw new Error(
          "GCP_SERVICE_ACCOUNT_KEY isn't valid JSON. Paste the full contents of the service-account key file (starting with '{\"type\": \"service_account\", ...}') as-is."
        );
      }
    }

    cachedClient = new GoogleGenAI({
      vertexai: true,
      project: PROJECT_ID,
      location: LOCATION,
      // Omitted entirely when using the file-path method, so the SDK falls
      // back to Application Default Credentials (which reads
      // GOOGLE_APPLICATION_CREDENTIALS itself) — local dev behavior is
      // unchanged.
      ...(credentials ? { googleAuthOptions: { credentials } } : {}),
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
    // Gemini 2.5+ models spend part of maxOutputTokens on internal "thinking"
    // before writing the visible answer, which was silently truncating our
    // short summaries/rationales mid-sentence. These are simple, low-latency
    // text tasks that don't need extended reasoning, so thinking is disabled
    // to give the full token budget to the actual response text.
    thinkingConfig: { thinkingBudget: 0 },
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
  return Boolean(
    PROJECT_ID && (process.env.GCP_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS)
  );
}
