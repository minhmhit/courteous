import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  RotateCcw,
  Truck,
  ChevronRight,
  Lock,
  CheckCircle,
} from "lucide-react";

const PolicyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map URL paths to tab IDs
  const pathToTab = {
    "/privacy-policy": "privacy",
    "/terms-of-service": "terms",
    "/return-policy": "return",
    "/shipping-policy": "shipping",
  };

  const tabToPath = {
    privacy: "/privacy-policy",
    terms: "/terms-of-service",
    return: "/return-policy",
    shipping: "/shipping-policy",
  };

  const [activeTab, setActiveTab] = useState(
    pathToTab[location.pathname] || "privacy"
  );

  // Update tab when URL changes
  useEffect(() => {
    const tab = pathToTab[location.pathname];
    if (tab) {
      setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Handle tab change with navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(tabToPath[tabId]);
  };

  const tabs = [
    {
      id: "privacy",
      label: "Chính sách bảo mật",
      icon: Shield,
      color: "blue",
    },
    {
      id: "terms",
      label: "Điều khoản sử dụng",
      icon: FileText,
      color: "purple",
    },
    {
      id: "return",
      label: "Chính sách đổi trả",
      icon: RotateCcw,
      color: "green",
    },
    {
      id: "shipping",
      label: "Chính sách vận chuyển",
      icon: Truck,
      color: "orange",
    },
  ];

  const policies = {
    privacy: {
      title: "Chính Sách Bảo Mật",
      icon: Shield,
      updated: "01/11/2025",
      sections: [
        {
          title: "1. Thu thập thông tin cá nhân",
          content: [
            "Chúng tôi thu thập thông tin cá nhân khi bạn:",
            "- Đăng ký tài khoản trên website",
            "- Đặt hàng sản phẩm",
            "- Đăng ký nhận bản tin",
            "- Tham gia các chương trình khuyến mãi",
            "- Liên hệ với bộ phận chăm sóc khách hàng",
            "",
            "Thông tin có thể bao gồm: họ tên, email, số điện thoại, địa chỉ giao hàng, thông tin thanh toán.",
          ],
        },
        {
          title: "2. Sử dụng thông tin",
          content: [
            "Thông tin của bạn được sử dụng để:",
            "- Xử lý đơn hàng và giao hàng",
            "- Gửi thông báo về đơn hàng và khuyến mãi",
            "- Cải thiện trải nghiệm người dùng",
            "- Phân tích và nghiên cứu thị trường",
            "- Ngăn chặn gian lận và bảo mật tài khoản",
          ],
        },
        {
          title: "3. Bảo mật thông tin",
          content: [
            "Chúng tôi cam kết:",
            "- Sử dụng mã hóa SSL để bảo vệ dữ liệu",
            "- Không chia sẻ thông tin với bên thứ ba (trừ đối tác vận chuyển)",
            "- Lưu trữ thông tin trên server an toàn",
            "- Cập nhật biện pháp bảo mật thường xuyên",
            "- Tuân thủ các quy định về bảo vệ dữ liệu cá nhân",
          ],
        },
        {
          title: "4. Quyền của khách hàng",
          content: [
            "Bạn có quyền:",
            "- Truy cập và chỉnh sửa thông tin cá nhân",
            "- Yêu cầu xóa tài khoản và dữ liệu",
            "- Từ chối nhận email marketing",
            "- Khiếu nại về việc sử dụng thông tin",
            "- Yêu cầu cung cấp bản sao dữ liệu cá nhân",
          ],
        },
        {
          title: "5. Cookie và công nghệ theo dõi",
          content: [
            "Website sử dụng cookie để:",
            "- Ghi nhớ thông tin đăng nhập",
            "- Phân tích lưu lượng truy cập",
            "- Cá nhân hóa trải nghiệm",
            "- Hiển thị quảng cáo phù hợp",
            "",
            "Bạn có thể tắt cookie trong trình duyệt, tuy nhiên một số tính năng có thể không hoạt động.",
          ],
        },
      ],
    },
    terms: {
      title: "Điều Khoản Sử Dụng",
      icon: FileText,
      updated: "01/11/2025",
      sections: [
        {
          title: "1. Chấp nhận điều khoản",
          content: [
            "Khi sử dụng website CoffeeBot, bạn đồng ý với các điều khoản sau:",
            "- Tuân thủ tất cả các quy định pháp luật hiện hành",
            "- Cung cấp thông tin chính xác và trung thực",
            "- Không sử dụng website cho mục đích bất hợp pháp",
            "- Tôn trọng quyền sở hữu trí tuệ của chúng tôi",
          ],
        },
        {
          title: "2. Tài khoản người dùng",
          content: [
            "Khi tạo tài khoản, bạn cần:",
            "- Cung cấp thông tin chính xác và đầy đủ",
            "- Bảo mật thông tin đăng nhập",
            "- Chịu trách nhiệm về mọi hoạt động từ tài khoản",
            "- Thông báo ngay nếu phát hiện truy cập trái phép",
            "- Không chia sẻ tài khoản cho người khác",
          ],
        },
        {
          title: "3. Đặt hàng và thanh toán",
          content: [
            "Quy định về đơn hàng:",
            "- Đơn hàng chỉ được xác nhận sau khi thanh toán thành công",
            "- Giá sản phẩm có thể thay đổi mà không cần báo trước",
            "- Chúng tôi có quyền từ chối đơn hàng nếu phát hiện gian lận",
            "- Khách hàng chịu trách nhiệm kiểm tra thông tin đơn hàng",
            "- Hóa đơn VAT được cung cấp theo yêu cầu",
          ],
        },
        {
          title: "4. Quyền sở hữu trí tuệ",
          content: [
            "Nội dung trên website bao gồm:",
            "- Logo, hình ảnh, văn bản đều thuộc quyền sở hữu của CoffeeBot",
            "- Không được sao chép, phân phối mà không có sự cho phép",
            "- Vi phạm sẽ bị xử lý theo pháp luật",
            "- Khách hàng giữ quyền sở hữu nội dung do họ tạo ra (đánh giá, bình luận)",
          ],
        },
        {
          title: "5. Giới hạn trách nhiệm",
          content: [
            "CoffeeBot không chịu trách nhiệm về:",
            "- Thiệt hại gián tiếp do sử dụng website",
            "- Gián đoạn dịch vụ do sự cố kỹ thuật",
            "- Thông tin từ website của bên thứ ba",
            "- Lỗi do người dùng cung cấp thông tin sai",
          ],
        },
        {
          title: "6. Thay đổi điều khoản",
          content: [
            "Chúng tôi có quyền:",
            "- Cập nhật điều khoản bất kỳ lúc nào",
            "- Thông báo thay đổi qua email hoặc website",
            "- Yêu cầu chấp nhận lại điều khoản mới",
            "- Việc tiếp tục sử dụng đồng nghĩa với chấp nhận thay đổi",
          ],
        },
      ],
    },
    return: {
      title: "Chính Sách Đổi Trả",
      icon: RotateCcw,
      updated: "01/11/2025",
      sections: [
        {
          title: "1. Điều kiện đổi trả",
          content: [
            "Sản phẩm được đổi trả khi:",
            "- Sản phẩm bị lỗi do nhà sản xuất",
            "- Giao sai sản phẩm hoặc thiếu số lượng",
            "- Sản phẩm hư hỏng trong quá trình vận chuyển",
            "- Sản phẩm không đúng mô tả",
            "- Còn nguyên tem, nhãn mác, bao bì",
            "- Trong vòng 7 ngày kể từ ngày nhận hàng",
          ],
        },
        {
          title: "2. Sản phẩm không được đổi trả",
          content: [
            "Các trường hợp sau không áp dụng đổi trả:",
            "- Sản phẩm đã qua sử dụng hoặc bị rách bao bì",
            "- Sản phẩm đã quá thời hạn đổi trả (7 ngày)",
            "- Sản phẩm mua trong chương trình khuyến mãi đặc biệt",
            "- Sản phẩm bị hư hỏng do người mua",
            "- Không có hóa đơn hoặc chứng từ mua hàng",
          ],
        },
        {
          title: "3. Quy trình đổi trả",
          content: [
            "Để đổi trả sản phẩm, vui lòng:",
            "",
            "Bước 1: Liên hệ",
            "- Gọi hotline: 0123 456 789",
            "- Email: support@coffeebot.vn",
            "- Chat trực tuyến trên website",
            "",
            "Bước 2: Cung cấp thông tin",
            "- Mã đơn hàng",
            "- Ảnh sản phẩm lỗi (nếu có)",
            "- Lý do đổi trả",
            "",
            "Bước 3: Xác nhận",
            "- Chúng tôi sẽ xác nhận trong vòng 24h",
            "- Hướng dẫn gửi hàng về hoặc đổi hàng mới",
            "",
            "Bước 4: Hoàn tất",
            "- Nhận sản phẩm mới hoặc được hoàn tiền",
            "- Thời gian xử lý: 3-5 ngày làm việc",
          ],
        },
        {
          title: "4. Chi phí đổi trả",
          content: [
            "Phí vận chuyển đổi trả:",
            "- CoffeeBot chịu phí nếu lỗi từ nhà bán",
            "- Khách hàng chịu phí nếu đổi ý hoặc chọn sai",
            "- Hoàn tiền qua chuyển khoản trong 5-7 ngày",
            "- Hoàn tiền gốc (không bao gồm phí ship lần đầu)",
          ],
        },
        {
          title: "5. Bảo hành sản phẩm",
          content: [
            "Một số sản phẩm có bảo hành từ nhà sản xuất:",
            "- Thời gian bảo hành: 3-12 tháng (tùy sản phẩm)",
            "- Điều kiện: Tem bảo hành còn nguyên vẹn",
            "- Liên hệ để được hỗ trợ bảo hành",
          ],
        },
      ],
    },
    shipping: {
      title: "Chính Sách Vận Chuyển",
      icon: Truck,
      updated: "01/11/2025",
      sections: [
        {
          title: "1. Khu vực giao hàng",
          content: [
            "Chúng tôi giao hàng toàn quốc:",
            "- Nội thành TP.HCM và Hà Nội: 1-2 ngày",
            "- Các tỉnh thành khác: 2-5 ngày",
            "- Vùng sâu vùng xa: 5-7 ngày",
            "- Đơn hàng quốc tế: Liên hệ để được báo giá",
          ],
        },
        {
          title: "2. Phí vận chuyển",
          content: [
            "Cước phí được tính theo:",
            "",
            "Nội thành TP.HCM/Hà Nội:",
            "- Đơn < 200.000đ: 30.000đ",
            "- Đơn 200.000đ - 500.000đ: 20.000đ",
            "- Đơn > 500.000đ: MIỄN PHÍ",
            "",
            "Các tỉnh thành khác:",
            "- Đơn < 300.000đ: 40.000đ",
            "- Đơn 300.000đ - 500.000đ: 30.000đ",
            "- Đơn > 500.000đ: MIỄN PHÍ",
            "",
            "Vùng xa/hải đảo: Phụ phí 20.000-50.000đ",
          ],
        },
        {
          title: "3. Thời gian xử lý đơn hàng",
          content: [
            "Quy trình xử lý:",
            "- Xác nhận đơn: Trong vòng 2 giờ (giờ hành chính)",
            "- Đóng gói: 4-6 giờ",
            "- Bàn giao vận chuyển: Trong ngày (nếu đặt trước 15h)",
            "- Đơn đặt sau 15h: Giao ngày hôm sau",
            "- Thứ 7, Chủ nhật: Xử lý vào thứ 2",
          ],
        },
        {
          title: "4. Đơn vị vận chuyển",
          content: [
            "Chúng tôi hợp tác với:",
            "- Giao Hàng Nhanh (GHN)",
            "- Giao Hàng Tiết Kiệm (GHTK)",
            "- Viettel Post",
            "- VNPost",
            "",
            "Khách hàng có thể:",
            "- Chọn đơn vị vận chuyển ưa thích",
            "- Tra cứu mã vận đơn trên website",
            "- Nhận thông báo qua SMS/Email",
          ],
        },
        {
          title: "5. Kiểm tra hàng khi nhận",
          content: [
            "Khách hàng vui lòng:",
            "- Kiểm tra tình trạng bên ngoài thùng hàng",
            "- Quay video khi mở hàng (khuyến nghị)",
            "- Đối chiếu sản phẩm với đơn hàng",
            "- Ký xác nhận nếu đồng ý nhận hàng",
            "- Từ chối nhận nếu phát hiện bất thường",
            "",
            "Lưu ý: Không ký nhận nếu:",
            "- Thùng hàng bị rách, móp méo",
            "- Băng keo bị cắt hoặc mở",
            "- Thiếu sản phẩm hoặc sai sản phẩm",
          ],
        },
        {
          title: "6. Giao hàng thất bại",
          content: [
            "Trong trường hợp không giao được hàng:",
            "- Liên hệ khách hàng 3 lần trong ngày",
            "- Gửi tin nhắn/email thông báo",
            "- Hẹn lại thời gian giao hàng",
            "- Sau 3 lần giao không thành công: Hoàn về kho",
            "- Phí ship hoàn: Khách hàng chịu (nếu không báo trước)",
          ],
        },
      ],
    },
  };

  const currentPolicy = policies[activeTab];
  const CurrentIcon = currentPolicy.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chính Sách & Điều Khoản
          </h1>
          <p className="text-gray-600 text-lg">
            Thông tin quan trọng về quyền lợi và nghĩa vụ của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? `bg-${tab.color}-600 text-white shadow-md`
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {/* Policy Header */}
          <div className="bg-gradient-to-r from-coffee-800 to-coffee-600 text-white p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <CurrentIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{currentPolicy.title}</h2>
                <p className="text-cream-200 mt-1">
                  Cập nhật lần cuối: {currentPolicy.updated}
                </p>
              </div>
            </div>
          </div>

          {/* Policy Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              {currentPolicy.sections.map((section, index) => (
                <div key={index} className="mb-8 last:mb-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ChevronRight className="w-6 h-6 text-coffee-600" />
                    {section.title}
                  </h3>
                  <div className="pl-8">
                    {section.content.map((line, i) => {
                      if (line === "") {
                        return <br key={i} />;
                      }
                      if (line.startsWith("-")) {
                        return (
                          <div key={i} className="flex items-start gap-3 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{line.substring(2)}</p>
                          </div>
                        );
                      }
                      return (
                        <p key={i} className="text-gray-700 mb-3 font-semibold">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Cần hỗ trợ thêm?
                    </h4>
                    <p className="text-gray-600 mb-3">
                      Nếu bạn có bất kỳ câu hỏi nào về chính sách của chúng tôi,
                      vui lòng liên hệ:
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>📧 Email: support@coffeebot.vn</p>
                      <p>📞 Hotline: 0123 456 789 (24/7)</p>
                      <p>💬 Live Chat: Trên website</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PolicyPage;
