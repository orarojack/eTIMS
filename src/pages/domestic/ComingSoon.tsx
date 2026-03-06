import PageHeader from '../../components/ui/PageHeader';

type ComingSoonProps = {
  title: string;
  subtitle?: string;
};

export default function ComingSoon({ title, subtitle = 'This module is coming soon.' }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-gray-900 font-medium">{title}</div>
        <div className="text-gray-600 mt-1">
          We’ve set up the navigation and layout for this page. Database-backed functionality will be added next.
        </div>
      </div>
    </div>
  );
}

