import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
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
      setCoupons(res?.data?.coupons || []);
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

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code || "",
      discountPercentage: coupon.discountPercent || 0,
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 16) : "",
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 16) : "",
      usageLimit: coupon.usageLimit || 0,
      isActive: !!coupon.isActive,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((state) => ({ ...state, [name]: type === "checkbox" ? checked : value }));
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

      if (editing?.id) {
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

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Xóa mã ${coupon.code}?`)) return;
    try {
      await couponAPI.deleteCoupon(coupon.id);
      toast.success("Đã xóa mã giảm giá");
      await loadCoupons();
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa mã giảm giá");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý mã giảm giá</h1>
          <p className="mt-1 text-slate-600">Theo dõi hiệu lực, phần trăm giảm và trạng thái kích hoạt.</p>
        </div>
        <Button onClick={openCreate} variant="primary">
          <Plus className="mr-2 h-4 w-4" /> Tạo mã mới
        </Button>
      </div>

      <div className="admin-table-shell">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/10 text-slate-500">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em]">Mã</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em]">% Giảm</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em]">Hiệu lực</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">Đang tải...</td>
                </tr>
              )}
              {!loading && coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">Không có mã giảm giá</td>
                </tr>
              )}
              {coupons.map((coupon) => {
                const now = new Date();
                const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
                const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;
                const isInValidPeriod = (!validFrom || now >= validFrom) && (!validUntil || now <= validUntil);
                const isActive = coupon.isActive && isInValidPeriod;

                return (
                  <tr key={coupon.id} className="hover:bg-white/20">
                    <td className="p-4 font-semibold text-slate-900">{coupon.code}</td>
                    <td className="p-4 text-slate-700">{coupon.discountPercent}%</td>
                    <td className="p-4 text-sm text-slate-600">
                      <div>{coupon.validFrom ? formatDate(coupon.validFrom) : "-"}</div>
                      <div>{coupon.validUntil ? formatDate(coupon.validUntil) : "-"}</div>
                    </td>
                    <td className="p-4">
                      <span className={isActive ? "glass-chip text-emerald-700" : "glass-chip text-slate-500"}>
                        {isInValidPeriod ? "Hoạt động" : "Ngoài thời gian"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(coupon)} className="glass-card inline-flex items-center rounded-2xl px-3 py-2 text-sm text-blue-600">
                          <Edit className="mr-1 h-4 w-4" /> Sửa
                        </button>
                        <button onClick={() => handleDelete(coupon)} className="glass-card inline-flex items-center rounded-2xl px-3 py-2 text-sm text-red-600">
                          <Trash2 className="mr-1 h-4 w-4" /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Sửa mã" : "Tạo mã mới"}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <Input label="Mã" name="code" value={form.code} onChange={handleChange} required />
            <Input label="% Giảm" name="discountPercentage" type="number" value={form.discountPercentage} onChange={handleChange} required />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Bắt đầu</label>
              <input type="datetime-local" name="validFrom" value={form.validFrom} onChange={handleChange} className="glass-input w-full" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Kết thúc</label>
              <input type="datetime-local" name="validUntil" value={form.validUntil} onChange={handleChange} className="glass-input w-full" />
            </div>
            <Input label="Lượt sử dụng (limit)" name="usageLimit" type="number" value={form.usageLimit} onChange={handleChange} />
            <label className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700">
              <Tag className="h-4 w-4 text-coffee-700" />
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              <span>Kích hoạt</span>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button type="submit" isLoading={submitting}>{editing ? "Lưu" : "Tạo"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
