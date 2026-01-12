import { Button } from '@/components/ui';

interface NavigationButtonsProps {
  currentStep: number;
  stepsCount: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isNextDisabled: boolean;
  isSubmitting: boolean;
}

export function NavigationButtons({
  currentStep,
  stepsCount,
  onBack,
  onNext,
  onSubmit,
  isNextDisabled,
  isSubmitting,
}: NavigationButtonsProps) {
  return (
    <div className="flex gap-3">
      {currentStep > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
      )}

      {currentStep < stepsCount - 1 ? (
        <Button
          type="button"
          onClick={onNext}
          className="flex-1"
          disabled={isNextDisabled}
        >
          Next
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      )}
    </div>
  );
}