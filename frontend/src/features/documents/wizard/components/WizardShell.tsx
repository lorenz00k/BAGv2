"use client"

import React from "react"
import clsx from "clsx"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Container } from "@/components/layout/Container"
import { useWizardStore, STEP_LABELS } from "../store/wizardStore"
import type { WizardStepId } from "../types/wizard.types"

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function WizardProgress() {
    const { currentStep, getActiveSteps, goToStep } = useWizardStore()
    const steps = getActiveSteps()
    const currentIdx = steps.indexOf(currentStep)
    const pct = steps.length <= 1 ? 100 : Math.round((currentIdx / (steps.length - 1)) * 100)

    return (
        <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20">
            <Container>
                <div className="py-4 flex flex-col gap-3">
                    {/* Top row: step counter + percent */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">
                            Schritt {currentIdx + 1} von {steps.length}
                            <span className="ml-2 font-normal text-slate-500">
                                — {STEP_LABELS[currentStep]}
                            </span>
                        </span>
                        <span className="font-bold tabular-nums text-[var(--color-accent)]">{pct}%</span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-400 ease-out"
                            style={{ width: `${pct}%` }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        />
                    </div>

                    {/* Step dots – scrollable on mobile */}
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                        {steps.map((step, idx) => {
                            const done = idx < currentIdx
                            const active = step === currentStep
                            return (
                                <button
                                    key={step}
                                    onClick={() => done && goToStep(step)}
                                    disabled={!done}
                                    aria-label={`Zu Schritt ${idx + 1}: ${STEP_LABELS[step]}`}
                                    className={clsx(
                                        "flex-shrink-0 h-1.5 rounded-full transition-all duration-200",
                                        active
                                            ? "bg-[var(--color-accent)] w-6"
                                            : done
                                                ? "bg-[var(--color-accent)] opacity-40 w-3 cursor-pointer hover:opacity-70"
                                                : "bg-slate-200 w-3 cursor-default"
                                    )}
                                />
                            )
                        })}
                    </div>
                </div>
            </Container>
        </div>
    )
}

// ─── Navigation Buttons ───────────────────────────────────────────────────────

type WizardNavProps = {
    onNext?: () => void      // if provided, called instead of store.goNext
    onBack?: () => void
    nextLabel?: string
    backLabel?: string
    nextDisabled?: boolean
    hideback?: boolean
    isLastStep?: boolean
}

export function WizardNav({
    onNext,
    onBack,
    nextLabel = "Weiter",
    backLabel = "Zurück",
    nextDisabled = false,
    hideback = false,
    isLastStep = false,
}: WizardNavProps) {
    const { goNext, goBack, getCurrentIndex } = useWizardStore()
    const isFirst = getCurrentIndex() === 0

    return (
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-[var(--color-border)]">
            <div>
                {!hideback && !isFirst && (
                    <Button
                        variant="outline"
                        onClick={onBack ?? goBack}
                        type="button"
                    >
                        <ChevronLeft className="w-4 h-4" aria-hidden />
                        {backLabel}
                    </Button>
                )}
            </div>
            <Button
                variant="primary"
                onClick={onNext ?? goNext}
                disabled={nextDisabled}
                type="submit"
            >
                {nextLabel}
                {!isLastStep && <ChevronRight className="w-4 h-4" aria-hidden />}
            </Button>
        </div>
    )
}

// ─── Step Wrapper ─────────────────────────────────────────────────────────────

type StepProps = {
    title: string
    subtitle?: string
    section?: string   // e.g. "§1.1"
    children: React.ReactNode
}

export function StepWrapper({ title, subtitle, section, children }: StepProps) {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                {section && (
                    <span className="text-xs font-mono text-slate-400 tracking-wide">{section}</span>
                )}
                <h2 className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">{title}</h2>
                {subtitle && (
                    <p className="mt-2 text-base text-slate-500 leading-6">{subtitle}</p>
                )}
            </div>
            {children}
        </div>
    )
}

// ─── Field components ─────────────────────────────────────────────────────────

type FieldProps = {
    label: string
    hint?: string
    error?: string
    required?: boolean
    children?: React.ReactNode
    className?: string
}

export function Field({ label, hint, error, required, children, className }: FieldProps) {
    return (
        <div className={clsx("space-y-1.5", className)}>
            <label className="block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-[var(--color-accent)]">*</span>}
            </label>
            {hint && <p className="text-xs text-slate-400 leading-5">{hint}</p>}
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}

const inputBase =
    "w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] " +
    "px-4 py-2.5 text-base text-slate-800 placeholder:text-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] " +
    "transition-colors"

export const inputCls = (error?: string) =>
    clsx(inputBase, error && "border-red-400 focus:ring-red-300")

export function TextInput({
    label, hint, error, required, className, ...props
}: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "children">) {
    return (
        <Field label={label} hint={hint} error={error} required={required} className={className}>
            <input className={inputCls(error)} {...props} />
        </Field>
    )
}

export function TextareaInput({
    label, hint, error, required, className, rows = 5, ...props
}: FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "children">) {
    return (
        <Field label={label} hint={hint} error={error} required={required} className={className}>
            <textarea rows={rows} className={clsx(inputBase, "resize-y", error && "border-red-400")} {...props} />
        </Field>
    )
}

export function RadioGroup({
    label, hint, required, options, value, onChange, className,
}: {
    label: string
    hint?: string
    required?: boolean
    options: { value: string; label: string }[]
    value: string
    onChange: (v: string) => void
    className?: string
}) {
    return (
        <Field label={label} hint={hint} required={required} className={className}>
            <div className="flex flex-col gap-2 pt-1">
                {options.map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                        <div className={clsx(
                            "w-5 h-5 rounded-full border-2 grid place-items-center flex-shrink-0 transition-colors",
                            value === opt.value
                                ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                                : "border-slate-300 group-hover:border-[var(--color-accent)]"
                        )}>
                            {value === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <input
                            type="radio"
                            className="sr-only"
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
                        />
                        <span className="text-base text-slate-700">{opt.label}</span>
                    </label>
                ))}
            </div>
        </Field>
    )
}

