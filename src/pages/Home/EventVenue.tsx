import { useMemo } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import EventVenueSkeleton from "@/components/skeleton/EventVenueSkeleton";

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

function venueMainImage(venue: VenueItem): string | null {
  if (venue.featured_image) return venue.featured_image;
  const gallery = Array.isArray(venue.gallery) ? venue.gallery : [];
  return gallery[0] ?? null;
}

function EventVenues() {
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

  return (
    <section id="venues" className="w-full py-16 bg-gray-50">
      <h2 className="text-4xl font-bold text-center mb-10">
        <span className="text-green-900">EVENT </span>
        <span className="text-yellow-500">VENUES</span>
      </h2>

      {error && (
        <p className="text-red-500 text-center mb-6">Error loading venues.</p>
      )}

      {isLoading ? (
        <EventVenueSkeleton />
      ) : venueList.length === 0 ? (
        <p className="text-center text-gray-500">No venues available.</p>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
          {venueList.map((venue) => {
            const mainImage = venueMainImage(venue);
            return (
              <div
                key={venue.id}
                className="max-w-sm mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg duration-300">
                <div className="w-full h-60 bg-gray-100 overflow-hidden">
                  <img
                    src={mainImage ?? "/placeholder-room.jpg"}
                    alt={venue.name ?? "Venue"}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {venue.name ?? "Venue"}
                  </h3>
                  {venue.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {venue.description}
                    </p>
                  )}
                  {venue.capacity != null && (
                    <p className="text-gray-600 text-sm mb-1">
                      Capacity: {venue.capacity}
                    </p>
                  )}
                  {venue.price != null && (
                    <p className="text-green-800 font-semibold mt-2">
                      {pricingFormat(String(venue.price))}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default EventVenues;
