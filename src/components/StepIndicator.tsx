import { cn } from '@/lib/utils';
import type { AppStep } from '@/types';
import { Upload, Sparkles, Eye, CheckCircle, Loader2 } from 'lucide-react';

interface Step {
  id: AppStep;
  label: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'analyzing', label: 'Analyze', icon: Sparkles },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'generating', label: 'Generate', icon: Loader2 },
  { id: 'success', label: 'Success', icon: CheckCircle },
];

interface StepIndicatorProps {
  currentStep: AppStep;
  className?: string;
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: Horizontal steps */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted && 'bg-green-500 border-green-500 text-black',
                    isCurrent && 'border-cyan-500 text-cyan-500 shadow-lg shadow-cyan-500/20',
                    !isCompleted && !isCurrent && 'border-zinc-700 text-zinc-600'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className={cn('h-5 w-5', isCurrent && 'animate-pulse')} />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    isCompleted && 'text-green-500',
                    isCurrent && 'text-cyan-500',
                    !isCompleted && !isCurrent && 'text-zinc-600'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2 transition-colors',
                    index < currentIndex ? 'bg-green-500' : 'bg-zinc-800'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Simple progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-cyan-500">
            {steps[currentIndex]?.label}
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
