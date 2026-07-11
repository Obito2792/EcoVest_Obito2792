import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { updateUserProfile } from "@/lib/db";
import { getAccountSummary } from "@/lib/trade";
import { INTEREST_CATEGORIES } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  try {
    const account = await getAccountSummary(session.userId);
    return NextResponse.json(account);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load profile." },
      { status: 500 }
    );
  }
}

// Saved once as onboarding right after sign-up (and editable later from
// account settings, if/when that page exists). Not itself a trade — just
// profile data used to personalize the Recommended For You list and as a
// soft tiebreaker in the reallocation logic.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { firstName, lastName, interests } = await req.json();

    if (typeof firstName !== "string" || firstName.trim().length === 0) {
      return NextResponse.json({ error: "First name is required." }, { status: 400 });
    }
    if (typeof lastName !== "string" || lastName.trim().length === 0) {
      return NextResponse.json({ error: "Last name is required." }, { status: 400 });
    }
    if (!Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: "Select at least one clean-energy interest." },
        { status: 400 }
      );
    }
    const validInterests = interests.filter(
      (i): i is string => typeof i === "string" && (INTEREST_CATEGORIES as readonly string[]).includes(i)
    );
    if (validInterests.length === 0) {
      return NextResponse.json(
        { error: "Select at least one valid clean-energy interest." },
        { status: 400 }
      );
    }

    await updateUserProfile(session.userId, firstName.trim(), lastName.trim(), validInterests);
    const account = await getAccountSummary(session.userId);
    return NextResponse.json(account);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save profile." },
      { status: 500 }
    );
  }
}
