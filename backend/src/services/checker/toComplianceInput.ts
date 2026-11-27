import type { ComplianceInput } from "../../types/compliance.js";
import type { CheckerAnswers } from "./evaluate.js";

export function toComplianceInput(answers: CheckerAnswers): ComplianceInput {
  const converted = Object.fromEntries(
    Object.entries(answers)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === "boolean" ? (value ? "yes" : "no") : value,
      ])
  );
  return converted as ComplianceInput;
}