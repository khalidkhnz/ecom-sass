import Link from "next/link";
import { Container } from "@/components/ui/container";

interface Category {
  name: string;
  slug: string;
  image: string;
}

interface FeaturedCategoriesProps {
  title?: string;
  subtitle?: string;
  categories?: Category[];
}

export function FeaturedCategories({
  title = "Shop by Category",
  subtitle = "Browse our range of categories to find exactly what you're looking for",
  categories = [
    {
      name: "Clothing",
      slug: "clothing",
      image:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1470&auto=format&fit=crop",
    },
    {
      name: "Electronics",
      slug: "electronics",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1470&auto=format&fit=crop",
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      image:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1470&auto=format&fit=crop",
    },
    {
      name: "Beauty",
      slug: "beauty",
      image:
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1469&auto=format&fit=crop",
    },
    {
      name: "Books",
      slug: "books",
      image:
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1473&auto=format&fit=crop",
    },
  ],
}: FeaturedCategoriesProps) {
  return (
    <Container>
      <div className="py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.slice(0, 3).map((category, index) => (
            <div
              key={category.slug}
              className={index === 0 ? "md:col-span-2" : ""}
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>

        {categories.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {categories.slice(3, 5).map((category) => (
              <div key={category.slug}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block relative h-64 w-full overflow-hidden rounded-lg"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${category.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6">
        <h3 className="text-xl font-semibold text-white mb-1">
          {category.name}
        </h3>
        <span className="inline-flex items-center text-sm text-white/80 group-hover:text-white">
          Shop Now
          <svg
            className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 12H20M20 12L14 6M20 12L14 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
