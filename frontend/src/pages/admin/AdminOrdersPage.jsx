import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
} from "lucide-react";
import { orderAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { exportToCsv } from "../../utils/exportCSV";

const AdminOrdersPage = () => {
  const toast = useToastStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const filterStatus = statusFilter === "all" ? null : statusFilter;
      const response = await orderAPI.getAllOrders(1, 100, filterStatus);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!confirm(`Xác nhận cập nhật trạng thái đơn hàng #${orderId}?`)) return;

    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      const response = await orderAPI.getOrderById(orderId);
      setSelectedOrder(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      toast.error("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredOrders.map((order) => ({
      "Mã Đơn": order.id,
      "Thời Gian": formatDate(order.createdAt || order.created_at),
      "Tổng Tiền": order.totalAmount || order.total_amount,
      "Trạng Thái": getStatusInfo(order.status)?.label || order.status,
      "Người Dùng": order.userId || order.user_id,
    }));
    exportToCsv("danh-sach-don-hang.csv", csvData);
    toast.success("Đã xuất file CSV thành công!");
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

  const statusConfig = {
    PENDING: {
      label: "Chờ xác nhận",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      color: "bg-blue-100 text-blue-800",
      icon: Package,
    },
    SHIPPING: {
      label: "Đang giao",
      color: "bg-purple-100 text-purple-800",
      icon: Truck,
    },
    COMPLETED: {
      label: "Hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    CANCELLED: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
    pending: {
      label: "Chờ xác nhận",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    confirmed: {
      label: "Đã xác nhận",
      color: "bg-blue-100 text-blue-800",
      icon: Package,
    },
    shipping: {
      label: "Đang giao",
      color: "bg-purple-100 text-purple-800",
      icon: Truck,
    },
    completed: {
      label: "Hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };

  const getStatusInfo = (status) => {
    return (
      statusConfig[status] || {
        label: status,
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
      }
    );
  };

  const filteredOrders = orders.filter((order) => {
    const searchMatch =
      order.id.toString().includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  const statusOptions = [
    { value: "all", label: "Tất cả", count: orders.length },
    {
      value: "PENDING",
      label: "Chờ xác nhận",
      count: orders.filter(
        (o) => o.status === "PENDING" || o.status === "pending"
      ).length,
    },
    {
      value: "CONFIRMED",
      label: "Đã xác nhận",
      count: orders.filter(
        (o) => o.status === "CONFIRMED" || o.status === "confirmed"
      ).length,
    },
    {
      value: "SHIPPING",
      label: "Đang giao",
      count: orders.filter(
        (o) => o.status === "SHIPPING" || o.status === "shipping"
      ).length,
    },
    {
      value: "COMPLETED",
      label: "Hoàn thành",
      count: orders.filter(
        (o) => o.status === "COMPLETED" || o.status === "completed"
      ).length,
    },
    {
      value: "CANCELLED",
      label: "Đã hủy",
      count: orders.filter(
        (o) => o.status === "CANCELLED" || o.status === "cancelled"
      ).length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và xử lý tất cả đơn hàng
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="secondary">
          <Download className="w-5 h-5 mr-2" />
          Xuất CSV
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === option.value
                  ? "bg-coffee-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Input
          placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Orders Table */}
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
                    Mã Đơn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách Hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời Gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng Tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-medium text-gray-900">
                            #{order.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.customerName ||
                                order.customer_name ||
                                "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerPhone ||
                                order.customer_phone ||
                                ""}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(order.createdAt || order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">
                            {formatPrice(
                              order.totalAmount || order.total_amount
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => handleViewDetail(order.id)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </button>

                          {order.status !== "COMPLETED" &&
                            order.status !== "completed" &&
                            order.status !== "CANCELLED" &&
                            order.status !== "cancelled" && (
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateStatus(order.id, e.target.value)
                                }
                                className="inline-flex px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                              >
                                <option value="PENDING">Chờ xác nhận</option>
                                <option value="CONFIRMED">Đã xác nhận</option>
                                <option value="SHIPPING">Đang giao</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCELLED">Hủy</option>
                              </select>
                            )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "Không tìm thấy đơn hàng nào"
                        : "Chưa có đơn hàng nào"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowDetailModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl z-50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Chi Tiết Đơn Hàng #{selectedOrder.id}
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Khách hàng</p>
                      <p className="font-medium">
                        {selectedOrder.customerName ||
                          selectedOrder.customer_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-medium">
                        {selectedOrder.customerPhone ||
                          selectedOrder.customer_phone}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Địa chỉ</p>
                      <p className="font-medium">
                        {selectedOrder.shippingAddress ||
                          selectedOrder.shipping_address ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thời gian đặt</p>
                      <p className="font-medium">
                        {formatDate(
                          selectedOrder.createdAt || selectedOrder.created_at
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          getStatusInfo(selectedOrder.status).color
                        }`}
                      >
                        {getStatusInfo(selectedOrder.status).label}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Sản phẩm</h4>
                    <div className="space-y-2">
                      {(selectedOrder.items || []).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.productName || item.product_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-coffee-600">
                        {formatPrice(
                          selectedOrder.totalAmount ||
                            selectedOrder.total_amount
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setShowDetailModal(false)}
                    variant="outline"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
