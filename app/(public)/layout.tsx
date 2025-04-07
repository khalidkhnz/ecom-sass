import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MarketingBanner } from "@/components/marketing-banner";
import { CartProvider } from "@/context/cart-context";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Texture enabled={false} />
      <MarketingBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Texture({ enabled }: { enabled: boolean }) {
  return (
    <div
      style={{
        backgroundImage: "url('/texture.jpg')",
      }}
      className={`fixed inset-0 w-screen h-[100dvh] opacity-15 mix-blend-multiply z-100 pointer-events-none bg-repeat bg-cover ${
        enabled ? "block" : "hidden"
      }`}
    />
  );
}
