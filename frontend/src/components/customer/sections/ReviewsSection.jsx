import { motion } from "framer-motion";
import { Star } from "lucide-react";

const ReviewsSection = () => {
  const reviews = [
    {
      name: "Nguyễn Múc Đinh",
      rating: 5,
      comment:
        "Cà phê rất thơm và đậm đà, đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ tiếp!",
      avatar: "Đ",
    },
    {
      name: "Trần Thị Nam",
      rating: 5,
      comment:
        "Chất lượng tuyệt vời, giá cả hợp lý. Dịch vụ chăm sóc khách hàng rất tốt. Rất hài lòng!",
      avatar: "N",
    },
    {
      name: "Lê Văn Khánh",
      rating: 5,
      comment:
        "Mình đã thử nhiều loại cà phê nhưng của shop này là ngon nhất. Hương vị đặc biệt, khó quên!",
      avatar: "K",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Khách Hàng Nói Gì Về Chúng Tôi
          </h2>
          <p className="text-gray-600 text-lg">
            Những đánh giá chân thực từ khách hàng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-coffee-600 rounded-full flex items-center justify-center text-white font-bold">
                  {review.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"{review.comment}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
