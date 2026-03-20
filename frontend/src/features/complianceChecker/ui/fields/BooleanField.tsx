"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/typography/Text";

type Props = {
  value?: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  error?: string | null;
};

export default function BooleanField({
  value,
  onChange,
  disabled,
  error,
}: Props) {
  const g = useTranslations("common.labels.general");
  const errorId = useId();
  const showErrorState = value === undefined && !!error;

  return (
    <div className="w-full">
      <div
        className="flex grid-cols-2 gap-2"
        role="radiogroup"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      >
        <Button
          type="button"
          variant="choice"
          selected={value === true}
          disabled={disabled}
          role="radio"
          aria-checked={value === true}
          onClick={() => onChange(true)}
          className={showErrorState ? "w-full rounded-xl !border-red-500" : "w-full rounded-xl"}
        >
          <Text className="mt-3" size="base" tone="default">
            {g("yes")}
          </Text>
        </Button>

        <Button
          type="button"
          variant="choice"
          selected={value === false}
          disabled={disabled}
          role="radio"
          aria-checked={value === false}
          onClick={() => onChange(false)}
          className={showErrorState ? "w-full rounded-xl !border-red-500" : "w-full rounded-xl"}
        >
          <Text className="mt-3" size="sm" tone="default">
            {g("no")}
          </Text>
        </Button>
      </div>

      {
        error ? (
          <Text id={errorId} size="sm" tone="error" className="mt-2">
            {error}
          </Text>
        ) : null
      }
    </div >
  );
}