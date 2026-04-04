import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  FileText,
  Receipt,
  CheckCircle,
  Wrench,
  TrendingUp,
  FileBarChart,
  Building2,
  Users,
  Package,
  ShoppingCart,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Bell,
  User,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: Home, section: 'DOMESTIC' },
    { path: '/invoices', label: 'File Returns', icon: FileText, section: 'DOMESTIC' },
    { path: '/payments', label: 'Payments', icon: Receipt, section: 'DOMESTIC' },
    { path: '/tax-compliance', label: 'Tax Compliance', icon: CheckCircle, section: 'DOMESTIC' },
    { path: '/amnesty', label: 'Amnesty', icon: Wrench, section: 'DOMESTIC' },
    { path: '/transactions', label: 'Transactions', icon: TrendingUp, section: 'DOMESTIC' },
    { path: '/rental-management', label: 'Rental Management', icon: Building2, section: 'DOMESTIC' },
    { path: '/organizations', label: 'Organizations', icon: Building2, section: 'DOMESTIC' },
    { path: '/sales/invoices', label: 'Invoice', icon: FileBarChart, section: 'INVOICING', subsection: 'Sales' },
    { path: '/sales/proforma', label: 'Proforma', icon: FileText, section: 'INVOICING', subsection: 'Sales' },
    { path: '/sales/quotations', label: 'Quotations', icon: ClipboardList, section: 'INVOICING', subsection: 'Sales' },
    { path: '/sales/customers', label: 'Customers', icon: Users, section: 'INVOICING', subsection: 'Sales' },
    { path: '/purchases/orders', label: 'Local Purchase Order', icon: ShoppingCart, section: 'INVOICING', subsection: 'Purchases' },
    { path: '/purchases/invoices', label: 'Purchase Invoices', icon: FileText, section: 'INVOICING', subsection: 'Purchases' },
    { path: '/purchases/suppliers', label: 'Suppliers', icon: Building2, section: 'INVOICING', subsection: 'Purchases' },
    { path: '/items', label: 'Item Management', icon: Package, section: 'INVOICING' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-red-700 text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}
      >
        <div className="p-4 border-b border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <Building2 className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <h1 className="text-lg font-bold">KENYA REVENUE</h1>
                <p className="text-xs text-red-200">AUTHORITY</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="p-4">
          {/* DOMESTIC Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-red-300 mb-2 px-3">DOMESTIC</h3>
            <ul className="space-y-1">
              {menuItems
                .filter((item) => item.section === 'DOMESTIC' && !item.subsection)
                .map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-800 text-white'
                          : 'text-red-100 hover:bg-red-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* INVOICING Section */}
          <div>
            <h3 className="text-xs font-semibold text-red-300 mb-2 px-3">INVOICING</h3>

            {/* Sales Subsection */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-red-200 mb-2 px-3">Sales</h4>
              <ul className="space-y-1">
                {menuItems
                  .filter((item) => item.subsection === 'Sales')
                  .map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                          isActive(item.path)
                            ? 'bg-red-800 text-white'
                            : 'text-red-100 hover:bg-red-600'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Purchases Subsection */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-red-200 mb-2 px-3">Purchases</h4>
              <ul className="space-y-1">
                {menuItems
                  .filter((item) => item.subsection === 'Purchases')
                  .map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                          isActive(item.path)
                            ? 'bg-red-800 text-white'
                            : 'text-red-100 hover:bg-red-600'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Item Management */}
            <ul className="space-y-1">
              {menuItems
                .filter((item) => item.section === 'INVOICING' && !item.subsection)
                .map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-800 text-white'
                          : 'text-red-100 hover:bg-red-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-red-800">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-100 hover:bg-red-600 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-600">
                <option>Individual</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Checkers</span>
              <button className="bg-orange-500 text-white px-4 py-1.5 rounded-md text-sm hover:bg-orange-600">
                File Returns
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </button>
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <User className="w-5 h-5" />
                <span className="text-sm">{user?.email || 'User'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
