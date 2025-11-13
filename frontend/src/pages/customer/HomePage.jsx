import { useState, useEffect } from "react";
import { productAPI, couponAPI } from "../../services";
import {
  HeroSection,
  FeaturesSection,
  FeaturedProductsSection,
  CTASection,
  PromotionsSection,
  AboutSection,
  ReviewsSection,
  HowToOrderSection,
  ContactSection,
  PolicyLinksSection,
} from "../../components/customer/sections";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productsRes, couponsRes] = await Promise.all([
          productAPI.getAllProducts(1, 8),
          couponAPI.getAllCoupons().catch(() => ({ data: [] })),
        ]);

        const products = productsRes.data || [];
        setFeaturedProducts(products.slice(0, 4));
        setPromotionProducts(products.slice(4, 8));

        // Normalize / Filter active coupons
        // The backend may return: { data: [...]} or { coupons: [...], pagination: {...} }
        const couponsData =
          (couponsRes &&
            (couponsRes.data?.coupons ||
              couponsRes.data ||
              couponsRes.coupons)) ||
          [];
        // Ensure it's an array
        const coupons = Array.isArray(couponsData) ? couponsData : [];
        // Normalize and filter
        const now = new Date();
        const active = coupons.filter((coupon) => {
          // possible date fields: validUntil, valid_until, endDate, end_date
          const endRaw =
            coupon.validUntil ||
            coupon.valid_until ||
            coupon.endDate ||
            coupon.end_date ||
            coupon.validTo ||
            coupon.valid_to;
          const startRaw =
            coupon.validFrom ||
            coupon.valid_from ||
            coupon.startDate ||
            coupon.start_date;
          const endDate = endRaw ? new Date(endRaw) : null;
          const startDate = startRaw ? new Date(startRaw) : null;

          // usage fields may be named differently
          const usageLimit =
            coupon.usageLimit ||
            coupon.usage_limit ||
            coupon.limit ||
            coupon.quota;
          const usedCount =
            coupon.usedCount || coupon.used_count || coupon.used || 0;

          const withinStart = !startDate || startDate <= now;
          const beforeEnd = !endDate || endDate > now;
          const hasUsage = (usageLimit || 999) > (usedCount || 0);

          return withinStart && beforeEnd && hasUsage;
        });
        setActiveCoupons(active.slice(0, 3));
      } catch (error) {
        console.error("Không thể tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <FeaturedProductsSection
        products={featuredProducts}
        isLoading={isLoading}
      />
      <PromotionsSection coupons={activeCoupons} products={promotionProducts} />
      <CTASection />
      <HowToOrderSection />
      <ReviewsSection />
      <PolicyLinksSection />
    </div>
  );
};

export default HomePage;
