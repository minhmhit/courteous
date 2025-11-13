import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

const ContactSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Liên Hệ & Cửa Hàng
          </h2>
          <p className="text-gray-600 text-lg">
            Ghé thăm cửa hàng hoặc liên hệ với chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Thông Tin Liên Hệ
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Địa chỉ</h4>
                  <p className="text-gray-600">
                    123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Số điện thoại
                  </h4>
                  <p className="text-gray-600">0123 456 789 (Hotline 24/7)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                  <p className="text-gray-600">contact@coffeebot.vn</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Giờ mở cửa</h4>
                  <p className="text-gray-600">
                    Thứ 2 - Chủ Nhật: 8:00 - 22:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MessageCircle className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Chat online</h4>
                  <p className="text-gray-600">
                    Hỗ trợ trực tuyến qua Zalo, Facebook Messenger
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-2 shadow-sm overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326810255127!2d106.69531731533449!3d10.776530392320184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0xb11bb0b8f8ed49ab!2zxJDGsOG7nW5nIE5ndXnhu4VuIEh14buHLCBCw6xuIE5naMOqLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1699999999999!5m2!1svi!2s"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
