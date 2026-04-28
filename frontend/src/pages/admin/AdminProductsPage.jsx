import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { productAPI, categoryAPI, supplierAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import { exportToCsv } from "../../utils/exportCSV";

const PRODUCT_IMAGE_PREFIX = "./asset/img/products/";

const normalizeProductImagePath = (value) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  const filename = value.split("/").pop();
  return filename ? `${PRODUCT_IMAGE_PREFIX}${filename}` : value;
};

const AdminProductsPage = () => {
  const toast = useToastStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: "all",
    supplierId: "all",
    stock: "all",
    priceMin: "",
    priceMax: "",
    sort: "name-asc",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  // Pagination details
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    categoryId: "",
    supplierId: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productAPI.getAllProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierAPI.getAllSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    if (searchTerm.trim()) {
      setIsLoading(true);
      try {
        const response = await productAPI.searchProducts(searchTerm);
        setProducts(response.data || []);
      } catch (error) {
        console.error("Error searching products:", error);
        toast.error("Không thể tìm kiếm sản phẩm");
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchProducts();
    }
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setFilters({
      categoryId: "all",
      supplierId: "all",
      stock: "all",
      priceMin: "",
      priceMax: "",
      sort: "name-asc",
    });
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        costPrice:
          product.costPrice ||
          product.cost_price ||
          product.importPrice ||
          "",
        categoryId: product.categoryId || product.category_id || "",
        supplierId: product.supplierId || product.supplier_id || "",
        imageUrl: normalizeProductImagePath(
          product.imageUrl || product.image_url || "",
        ),
      });
      setImagePreview(
        normalizeProductImagePath(product.imageUrl || product.image_url || ""),
      );
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        costPrice: "",
        categoryId: "",
        supplierId: "",
        imageUrl: "",
      });
      setImagePreview("");
      setSelectedImageFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      costPrice: "",
      categoryId: "",
      supplierId: "",
      imageUrl: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      formData.description.trim().length < 10 ||
      !formData.price ||
      !formData.categoryId ||
      !formData.supplierId
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      let resolvedImageUrl = formData.imageUrl;
      // If user selected a new image but didn't click upload, upload it automatically
      if (
        selectedImageFile &&
        !resolvedImageUrl?.includes(PRODUCT_IMAGE_PREFIX) &&
        !resolvedImageUrl?.startsWith("http")
      ) {
        try {
          const res = await productAPI.uploadImage(selectedImageFile);
          const data = res.data || res;
          let imgPath = "";
          if (data.path) imgPath = normalizeProductImagePath(data.path);
          else if (data.filename)
            imgPath = `${PRODUCT_IMAGE_PREFIX}${data.filename}`;
          else if (data.fileName)
            imgPath = `${PRODUCT_IMAGE_PREFIX}${data.fileName}`;
          else if (data.url) imgPath = data.url;

          if (imgPath) {
            resolvedImageUrl = imgPath;
            setFormData((f) => ({ ...f, imageUrl: imgPath }));
          }
        } catch (err) {
          console.error("Auto upload image error:", err);
          toast.error("Không thể tải ảnh lên. Vui lòng thử lại hoặc nhập URL");
          setUploadingImage(false);
          return;
        }
      }
      // Destructure costPrice out to avoid sending it to a backend that doesn't have the column
      const { costPrice, ...apiData } = {
        ...formData,
        imageUrl: resolvedImageUrl,
      };

      if (editingProduct) {
        const productId =
          editingProduct.id ||
          editingProduct.productId ||
          editingProduct.product_id;
        await productAPI.updateProduct(productId, apiData);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await productAPI.createProduct(apiData);
        toast.success("Thêm sản phẩm thành công");
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Không thể lưu sản phẩm");
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      const resolvedId =
        productId?.id || productId?.productId || productId?.product_id || productId;
      await productAPI.deleteProduct(resolvedId);
      toast.success("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredProducts.map((product) => ({
      "Mã SP": product.id,
      "Tên Sản Phẩm": product.name,
      "Danh Mục": product.categoryName,
      
      "Giá": product.price,
      "Tồn Kho": product.stockQuantity || 0,
      "Nhà Cung Cấp": product.supplierName || "",
      "Mô Tả": product.description || "",
    }));
    exportToCsv("danh-sach-san-pham.csv", csvData);
    toast.success("Đã xuất file CSV thành công!");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "N/A";
  };

  const supplierList = Array.isArray(suppliers) ? suppliers : [];

  const getSupplierName = (supplierId) => {
    const supplier = supplierList.find((s) => s.id === supplierId);
    return supplier?.name || "N/A";
  };

  const filteredProducts = products
    .filter((product) => {
      // Frontend-only filtering for soft-deleted items
      if (product.isActive === 0) return false;

      const term = searchTerm.trim().toLowerCase();
      const nameMatch = product.name?.toLowerCase().includes(term);
      const codeMatch = String(product.id || product.productId || "").includes(term);
      const supplierMatch =
        product.supplierName?.toLowerCase().includes(term) || false;
      const categoryMatch =
        product.categoryName?.toLowerCase().includes(term) || false;

      const searchOk = !term || nameMatch || codeMatch || supplierMatch || categoryMatch;

      const categoryOk =
        filters.categoryId === "all" ||
        String(product.categoryId || product.category_id) ===
          String(filters.categoryId);

      const supplierOk =
        filters.supplierId === "all" ||
        String(product.supplierId || product.supplier_id) ===
          String(filters.supplierId);

      const stockQty = Number(product.stockQuantity || 0);
      const stockOk =
        filters.stock === "all" ||
        (filters.stock === "in" && stockQty > 10) ||
        (filters.stock === "low" && stockQty > 0 && stockQty <= 10) ||
        (filters.stock === "out" && stockQty === 0);

      const priceValue = Number(product.price || 0);
      const minOk =
        !filters.priceMin || priceValue >= Number(filters.priceMin);
      const maxOk =
        !filters.priceMax || priceValue <= Number(filters.priceMax);

      return searchOk && categoryOk && supplierOk && stockOk && minOk && maxOk;
    })
    .sort((a, b) => {
      const sortKey = filters.sort;
      if (sortKey === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortKey === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (sortKey === "price-asc") {
        return Number(a.price || 0) - Number(b.price || 0);
      }
      if (sortKey === "price-desc") {
        return Number(b.price || 0) - Number(a.price || 0);
      }
      if (sortKey === "stock-asc") {
        return Number(a.stockQuantity || 0) - Number(b.stockQuantity || 0);
      }
      if (sortKey === "stock-desc") {
        return Number(b.stockQuantity || 0) - Number(a.stockQuantity || 0);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  // Ensure currentPage is valid if data shrinks
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const currentItems = filteredProducts.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý toàn bộ sản phẩm cà phê</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportCSV} variant="secondary">
            <Download className="w-5 h-5 mr-2" />
            Xuất CSV
          </Button>
          <Button onClick={() => handleOpenModal()} variant="primary">
            <Plus className="w-5 h-5 mr-2" />
            Thêm Sản Phẩm
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input
              placeholder="Tìm kiếm sản phẩm, nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Button onClick={handleSearch} variant="primary">
            Tìm Kiếm
          </Button>
          <Button
            onClick={() => setShowAdvanced((prev) => !prev)}
            variant="outline"
          >
            {showAdvanced ? "Ẩn Bộ Lọc" : "Bộ Lọc Nâng Cao"}
          </Button>
          {(searchTerm || filters.categoryId !== "all" || filters.supplierId !== "all" || filters.stock !== "all" || filters.priceMin || filters.priceMax) && (
            <Button
              onClick={() => {
                setSearchTerm("");
                resetFilters();
                fetchProducts();
              }}
              variant="outline"
            >
              Xóa Lọc
            </Button>
          )}
        </div>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh Mục
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, categoryId: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhà cung cấp
              </label>
              <select
                value={filters.supplierId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, supplierId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="all">Tất cả nhà cung cấp</option>
                {supplierList.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tồn kho
              </label>
              <select
                value={filters.stock}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, stock: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="all">Tất cả</option>
                <option value="in">Còn nhiều</option>
                <option value="low">Sắp hết</option>
                <option value="out">Hết hàng</option>
              </select>
            </div>

            <Input
              label="Giá từ"
              type="number"
              min="0"
              step="1000"
              value={filters.priceMin}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priceMin: e.target.value }))
              }
              placeholder="VD: 50000"
            />

            <Input
              label="Giá đến"
              type="number"
              min="0"
              step="1000"
              value={filters.priceMax}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priceMax: e.target.value }))
              }
              placeholder="VD: 500000"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp
              </label>
              <select
                value={filters.sort}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, sort: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="name-asc">Tên (A→Z)</option>
                <option value="name-desc">Tên (Z→A)</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="stock-asc">Tồn kho tăng dần</option>
                <option value="stock-desc">Tồn kho giảm dần</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản Phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh Mục
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhà Cung Cấp
                  </th>
                 
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá Bán
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn Kho
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.imageUrl?.startsWith("http")
                                ? product.imageUrl
                                : `..${normalizeProductImagePath(product.imageUrl)}`
                            }
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getCategoryName(
                          product.categoryId || product.category_id
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {getSupplierName(
                            product.supplierId || product.supplier_id
                          )}
                        </span>
                      </td>
                     
                      <td className="px-6 py-4">
                        <span className="font-semibold text-coffee-600">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            (product.stockQuantity || 0) > 10
                              ? "bg-green-100 text-green-800"
                              : (product.stockQuantity || 0) > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stockQuantity || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(product.id || product.productId || product.product_id)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "Không tìm thấy sản phẩm nào"
                        : "Chưa có sản phẩm nào"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Logic at bottom */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={validCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={handleCloseModal}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl z-50"
              >
                <form onSubmit={handleSubmit}>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {editingProduct ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4">
                    <Input
                      label="Tên Sản Phẩm"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      icon={<Package className="w-5 h-5" />}
                      placeholder="Cà phê Robusta..."
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô Tả
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        placeholder="Mô tả chi tiết về sản phẩm..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Giá Bán (VNĐ) *</label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          onWheel={(e) => e.target.blur()}
                          required
                          placeholder="200000"
                          min="0"
                          step="1000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Danh Mục
                        </label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              categoryId: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhà Cung Cấp
                      </label>
                      <select
                        value={formData.supplierId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supplierId: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      >
                        <option value="">Chọn nhà cung cấp</option>

                         {supplierList.map((sup) => (
                          <option key={sup.id} value={sup.id}>
                            {sup.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ảnh sản phẩm
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setSelectedImageFile(file);
                            if (file) {
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            if (!selectedImageFile) {
                              toast.error(
                                "Vui lòng chọn tập tin trước khi tải lên"
                              );
                              return;
                            }
                            setUploadingImage(true);
                            try {
                              const res = await productAPI.uploadImage(
                                selectedImageFile
                              );
                              // Expect backend to return { filename: 'img.jpg' } or { path: './asset/products/img/img.jpg' }
                              const data = res.data || res;
                              let imgPath = "";
                              if (data.path) imgPath = normalizeProductImagePath(data.path);
                              else if (data.filename)
                                imgPath = `${PRODUCT_IMAGE_PREFIX}${data.filename}`;
                              else if (data.fileName)
                                imgPath = `${PRODUCT_IMAGE_PREFIX}${data.fileName}`;
                              else if (data.url) imgPath = data.url;

                              if (!imgPath) {
                                toast.error(
                                  "Không nhận được đường dẫn ảnh từ server"
                                );
                              } else {
                                setFormData({ ...formData, imageUrl: imgPath });
                                toast.success("Tải ảnh lên thành công");
                              }
                            } catch (err) {
                              console.error("Upload image error:", err);
                              toast.error("Không thể tải ảnh lên");
                            } finally {
                              setUploadingImage(false);
                            }
                          }}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? "Đang tải..." : "Tải lên"}
                        </Button>
                      </div>

                      <div className="mt-2">
                        {imagePreview ? (
                          <img
                            src={
                              imagePreview.startsWith("blob:") ||
                              imagePreview.startsWith("http")
                                ? imagePreview
                                : `..${normalizeProductImagePath(imagePreview)}`
                            }
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/128";
                            }}
                          />
                        ) : formData.imageUrl ? (
                          <img
                            src={
                              formData.imageUrl.startsWith("./")
                                ? `..${formData.imageUrl}`
                                : formData.imageUrl
                            }
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/128";
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      variant="outline"
                    >
                      Hủy
                    </Button>
                    <Button type="submit" variant="primary">
                      {editingProduct ? "Cập Nhật" : "Thêm Mới"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductsPage;
