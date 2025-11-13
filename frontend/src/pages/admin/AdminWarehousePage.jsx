import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  Eye,
  Edit,
  X,
  TruckIcon,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  inventoryAPI,
  importAPI,
  productAPI,
  supplierAPI,
} from "../../services";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AdminWarehousePage = () => {
  const toast = useToastStore();
  const [activeTab, setActiveTab] = useState("inventory"); // inventory, imports, low-stock
  const [inventory, setInventory] = useState([]);
  const [imports, setImports] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [importFormData, setImportFormData] = useState({
    supplierId: "",
    importItems: [{ productId: "", quantity: "", price: "" }],
  });
  const [adjustQuantity, setAdjustQuantity] = useState("");

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [inventoryRes, importsRes, productsRes, suppliersRes] =
        await Promise.all([
          inventoryAPI.getAllInventory(1, 100).catch(() => ({ data: [] })),
          importAPI.getAllImports(1, 100).catch(() => ({ data: [] })),
          productAPI.getAllProducts().catch(() => ({ data: [] })),
          supplierAPI.getAllSuppliers().catch(() => ({ data: [] })),
        ]);

      setInventory(inventoryRes.data || []);
      setImports(importsRes.data || []);
      setProducts(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);

      // Fetch low stock
      if (activeTab === "low-stock") {
        const lowStockRes = await inventoryAPI.getLowStockProducts(20);
        setLowStockProducts(lowStockRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching warehouse data:", error);
      toast.error("Không thể tải dữ liệu kho hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenImportModal = () => {
    setImportFormData({
      supplierId: "",
      importItems: [{ productId: "", quantity: "", price: "" }],
    });
    setShowImportModal(true);
  };

  const handleAddImportItem = () => {
    setImportFormData({
      ...importFormData,
      importItems: [
        ...importFormData.importItems,
        { productId: "", quantity: "", price: "" },
      ],
    });
  };

  const handleRemoveImportItem = (index) => {
    const newItems = importFormData.importItems.filter((_, i) => i !== index);
    setImportFormData({ ...importFormData, importItems: newItems });
  };

  const handleImportItemChange = (index, field, value) => {
    const newItems = [...importFormData.importItems];
    newItems[index][field] = value;
    setImportFormData({ ...importFormData, importItems: newItems });
  };

  const handleSubmitImport = async (e) => {
    e.preventDefault();

    if (!importFormData.supplierId) {
      toast.error("Vui lòng chọn nhà cung cấp");
      return;
    }

    if (
      importFormData.importItems.some(
        (item) => !item.productId || !item.quantity || !item.price
      )
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin sản phẩm");
      return;
    }

    try {
      await importAPI.createImport({
        supplierId: parseInt(importFormData.supplierId),
        importItems: importFormData.importItems.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
      });
      toast.success("Tạo phiếu nhập hàng thành công");
      setShowImportModal(false);
      fetchAllData();
    } catch (error) {
      console.error("Error creating import:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo phiếu nhập hàng"
      );
    }
  };

  const handleOpenAdjustModal = (product) => {
    setSelectedProduct(product);
    setAdjustQuantity(product.quantity || 0);
    setShowAdjustModal(true);
  };

  const handleSubmitAdjust = async (e) => {
    e.preventDefault();

    if (!selectedProduct) return;

    try {
      await inventoryAPI.updateInventory(
        selectedProduct.productId || selectedProduct.id,
        parseInt(adjustQuantity)
      );
      toast.success("Cập nhật tồn kho thành công");
      setShowAdjustModal(false);
      fetchAllData();
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error("Không thể cập nhật tồn kho");
    }
  };

  const handleUpdatePaymentStatus = async (importId, status) => {
    try {
      await importAPI.updatePaymentStatus(importId, status);
      toast.success("Cập nhật trạng thái thành công");
      fetchAllData();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || "N/A";
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || "N/A";
  };

  const calculateImportTotal = (importItem) => {
    return (importItem.importItems || []).reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    );
  };

  const filteredInventory = inventory.filter((item) => {
    const productName = getProductName(item.productId);
    return productName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredImports = imports.filter((item) => {
    const supplierName = getSupplierName(item.supplierId);
    return supplierName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Kho</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi tồn kho và phiếu nhập hàng
          </p>
        </div>
        <Button onClick={handleOpenImportModal} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Tạo Phiếu Nhập
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "inventory"
                ? "bg-coffee-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Tồn Kho
          </button>
          <button
            onClick={() => setActiveTab("imports")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "imports"
                ? "bg-coffee-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <TruckIcon className="w-5 h-5 inline mr-2" />
            Phiếu Nhập
          </button>
          <button
            onClick={() => setActiveTab("low-stock")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "low-stock"
                ? "bg-coffee-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Sắp Hết Hàng
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Input
          placeholder={`Tìm kiếm ${
            activeTab === "imports" ? "phiếu nhập" : "sản phẩm"
          }...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
        </div>
      ) : (
        <>
          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sản Phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tồn Kho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {getProductName(item.productId)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-2xl font-bold text-gray-900">
                            {item.quantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {(item.quantity || 0) < 20 ? (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Sắp hết
                            </span>
                          ) : (item.quantity || 0) < 50 ? (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Thấp
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Đủ hàng
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => handleOpenAdjustModal(item)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Điều Chỉnh
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Không có dữ liệu tồn kho
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Imports Tab */}
          {activeTab === "imports" && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã Phiếu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nhà Cung Cấp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày Nhập
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tổng Tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredImports.length > 0 ? (
                    filteredImports.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="font-mono font-medium text-gray-900">
                            #{item.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {getSupplierName(item.supplierId)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(item.createdAt || item.created_at)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatPrice(calculateImportTotal(item))}
                        </td>
                        <td className="px-6 py-4">
                          {item.paymentStatus === "PAID" ||
                          item.payment_status === "PAID" ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              Đã thanh toán
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              Chưa thanh toán
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.paymentStatus !== "PAID" &&
                            item.payment_status !== "PAID" && (
                              <Button
                                onClick={() =>
                                  handleUpdatePaymentStatus(item.id, "PAID")
                                }
                                variant="outline"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Xác Nhận
                              </Button>
                            )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Chưa có phiếu nhập nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Low Stock Tab */}
          {activeTab === "low-stock" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-2 border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          {getProductName(product.productId)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Còn {product.quantity || 0} sản phẩm
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleOpenAdjustModal(product)}
                      variant="primary"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nhập Thêm Hàng
                    </Button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 bg-white rounded-lg p-12 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tất cả sản phẩm đều đủ hàng</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75"
                onClick={() => setShowImportModal(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
              >
                <form onSubmit={handleSubmitImport}>
                  <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Tạo Phiếu Nhập Hàng
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Supplier */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhà Cung Cấp *
                      </label>
                      <select
                        value={importFormData.supplierId}
                        onChange={(e) =>
                          setImportFormData({
                            ...importFormData,
                            supplierId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        required
                      >
                        <option value="">-- Chọn nhà cung cấp --</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Import Items */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">
                          Sản Phẩm Nhập *
                        </label>
                        <Button
                          type="button"
                          onClick={handleAddImportItem}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Thêm Sản Phẩm
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {importFormData.importItems.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="col-span-5">
                              <select
                                value={item.productId}
                                onChange={(e) =>
                                  handleImportItemChange(
                                    index,
                                    "productId",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                required
                              >
                                <option value="">-- Chọn sản phẩm --</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                placeholder="Số lượng"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleImportItemChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                required
                                min="1"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                placeholder="Giá nhập"
                                value={item.price}
                                onChange={(e) =>
                                  handleImportItemChange(
                                    index,
                                    "price",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                required
                                min="0"
                              />
                            </div>
                            {importFormData.importItems.length > 1 && (
                              <div className="col-span-1 flex items-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImportItem(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <Button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      variant="outline"
                    >
                      Hủy
                    </Button>
                    <Button type="submit" variant="primary">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Tạo Phiếu Nhập
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjust Inventory Modal */}
      <AnimatePresence>
        {showAdjustModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75"
                onClick={() => setShowAdjustModal(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
              >
                <form onSubmit={handleSubmitAdjust}>
                  <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Điều Chỉnh Tồn Kho
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAdjustModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sản Phẩm
                      </label>
                      <p className="text-lg font-bold text-gray-900">
                        {getProductName(
                          selectedProduct?.productId || selectedProduct?.id
                        )}
                      </p>
                    </div>

                    <Input
                      label="Số Lượng Mới"
                      type="number"
                      value={adjustQuantity}
                      onChange={(e) => setAdjustQuantity(e.target.value)}
                      required
                      min="0"
                      icon={<Package className="w-5 h-5" />}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <Button
                      type="button"
                      onClick={() => setShowAdjustModal(false)}
                      variant="outline"
                    >
                      Hủy
                    </Button>
                    <Button type="submit" variant="primary">
                      Cập Nhật
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

export default AdminWarehousePage;
