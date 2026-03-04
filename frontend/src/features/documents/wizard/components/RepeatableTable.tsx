"use client"

import React from "react"
import clsx from "clsx"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { inputCls } from "./WizardShell"

export type ColumnDef<T> = {
    key: keyof T
    label: string
    placeholder?: string
    width?: string   // tailwind width class e.g. "w-32"
    type?: "text" | "number"
}

type RepeatableTableProps<T extends Record<string, string>> = {
    rows: T[]
    columns: ColumnDef<T>[]
    emptyRow: T
    onChange: (rows: T[]) => void
    addLabel?: string
    minRows?: number
    maxRows?: number
}

export function RepeatableTable<T extends Record<string, string>>({
    rows,
    columns,
    emptyRow,
    onChange,
    addLabel = "Zeile hinzufügen",
    minRows = 1,
    maxRows = 30,
}: RepeatableTableProps<T>) {
    const addRow = () => {
        if (rows.length < maxRows) onChange([...rows, { ...emptyRow }])
    }

    const removeRow = (idx: number) => {
        if (rows.length <= minRows) return
        onChange(rows.filter((_, i) => i !== idx))
    }

    const updateRow = (idx: number, key: keyof T, value: string) => {
        onChange(rows.map((row, i) =>
            i === idx ? { ...row, [key]: value } : row
        ))
    }

    return (
        <div className="space-y-3">
            {/* Mobile: Card layout */}
            <div className="flex flex-col gap-3 md:hidden">
                {rows.map((row, idx) => (
                    <div key={idx} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Eintrag {idx + 1}
                            </span>
                            {rows.length > minRows && (
                                <button
                                    type="button"
                                    onClick={() => removeRow(idx)}
                                    className="text-slate-300 hover:text-red-400 transition-colors"
                                    aria-label="Zeile entfernen"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {columns.map(col => (
                            <div key={String(col.key)} className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">{col.label}</label>
                                <input
                                    type={col.type ?? "text"}
                                    value={row[col.key] ?? ""}
                                    placeholder={col.placeholder ?? col.label}
                                    onChange={e => updateRow(idx, col.key, e.target.value)}
                                    className={inputCls()}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-[var(--color-border)]">
                        <tr>
                            <th className="w-10 px-3 py-2.5 text-left text-xs font-semibold text-slate-400">#</th>
                            {columns.map(col => (
                                <th
                                    key={String(col.key)}
                                    className={clsx("px-3 py-2.5 text-left text-xs font-semibold text-slate-600", col.width)}
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th className="w-10 px-3 py-2.5" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="group">
                                <td className="px-3 py-2 text-xs text-slate-400 font-mono">{idx + 1}</td>
                                {columns.map(col => (
                                    <td key={String(col.key)} className="px-2 py-1.5">
                                        <input
                                            type={col.type ?? "text"}
                                            value={row[col.key] ?? ""}
                                            placeholder={col.placeholder ?? ""}
                                            onChange={e => updateRow(idx, col.key, e.target.value)}
                                            className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-accent-soft)] transition-colors"
                                        />
                                    </td>
                                ))}
                                <td className="px-3 py-2">
                                    {rows.length > minRows && (
                                        <button
                                            type="button"
                                            onClick={() => removeRow(idx)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                                            aria-label="Zeile entfernen"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {rows.length < maxRows && (
                <Button type="button" variant="ghost" size="sm" onClick={addRow}>
                    <Plus className="w-4 h-4" aria-hidden />
                    {addLabel}
                </Button>
            )}
        </div>
    )
}
