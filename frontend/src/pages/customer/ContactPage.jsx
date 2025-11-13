import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { ContactSection } from "../../components/customer/sections";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useToastStore from "../../stores/useToastStore";

const ContactPage = () => {
  const toast = useToastStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: MapPin,
      title: "Địa chỉ",
      details: [
        "268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM",
        "Chi nhánh Hà Nội: 144 Xuân Thủy, Cầu Giấy",
      ],
    },
    {
      icon: Phone,
      title: "Điện thoại",
      details: ["Hotline: 1900 xxxx", "Hỗ trợ: 0123 456 789"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@coffeebot.vn", "support@coffeebot.vn"],
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      details: ["Thứ 2 - Thứ 6: 8:00 - 18:00", "Thứ 7 - CN: 9:00 - 17:00"],
    },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "#", color: "bg-blue-600" },
    { icon: Instagram, name: "Instagram", url: "#", color: "bg-pink-600" },
    { icon: Youtube, name: "Youtube", url: "#", color: "bg-red-600" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Tin nhắn của bạn đã được gửi thành công!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cream-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-slow-pan"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <MessageSquare className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">Liên Hệ Với Chúng Tôi</h1>
            <p className="text-xl text-cream-100 leading-relaxed">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông
              tin và chúng tôi sẽ phản hồi sớm nhất có thể.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white -mt-8 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-cream-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-coffee-600 rounded-full mb-4">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-coffee-800 mb-3">
                  {info.title}
                </h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 text-sm mb-1">
                    {detail}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-coffee-800 mb-6">
                Gửi Tin Nhắn
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Họ và tên"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nguyễn Văn A"
                />
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                  />
                  <Input
                    label="Số điện thoại"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0123456789"
                  />
                </div>
                <Input
                  label="Tiêu đề"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Vấn đề bạn cần hỗ trợ"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Đang gửi..."
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Gửi tin nhắn
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Map & Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Google Map */}
              <div className="rounded-2xl overflow-hidden shadow-lg h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6305148872157!2d106.66568331533431!3d10.762622392324575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ee0c3056e99%3A0x5e32a92b09cb31de!2zMjY4IEzDvSBUaMaw4budbmcgS2nhu4d0LCBQaMaw4budbmcgMTQsIFF1YW4gMTAsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="CoffeeBot Location"
                ></iframe>
              </div>

              {/* Social Media */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-coffee-800 mb-6">
                  Kết Nối Với Chúng Tôi
                </h3>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.url}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`flex items-center justify-center w-12 h-12 ${social.color} text-white rounded-full hover:opacity-90 transition-opacity`}
                      aria-label={social.name}
                    >
                      <social.icon className="w-6 h-6" />
                    </motion.a>
                  ))}
                </div>
                <p className="text-gray-600 mt-6 text-sm">
                  Theo dõi chúng tôi trên mạng xã hội để cập nhật tin tức mới
                  nhất, khuyến mãi đặc biệt và những bí quyết pha chế cà phê
                  tuyệt vời.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section Component */}
      <ContactSection />

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-coffee-800 mb-4">
              Câu Hỏi Thường Gặp
            </h2>
            <p className="text-gray-600">
              Một số câu hỏi phổ biến từ khách hàng
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Thời gian giao hàng là bao lâu?",
                a: "Chúng tôi giao hàng trong vòng 2-3 ngày làm việc tại nội thành và 3-5 ngày với các tỉnh thành khác.",
              },
              {
                q: "Làm thế nào để bảo quản cà phê tốt nhất?",
                a: "Nên bảo quản cà phê trong túi kín, tránh ánh nắng trực tiếp và nhiệt độ cao. Sử dụng trong vòng 1 tháng sau khi mở bao để giữ được hương vị tốt nhất.",
              },
              {
                q: "Tôi có thể đổi trả sản phẩm không?",
                a: "Có, bạn có thể đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên seal và chưa sử dụng.",
              },
              {
                q: "Có chương trình khuyến mãi nào không?",
                a: "Chúng tôi thường xuyên có các chương trình khuyến mãi. Hãy theo dõi website và mạng xã hội để cập nhật thông tin mới nhất.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-cream-50 p-6 rounded-lg"
              >
                <h3 className="font-bold text-coffee-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
