// utils/session-merge.ts
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

    const sidHash = hashSid(sid);

    // Anonyme Session suchen
    const [anonSession] = await db
        .select()
        .from(checkerSessions)
        .where(eq(checkerSessions.sidHash, sidHash))
        .limit(1);

    if (!anonSession) return;

    const answers = anonSession.answers as Record<string, unknown>;
    if (answers && Object.keys(answers).length > 0) {
        // Als Check dem User zuordnen
        await db.insert(checks).values({
            userId,
            status: anonSession.status === "finished" ? "completed" : "draft",
            currentStep: "0",
            formData: anonSession.answers,
        });
    }

    // Anonyme Session löschen — Daten sind jetzt im Account
    await db
        .delete(checkerSessions)
        .where(eq(checkerSessions.id, anonSession.id));
}