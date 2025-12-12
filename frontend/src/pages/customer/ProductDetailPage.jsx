import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import ProductCard from "../../components/customer/ProductCard";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import Button from "../../components/ui/Button";
import { productAPI } from "../../services";
import useCartStore from "../../stores/useCartStore";
import useToastStore from "../../stores/useToastStore";
import { formatCurrency } from "../../utils/formatDate";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setIsLoading(true);
      try {
        const response = await productAPI.getProductById(id);
        setProduct(response.data);

        // Fetch related products (same category)
        if (response.data?.categoryId) {
          const allProducts = await productAPI.getAllProducts(1, 20);
          const related = (allProducts.data || [])
            .filter(
              (p) => p.categoryId === response.data.categoryId && p.id !== id
            )
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
        toast.error("Không thể tải thông tin sản phẩm");
        navigate("/products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();
  }, [id, navigate, toast]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product.id, quantity);
      navigate("/cart");
    } catch (error) {
      toast.error("Không thể thực hiện");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonLoader className="h-96" />
            <SkeletonLoader className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }
  // console.log(product);

  // Mock images array (in real app, comes from backend)
  const images = product.images || [
    `../.${product.imageUrl}`,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-coffee-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-coffee-600">
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-xl shadow-sm p-8">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Like button */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </button>

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-coffee-600 text-white font-semibold rounded-full">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-coffee-600"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 4.5)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({product.reviews || 0} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-coffee-600">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-green-600 font-medium mt-1">
                  Tiết kiệm{" "}
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  %
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "Sản phẩm cà phê bột chất lượng cao"}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <p
                className={`font-medium ${
                  product.stockQuantity > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stockQuantity > 0
                  ? `Còn ${product.stockQuantity} sản phẩm`
                  : "Hết hàng"}
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Số lượng</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                  
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 font-semibold">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stockQuantity || null, quantity + 1))
                    }
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-gray-600 text-sm">
                  {product.stockQuantity} sản phẩm có sẵn
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="flex-1"
                disabled={!product.stockQuantity}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="primary"
                className="flex-1"
                disabled={!product.stockQuantity}
              >
                Mua ngay
              </Button>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-coffee-50 rounded-lg">
                  <Truck className="w-6 h-6 text-coffee-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Miễn phí vận chuyển
                  </p>
                  <p className="text-sm text-gray-600">
                    Cho đơn hàng trên 500.000đ
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-coffee-50 rounded-lg">
                  <Shield className="w-6 h-6 text-coffee-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Đảm bảo chất lượng
                  </p>
                  <p className="text-sm text-gray-600">
                    Sản phẩm chính hãng 100%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-coffee-50 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-coffee-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Đổi trả dễ dàng</p>
                  <p className="text-sm text-gray-600">
                    Trong vòng 7 ngày nếu có lỗi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
