'use client';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressBar({ steps, currentStep, className = '' }: ProgressBarProps) {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col items-center text-center flex-1 ${index <= currentStep ? 'text-green-600' : 'text-gray-400'
              }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${index <= currentStep
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-400'
                }`}
            >
              {index + 1}
            </div>
            <span className="text-xs font-medium wrap-break-word max-w-20 h-8 flex items-center justify-center">
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-green-600 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}