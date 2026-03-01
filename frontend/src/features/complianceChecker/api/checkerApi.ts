
//createSession, patchAnswers, getState, evaluate, deleteSession

import { client } from "./client";
import type { components } from "@/lib/api/checker";

export type CheckerState = components["schemas"]["CheckerState"];
export type CheckerResult = components["schemas"]["CheckerResult"];
export type CheckerAnswers = components["schemas"]["CheckerAnswers"];
export type CheckerAnswersPatch = components["schemas"]["CheckerAnswersPatch"];

function throwOnError(error: unknown): never {
  // openapi-fetch liefert "error" typisiert (ProblemDetails o.ä.), aber wir machen es erstmal simpel
  const msg =
    typeof error === "string"
      ? error
      : (error as any)?.message ??
        (error as any)?.title ??
        "Request failed";
  throw new Error(msg);
}

export async function createSession(): Promise<CheckerState> {
  const { data, error } = await client.POST("/api/checker/session");
  if (error) throwOnError(error);
  return data!;
}

export async function getState(): Promise<CheckerState> {
  const { data, error } = await client.GET("/api/checker/state");
  if (error) throwOnError(error);
  return data!;
}

/**
 * Merge semantics: you pass only changed keys in `patch`.
 * Backend merges into stored answers.
 */
export async function patchAnswers(patch: Partial<CheckerAnswers>): Promise<CheckerState> {
  const body: CheckerAnswersPatch = { answers: patch as CheckerAnswers };
  const { data, error } = await client.PATCH("/api/checker/answers", { body });
  if (error) throwOnError(error);
  return data!;
}

export async function evaluate(): Promise<CheckerResult> {
  const { data, error } = await client.POST("/api/checker/evaluate");
  if (error) throwOnError(error);
  return data!;
}

export async function deleteSession(): Promise<void> {
  const { error } = await client.DELETE("/api/checker/session");
  if (error) throwOnError(error);
}