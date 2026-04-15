import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, CheckCircle, XCircle, Clock, Filter, Download, Printer } from "lucide-react";
import { orderAPI, paymentAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import { exportToCsv } from "../../utils/exportCSV";
import { formatDate, formatCurrency } from "../../utils/formatDate";

const statusConfig = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800", icon: XCircle },
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800", icon: XCircle },
};

const getStatusInfo = (status) =>
  statusConfig[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
  };

const AdminOrdersPage = () => {
  const toast = useToastStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    paymentStatus: "all",
    dateFrom: "",
    dateTo: "",
    minTotal: "",
    maxTotal: "",
  });
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
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
      const orderList = response.data || [];
      const ordersWithPayment = await Promise.all(
        orderList.map(async (order) => {
          try {
            const paymentResponse = await paymentAPI.getOrderPayment(order.id);
            const payment = paymentResponse?.data || paymentResponse || null;
            return { ...order, paymentStatus: payment?.status || null };
          } catch {
            return { ...order, paymentStatus: null };
          }
        }),
      );
      setOrders(ordersWithPayment);
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
      setSelectedOrder(response.data || response);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      toast.error("Không thể tải chi tiết đơn hàng");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const keyword = searchTerm.toLowerCase();
    const orderDate = new Date(order.orderDate);
    const totalAmount = Number(order.totalAmount || 0);
    const searchMatch =
      String(order.id || "").includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(keyword) ||
      order.customer_name?.toLowerCase().includes(keyword) ||
      order.phoneNumber?.includes(searchTerm) ||
      order.email?.toLowerCase().includes(keyword) ||
      order.shipAddress?.toLowerCase().includes(keyword);
    const paymentMatch =
      advancedFilters.paymentStatus === "all" ||
      (advancedFilters.paymentStatus === "none" && !order.paymentStatus) ||
      order.paymentStatus === advancedFilters.paymentStatus;
    const fromMatch =
      !advancedFilters.dateFrom ||
      orderDate >= new Date(`${advancedFilters.dateFrom}T00:00:00`);
    const toMatch =
      !advancedFilters.dateTo ||
      orderDate <= new Date(`${advancedFilters.dateTo}T23:59:59`);
    const minMatch =
      !advancedFilters.minTotal || totalAmount >= Number(advancedFilters.minTotal);
    const maxMatch =
      !advancedFilters.maxTotal || totalAmount <= Number(advancedFilters.maxTotal);
    return searchMatch && paymentMatch && fromMatch && toMatch && minMatch && maxMatch;
  });

  const handleExportCSV = () => {
    exportToCsv(
      "danh-sach-don-hang.csv",
      filteredOrders.map((order) => ({
        "Mã Đơn": order.id,
        "Thời Gian": formatDate(order.orderDate),
        "Tổng Tiền": order.totalAmount,
        "Trạng Thái": getStatusInfo(order.status)?.label || order.status,
        "Thanh Toán": order.paymentStatus || "Chưa có",
        "Người Dùng": order.customerName,
        "Số Điện Thoại": order.phoneNumber,
        Email: order.email,
        "Địa Chỉ": order.shipAddress,
      })),
    );
    toast.success("Đã xuất file CSV thành công!");
  };

  const statusOptions = [
    { value: "all", label: "Tất cả", count: orders.length },
    { value: "PENDING", label: "Chờ xác nhận", count: orders.filter((o) => o.status === "PENDING" || o.status === "pending").length },
    { value: "COMPLETED", label: "Hoàn thành", count: orders.filter((o) => o.status === "COMPLETED" || o.status === "completed").length },
    { value: "CANCELLED", label: "Đã hủy", count: orders.filter((o) => o.status === "CANCELLED" || o.status === "cancelled").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
          <p className="mt-1 text-gray-600">Theo dõi và xử lý tất cả đơn hàng</p>
        </div>
        <Button onClick={handleExportCSV} variant="secondary">
          <Download className="mr-2 h-5 w-5" />
          Xuất CSV
        </Button>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-5 w-5 flex-shrink-0 text-gray-500" />
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setStatusFilter(option.value);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium transition-colors ${statusFilter === option.value ? "bg-coffee-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[260px] flex-1">
            <Input
              placeholder="Tìm theo mã đơn, tên, SĐT, email, địa chỉ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="h-5 w-5" />}
            />
          </div>
          <Button onClick={() => setShowAdvanced((prev) => !prev)} variant="outline">
            {showAdvanced ? "Ẩn lọc nâng cao" : "Lọc nâng cao"}
          </Button>
        </div>
        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <select value={advancedFilters.paymentStatus} onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2">
              <option value="all">Tất cả thanh toán</option>
              <option value="SUCCESS">Đã thanh toán</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="FAILED">Thất bại</option>
              <option value="none">Chưa có payment</option>
            </select>
            <input type="date" value={advancedFilters.dateFrom} onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, dateFrom: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
            <input type="date" value={advancedFilters.dateTo} onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, dateTo: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
            <input type="number" min="0" placeholder="Tổng tiền từ" value={advancedFilters.minTotal} onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, minTotal: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
            <input type="number" min="0" placeholder="Tổng tiền đến" value={advancedFilters.maxTotal} onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, maxTotal: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-coffee-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mã Đơn</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Khách Hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Thời Gian</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trạng Thái</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Thanh Toán</th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length > 0 ? (
                  filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4"><span className="font-mono font-medium text-gray-900">#{order.id}</span></td>
                        <td className="px-6 py-4"><div><div className="font-medium text-gray-900">{order.customerName}</div><div className="text-sm text-gray-500">{order.phoneNumber}</div></div></td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{formatDate(order.orderDate)}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{order.paymentStatus || "Chưa có"}</td>
                        <td className="space-x-2 whitespace-nowrap px-6 py-4 text-right">
                          {order.status !== "COMPLETED" && order.status !== "completed" && order.status !== "CANCELLED" && order.status !== "cancelled" && (
                            <select value={order.status} onChange={(e) => handleUpdateStatus(order.id, e.target.value)} className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-coffee-500">
                              <option value="PENDING">Chờ xác nhận</option>
                              <option value="COMPLETED">Hoàn thành</option>
                              <option value="CANCELLED">Hủy</option>
                            </select>
                          )}
                          <button onClick={() => handleViewDetail(order.id)} className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800">
                            <Eye className="mr-1 h-4 w-4" />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? "Không tìm thấy đơn hàng nào" : "Chưa có đơn hàng nào"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Logic at bottom */}
        {!isLoading && Math.ceil(filteredOrders.length / itemsPerPage) > 1 && (
          <Pagination
            currentPage={Math.min(currentPage, Math.ceil(filteredOrders.length / itemsPerPage))}
            totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-50 my-8 inline-block w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Chi Tiết Đơn Hàng #{selectedOrder.id}</h3>
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-600">Khách hàng</p><p className="font-medium">{selectedOrder.customerName}</p></div>
                    <div><p className="text-sm text-gray-600">Số điện thoại</p><p className="font-medium">{selectedOrder.phoneNumber}</p></div>
                    <div className="col-span-2"><p className="text-sm text-gray-600">Địa chỉ</p><p className="font-medium">{selectedOrder.shipAddress}</p></div>
                    <div><p className="text-sm text-gray-600">Thời gian đặt</p><p className="font-medium">{formatDate(selectedOrder.orderDate)}</p></div>
                    <div><p className="text-sm text-gray-600">Trạng thái</p><span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusInfo(selectedOrder.status).color}`}>{getStatusInfo(selectedOrder.status).label}</span></div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="mb-3 font-semibold">Sản phẩm</h4>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Sản phẩm</th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Số lượng</th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Giá bán</th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(selectedOrder.items || []).map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-gray-900">{item.productName}</td>
                              <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.unitPrice * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-coffee-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    onClick={() => {
                      const win = window.open("", "_blank");
                      const rows = (selectedOrder.items || []).map((item) => `<tr><td>${item.productName || ""}</td><td style="text-align:right">${item.quantity || 0}</td><td style="text-align:right">${Number(item.unitPrice || 0).toLocaleString("vi-VN")} đ</td><td style="text-align:right">${(Number(item.unitPrice || 0) * Number(item.quantity || 0)).toLocaleString("vi-VN")} đ</td></tr>`).join("");
                      win.document.write(`<html><head><meta charset="UTF-8"><title>Phieu Xuat #${selectedOrder.id}</title><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5;font-size:12px;text-transform:uppercase}.total{font-weight:bold;font-size:16px;margin-top:20px;text-align:right}.info p{margin:4px 0;font-size:14px}</style></head><body><h2>PHIEU XUAT KHO - DON HANG #${selectedOrder.id}</h2><div class="info"><p><b>Khach hang:</b> ${selectedOrder.customerName || ""}</p><p><b>SDT:</b> ${selectedOrder.phoneNumber || ""}</p><p><b>Dia chi:</b> ${selectedOrder.shipAddress || ""}</p><p><b>Ngay:</b> ${new Date().toLocaleDateString("vi-VN")}</p></div><table><thead><tr><th>San pham</th><th style="text-align:right">SL</th><th style="text-align:right">Gia ban</th><th style="text-align:right">Thanh tien</th></tr></thead><tbody>${rows}</tbody></table><p class="total">Tong: ${Number(selectedOrder.totalAmount || 0).toLocaleString("vi-VN")} đ</p><script>window.print()<\/script></body></html>`);
                      win.document.close();
                    }}
                    variant="secondary"
                  >
                    <Printer className="mr-1 h-4 w-4" />
                    In Phiếu Xuất
                  </Button>
                  <Button onClick={() => setShowDetailModal(false)} variant="outline">Đóng</Button>
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
