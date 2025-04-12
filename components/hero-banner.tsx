import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl?: string;
  overlayOpacity?: number;
}

export function HeroBanner({
  title = "Summer Collection 2024",
  subtitle = "Discover the latest trends and styles for the season with our curated collection of premium products.",
  buttonText = "Shop Now",
  buttonLink = "/products",
  secondaryButtonText = "Learn More",
  secondaryButtonLink = "/about",
  imageUrl = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1470&auto=format&fit=crop",
  overlayOpacity = 0.5,
}: HeroBannerProps) {
  return (
    <div className="relative bg-black overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          opacity: overlayOpacity,
        }}
      />

      {/* Content */}
      <Container>
        <div className="relative z-10 py-20 md:py-32 text-white max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-xl">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href={buttonLink}>{buttonText}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-primary"
              asChild
            >
              <Link href={secondaryButtonLink}>{secondaryButtonText}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
