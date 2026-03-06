type ErrorBannerProps = {
  title?: string;
  message: string;
  className?: string;
};

export default function ErrorBanner({ title = 'Error', message, className }: ErrorBannerProps) {
  return (
    <div className={`bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded ${className || ''}`}>
      <div className="font-medium">{title}</div>
      <div className="text-sm mt-1">{message}</div>
    </div>
  );
}

