const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Tổng Đơn Hàng</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Doanh Thu</h3>
          <p className="text-3xl font-bold">0 đ</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Sản Phẩm</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
