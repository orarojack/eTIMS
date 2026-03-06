import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import NewCustomer from './pages/customers/NewCustomer';
import CustomerDetail from './pages/customers/CustomerDetail';
import ItemList from './pages/items/ItemList';
import NewItem from './pages/items/NewItem';
import ItemDetail from './pages/items/ItemDetail';
import FileReturns from './pages/domestic/FileReturns';
import Payments from './pages/domestic/Payments';
import TaxCompliance from './pages/domestic/TaxCompliance';
import Amnesty from './pages/domestic/Amnesty';
import Transactions from './pages/domestic/Transactions';
import RentalManagement from './pages/domestic/RentalManagement';
import OrganizationsPage from './pages/organizations/OrganizationsPage';
import InvoiceList from './pages/sales/invoices/InvoiceList';
import InvoiceDetail from './pages/sales/invoices/InvoiceDetail';
import NewInvoice from './pages/sales/invoices/NewInvoice';
import ProformaList from './pages/sales/proforma/ProformaList';
import NewProforma from './pages/sales/proforma/NewProforma';
import QuotationList from './pages/sales/quotations/QuotationList';
import NewQuotation from './pages/sales/quotations/NewQuotation';
import SupplierList from './pages/purchases/suppliers/SupplierList';
import NewSupplier from './pages/purchases/suppliers/NewSupplier';
import PurchaseOrderList from './pages/purchases/orders/PurchaseOrderList';
import NewPurchaseOrder from './pages/purchases/orders/NewPurchaseOrder';
import PurchaseInvoiceList from './pages/purchases/invoices/PurchaseInvoiceList';
import NewPurchaseInvoice from './pages/purchases/invoices/NewPurchaseInvoice';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <FileReturns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tax-compliance"
            element={
              <ProtectedRoute>
                <TaxCompliance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/amnesty"
            element={
              <ProtectedRoute>
                <Amnesty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rental-management"
            element={
              <ProtectedRoute>
                <RentalManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <OrganizationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/customers"
            element={
              <ProtectedRoute>
                <CustomerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/customers/new"
            element={
              <ProtectedRoute>
                <NewCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/customers/:id"
            element={
              <ProtectedRoute>
                <CustomerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/invoices"
            element={
              <ProtectedRoute>
                <InvoiceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/invoices/new"
            element={
              <ProtectedRoute>
                <NewInvoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/invoices/:id"
            element={
              <ProtectedRoute>
                <InvoiceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/proforma"
            element={
              <ProtectedRoute>
                <ProformaList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/proforma/new"
            element={
              <ProtectedRoute>
                <NewProforma />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/quotations"
            element={
              <ProtectedRoute>
                <QuotationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/quotations/new"
            element={
              <ProtectedRoute>
                <NewQuotation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <ItemList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/new"
            element={
              <ProtectedRoute>
                <NewItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:id"
            element={
              <ProtectedRoute>
                <ItemDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/suppliers"
            element={
              <ProtectedRoute>
                <SupplierList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/suppliers/new"
            element={
              <ProtectedRoute>
                <NewSupplier />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/orders"
            element={
              <ProtectedRoute>
                <PurchaseOrderList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/orders/new"
            element={
              <ProtectedRoute>
                <NewPurchaseOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/invoices"
            element={
              <ProtectedRoute>
                <PurchaseInvoiceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/invoices/new"
            element={
              <ProtectedRoute>
                <NewPurchaseInvoice />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