export function CheckboxField({
    label, hint, checked, onChange, className,
}: {
    label: string
    hint?: string
    checked: boolean
    onChange: (v: boolean) => void
    className?: string
}) {
    return (
        <label className={clsx("flex items-start gap-3 cursor-pointer group", className)}>
            <div className={clsx(
                "w-5 h-5 rounded border-2 grid place-items-center flex-shrink-0 mt-0.5 transition-colors",
                checked
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                    : "border-slate-300 group-hover:border-[var(--color-accent)]"
            )}>
                {checked && (
                    <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div>
                <span className="text-base text-slate-700">{label}</span>
                {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
            </div>
        </label>
    )
}

// ─── Hint Box ─────────────────────────────────────────────────────────────────

export function HintBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-accent-soft)] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] px-4 py-3 text-sm text-slate-700 leading-6">
            {children}
        </div>
    )
}

// ─── Section Divider ──────────────────────────────────────────────────────────

export function FieldDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">{label}</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>
    )
}

// ─── Main Shell ───────────────────────────────────────────────────────────────

type WizardShellProps = {
    children: React.ReactNode
    onReset?: () => void
}

export function WizardShell({ children, onReset }: WizardShellProps) {
    return (
        <div className="min-h-screen bg-[var(--color-background,#f8f9fa)]">
            <WizardProgress />

            <Container>
                <div className="py-10 md:py-14">
                    {children}
                </div>
            </Container>

            {/* Reset button – fixed bottom right */}
            {onReset && (
                <button
                    onClick={onReset}
                    className="fixed bottom-6 right-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 bg-white border border-[var(--color-border)] rounded-full px-3 py-2 shadow-sm transition-colors z-30"
                >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden />
                    Zurücksetzen
                </button>
            )}
        </div>
    )
}
