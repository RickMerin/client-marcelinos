import { useRef, useLayoutEffect, useMemo, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import CardItem from "@/components/cards/CardItem";
import EventVenueSkeleton from "@/components/skeleton/EventVenueSkeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";
import {
  venueStartingDisplayPrice,
  type VenuePriceItem,
} from "@/lib/math/calculate";

gsap.registerPlugin(ScrollTrigger);

interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
}

interface VenueItem {
  id: number;
  name?: string;
  description?: string;
  capacity?: number;
  wedding_price?: number;
  birthday_price?: number;
  meeting_staff_price?: number;
  featured_image?: string | null;
  gallery?: string[];
}

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

const REVEAL_DURATION = 0.6;
const STAGGER_DELAY = 0.12;
const REVEAL_EASE = "power2.out";

function getVenueCarouselThreshold(viewportWidth: number): number {
  if (viewportWidth < 640) return 1;
  return 2;
}

function EventVenues() {
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  const {
		data: venuesResponse,
		isLoading,
		error,
	} = useApiQuery<ApiListResponse<VenueItem>>(
		["venues", "home"],
		"/venues?is_all=1&limit=12",
	);

  const venueList = useMemo(
    () => extractList(venuesResponse),
    [venuesResponse],
  );

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const venueCarouselThreshold = getVenueCarouselThreshold(viewportWidth);
  const shouldUseVenueCarousel = venueList.length > venueCarouselThreshold;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || isLoading || venueList.length === 0) return;

    const heading = section.querySelector("h2");
    const cards = section.querySelectorAll(".venue-card-wrap");

    const ctx = gsap.context(() => {
      if (heading) {
        gsap.from(heading, {
          y: 28,
          opacity: 0,
          duration: REVEAL_DURATION,
          ease: REVEAL_EASE,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }
      if (cards.length) {
        gsap.from(cards, {
          y: 40,
          opacity: 0,
          duration: REVEAL_DURATION - 0.05,
          stagger: STAGGER_DELAY,
          ease: REVEAL_EASE,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, [isLoading, venueList.length]);

  return (
    <section
      ref={sectionRef}
      className="w-full"
      aria-labelledby="venues-heading"
    >
      {/* Header */}
      <div className="mb-12">
        <div className="section-eyebrow">Event Spaces</div>
        <h2
          id="venues-heading"
          className="font-display text-fluid-h2 font-light leading-[1.1] text-ink"
        >
          Host Your <em className="italic text-gold">Perfect</em> Event
        </h2>
      </div>

      {error && (
        <p className="text-base text-red-600 text-center mb-6 font-medium">
          Error loading venues.
        </p>
      )}

      {isLoading ? (
        <EventVenueSkeleton />
      ) : venueList.length === 0 ? (
        <p className="text-base text-center text-ink-soft opacity-80">
          No venues available.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.25fr] gap-12 lg:gap-18 items-start">
          {/* Left: venue text + features */}
          <div>
            <p className="text-lg leading-relaxed text-black mb-10 max-w-[65ch]">
              From intimate weddings to grand corporate gatherings, our versatile
              venues transform your vision into an unforgettable experience in the
              heart of Leyte.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
              {[
                { icon: "🌿", title: "Garden Pavilion", text: "Up to 50 guests, open-air" },
                { icon: "🏛️", title: "Grand Function Hall", text: "Air-conditioned 50 pax, Non Air-conditioned 80 pax" },
              ].map((feat) => (
                <div key={feat.title} className="flex items-start gap-3.5">
                  <div className="w-[36px] h-[36px] shrink-0 bg-gold rounded-full flex items-center justify-center text-base text-ink">
                    {feat.icon}
                  </div>
                  <div className="text-base leading-relaxed text-black">
                    <strong className="block font-medium text-blacks mb-0.5">{feat.title}</strong>
                    {feat.text}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/venues")}
              className="btn-primary-mockup"
            >
              Inquire About Venues
            </button>
          </div>

          {/* Right: venue cards */}
          {shouldUseVenueCarousel ? (
            <div className="relative min-w-0 overflow-visible">
              <Carousel opts={{ align: "start", loop: true }} className="w-full px-4 sm:px-8 md:px-10">
                <CarouselContent className="-ml-4">
                  {venueList.map((venue) => (
                    <CarouselItem
                      key={venue.id}
                      className="min-w-0 basis-full pl-4 sm:basis-1/2"
                    >
                      <div className="venue-card-wrap">
                        <CardItem
                          id={venue.id}
                          name={venue.name}
                          capacity={venue.capacity}
                          price={venueStartingDisplayPrice(venue as VenuePriceItem)}
                          description={venue.description}
                          featured_image={venue.featured_image}
                          gallery={venue.gallery}
                          onClick={() =>
                            navigate(`/venues/${venue.id}`, { state: { venue } })
                          }
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/10 backdrop-blur-sm text-gray-700 hover:bg-white sm:left-0 sm:-translate-x-1/2" />
                <CarouselNext className="right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/10 backdrop-blur-sm text-gray-700 hover:bg-white sm:right-0 sm:translate-x-1/2" />
              </Carousel>
            </div>
          ) : (
            <div
              className={`min-w-0 grid gap-6 ${
                venueList.length === 1
                  ? "grid-cols-1 max-w-md"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {venueList.map((venue) => (
                <div key={venue.id} className="venue-card-wrap">
                  <CardItem
                    id={venue.id}
                    name={venue.name}
                    capacity={venue.capacity}
                    price={venueStartingDisplayPrice(venue as VenuePriceItem)}
                    description={venue.description}
                    featured_image={venue.featured_image}
                    gallery={venue.gallery}
                    onClick={() =>
                      navigate(`/venues/${venue.id}`, { state: { venue } })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default EventVenues;
