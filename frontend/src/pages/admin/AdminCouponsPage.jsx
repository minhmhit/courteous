import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { couponAPI } from "../../services";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import useToastStore from "../../stores/useToastStore";
import { formatDate, formatDateISO } from "../../utils/formatDate";

const emptyForm = {
  code: "",
  discountPercentage: 0,
  validFrom: "",
  validUntil: "",
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
      const list = res?.data?.coupons;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      discountPercentage: c.discountPercent || 0,
      validFrom: c.validFrom ? c.validFrom.slice(0, 16) : "",
      validUntil: c.validUntil ? c.validUntil.slice(0, 16) : "",
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
        discountPercent: Number(form.discountPercentage) || 0,
        validFrom: form.validFrom ? formatDateISO(form.validFrom) : null,
        validUntil: form.validUntil ? formatDateISO(form.validUntil) : null,
        
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
                {/* <th className="p-3">Lượt/giới hạn</th> */}
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

              {coupons.map((c) => {
                const now = new Date();
                const validFrom = c.validFrom ? new Date(c.validFrom) : null;
                const validUntil = c.validUntil ? new Date(c.validUntil) : null;
                const isInValidPeriod =
                  (!validFrom || now >= validFrom) &&
                  (!validUntil || now <= validUntil);
                const isActive = c.isActive && isInValidPeriod;

                return (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.code}</td>
                    <td className="p-3">{c.discountPercent}%</td>
                    <td className="p-3">
                      {c.validFrom
                        ? formatDate(c.validFrom, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                      <br />
                      {c.validUntil
                        ? formatDate(c.validUntil, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    {/* <td className="p-3">
                    {c.currentUsage || 0}/{c.usageLimit || 0}
                  </td> */}
                    <td className="p-3">
                      <span
                        className={
                          isActive
                            ? "text-green-600 font-medium"
                            : "text-gray-500"
                        }
                      >
                        {isInValidPeriod ? "Hoạt động" : "Không hoạt động"}
                      </span>
                      {!isInValidPeriod && (
                        <span className="text-xs text-amber-600 block">
                          (Ngoài thời gian)
                        </span>
                      )}
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
                );
              })}
            </tbody>
          </table>
        </div>

        <Modal
          isOpen={showModal}
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
                name="validFrom"
                value={form.validFrom}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <label className="block text-sm">Kết thúc</label>
              <input
                type="datetime-local"
                name="validUntil"
                value={form.validUntil}
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
