import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Minus, Plus, Heart, Package, RotateCcw, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductById } from "@/app/actions/products";
import { getCategories } from "@/app/actions/categories";
import { ProductShowcase } from "@/components/product-showcase";
import { Product } from "@/hooks/useProducts";
import ImageGallery from "./image-gallery";
import ProductSkeleton from "./product-skeleton";

async function getSimilarProducts(
  categoryId: string | null,
  currentProductId: string
) {
  const productsData = await import("@/app/actions/products").then((mod) =>
    mod.getProducts()
  );

  const products = productsData.map((p) => ({
    ...p,
    tags: p.tags || [],
    images: p.images || [],
  })) as Product[];

  return products
    .filter(
      (p) =>
        p.id !== currentProductId &&
        (categoryId ? p.categoryId === categoryId : true)
    )
    .slice(0, 4);
}

interface ProductPageProps {
  params: {
    productId: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails productId={params.productId} />
    </Suspense>
  );
}

async function ProductDetails({ productId }: { productId: string }) {
  const productData = await getProductById(productId);

  if (!productData) {
    notFound();
  }

  const product = {
    ...productData,
    tags: productData.tags || [],
    images: productData.images || [],
  } as Product & { category: { name: string; slug: string } | null };

  const [categories, similarProducts] = await Promise.all([
    getCategories(),
    getSimilarProducts(product.categoryId, productId),
  ]);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(product.price));

  const inStock = product.inventory > 0;
  const formattedImages =
    product.images && product.images.length > 0
      ? product.images
      : ["https://placehold.co/600x600/f3f4f6/a1a1aa?text=No+Image"];

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
              {product.category && (
                <div className="mb-2">
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {product.category.name}
                  </Badge>
                </div>
              )}
              <h1 className="text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold mt-2">{formattedPrice}</p>
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

              {inStock && product.inventory < 5 && (
                <span className="ml-2 text-sm text-red-600">
                  Only {product.inventory} left!
                </span>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-2.5 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-muted-foreground">
                {product.description ||
                  "No description available for this product."}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="pt-4">
              <div className="flex items-center mb-6">
                <span className="text-sm font-medium mr-3">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button
                    className="px-3 py-2 hover:bg-accent transition-colors"
                    disabled={!inStock}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-center w-12">1</span>
                  <button
                    className="px-3 py-2 hover:bg-accent transition-colors"
                    disabled={!inStock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex space-x-4">
                <Button className="w-full" size="lg" disabled={!inStock}>
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button variant="outline" size="lg" className="flex-shrink-0">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Product Benefits */}
            <div className="border rounded-lg p-4 space-y-3 mt-6 bg-muted/30">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  Free shipping on orders over $50
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
                <p className="text-muted-foreground">
                  {product.description ||
                    "No detailed description available for this product."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Premium quality materials</li>
                      <li>Designed for durability</li>
                      <li>Modern and elegant design</li>
                      <li>Versatile use cases</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Specifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SKU</span>
                        <span className="font-medium">
                          {product.id.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock</span>
                        <span className="font-medium">
                          {product.inventory} units
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
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
                        <span className="font-medium">$4.99</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Express Shipping (1-2 business days)</span>
                        <span className="font-medium">$9.99</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Free Shipping on orders over $50</span>
                        <span className="font-medium">$0.00</span>
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
