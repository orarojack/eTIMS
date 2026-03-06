import { ReactNode } from 'react';

export default function ComingSoon({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description ? <p className="text-gray-600 mt-1">{description}</p> : null}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">Module status</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">Coming soon</p>
            <p className="text-sm text-gray-600 mt-2">
              This screen is wired into the sidebar routing; next step is implementing full CRUD + eTIMS workflows.
            </p>
          </div>

          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}

