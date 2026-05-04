import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Phone,
  MapPin,
  User,
  Building2,
} from "lucide-react";
import { supplierAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/apiValidation";
import { validateSupplierForm } from "../../validations/catalog";

const AdminSuppliersPage = () => {
  const toast = useToastStore();
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    sort: "name-asc",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactInfo: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await supplierAPI.getAllSuppliers();
      const raw = response?.suppliers?.data || response?.suppliers || response?.data || response || [];
      const supplierData = Array.isArray(raw) ? raw : [];
      setSuppliers(supplierData.filter((s) => s.isActive !== 0));
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Khong the tai danh sach nha cung cap");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || "",
        code: supplier.code || "",
        contactInfo: supplier.contactInfo || "",
        address: supplier.address || "",
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: "",
        code: "",
        contactInfo: "",
        address: "",
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormData({
      name: "",
      code: "",
      contactInfo: "",
      address: "",
    });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedFormData = {
      ...formData,
      code: String(formData.code || "").trim().toUpperCase(),
    };
    const validation = validateSupplierForm(normalizedFormData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      toast.error(Object.values(validation.errors)[0]);
      return;
    }

    try {
      setFormErrors({});
      const submitData = {
        name: normalizedFormData.name,
        code: normalizedFormData.code,
        contactInfo: normalizedFormData.contactInfo,
        address: normalizedFormData.address,
      };

      if (editingSupplier) {
        await supplierAPI.updateSupplier(editingSupplier.id, submitData);
        toast.success("Cap nhat nha cung cap thanh cong");
      } else {
        await supplierAPI.createSupplier(submitData);
        toast.success("Them nha cung cap thanh cong");
      }
      handleCloseModal();
      fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
      const fieldErrors = getApiFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      toast.error(getApiErrorMessage(error, "Khong the luu nha cung cap"));
    }
  };

  const handleDelete = async (supplierId) => {
    if (!confirm("Ban co chac muon xoa nha cung cap nay?")) return;

    try {
      const resolvedId =
        supplierId?.id ||
        supplierId?.supplierId ||
        supplierId?.supplier_id ||
        supplierId;
      await supplierAPI.deleteSupplier(resolvedId);
      toast.success("Xoa nha cung cap thanh cong");
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Khong the xoa nha cung cap");
    }
  };

  const filteredSuppliers = suppliers
    .filter((supplier) => {
      const searchLower = searchTerm.trim().toLowerCase();
      const searchMatch =
        !searchLower ||
        supplier.name?.toLowerCase().includes(searchLower) ||
        supplier.code?.toLowerCase().includes(searchLower) ||
        supplier.address?.toLowerCase().includes(searchLower) ||
        supplier.contactInfo?.toLowerCase().includes(searchLower);

      const status =
        supplier.isActive === 0 || supplier.isActive === false
          ? "inactive"
          : "active";
      const statusMatch =
        filters.status === "all" || filters.status === status;

      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      if (filters.sort === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (filters.sort === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (filters.sort === "code-asc") {
        return (a.code || "").localeCompare(b.code || "");
      }
      if (filters.sort === "code-desc") {
        return (b.code || "").localeCompare(a.code || "");
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quan Ly Nha Cung Cap</h1>
          <p className="text-gray-600 mt-1">Quan ly thong tin cac nha cung cap san pham</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Them Nha Cung Cap
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tong Nha Cung Cap</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dang Hoat Dong</p>
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.filter((s) => s.isActive !== 0 && s.isActive !== false).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngung Hoat Dong</p>
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.filter((s) => s.isActive === 0 || s.isActive === false).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input
              placeholder="Tim kiem nha cung cap..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Button
            onClick={() => setShowAdvanced((prev) => !prev)}
            variant="outline"
          >
            {showAdvanced ? "An Bo Loc" : "Bo Loc Nang Cao"}
          </Button>
          {(searchTerm || filters.status !== "all") && (
            <Button
              onClick={() => {
                setSearchTerm("");
                setFilters({ status: "all", sort: "name-asc" });
              }}
              variant="outline"
            >
              Xoa Loc
            </Button>
          )}
        </div>
        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trang thai</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="all">Tat ca</option>
                <option value="active">Dang hoat dong</option>
                <option value="inactive">Ngung hoat dong</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sap xep</label>
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sort: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="name-asc">Ten (A-Z)</option>
                <option value="name-desc">Ten (Z-A)</option>
                <option value="code-asc">Ma tang dan</option>
                <option value="code-desc">Ma giam dan</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ten Cong Ty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thong Tin Lien Lac</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dia Chi</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao Tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length > 0 ? (
                filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-coffee-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-coffee-600" />
                        </div>
                        <p className="font-bold text-gray-900">{supplier.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {supplier.contactInfo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {supplier.contactInfo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{supplier.address || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(supplier)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Khong tim thay nha cung cap nao
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {!isLoading && Math.ceil(filteredSuppliers.length / itemsPerPage) > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredSuppliers.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75"
                onClick={handleCloseModal}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl z-50"
              >
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {editingSupplier ? "Sua Nha Cung Cap" : "Them Nha Cung Cap Moi"}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <Input
                      label="Ten cong ty *"
                      name="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setFormErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      error={formErrors.name}
                      required
                      icon={<Building2 className="w-5 h-5" />}
                      placeholder="VD: Cong ty Ca Phe ABC"
                    />

                    <Input
                      label="Ma nha cung cap *"
                      name="code"
                      value={formData.code}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        });
                        setFormErrors((prev) => ({ ...prev, code: "" }));
                      }}
                      error={formErrors.code}
                      icon={<User className="w-5 h-5" />}
                      placeholder="VD: ABC123"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="So dien thoai *"
                        name="contactInfo"
                        type="tel"
                        value={formData.contactInfo}
                        onChange={(e) => {
                          setFormData({ ...formData, contactInfo: e.target.value });
                          setFormErrors((prev) => ({ ...prev, contactInfo: "" }));
                        }}
                        error={formErrors.contactInfo}
                        required
                        icon={<Phone className="w-5 h-5" />}
                        placeholder="0123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dia chi</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          value={formData.address}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            });
                            setFormErrors((prev) => ({ ...prev, address: "" }));
                          }}
                          rows={3}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          placeholder="Dia chi cong ty..."
                        />
                      </div>
                      {formErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      variant="outline"
                    >
                      Huy
                    </Button>
                    <Button type="submit" variant="primary">
                      {editingSupplier ? "Cap Nhat" : "Them Moi"}
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

export default AdminSuppliersPage;
