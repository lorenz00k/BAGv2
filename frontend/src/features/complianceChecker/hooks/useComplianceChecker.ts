// orchestriert: session starten, state laden, patchen, evaluate, loading/error states

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../api/checkerApi";
import { clear } from "console";

type Status = "idle" | "loading" | "ready" | "saving" | "evaluating" | "error";

type FieldErrors = Record<string, string>;

function pathToFieldKey(path?: (string | number)[]) {
  if (!path || path.length === 0) return "";
  return path
    .filter((part) => part !== "answers")
    .map(String)
    .join(".");
}

function extractFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof api.ApiError) || !error.issues?.length) return {};

  const out: FieldErrors = {};

  for (const issue of error.issues) {
    const key = pathToFieldKey(issue.path);
    if (!key) continue;
    if (!out[key]) out[key] = issue.message;
  }

  return out;
}

export function useComplianceChecker() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [state, setState] = useState<api.CheckerState | null>(null);

  const answers = useMemo(() => (state?.answers ?? {}) as api.CheckerAnswers, [state]);
  const clearErrors = useCallback(() => {setError(null); setFieldErrors({});}, []);

  const start = useCallback(async () => {
    clearErrors();
    setStatus("loading");
    try {
      const s = await api.createSession();
      setState(s);
      setStatus("ready");
      return s;
    } catch (e: any) {
      setError(e?.message ?? "Failed to start session");
      setStatus("error");
      throw e;
    }
  }, [clearErrors]);

  useEffect(() => {
    // auto-start on mount
    void start();
  }, [start]);

  const savePatch = useCallback(async (patch: Partial<api.CheckerAnswers>) => {
    if (!state) return;

    clearErrors();
    setStatus("saving");

    // optimistic local merge for snappy UI
    const previousState = state;
    setState((prev) =>
      prev
        ? ({
            ...prev,
            answers: { ...(prev.answers as object), ...patch },
          } as api.CheckerState)
        : prev
    );

    try {
      const next = await api.patchAnswers(patch);
      setState(next);
      setStatus("ready");
      return next;
    } catch (e: any) {
      setState(previousState);
      setFieldErrors(extractFieldErrors(e));

      setError(e?.message ?? "Failed to save");
      setStatus("error");
      throw e;
    }
  }, [state, clearErrors]);

  const runEvaluate = useCallback(async () => {
    if (!state) return;

    clearErrors();
    setStatus("evaluating");
    try {
      const result = await api.evaluate();
      // state enthält ggf. result; zur Sicherheit einmal state refresh:
      const next = await api.getState();
      setState(next);
      setStatus("ready");
      return result;
    } catch (e: any) {
      setFieldErrors(extractFieldErrors(e));
      setError(e?.message ?? "Failed to evaluate");
      setStatus("error");
      throw e;
    }
  }, [state, clearErrors]);

  const refresh = useCallback(async () => {
    clearErrors();
    setStatus("loading");
    try {
      const next = await api.getState();
      setState(next);
      setStatus("ready");
      return next;
    } catch (e: any) {
      setError(e?.message ?? "Failed to load state");
      setStatus("error");
      throw e;
    }
  }, [clearErrors]);

  const restart = useCallback(async () => {
    clearErrors();
    setStatus("loading");
    try {
      await api.deleteSession();
    } catch (e: any) {
      console.error("Failed to delete session", e);
    }
    setState(null);

    try {
      const fresh = await api.createSession();
      setState(fresh);
      setStatus("ready");
      return fresh;
    } catch (e: any) {
      setError(e?.message ?? "Failed to start session");
      setStatus("error");
      throw e;
    }
  }, [clearErrors]);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const getFieldError = useCallback((field: string) => fieldErrors[field] ?? null, [fieldErrors]);

  return {
    status,
    error,
    fieldErrors,
    state,
    answers,
    start,
    savePatch,
    runEvaluate,
    refresh,
    restart,
    clearErrors,
    clearFieldError,
    getFieldError,
  };
}