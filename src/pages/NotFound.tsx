import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageSEO } from "@/hooks/usePageSEO";

function NotFound() {
  usePageSEO({
    title: "Page Not Found | Marcelinos Hotel & Resort",
    description:
      "The page you're looking for doesn't exist. Return to Marcelinos Hotel & Resort in Hilongos, Leyte.",
    path: "/404",
    keywords: "404, page not found, Marcelinos, hotel resort Hilongos Leyte",
  });

  return (
    <div
      id="not-found"
      className="min-h-[70vh] bg-neutral-50 flex flex-col items-center justify-center px-4 py-12 md:py-16"
    >
      <div className="mx-auto max-w-lg w-full text-center">
        {/* 404 number - brand colors */}
        <p
          className="font-display text-8xl md:text-9xl font-bold tracking-tight text-green-800/20 select-none"
          aria-hidden
        >
          404
        </p>

        <div className="-mt-12 md:-mt-16 relative z-10">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-green-900">
            Page not found
          </h1>
          <p className="mt-3 text-neutral-600 max-w-sm mx-auto">
            The page you're looking for doesn't exist or may have been moved.
            Head back to our homepage to explore rooms, venues, and book your
            stay at Marcelinos.
          </p>

          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="bg-green-800 text-white hover:bg-green-900 focus-visible:ring-green-800/50"
            >
              <Link to="/" className="inline-flex items-center gap-2">
                <Home className="size-5" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
