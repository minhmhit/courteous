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
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // Get search query from URL
  const searchQuery = searchParams.get("search") || "";

  // Fetch categories
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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let response;

        if (searchQuery) {
          // Search products
          response = await productAPI.searchProducts(
            searchQuery,
            currentPage,
            itemsPerPage
          );
        } else {
          // Get all products
          response = await productAPI.getAllProducts(currentPage, itemsPerPage);
        }

        let productList = response.data || [];

        // Filter by category if selected
        if (selectedCategory) {
          productList = productList.filter(
            (p) => p.categoryId === selectedCategory
          );
        }

        // Sort products
        productList = sortProducts(productList, sortBy);

        setProducts(productList);

        // Calculate total pages (giả sử backend trả về total)
        const total = response.total || productList.length;
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, currentPage, selectedCategory, sortBy, toast]);

  const sortProducts = (productList, sortType) => {
    const sorted = [...productList];
    switch (sortType) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
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
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : "Sản phẩm"}
          </h1>
          <p className="text-gray-600">
            {isLoading ? "Đang tải..." : `${products.length} sản phẩm`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Bộ lọc</h2>
                {(selectedCategory || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-coffee-600 hover:text-coffee-700"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategory === category.id}
                        onChange={() => handleCategoryChange(category.id)}
                        className="rounded border-gray-300 text-coffee-600 focus:ring-coffee-500"
                      />
                      <span className="text-sm text-gray-700">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sắp xếp</h3>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-sm"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="name">Tên A-Z</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <Filter className="w-5 h-5" />
              <span>Bộ lọc & Sắp xếp</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Mobile Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 bg-white rounded-lg shadow-sm p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Bộ lọc</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Danh mục</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategory === category.id}
                          onChange={() => handleCategoryChange(category.id)}
                          className="rounded border-gray-300 text-coffee-600 focus:ring-coffee-500"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="font-medium mb-2">Sắp xếp</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="name">Tên A-Z</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                  </select>
                </div>

                {(selectedCategory || searchQuery) && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setShowFilters(false);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonLoader key={i} className="h-96" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy sản phẩm nào
                </p>
                {(selectedCategory || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === i + 1
                              ? "bg-coffee-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
