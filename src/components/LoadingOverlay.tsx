import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, Circle } from 'lucide-react';

interface LoadingTask {
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface LoadingOverlayProps {
  isVisible: boolean;
  title: string;
  message?: string;
  progress?: number;
  tasks?: LoadingTask[];
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  title,
  message,
  progress,
  tasks,
  className,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="w-full max-w-md mx-4 p-6 bg-[#1A1A1A] rounded-2xl border border-zinc-800">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Loader2 className="h-6 w-6 text-cyan-500 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Progress</span>
              <span className="text-cyan-500 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <p className="text-sm text-zinc-400 mb-4">{message}</p>
        )}

        {/* Tasks list */}
        {tasks && tasks.length > 0 && (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-lg transition-all',
                  task.status === 'in-progress' && 'bg-cyan-500/10',
                  task.status === 'completed' && 'bg-green-500/10'
                )}
              >
                {task.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : task.status === 'in-progress' ? (
                  <Loader2 className="h-4 w-4 text-cyan-500 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4 text-zinc-600" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    task.status === 'completed' && 'text-green-400',
                    task.status === 'in-progress' && 'text-cyan-400',
                    task.status === 'pending' && 'text-zinc-500'
                  )}
                >
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
