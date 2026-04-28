import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  Coffee,
} from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";

const navLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/products", label: "Sản phẩm" },
  { to: "/policy/about", label: "Về chúng tôi" },
  { to: "/policy/contact", label: "Liên hệ" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { totalItems, fetchCart, clearCart } = useCartStore();

  const roleId = user?.roleId || user?.role_id || user?.role;
  const isEnterpriseUser = [1, 3, 4, 5].includes(roleId);
  const canUseCart = roleId === 2;

  useEffect(() => {
    if (user && canUseCart) {
      fetchCart();
      return;
    }

    clearCart();
  }, [user, canUseCart, fetchCart, clearCart]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <div
        className={`mx-auto max-w-7xl rounded-[28px] border border-white/35 px-4 transition-all duration-300 md:px-6 ${
          isScrolled
            ? "glass-panel-strong py-3 shadow-[0_24px_60px_rgba(63,35,16,0.18)]"
            : "glass-panel py-4"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              transition={{ duration: 0.35 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/45 text-coffee-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            >
              <Coffee className="h-5 w-5" />
            </motion.div>
            <div>
              <span className="block font-display text-xl font-bold tracking-tight text-coffee-950">
                CoffeeBot
              </span>
              <span className="hidden text-xs uppercase tracking-[0.28em] text-coffee-700/75 md:block">
                Premium Beans
              </span>
            </div>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden max-w-md flex-1 items-center md:flex"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm cà phê, combo, phụ kiện..."
                className="glass-input w-full pl-11 pr-4"
              />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-700/60" />
            </div>
          </form>

          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white/35 hover:text-coffee-700"
              >
                {link.label}
              </Link>
            ))}

            <Link to="/cart" className="relative">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="glass-card flex h-11 w-11 items-center justify-center rounded-2xl"
              >
                <ShoppingCart className="h-5 w-5 text-slate-700" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="glass-card flex items-center gap-3 rounded-2xl px-3 py-2 text-left"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee-700 text-sm font-semibold text-white shadow-lg">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800">
                      {user.name}
                    </span>
                    <span className="block text-xs text-slate-500">Tài khoản</span>
                  </div>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="glass-popover absolute right-0 mt-3 w-56 rounded-3xl p-2"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 hover:bg-white/35"
                      >
                        <User className="h-4 w-4 text-coffee-700" />
                        <span>Tài khoản</span>
                      </Link>
                      <Link
                        to="/profile/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 hover:bg-white/35"
                      >
                        <Package className="h-4 w-4 text-coffee-700" />
                        <span>Đơn hàng</span>
                      </Link>
                      {isEnterpriseUser && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 hover:bg-white/35"
                        >
                          <Settings className="h-4 w-4 text-coffee-700" />
                          <span>Quản trị</span>
                        </Link>
                      )}
                      <div className="mb-1 mt-0.5 border-t border-white/25" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-rose-600 hover:bg-rose-50/80"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="glass-button px-5 py-2.5 text-sm font-semibold text-white"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="glass-card flex h-11 w-11 items-center justify-center rounded-2xl md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-700" />
            ) : (
              <Menu className="h-6 w-6 text-slate-700" />
            )}
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative mt-4 md:hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm cà phê..."
            className="glass-input w-full pl-11 pr-4"
          />
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-coffee-700/60" />
        </form>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden rounded-[24px] border border-white/20 bg-white/12 px-4 pb-4 pt-3 md:hidden"
            >
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-white/35"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-white/35"
                >
                  Giỏ hàng ({totalItems})
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-white/35"
                    >
                      Tài khoản
                    </Link>
                    <Link
                      to="/profile/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-white/35"
                    >
                      Đơn hàng
                    </Link>
                    {isEnterpriseUser && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-white/35"
                      >
                        Quản trị
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full rounded-2xl px-3 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50/80"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl px-3 py-3 text-sm font-medium text-coffee-700 hover:bg-white/35"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
