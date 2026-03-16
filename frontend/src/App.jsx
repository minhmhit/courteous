import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "./stores/useAuthStore";
import ToastContainer from "./components/ui/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerLayout from "./components/customer/CustomerLayout";
import ScrollToTop from "./components/ScrollToTop";

const HomePage = lazy(() => import("./pages/customer/HomePage"));
const ProductsPage = lazy(() => import("./pages/customer/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/customer/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/customer/CartPage"));
const CheckoutPage = lazy(() => import("./pages/customer/CheckoutPage"));
const ProfilePage = lazy(() => import("./pages/customer/ProfilePage"));
const OrderHistoryPage = lazy(() => import("./pages/customer/OrderHistoryPage"));
const OrderDetailPage = lazy(() => import("./pages/customer/OrderDetailPage"));
const PolicyPage = lazy(() => import("./pages/customer/PolicyPage"));
const AboutPage = lazy(() => import("./pages/customer/AboutPage"));
const ContactPage = lazy(() => import("./pages/customer/ContactPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminWarehousePage = lazy(() => import("./pages/admin/AdminWarehousePage"));
const AdminHRMPage = lazy(() => import("./pages/admin/AdminHRMPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const WarehouseDashboardPage = lazy(() => import("./pages/admin/WarehouseDashboardPage"));
const SalesDashboardPage = lazy(() => import("./pages/admin/SalesDashboardPage"));
const HRMDashboardPage = lazy(() => import("./pages/admin/HRMDashboardPage"));
const AdminCouponsPage = lazy(() => import("./pages/admin/AdminCouponsPage"));
const AdminSuppliersPage = lazy(() => import("./pages/admin/AdminSuppliersPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">
    <div className="glass-panel-strong flex items-center gap-4 rounded-[28px] px-6 py-5 text-slate-700">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-coffee-300 border-t-coffee-700" />
      <div>
        <p className="font-semibold text-slate-900">Đang tải giao diện</p>
        <p className="text-sm text-slate-500">Tách tải route để giảm bundle khởi tạo.</p>
      </div>
    </div>
  </div>
);

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/policy/about" element={<AboutPage />} />
              <Route path="/policy/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PolicyPage />} />
              <Route path="/terms-of-service" element={<PolicyPage />} />
              <Route path="/return-policy" element={<PolicyPage />} />
              <Route path="/shipping-policy" element={<PolicyPage />} />

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
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
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

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[1, 3, 4, 5]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
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
              <Route
                path="products"
                element={
                  <ProtectedRoute allowedRoles={[1, 3, 4]}>
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
              <Route
                path="warehouse"
                element={
                  <ProtectedRoute allowedRoles={[1, 3]}>
                    <AdminWarehousePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="suppliers"
                element={
                  <ProtectedRoute allowedRoles={[1, 3]}>
                    <AdminSuppliersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute allowedRoles={[1, 4]}>
                    <AdminOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="coupons"
                element={
                  <ProtectedRoute allowedRoles={[1, 4]}>
                    <AdminCouponsPage />
                  </ProtectedRoute>
                }
              />
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
              <Route
                path="settings"
                element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
