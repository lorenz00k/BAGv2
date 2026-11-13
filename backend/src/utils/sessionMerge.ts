import { db } from "../db/index.js";
import { checkerSessions } from "../db/schema/checker.js";
import { checks } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { hashSid } from "./checkerSession.js";

export async function mergeAnonymousChecker(
  sid: string | undefined,
  userId: string
): Promise<void> {
  if (!sid) return;

  await db.transaction(async (tx) => {
    // Claim the anonymous session: only one caller can delete it
    const [anonymousSession] = await tx
      .delete(checkerSessions)
      .where(eq(checkerSessions.sidHash, hashSid(sid)))
      .returning();

    if (!anonymousSession) return;

    // migrate if answers are exitsing
    const answers = anonymousSession.answers as Record<string, unknown>;
    if (answers && Object.keys(answers).length > 0) {
      // connect the data to the correct user
      await tx.insert(checks).values({
        userId,
        status: anonymousSession.status === "finished" ? "completed" : "draft",
        currentStep: "0",
        formData: anonymousSession.answers,
      });
    }
  });
}
