import { fetchApi } from "./api";
import type {
  Check,
  ComplianceFormData,
  ComplianceResult,
} from "@/tools/complianceChecker/types";

// ---------------------------------------------------------------------------
// API response shapes
// ---------------------------------------------------------------------------

interface CheckResponse {
  check: Check;
}

interface CheckListResponse {
  checks: Check[];
}

interface EvaluateResponse {
  result: ComplianceResult;
  check: Check;
}

// ---------------------------------------------------------------------------
// Check CRUD
// ---------------------------------------------------------------------------

export async function createCheck(
  formData: ComplianceFormData = {},
  currentStep = "0"
): Promise<Check> {
  const data = await fetchApi<CheckResponse>("/api/checks", {
    method: "POST",
    body: JSON.stringify({ formData, currentStep }),
  });
  return data.check;
}

export async function getCheck(id: string): Promise<Check> {
  const data = await fetchApi<CheckResponse>(`/api/checks/${id}`);
  return data.check;
}

export async function getUserChecks(): Promise<Check[]> {
  const data = await fetchApi<CheckListResponse>("/api/checks");
  return data.checks;
}

export async function updateCheck(
  id: string,
  update: {
    formData?: ComplianceFormData;
    currentStep?: string;
    status?: "draft" | "completed";
  }
): Promise<Check> {
  const data = await fetchApi<CheckResponse>(`/api/checks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });
  return data.check;
}

export async function deleteCheck(id: string): Promise<void> {
  await fetchApi(`/api/checks/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Compliance evaluation
// ---------------------------------------------------------------------------

export async function evaluateCheck(
  id: string
): Promise<EvaluateResponse> {
  return fetchApi<EvaluateResponse>(`/api/checks/${id}/evaluate`, {
    method: "POST",
  });
}
