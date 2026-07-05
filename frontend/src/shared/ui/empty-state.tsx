
import type { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="animate-scale-in flex flex-col items-center justify-center p-8 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low/60">
      <div className="animate-pop flex items-center justify-center w-12 h-12 rounded-full bg-primary-fixed mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
