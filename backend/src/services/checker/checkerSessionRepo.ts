// DB reads and writes 

import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { db } from "../../db/index.js";
import { checkerSessions } from "../../db/schema/checker.js";

import type { CheckerAnswers, CheckerResult } from "./evaluate.js";

export type CheckerSessionRow = InferSelectModel<typeof checkerSessions>;

export function isExpired(expiresAt: Date) {
    return expiresAt.getTime() <= Date.now();
}

export function toState(row: CheckerSessionRow) {
    return {
        sessionId: row.id,
        status: row.status,
        answers: row.answers ?? {},
        result: row.result ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        expiresAt: row.expiresAt,
    };
}

export async function findSessionBySidHash(sidHash: string) {
    const [row] = await db
        .select()
        .from(checkerSessions)
        .where(eq(checkerSessions.sidHash, sidHash))
        .limit(1);

    return row ?? null;
}

export async function createDraftSession(sidHash: string, expiresAt: Date) {
    const [created] = await db
        .insert(checkerSessions)
        .values({
            sidHash,
            status: "draft",
            answers: {},
            result: null,
            expiresAt,
        })
        .returning();

    return created ?? null;
}

export async function touchSession(id: CheckerSessionRow["id"], expiresAt: Date) {
    const [updated] = await db
        .update(checkerSessions)
        .set({
            updatedAt: new Date(),
            expiresAt,
        })
        .where(eq(checkerSessions.id, id))
        .returning();

    return updated ?? null;
}

export async function replaceSessionAnswers(
    id: CheckerSessionRow["id"],
    answers: CheckerAnswers,
    expiresAt: Date
) {
    const [updated] = await db
        .update(checkerSessions)
        .set({
            answers,
            status: "draft",
            result: null,
            updatedAt: new Date(),
            expiresAt,
        })
        .where(eq(checkerSessions.id, id))
        .returning();

    return updated ?? null;
}

export async function finishSessionEvaluation(
    id: CheckerSessionRow["id"],
    answers: CheckerAnswers,
    result: CheckerResult,
    expiresAt: Date
) {
    const [updated] = await db
        .update(checkerSessions)
        .set({
            answers,
            status: "finished",
            result,
            updatedAt: new Date(),
            expiresAt,
        })
        .where(eq(checkerSessions.id, id))
        .returning();

    return updated ?? null;
}

export async function deleteSessionById(id: CheckerSessionRow["id"]) {
    await db.delete(checkerSessions).where(eq(checkerSessions.id, id));
}