import { useRef, useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import CardItem from "@/components/cards/CardItem";
import EventVenueSkeleton from "@/components/skeleton/EventVenueSkeleton";

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
  price?: number;
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

function EventVenues() {
  const sectionRef = useRef<HTMLElement>(null);

  const {
    data: venuesResponse,
    isLoading,
    error,
  } = useApiQuery<ApiListResponse<VenueItem>>(
    ["venues", "home"],
    "/venues?is_all=1",
  );

  const venueList = useMemo(
    () => extractList(venuesResponse),
    [venuesResponse],
  );

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
      aria-labelledby="venues-heading">
      <h2
        id="venues-heading"
        className="font-display text-3xl font-bold tracking-tight text-center mb-10 text-(--color-charcoal)">
        <span className="text-green-900">EVENT </span>
        <span className="text-yellow-500">VENUES</span>
      </h2>

      {error && (
        <p className="text-sm text-red-600 text-center mb-6 font-medium">
          Error loading venues.
        </p>
      )}

      {isLoading ? (
        <EventVenueSkeleton />
      ) : venueList.length === 0 ? (
        <p className="text-sm text-center text-(--color-charcoal) opacity-80">
          No venues available.
        </p>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 md:grid-cols-3">
          {venueList.map((venue) => (
            <div key={venue.id} className="venue-card-wrap">
              <CardItem
                id={venue.id}
                name={venue.name}
                capacity={venue.capacity}
                price={venue.price}
                description={venue.description}
                featured_image={venue.featured_image}
                gallery={venue.gallery}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default EventVenues;
