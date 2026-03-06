type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeToClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-b-2',
  lg: 'h-12 w-12 border-b-2',
};

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  const base =
    size === 'sm'
      ? 'animate-spin rounded-full border-gray-300 border-t-red-600'
      : 'animate-spin rounded-full border-gray-300 border-t-red-600';

  return <div className={`${base} ${sizeToClasses[size]} ${className || ''}`} />;
}

