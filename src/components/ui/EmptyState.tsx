import { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={`p-8 text-center text-gray-600 ${className || ''}`}>
      <div className="text-gray-900 font-medium">{title}</div>
      {description ? <div className="text-sm mt-1">{description}</div> : null}
      {action ? <div className="mt-4 flex items-center justify-center">{action}</div> : null}
    </div>
  );
}

