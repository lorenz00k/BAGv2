"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { ComplianceFormData, WizardStepConfig } from "./types";
import { getVisibleFields } from "./steps";
import RadioField from "./fields/RadioField";
import NumberField from "./fields/NumberField";
import BooleanField from "./fields/BooleanField";

interface WizardStepProps {
  step: WizardStepConfig;
  formData: ComplianceFormData;
  onFieldChange: (key: keyof ComplianceFormData, value: unknown) => void;
  direction: "forward" | "backward";
}

const slideVariants = {
  enter: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? -80 : 80,
    opacity: 0,
  }),
};

export default function WizardStep({
  step,
  formData,
  onFieldChange,
  direction,
}: WizardStepProps) {
  const t = useTranslations("sections.complianceChecker");
  const visibleFields = getVisibleFields(step, formData);

  return (
    <motion.div
      key={step.id}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col gap-8"
    >
      {/* Step heading */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {t(step.headingKey)}
        </h2>
        {step.helperKey && (
          <p className="text-gray-600">
            {t(step.helperKey)}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-6">
        {visibleFields.map((field) => {
          const fieldValue = formData[field.key];

          switch (field.type) {
            case "radio":
              return (
                <RadioField
                  key={field.key}
                  value={fieldValue as string | undefined}
                  onChange={(val) => onFieldChange(field.key, val)}
                  optionsKey={field.optionsKey!}
                  descriptionsKey={field.descriptionsKey}
                />
              );

            case "number":
              return (
                <NumberField
                  key={field.key}
                  value={fieldValue as number | undefined}
                  onChange={(val) => onFieldChange(field.key, val)}
                  labelKey={field.labelKey}
                  placeholderKey={field.placeholderKey}
                />
              );

            case "boolean":
              return (
                <BooleanField
                  key={field.key}
                  value={fieldValue as "yes" | "no" | undefined}
                  onChange={(val) => onFieldChange(field.key, val)}
                  labelKey={field.labelKey}
                />
              );

            default:
              return null;
          }
        })}
      </div>
    </motion.div>
  );
}
