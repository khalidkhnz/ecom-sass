import { HeroBanner } from "@/components/hero-banner";
import { FeaturedCategories } from "@/components/featured-categories";
import { ProductShowcase } from "@/components/product-showcase";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/app/actions/products";
import { Product } from "@/hooks/useProducts";

export default async function HomePage() {
  // Get products data
  const productsData = await getProducts();

  // Convert to match Product interface
  const products = productsData.map((p) => ({
    ...p,
    tags: p.tags || [],
    images: p.images || [],
    barcode: null,
    costPrice: null,
    discountStart: null,
    discountEnd: null,
    soldCount: 0,
    vendorId: null,
    features: [],
    attributes: {},
    reviewCount: 0,
    taxable: true,
    taxClass: null,
    weight: null,
    dimensions: null,
    shippingClass: null,
    visibility: true,
    isDigital: false,
    fileUrl: null,
    labels: [],
    metaTitle: null,
    metaDescription: null,
    updatedAt: p.createdAt,
    // Convert string fields to numbers
    inventory: Number(p.inventory),
    lowStockThreshold: Number(p.lowStockThreshold),
    price: String(p.price),
    discountPrice: p.discountPrice ? String(p.discountPrice) : null,
    actualPrice: String(p.actualPrice),
    rating: Number(p.rating || 0),
  })) as Product[];

  // Filter for featured products
  const featuredProducts = products.filter((product) => product.featured);

  // Get recently added products (most recent 8)
  const recentProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  return (
    <div>
      {/* Hero Section */}
      <HeroBanner />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Featured Products */}
      <Container>
        <ProductShowcase
          title="Featured Products"
          products={featuredProducts}
          viewAllLink="/featured"
        />
      </Container>

      {/* Promo Banner */}
      <div className="bg-primary/5 py-16 my-8">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Join Our Membership Program
              </h2>
              <p className="text-muted-foreground mb-6">
                Sign up for our membership program and get exclusive access to
                special offers, early product releases, and free shipping on all
                orders.
              </p>
              <Button size="lg">Join Now</Button>
            </div>
            <div className="w-full max-w-md">
              <img
                src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1470&auto=format&fit=crop"
                alt="Membership benefits"
                className="rounded-lg shadow-xl aspect-video object-cover"
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Recent Products */}
      <Container>
        <ProductShowcase title="Recently Added" products={recentProducts} />
      </Container>

      {/* Testimonials */}
      <div className="bg-muted/50 py-16 my-8">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground">
              Don't just take our word for it. Here's what our customers have to
              say about their shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm mb-4">
                "The quality of the products exceeded my expectations. Fast
                shipping and excellent customer service. Will definitely be a
                returning customer!"
              </p>
              <div className="font-medium">Sarah T.</div>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm mb-4">
                "I've been shopping here for years and have never been
                disappointed. Their customer service is top-notch and the
                products are always as described."
              </p>
              <div className="font-medium">Michael R.</div>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm mb-4">
                "The website is easy to navigate, checkout process is smooth,
                and the delivery was faster than expected. Truly a 5-star
                experience!"
              </p>
              <div className="font-medium">Jessica L.</div>
            </div>
          </div>
        </Container>
      </div>

      {/* Newsletter */}
      <Container>
        <div className="py-12 my-8 border-t border-border">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-muted-foreground mb-6">
              Stay updated with the latest products, exclusive offers, and
              helpful tips.
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button className="rounded-l-none">Subscribe</Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
