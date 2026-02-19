"use client";

interface WizardProgressProps {
  steps: { id: string; headingKey: string }[];
  currentIndex: number;
  onStepClick: (index: number) => void;
}

export default function WizardProgress({
  steps,
  currentIndex,
}: WizardProgressProps) {
  const progress = steps.length > 1
    ? ((currentIndex) / (steps.length - 1)) * 100
    : 100;

  return (
    <div className="w-full">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(progress, 5)}%` }}
        />
      </div>
    </div>
  );
}
