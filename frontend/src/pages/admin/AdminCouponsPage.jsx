import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { couponAPI } from "../../services";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import useToastStore from "../../stores/useToastStore";

const emptyForm = {
  code: "",
  discountPercentage: 0,
  startDate: "",
  endDate: "",
  usageLimit: 0,
  isActive: true,
};

export default function AdminCouponsPage() {
  const toast = useToastStore();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await couponAPI.getAllCoupons();
      const list = res.data || res.coupons || res;
      setCoupons(list);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code || "",
      discountPercentage: c.discountPercentage || 0,
      startDate: c.startDate ? c.startDate.slice(0, 16) : "",
      endDate: c.endDate ? c.endDate.slice(0, 16) : "",
      usageLimit: c.usageLimit || 0,
      isActive: !!c.isActive,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code: form.code,
        discountPercentage: Number(form.discountPercentage) || 0,
        startDate: form.startDate
          ? new Date(form.startDate).toISOString()
          : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        usageLimit: Number(form.usageLimit) || 0,
        isActive: !!form.isActive,
      };

      if (editing && editing.id) {
        await couponAPI.updateCoupon(editing.id, payload);
        toast.success("Cập nhật mã giảm giá thành công");
      } else {
        await couponAPI.createCoupon(payload);
        toast.success("Tạo mã giảm giá thành công");
      }

      setShowModal(false);
      await loadCoupons();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu mã giảm giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Xóa mã ${c.code}?`)) return;
    try {
      await couponAPI.deleteCoupon(c.id);
      toast.success("Đã xóa mã giảm giá");
      await loadCoupons();
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa mã giảm giá");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
          <Button onClick={openCreate} variant="primary">
            <Plus className="w-4 h-4 mr-2" /> Tạo mã mới
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Mã</th>
                <th className="p-3">% Giảm</th>
                <th className="p-3">Hiệu lực</th>
                <th className="p-3">Lượt/giới hạn</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              )}

              {!loading && coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Không có mã giảm giá
                  </td>
                </tr>
              )}

              {coupons.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.code}</td>
                  <td className="p-3">{c.discountPercentage}%</td>
                  <td className="p-3">
                    {c.startDate ? new Date(c.startDate).toLocaleString() : "-"}
                    <br />
                    {c.endDate ? new Date(c.endDate).toLocaleString() : "-"}
                  </td>
                  <td className="p-3">
                    {c.currentUsage || 0}/{c.usageLimit || 0}
                  </td>
                  <td className="p-3">
                    {c.isActive ? "Hoạt động" : "Không hoạt động"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="text-red-600 hover:underline inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={editing ? "Sửa mã" : "Tạo mã mới"}
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <Input
                label="Mã"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
              />
              <Input
                label="% Giảm"
                name="discountPercentage"
                type="number"
                value={form.discountPercentage}
                onChange={handleChange}
                required
              />
              <label className="block text-sm">Bắt đầu</label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <label className="block text-sm">Kết thúc</label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <Input
                label="Lượt sử dụng (limit)"
                name="usageLimit"
                type="number"
                value={form.usageLimit}
                onChange={handleChange}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <span>Kích hoạt</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </Button>
              <Button type="submit" isLoading={submitting}>
                {editing ? "Lưu" : "Tạo"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
