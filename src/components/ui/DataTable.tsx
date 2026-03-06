import { ReactNode } from 'react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

type DataTableProps = {
  loading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
};

export default function DataTable({
  loading,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}: DataTableProps) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block">
          <Spinner />
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return <div className="overflow-x-auto">{children}</div>;
}

