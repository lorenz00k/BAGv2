"use client";

type Props = {
  value?: number;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
};

export default function NumberField({ value, placeholder, onChange, disabled }: Props) {
  return (
    <input
      type="number"
      className="w-full rounded-lg border px-3 py-2 text-sm"
      value={value ?? ""}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return onChange(undefined);
        const n = Number(raw);
        onChange(Number.isFinite(n) ? n : undefined);
      }}
    />
  );
}