import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { checkerSessions, checks } from "../../db/schema/checks.js";
import type { CheckerAnswers, CheckerResult } from "./evaluate.js";

export class CheckNotFoundError extends Error {}

type PersistCheckInput = {
  userId: string;
  sessionId: string;
  linkedCheckId: string | null; // aus der Session
  requestedCheckId?: string | undefined; // explizit vom Client (Check öffnen)
  formData: CheckerAnswers;
  result: CheckerResult | null; // null = Entwurf
};

/** Speichert die Antworten am richtigen Check und verknüpft die Session damit. */
export async function persistCheck(input: PersistCheckInput): Promise<string> {
  const { userId, sessionId, formData, result } = input;
  const targetId = input.requestedCheckId ?? input.linkedCheckId;

  const values = {
    formData,
    result,
    status: result ? ("completed" as const) : ("draft" as const),
    updatedAt: new Date(),
  };

  return db.transaction(async (tx) => {
    let checkId: string | undefined;

    if (targetId) {
      // userId + deletedAt im WHERE: fremde/gelöschte Checks werden nie getroffen
      const [updated] = await tx
        .update(checks)
        .set(values)
        .where(
          and(
            eq(checks.id, targetId),
            eq(checks.userId, userId),
            isNull(checks.deletedAt)
          )
        )
        .returning({ id: checks.id });

      if (updated) checkId = updated.id;
      else if (input.requestedCheckId) throw new CheckNotFoundError();
      // verknüpfter Check weg (gelöscht)? -> unten neuen anlegen
    }

    if (!checkId) {
      const [created] = await tx
        .insert(checks)
        .values({ userId, currentStep: "0", ...values })
        .returning({ id: checks.id });
      checkId = created!.id;
    }

    await tx
      .update(checkerSessions)
      .set({ checkId })
      .where(eq(checkerSessions.id, sessionId));

    return checkId;
  });
}
