import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, X, Coffee } from "lucide-react";
import { categoryAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";

const AdminCategoriesPage = () => {
  const toast = useToastStore();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.id, formData);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await categoryAPI.createCategory(formData);
        toast.success("Thêm danh mục thành công");
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Không thể lưu danh mục");
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await categoryAPI.deleteCategory(categoryId);
      toast.success("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Không thể xóa danh mục");
    }
  };

  const filteredCategories = categories
    .filter((category) => {
      const keyword = searchTerm.toLowerCase();
      return (
        category.name?.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name-desc") return (b.name || "").localeCompare(a.name || "");
      return (a.name || "").localeCompare(b.name || "");
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Danh Mục</h1>
          <p className="mt-1 text-gray-600">Quản lý danh mục sản phẩm cà phê</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="mr-2 h-5 w-5" />
          Thêm Danh Mục
        </Button>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <Input
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-5 w-5" />}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-coffee-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length > 0 ? (
              filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-gray-200 bg-gradient-to-br from-coffee-50 to-white p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-coffee-600 p-3">
                      <Coffee className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(category)} className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{category.name}</h3>
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {category.description || "Không có mô tả"}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-gray-500">
                {searchTerm ? "Không tìm thấy danh mục nào" : "Chưa có danh mục nào"}
              </div>
            )}
          </div>
        )}
        
        {!isLoading && Math.ceil(filteredCategories.length / itemsPerPage) > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredCategories.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={handleCloseModal}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-50 my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all"
              >
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {editingCategory ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
                    </h3>
                    <button type="button" onClick={handleCloseModal} className="text-gray-400 transition-colors hover:text-gray-600">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4 p-6">
                    <Input
                      label="Tên Danh Mục"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      icon={<Coffee className="h-5 w-5" />}
                      placeholder="VD: Cà phê Arabica"
                    />

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Mô Tả</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        placeholder="Mô tả về danh mục..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
                    <Button type="button" onClick={handleCloseModal} variant="outline">Hủy</Button>
                    <Button type="submit" variant="primary">
                      {editingCategory ? "Cập Nhật" : "Thêm Mới"}
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

export default AdminCategoriesPage;
