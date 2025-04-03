import { Suspense } from "react";
import { getProducts } from "@/app/actions/products";
import { getCategories } from "@/app/actions/categories";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="py-10">
      <Container>
        <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Browse our collection of premium products
            </p>
          </div>
        </div>
        <Separator className="my-6" />
        <Suspense fallback={<ProductsLoading />}>
          <ProductsList searchParams={resolvedSearchParams} />
        </Suspense>
      </Container>
    </div>
  );
}

async function ProductsList({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { data: categories } = await getCategories();
  const productsData = await getProducts();

  // Convert products to match the Product interface
  const products = productsData.map((p) => ({
    ...p,
    inventory: Number(p.inventory),
    price: p.price,
    discountPrice: p.discountPrice,
    lowStockThreshold: Number(p.lowStockThreshold),
    rating: Number(p.rating),
    tags: p.tags || [],
    images: p.images || [],
    // Add missing required fields with default values
    barcode: null,
    costPrice: null,
    discountStart: null,
    discountEnd: null,
    soldCount: 0,
    status: "draft",
    featured: false,
    categoryId: p.categoryId || null,
    vendorId: null,
    features: [],
    attributes: {},
    reviewCount: 0,
    taxable: true,
    taxClass: "standard",
    weight: null,
    dimensions: { length: 0, width: 0, height: 0 },
    shippingClass: "standard",
    visibility: true,
    isDigital: false,
    fileUrl: null,
    labels: [],
    metaTitle: null,
    metaDescription: null,
    updatedAt: p.createdAt,
  })) as Product[];

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }
    return newSearchParams.toString();
  };

  const category = searchParams?.category?.toString();
  const query = searchParams?.query?.toString();
  const inStock = searchParams?.inStock?.toString();
  const sort = searchParams?.sort?.toString();

  let filteredProducts = [...products];

  if (category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.categoryId === category
    );
  }

  if (query) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  if (inStock === "true") {
    filteredProducts = filteredProducts.filter(
      (product) => product.inventory > 0
    );
  }

  if (sort === "price-asc") {
    filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (sort === "price-desc") {
    filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <Select
            value={category || ""}
            onValueChange={(value) => {
              window.location.href = `?${createQueryString({
                category: value || null,
              })}`;
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Search products..."
            className="w-full md:w-[300px]"
            value={query || ""}
            onChange={(e) => {
              window.location.href = `?${createQueryString({
                query: e.target.value || null,
              })}`;
            }}
          />
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={sort || ""}
            onValueChange={(value) => {
              window.location.href = `?${createQueryString({
                sort: value || null,
              })}`;
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to high</SelectItem>
              <SelectItem value="price-desc">Price: High to low</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={inStock === "true" ? "default" : "outline"}
            onClick={() => {
              window.location.href = `?${createQueryString({
                inStock: inStock === "true" ? null : "true",
              })}`;
            }}
          >
            In stock only
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://placehold.co/300x300/f3f4f6/a1a1aa?text=No+Image";

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(product.price));

  return (
    <Card className="h-full overflow-hidden border border-border rounded-lg transition-all hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        className="block relative h-48 overflow-hidden"
      >
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {product.status === "active" && product.inventory <= 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Sold Out
          </Badge>
        )}
        {product.featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
            Featured
          </Badge>
        )}
      </Link>

      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/products/${product.id}`}>
              <h3 className="font-medium text-lg leading-tight line-clamp-1 hover:underline">
                {product.name}
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
              {product.categoryName || "Uncategorized"}
            </p>
          </div>
          <p className="font-semibold text-lg">{formattedPrice}</p>
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {product.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1" size="sm" disabled={product.inventory <= 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProductsLoading() {
  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <Skeleton className="mb-6 h-5 w-40" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
