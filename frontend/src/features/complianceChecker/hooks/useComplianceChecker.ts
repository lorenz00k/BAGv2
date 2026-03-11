// orchestriert: session starten, state laden, patchen, evaluate, loading/error states

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../api/checkerApi";

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

function isNotFoundError(error: unknown) {
  if (!(error instanceof api.ApiError)) return false;

  // adjust to your actual ApiError shape
  return error.status === 404;
}

export function useComplianceChecker() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [state, setState] = useState<api.CheckerState | null>(null);

  const answers = useMemo(() => (state?.answers ?? {}) as api.CheckerAnswers, [state]);
  const clearErrors = useCallback(() => { setError(null); setFieldErrors({}); }, []);

  const init = useCallback(async () => {
    clearErrors();
    setStatus("loading");
    try {
      const existing = await api.createSession();
      setState(existing);
      setStatus("ready");
      return existing;
    } catch (e: unknown) {
      if (!isNotFoundError(e)) {
        const message = e instanceof Error ? e.message : "Failed to initialize session";
        setError(message);
        setStatus("error");
        throw e;
      }
    }
    try {
      const fresh = await api.createSession();
      setState(fresh);
      setStatus("ready");
      return fresh;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to start session";
      setError(message);
      setStatus("error");
      throw e;
    }
  }, [clearErrors]);

  useEffect(() => {
    void init();
  }, [init]);

  const start = useCallback(async () => {
    clearErrors();
    setStatus("loading");

    try {
      const fresh = await api.createSession();
      setState(fresh);
      setStatus("ready");
      return fresh;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to start session";
      setError(message);
      setStatus("error");
      throw e;
    }
  }, [clearErrors]);

  const saveAnswers = useCallback(async (patch: Partial<api.CheckerAnswers>) => {
    if (!state) return;

    clearErrors();
    setStatus("saving");

    const previousState = state;

    const fullAnswers = {
      ...(state.answers ?? {}),
      ...patch,
    } as api.CheckerAnswers;

    setState((prev) =>
      prev
        ? {
          ...prev,
          answers: fullAnswers,
          status: "draft",
          result: null,
        }
        : prev
    );

    try {
      const next = await api.saveAnswers(fullAnswers);
      setState(next);
      setStatus("ready");
      return next;
    } catch (e: unknown) {
      setState(previousState);
      setFieldErrors(extractFieldErrors(e));
      const message = e instanceof Error ? e.message : "Failed to save";
      setError(message);
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
      const next = await api.getState();
      setState(next);
      setStatus("ready");
      return result;
    } catch (e: unknown) {
      setFieldErrors(extractFieldErrors(e));
      const message = e instanceof Error ? e.message : "Failed to evaluate";
      setError(message);
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
    } catch (e: unknown) {
      setFieldErrors(extractFieldErrors(e));
      const message = e instanceof Error ? e.message : "Failed to load state";
      setError(message);
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to restart session";
      setError(message);
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
    saveAnswers,
    runEvaluate,
    refresh,
    restart,
    clearErrors,
    clearFieldError,
    getFieldError,
  };
}