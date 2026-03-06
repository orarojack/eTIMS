import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Plus, Search } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import { supabase } from '../../../lib/supabase';
import { getCurrentOrganizationId } from '../../../services/organization';

type Supplier = {
  id: string;
  pin: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const orgId = await getCurrentOrganizationId();
        const { data, error: fetchError } = await supabase
          .from('suppliers')
          .select('id,pin,name,email,phone,created_at')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setSuppliers(data || []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load suppliers');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = suppliers.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.pin.toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage your supplier database"
        actions={
          <Link
            to="/purchases/suppliers/new"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
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
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        <DataTable
          loading={loading}
          isEmpty={!loading && filtered.length === 0}
          emptyTitle="No suppliers found"
          emptyDescription="Add a supplier to start creating purchase orders and bills."
          emptyAction={
            <Link to="/purchases/suppliers/new" className="text-red-600 hover:text-red-700">
              Create your first supplier
            </Link>
          }
        >
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(supplier.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.pin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/purchases/suppliers/${supplier.id}`}
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
        </DataTable>
      </div>
    </div>
  );
}
