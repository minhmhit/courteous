import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Tag, Search } from "lucide-react";
import { couponAPI } from "../../services";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    validFrom: "",
    validUntil: "",
    sort: "newest",
  });
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await couponAPI.getAllCoupons();
      setCoupons(res?.data?.data?.coupons || []);
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
      toast.error("Lỗi khi lưu mã giảm giá");
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

  const filteredCoupons = [...coupons]
    .filter((coupon) => {
      const now = new Date();
      const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
      const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;
      const isInValidPeriod =
        (!validFrom || now >= validFrom) && (!validUntil || now <= validUntil);
      const status = coupon.isActive && isInValidPeriod ? "active" : coupon.isActive ? "scheduled" : "inactive";
      const keyword = searchTerm.toLowerCase();
      const searchMatch = !keyword || coupon.code?.toLowerCase().includes(keyword);
      const statusMatch = filters.status === "all" || filters.status === status;
      const fromMatch =
        !filters.validFrom ||
        (validFrom && validFrom >= new Date(`${filters.validFrom}T00:00:00`));
      const toMatch =
        !filters.validUntil ||
        (validUntil && validUntil <= new Date(`${filters.validUntil}T23:59:59`));
      return searchMatch && statusMatch && fromMatch && toMatch;
    })
    .sort((a, b) => {
      if (filters.sort === "code-asc") return (a.code || "").localeCompare(b.code || "");
      if (filters.sort === "code-desc") return (b.code || "").localeCompare(a.code || "");
      if (filters.sort === "highest-discount") return Number(b.discountPercent || 0) - Number(a.discountPercent || 0);
      return new Date(b.validFrom || 0) - new Date(a.validFrom || 0);
    });

  return (
    <div className="space-y-6">
      <div className="glass-card flex flex-col gap-4 lg:flex-row lg:items-center justify-between p-4 rounded-3xl shadow-sm border border-white/20 bg-white/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mã giảm giá</h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-48">
            <Input
              placeholder="Tìm mã coupon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="glass-input text-sm">
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="scheduled">Chưa tới hạn</option>
            <option value="inactive">Đã tắt</option>
          </select>
          <input type="date" value={filters.validFrom} onChange={(e) => setFilters((prev) => ({ ...prev, validFrom: e.target.value }))} className="glass-input text-sm w-[130px]" />
          <input type="date" value={filters.validUntil} onChange={(e) => setFilters((prev) => ({ ...prev, validUntil: e.target.value }))} className="glass-input text-sm w-[130px]" />
          <select value={filters.sort} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))} className="glass-input text-sm">
            <option value="newest">Mới nhất</option>
            <option value="code-asc">A-Z</option>
            <option value="code-desc">Z-A</option>
            <option value="highest-discount">% Cao nhất</option>
          </select>
          <Button onClick={openCreate} variant="primary" className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" /> Tạo mã
          </Button>
        </div>
      </div>

      <div className="admin-table-shell flex-1">
        <div className="w-full">
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
              {loading && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Đang tải...</td></tr>}
              {!loading && filteredCoupons.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Không có mã giảm giá phù hợp</td></tr>}
              {filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((coupon) => {
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
        
        {!loading && Math.ceil(filteredCoupons.length / itemsPerPage) > 1 && (
          <div className="p-4 border-t border-white/20">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCoupons.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
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
