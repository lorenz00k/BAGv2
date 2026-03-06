"use client";

type Props = {
  value?: number;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
  error?: string | null;
  min?: number;
  step?: number;
};

export default function NumberField({
  value,
  placeholder,
  onChange,
  disabled,
  error,
  min = 0,
  step = 1,
}: Props) {
  return (
    <div className="w-full">
      <input
        type="number"
        inputMode="numeric"
        className={`w-full rounded-lg border px-3 py-2 text-sm ${
          error ? "border-red-500" : ""
        }`}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        aria-invalid={!!error}
        onChange={(e) => {
          const raw = e.target.value;

          if (raw === "") {
            onChange(undefined);
            return;
          }

          const n = Number(raw);

          if (!Number.isFinite(n)) {
            onChange(undefined);
            return;
          }

          if (n < min) {
            onChange(undefined);
            return;
          }

          onChange(n);
        }}
      />

      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}