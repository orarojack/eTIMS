import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Plus, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getCurrentOrganizationId } from '../../../services/organization';
import DataTable from '../../../components/ui/DataTable';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatMoney } from '../../../services/numbers';

type Quotation = {
  id: string;
  customer_id: string;
  quotation_number: string;
  quotation_date: string;
  total: number;
  status: string;
  created_at: string;
};

export default function QuotationList() {
  const [rows, setRows] = useState<Quotation[]>([]);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        setError('');
        const orgId = await getCurrentOrganizationId();

        const { data, error: fetchError } = await supabase
          .from('quotations')
          .select('id,customer_id,quotation_number,quotation_date,total,status,created_at')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        const list = (data || []) as Quotation[];
        setRows(list);

        const ids = Array.from(new Set(list.map((r) => r.customer_id).filter(Boolean)));
        if (ids.length) {
          const { data: custData, error: custError } = await supabase.from('customers').select('id,name').in('id', ids);
          if (custError) throw custError;
          const map: Record<string, string> = {};
          (custData || []).forEach((c) => {
            map[c.id] = c.name;
          });
          setCustomerNames(map);
        } else {
          setCustomerNames({});
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to fetch quotations');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((q) => {
      const customerName = (customerNames[q.customer_id] || '').toLowerCase();
      return (
        q.quotation_number.toLowerCase().includes(term) ||
        customerName.includes(term) ||
        q.status.toLowerCase().includes(term)
      );
    });
  }, [customerNames, rows, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        subtitle="Create and manage quotations"
        actions={
          <Link to="/sales/quotations/new" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
            <span className="inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New
            </span>
          </Link>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search quotations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        <DataTable
          loading={loading}
          isEmpty={!loading && filtered.length === 0}
          emptyTitle="No quotations found"
          emptyAction={
            <Link to="/sales/quotations/new" className="text-red-600 hover:text-red-700">
              Create your first quotation
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotation #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(q.quotation_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.quotation_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customerNames[q.customer_id] || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatMoney(q.total, 'KES')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/sales/quotations/${q.id}`}
                        className="text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataTable>
      </div>
    </div>
  );
}

