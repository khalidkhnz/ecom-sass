import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Package, RotateCcw, Truck, Tag, Box } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductById } from "@/app/actions/products";
import { getCategories } from "@/app/actions/categories";
import { ProductShowcase } from "@/components/product-showcase";
import ImageGallery from "./image-gallery";
import ProductSkeleton from "./product-skeleton";
import ProductVariantsSection from "@/components/product-variants-section";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

async function getSimilarProducts(
  categoryId: string | null,
  currentProductId: string
) {
  const productsData = await import("@/app/actions/products").then((mod) =>
    mod.getProducts()
  );

  // Ensure minimum properties are available for display
  const products = productsData.map((p) => ({
    ...p,
    tags: p.tags || [],
    images: p.images || [],
  })) as any[]; // Use any to bypass type checking

  return products
    .filter(
      (p) =>
        p.id !== currentProductId &&
        (categoryId ? p.categoryId === categoryId : true)
    )
    .slice(0, 4);
}

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails productId={(await params).productId} />
    </Suspense>
  );
}

async function ProductDetails({ productId }: { productId: string }) {
  const productData = await getProductById(productId);

  if (!productData) {
    notFound();
  }

  // Fill missing properties to avoid TypeScript errors
  const product = {
    ...productData,
    tags: productData.tags || [],
    images: productData.images || [],
    features: productData.features || [],
    attributes: productData.attributes || {},
    dimensions: productData.dimensions || { length: 0, width: 0, height: 0 },
    variants: productData.variants || [],
  } as any; // Use any to bypass strict type checking

  const [categories, similarProducts] = await Promise.all([
    getCategories(),
    getSimilarProducts(product.categoryId, productId),
  ]);

  const formattedPrice = formatPrice(product.price);

  const formattedDiscountPrice = product.discountPrice
    ? formatPrice(product.discountPrice)
    : null;

  const inStock = product.inventory > 0;
  const hasDiscount = formattedDiscountPrice !== null;
  const lowStock =
    inStock && product.inventory <= (product.lowStockThreshold || 5);

  const formattedImages =
    product.images && product.images.length > 0
      ? product.images
      : ["https://placehold.co/600x600/f3f4f6/a1a1aa?text=No+Image"];

  // Check if discount is currently active
  const now = new Date();
  const discountActive =
    hasDiscount &&
    (!product.discountStart || new Date(product.discountStart) <= now) &&
    (!product.discountEnd || new Date(product.discountEnd) >= now);

  // Determine actual price to display
  const actualPrice =
    discountActive && formattedDiscountPrice
      ? formattedDiscountPrice
      : formattedPrice;

  // Format dimensions if they exist
  const hasDimensions =
    product.dimensions &&
    (product.dimensions.length > 0 ||
      product.dimensions.width > 0 ||
      product.dimensions.height > 0);

  // Get attributes for display
  const productAttributes = Object.entries(product.attributes || {});
  const hasAttributes = productAttributes.length > 0;

  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="py-10">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Product Images */}
          <div className="sticky top-20">
            <ImageGallery images={formattedImages} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {/* Category & Brand */}
              <div className="flex flex-wrap gap-2 mb-2">
                {product.category && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {product.category.name}
                  </Badge>
                )}
                {product.subcategory && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {product.subcategory.name}
                  </Badge>
                )}
                {product.brand && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {product.brand.name}
                  </Badge>
                )}
                {product.featured && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                {product.name}
              </h1>

              {/* SKU */}
              <div className="text-sm text-muted-foreground mt-1">
                SKU: {product.sku}
              </div>

              {/* Short description if available */}
              {product.shortDescription && (
                <p className="mt-2 text-muted-foreground">
                  {product.shortDescription}
                </p>
              )}

              {/* Price section */}
              <div className="flex items-baseline mt-4">
                <p
                  className={cn(
                    "text-2xl font-semibold",
                    hasDiscount && discountActive
                      ? "text-muted-foreground line-through mr-2"
                      : ""
                  )}
                >
                  {formattedPrice}
                </p>

                {hasDiscount && discountActive && (
                  <p className="text-2xl font-bold text-red-600">
                    {formattedDiscountPrice}
                  </p>
                )}

                {hasDiscount && discountActive && (
                  <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    Save{" "}
                    {Math.round(
                      (1 -
                        parseFloat(product.discountPrice || "0") /
                          parseFloat(product.price)) *
                        100
                    )}
                    %
                  </span>
                )}
              </div>

              {/* Discount period if available */}
              {hasDiscount && discountActive && product.discountEnd && (
                <p className="text-sm text-red-600 mt-1">
                  Sale ends{" "}
                  {format(new Date(product.discountEnd), "MMMM dd, yyyy")}
                </p>
              )}
            </div>

            {/* Inventory Status */}
            <div>
              <Badge
                variant={inStock ? "default" : "destructive"}
                className={
                  inStock
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : ""
                }
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </Badge>

              {lowStock && (
                <span className="ml-2 text-sm text-red-600">
                  Only {product.inventory} left!
                </span>
              )}
            </div>

            {/* Product Variants Section (Client Component) */}
            <ProductVariantsSection
              product={product}
              variants={product.variants || []}
              inStock={inStock}
              hasDiscount={hasDiscount}
              discountActive={discountActive}
              discountEnd={
                product.discountEnd ? new Date(product.discountEnd) : null
              }
            />

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-2.5 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Product Benefits */}
            <div className="border rounded-lg p-4 space-y-3 mt-6 bg-muted/30">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  Free shipping on orders over ₹1100
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">30-day easy returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Secure packaging</span>
              </div>
              {product.isDigital && (
                <div className="flex items-center gap-2">
                  <Box className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    Digital product - Instant download
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent mb-4">
              <TabsTrigger
                value="details"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Details
              </TabsTrigger>
              {hasAttributes && (
                <TabsTrigger
                  value="attributes"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Specifications
                </TabsTrigger>
              )}
              <TabsTrigger
                value="shipping"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Shipping & Returns
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Details</h3>
                <div className="prose max-w-none text-muted-foreground">
                  {product.description ||
                    "No detailed description available for this product."}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features</h4>
                    {product.features && product.features.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {product.features.map(
                          (feature: string, index: number) => (
                            <li key={index}>{feature}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No features available for this product.
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Specifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SKU</span>
                        <span className="font-medium">{product.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </div>
                      {product.brand && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Brand</span>
                          <span className="font-medium">
                            {product.brand.name}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock</span>
                        <span className="font-medium">
                          {product.inventory} units
                        </span>
                      </div>
                      {product.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Dimensions
                          </span>
                          <span className="font-medium">
                            {product.dimensions.length}" ×{" "}
                            {product.dimensions.width}" ×{" "}
                            {product.dimensions.height}"
                          </span>
                        </div>
                      )}
                      {product.weight && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight</span>
                          <span className="font-medium">
                            {product.weight} kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {hasAttributes && (
              <TabsContent value="attributes" className="pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Product Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {productAttributes.map(([key, value], index) => (
                      <div
                        key={index}
                        className="flex justify-between border-b pb-2"
                      >
                        <span className="font-medium">{key}</span>
                        <span className="text-muted-foreground">
                          {Array.isArray(value)
                            ? (value as string[]).join(", ")
                            : (value as string)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}

            <TabsContent value="shipping" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Shipping Information</h3>
                <p className="text-muted-foreground">
                  We offer fast and reliable shipping options to ensure your
                  order reaches you in perfect condition.
                </p>

                <div className="space-y-4 pt-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Shipping Options
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex justify-between">
                        <span>Standard Shipping (3-5 business days)</span>
                        <span className="font-medium">₹100</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Express Shipping (1-2 business days)</span>
                        <span className="font-medium">₹200</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Free Shipping on orders over ₹1100</span>
                        <span className="font-medium">₹0.00</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Return Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      We accept returns within 30 days of delivery. Items must
                      be in original condition with all tags attached. Return
                      shipping fees may apply unless the item was received
                      damaged or defective.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Customer Reviews</h3>
                  <Button variant="outline" size="sm">
                    Write a Review
                  </Button>
                </div>

                <div className="flex items-center justify-center p-12 text-muted-foreground">
                  <p>No reviews yet. Be the first to share your thoughts!</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <Separator className="mb-8" />
            <ProductShowcase
              title="You might also like"
              products={similarProducts}
              viewAllLink={
                product.category
                  ? `/categories/${product.category.slug}`
                  : "/products"
              }
            />
          </div>
        )}
      </Container>
    </div>
  );
}
