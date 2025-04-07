import { Suspense } from "react";
import { getProducts } from "@/app/actions/products";
import { getCategories } from "@/app/actions/categories";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/hooks/useProducts";
import { ProductsFilter } from "./components/products-filter";
import { ProductCard } from "./components/product-card";
import { ProductsLoading } from "./components/products-loading";

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

  const category = searchParams?.category?.toString();
  const query = searchParams?.query?.toString();
  const inStock = searchParams?.inStock?.toString();
  const sort = searchParams?.sort?.toString();

  let filteredProducts = [...products];

  // Don't filter by category if "all" is selected or category is not specified
  if (category && category !== "all") {
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

  // Update sorting logic to match new values
  if (sort === "featured") {
    filteredProducts.sort((a, b) =>
      a.featured === b.featured ? 0 : a.featured ? -1 : 1
    );
  } else if (sort === "price-asc") {
    filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === "price-desc") {
    filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
  }

  return (
    <div className="flex flex-col gap-8">
      <ProductsFilter
        categories={categories || []}
        searchParams={searchParams}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
