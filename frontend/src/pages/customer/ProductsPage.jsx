import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, X, ChevronDown } from "lucide-react";
import ProductCard from "../../components/customer/ProductCard";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { productAPI, categoryAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToastStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [stockFilter, setStockFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Không thể tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = searchQuery
          ? await productAPI.searchProducts(searchQuery, currentPage, itemsPerPage)
          : await productAPI.getAllProducts(currentPage, itemsPerPage);

        let productList = response.data || [];
        if (selectedCategory) {
          productList = productList.filter((p) => p.categoryId === selectedCategory);
        }
        if (priceRange.min) {
          productList = productList.filter(
            (p) => Number(p.price || 0) >= Number(priceRange.min),
          );
        }
        if (priceRange.max) {
          productList = productList.filter(
            (p) => Number(p.price || 0) <= Number(priceRange.max),
          );
        }
        if (stockFilter === "in-stock") {
          productList = productList.filter((p) => Number(p.stockQuantity || 0) > 0);
        }
        if (stockFilter === "out-of-stock") {
          productList = productList.filter((p) => Number(p.stockQuantity || 0) <= 0);
        }
        productList = sortProducts(productList, sortBy);
        setProducts(productList);
        const total = productList.length;
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, currentPage, selectedCategory, sortBy, priceRange.min, priceRange.max, stockFilter, toast]);

  const sortProducts = (productList, sortType) => {
    const sorted = [...productList];
    switch (sortType) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSortBy("newest");
    setPriceRange({ min: "", max: "" });
    setStockFilter("all");
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen px-3 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-panel-strong rounded-[32px] px-6 py-8 md:px-8">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : "Sản phẩm"}
          </h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Đang tải..." : `${products.length} sản phẩm.`}
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <div className="glass-card sticky top-28 rounded-[28px] p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Bộ lọc</h2>
                {(selectedCategory || searchQuery || priceRange.min || priceRange.max || stockFilter !== "all") && (
                  <button onClick={clearFilters} className="text-sm font-medium text-coffee-700 hover:text-coffee-900">
                    Xóa
                  </button>
                )}
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="glass-card flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedCategory === category.id}
                        onChange={() => handleCategoryChange(category.id)}
                        className="h-4 w-4 rounded border-white/40 text-coffee-700 focus:ring-coffee-500"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Sắp xếp</h3>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="glass-select w-full"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="name">Tên A-Z</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                </select>
              </div>
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Khoảng giá</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    min="0"
                    placeholder="Giá từ"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                    className="glass-input w-full"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Giá đến"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                    className="glass-input w-full"
                  />
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="glass-select w-full"
                  >
                    <option value="all">Tất cả tồn kho</option>
                    <option value="in-stock">Còn hàng</option>
                    <option value="out-of-stock">Hết hàng</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="glass-card flex w-full items-center justify-center gap-2 rounded-[24px] px-4 py-3"
            >
              <Filter className="h-5 w-5" />
              <span>Bộ lọc & Sắp xếp</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glass-card mt-4 rounded-[24px] p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Bộ lọc</h2>
                  <button onClick={() => setShowFilters(false)} className="glass-card rounded-2xl p-2">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4 space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="glass-card flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedCategory === category.id}
                        onChange={() => handleCategoryChange(category.id)}
                        className="h-4 w-4 rounded border-white/40 text-coffee-700 focus:ring-coffee-500"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>

                <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} className="glass-select w-full">
                  <option value="newest">Mới nhất</option>
                  <option value="name">Tên A-Z</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                </select>
                <div className="mt-4 space-y-3">
                  <input
                    type="number"
                    min="0"
                    placeholder="Giá từ"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                    className="glass-input w-full"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Giá đến"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                    className="glass-input w-full"
                  />
                  <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="glass-select w-full">
                    <option value="all">Tất cả tồn kho</option>
                    <option value="in-stock">Còn hàng</option>
                    <option value="out-of-stock">Hết hàng</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <SkeletonLoader key={i} className="h-96" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card rounded-[32px] p-12 text-center">
                <p className="text-lg text-slate-500">Không tìm thấy sản phẩm nào</p>
                {(selectedCategory || searchQuery || priceRange.min || priceRange.max || stockFilter !== "all") && (
                  <button onClick={clearFilters} className="glass-button mt-4 px-6 py-3 text-white">
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="glass-card rounded-2xl px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Trước
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? "glass-button rounded-2xl px-4 py-2 text-white" : "glass-card rounded-2xl px-4 py-2 text-sm"}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="glass-card rounded-2xl px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
