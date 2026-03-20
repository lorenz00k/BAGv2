
//createSession, patchAnswers, getState, evaluate, deleteSession

import { fetchApi } from "@/services/api";
import { client } from "./client";
import type { components } from "@/lib/api/checker";

export type CheckerState = components["schemas"]["CheckerState"];
export type CheckerResult = components["schemas"]["CheckerResult"];
export type CheckerAnswers = components["schemas"]["CheckerAnswers"];
//export type CheckerAnswersPatch = components["schemas"]["CheckerAnswersPatch"];

export type ApiFieldIssue = {
  path?: (string | number)[];
  message: string;
};

export class ApiError extends Error {
  status?: number;
  issues?: ApiFieldIssue[];

  constructor(message: string, options?: { status?: number; issues?: ApiFieldIssue[] }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.issues = options?.issues;
  }
}

function toApiError(error: unknown, httpStatus?: number): ApiError {
  if (typeof error === "string") {
    return new ApiError(error);
  }

  const e = error as any;

  const issues = Array.isArray(e?.error)
    ? e.error.map((issue: any) => ({
      path: Array.isArray(issue?.path) ? issue.path : [],
      message: issue?.message ?? "Invalid value",
    }))
    : Array.isArray(e?.issues)
      ? e.issues.map((issue: any) => ({
        path: Array.isArray(issue?.path) ? issue.path : [],
        message: issue?.message ?? "Invalid value",
      }))
      : undefined;

  const message =
    e?.message ??
    e?.title ??
    (issues?.length ? "Validation failed" : "Request failed");

  return new ApiError(message, {
    status: httpStatus ?? e?.status,
    issues,
  });
}

function throwOnError(error: unknown, response: number): never {
  throw toApiError(error, response);
}

export async function createSession(): Promise<CheckerState> {
  const { data, error, response } = await client.POST("/api/checker/session");
  if (error) throwOnError(error, response.status);
  return data!;
}

export async function getState(): Promise<CheckerState> {
  const { data, error, response } = await client.GET("/api/checker/state");
  if (error) throwOnError(error, response.status);
  return data!;
}

export async function saveAnswers(answers: Partial<CheckerAnswers>): Promise<CheckerState> {
  const body = { answers };
  const { data, error, response } = await client.PUT("/api/checker/answers", { body });
  if (error) throwOnError(error, response.status);
  return data!;
}


export async function evaluate(): Promise<CheckerResult> {
  const { data, error, response } = await client.POST("/api/checker/evaluate");
  if (error) throwOnError(error, response.status);
  return data!;
}

export async function deleteSession(): Promise<void> {
  const { error, response } = await client.DELETE("/api/checker/session");
  if (error) throwOnError(error, response.status);
}

export type SavedCheck = {
  id: string;
  status: "draft" | "completed";
  formData: CheckerAnswers;
  currentStep: string;
  updatedAt: string;
};

export async function getLatestCheck(): Promise<SavedCheck | null> {
  const data = await fetchApi<{ check: SavedCheck | null }>("/api/checker/latest");
  return data.check;
}