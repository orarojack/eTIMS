type StatusBadgeProps = {
  status: string | null | undefined;
};

function classesForStatus(status: string) {
  const s = status.toLowerCase();
  if (s === 'draft') return 'bg-gray-100 text-gray-800';
  if (s === 'unpaid') return 'bg-orange-100 text-orange-800';
  if (s === 'paid') return 'bg-green-100 text-green-800';
  if (s === 'cancelled' || s === 'void') return 'bg-red-100 text-red-800';
  return 'bg-blue-100 text-blue-800';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const label = status || 'unknown';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${classesForStatus(label)}`}>
      {label}
    </span>
  );
}

