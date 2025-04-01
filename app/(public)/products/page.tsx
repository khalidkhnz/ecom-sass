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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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
          <ProductsList searchParams={searchParams} />
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
  const [productsData, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Convert to match Product interface
  const allProducts = productsData.map((p) => ({
    ...p,
    tags: p.tags || [],
    images: p.images || [],
  })) as Product[];

  // Filtering logic
  const categoryId = searchParams.category as string | undefined;
  const sort = searchParams.sort as string | undefined;
  const searchQuery = searchParams.search as string | undefined;
  const inStockOnly = searchParams.inStock === "true";

  let filteredProducts = [...allProducts];

  // Filter by category
  if (categoryId) {
    filteredProducts = filteredProducts.filter(
      (product) => product.categoryId === categoryId
    );
  }

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        (product.description &&
          product.description.toLowerCase().includes(query)) ||
        (product.tags &&
          product.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  }

  // Filter by in stock
  if (inStockOnly) {
    filteredProducts = filteredProducts.filter(
      (product) => product.inventory > 0
    );
  }

  // Sort products
  if (sort) {
    switch (sort) {
      case "price-asc":
        filteredProducts.sort(
          (a, b) => parseFloat(a.price) - parseFloat(b.price)
        );
        break;
      case "price-desc":
        filteredProducts.sort(
          (a, b) => parseFloat(b.price) - parseFloat(a.price)
        );
        break;
      case "name-asc":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        filteredProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        break;
    }
  }

  // Create URL search params utility for filtering
  const createQueryString = (name: string, value: string | null): string => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    if (value === null) {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    return params.toString();
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Category
          </label>
          <Select
            defaultValue={categoryId}
            onValueChange={(value) => {
              const url = new URL(window.location.href);
              url.search = createQueryString(
                "category",
                value === "all" ? null : value
              );
              window.location.href = url.toString();
            }}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="sort"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Sort by
          </label>
          <Select
            defaultValue={sort || "newest"}
            onValueChange={(value) => {
              const url = new URL(window.location.href);
              url.search = createQueryString("sort", value);
              window.location.href = url.toString();
            }}
          >
            <SelectTrigger id="sort" className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price-asc">Price: Low to high</SelectItem>
              <SelectItem value="price-desc">Price: High to low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="search"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Search
          </label>
          <form
            action={(formData) => {
              const search = formData.get("search") as string;
              const url = new URL(window.location.href);
              url.search = createQueryString("search", search || null);
              window.location.href = url.toString();
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="search"
              name="search"
              placeholder="Search products..."
              defaultValue={searchQuery || ""}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = "/products";
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {/* Product count */}
      <p className="mb-6 text-sm text-muted-foreground">
        Showing {filteredProducts.length} products
      </p>

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-lg font-medium">No products found</p>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
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
