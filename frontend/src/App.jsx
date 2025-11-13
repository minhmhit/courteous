import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

// Stores
import useAuthStore from "./stores/useAuthStore";

// Components
import ToastContainer from "./components/ui/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerLayout from "./components/customer/CustomerLayout";

// Pages - Customer
import HomePage from "./pages/customer/HomePage";
import ProductsPage from "./pages/customer/ProductsPage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import ProfilePage from "./pages/customer/ProfilePage";
import OrderHistoryPage from "./pages/customer/OrderHistoryPage";
import OrderDetailPage from "./pages/customer/OrderDetailPage";
import PolicyPage from "./pages/customer/PolicyPage";
import AboutPage from "./pages/customer/AboutPage";
import ContactPage from "./pages/customer/ContactPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Pages - Admin
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminWarehousePage from "./pages/admin/AdminWarehousePage";
import AdminHRMPage from "./pages/admin/AdminHRMPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import WarehouseDashboardPage from "./pages/admin/WarehouseDashboardPage";
import SalesDashboardPage from "./pages/admin/SalesDashboardPage";
import HRMDashboardPage from "./pages/admin/HRMDashboardPage";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - chỉ chạy 1 lần khi mount

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Auth Routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Routes with Navbar & Footer */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* About & Contact Routes */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/policy/about" element={<AboutPage />} />
            <Route path="/policy/contact" element={<ContactPage />} />

            {/* Policy Routes */}
            <Route path="/privacy-policy" element={<PolicyPage />} />
            <Route path="/terms-of-service" element={<PolicyPage />} />
            <Route path="/return-policy" element={<PolicyPage />} />
            <Route path="/shipping-policy" element={<PolicyPage />} />

            {/* Protected Customer Routes */}
            {/* Cart & Checkout - Customer & Admin Only */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            {/* Profile - All authenticated users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Order History - Customer & Admin Only */}
            <Route
              path="/profile/orders"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <OrderHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[1, 3, 4, 5]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />

            {/* Role-Specific Dashboards */}
            <Route
              path="warehouse-dashboard"
              element={
                <ProtectedRoute allowedRoles={[1, 3]}>
                  <WarehouseDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales-dashboard"
              element={
                <ProtectedRoute allowedRoles={[1, 4]}>
                  <SalesDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="hrm-dashboard"
              element={
                <ProtectedRoute allowedRoles={[1, 5]}>
                  <HRMDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard & Analytics - Admin Only */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Products & Categories - Admin & Warehouse */}
            <Route
              path="products"
              element={
                <ProtectedRoute allowedRoles={[1, 3]}>
                  <AdminProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="categories"
              element={
                <ProtectedRoute allowedRoles={[1, 3]}>
                  <AdminCategoriesPage />
                </ProtectedRoute>
              }
            />

            {/* Warehouse - Admin & Warehouse */}
            <Route
              path="warehouse"
              element={
                <ProtectedRoute allowedRoles={[1, 3]}>
                  <AdminWarehousePage />
                </ProtectedRoute>
              }
            />

            {/* Orders - Admin & Sales */}
            <Route
              path="orders"
              element={
                <ProtectedRoute allowedRoles={[1, 4]}>
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Users & HRM - Admin & HRM */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={[1, 5]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="hrm"
              element={
                <ProtectedRoute allowedRoles={[1, 5]}>
                  <AdminHRMPage />
                </ProtectedRoute>
              }
            />

            {/* Settings - Admin Only */}
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
