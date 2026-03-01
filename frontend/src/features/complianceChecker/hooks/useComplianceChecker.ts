// orchestriert: session starten, state laden, patchen, evaluate, loading/error states

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../api/checkerApi";

type Status = "idle" | "loading" | "ready" | "saving" | "evaluating" | "error";

export function useComplianceChecker() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<api.CheckerState | null>(null);

  const answers = useMemo(() => (state?.answers ?? {}) as api.CheckerAnswers, [state]);

  const start = useCallback(async () => {
    setError(null);
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
  }, []);

  useEffect(() => {
    // auto-start on mount
    void start();
  }, [start]);

  const savePatch = useCallback(async (patch: Partial<api.CheckerAnswers>) => {
    if (!state) return;

    setError(null);
    setStatus("saving");

    // optimistic local merge for snappy UI
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
      setError(e?.message ?? "Failed to save");
      setStatus("error");
      throw e;
    }
  }, [state]);

  const runEvaluate = useCallback(async () => {
    if (!state) return;

    setError(null);
    setStatus("evaluating");
    try {
      const result = await api.evaluate();
      // state enthält ggf. result; zur Sicherheit einmal state refresh:
      const next = await api.getState();
      setState(next);
      setStatus("ready");
      return result;
    } catch (e: any) {
      setError(e?.message ?? "Failed to evaluate");
      setStatus("error");
      throw e;
    }
  }, [state]);

  const refresh = useCallback(async () => {
    setError(null);
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
  }, []);

  return {
    status,
    error,
    state,
    answers,
    start,
    savePatch,
    runEvaluate,
    refresh,
  };
}