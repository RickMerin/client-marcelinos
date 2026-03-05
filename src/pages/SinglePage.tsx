import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CardItem from "@/components/cards/CardItem";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { RoomTypeBadge } from "@/components/ui/RoomTypeBadge";


interface ApiListResponse<T> {
	success?: boolean;
	data?: T[];
}

interface ListingItem {
  id: number;
  name?: string;
  type?: string;
  capacity?: number;
  price?: number;
  description?: string;
  amenities?: unknown[];
  featured_image?: string | null;
  gallery?: string[];
}

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
	if (Array.isArray(response)) return response;
	if (response?.data && Array.isArray(response.data)) return response.data;
	return [];
}

function amenityLabels(amenities: unknown[] | undefined): string[] {
	if (!Array.isArray(amenities)) return [];
	return amenities
		.map((item) =>
			typeof item === "string" ? item : (item as { name?: string })?.name,
		)
		.filter((label): label is string => Boolean(label));
}

const SinglePage = () => {
	const navigate = useNavigate();
	const { roomId, venueId } = useParams<{ roomId?: string; venueId?: string }>();
	const location = useLocation();
	const state = location.state as { room?: ListingItem; venue?: ListingItem } | null;
	const detailRef = useRef<HTMLDivElement>(null);


	const isVenuePage = location.pathname.startsWith("/venues");
	const stateItem = state?.room ?? state?.venue;

	const { data, isLoading, error } = useApiQuery<
		ApiListResponse<ListingItem> | ListingItem[]
	>([
		isVenuePage ? "venues" : "rooms",
		"single-page",
	], isVenuePage ? "/venues?is_all=1" : "/rooms?is_all=1");

	const itemList = useMemo(() => extractList<ListingItem>(data), [data]);

	const selectedItem = useMemo(() => {
		const idToMatch = isVenuePage ? venueId : roomId;
		if (idToMatch) {
			const match = itemList.find((item) => String(item.id) === idToMatch);
			if (match) return match;
		}
		return stateItem ?? null;
	}, [isVenuePage, venueId, roomId, itemList, stateItem]);

	const visibleList = useMemo(() => {
		if (!selectedItem) return itemList;
		return itemList.filter((item) => item.id !== selectedItem.id);
	}, [itemList, selectedItem]);

	const handleCardClick = (id: number, item?: ListingItem) => {
		const path = isVenuePage ? `/venues/${id}` : `/rooms/${id}`;
		navigate(path, {
			state: {
				[isVenuePage ? "venue" : "room"]:
					item ?? itemList.find((entry) => entry.id === id),
			},
		});
	};

	const heroImage = selectedItem?.featured_image ?? selectedItem?.gallery?.[0];
	const amenities = amenityLabels(selectedItem?.amenities);
	const headingLabel = isVenuePage ? "Our Venues" : "Our Rooms";
	const introTitle = isVenuePage ? "Find the perfect venue" : "Find the perfect stay";
	const introCopy = isVenuePage
		? "Browse every venue we have available. Click any card to open its full details."
		: "Browse every room we have available. Click any card to open its full details.";
	const listLabel = isVenuePage ? "All venues" : "All rooms";
	const availableLabel = isVenuePage ? "venues" : "rooms";
	const bookCta = isVenuePage ? "Book this venue" : "Book this room";
	const fallbackLabel = isVenuePage ? "Venue" : "Room";

	useEffect(() => {
		if (selectedItem && detailRef.current) {
			detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [selectedItem]);

	return (
    <div className="w-full bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.15em] text-green-800/70 font-semibold">
              {headingLabel}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-(--color-charcoal)">
              {introTitle}
            </h1>
            <p className="mt-2 text-gray-600 max-w-2xl">{introCopy}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-semibold text-green-900 shadow-sm transition hover:border-green-200 hover:shadow-md"
          >
            ← Back
          </button>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-600">
            Loading {availableLabel}…
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-800">
            Unable to load {availableLabel} right now. Please try again later.
          </div>
        ) : (
          <div className="space-y-12">
            {selectedItem && (
              <div
                ref={detailRef}
                className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start rounded-3xl border border-gray-100 bg-white shadow-sm shadow-gray-900/5 p-6 sm:p-8"
              >
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                  <OptimizedImage
                    src={heroImage ?? "/placeholder-room.jpg"}
                    alt={selectedItem.name ?? fallbackLabel}
                    containerClassName="h-[280px] sm:h-[360px]"
                    className="object-center"
                  />
                </div>

								<div className="space-y-4">
									<div className="flex items-center gap-3">
										{selectedItem.type && (
											<RoomTypeBadge type={selectedItem.type} />
										)}
									</div>

                  <h2 className="font-display text-3xl font-bold text-(--color-charcoal)">
                    {selectedItem.name ?? fallbackLabel}
                  </h2>

                  {selectedItem.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    {selectedItem.capacity != null && (
                      <div className="rounded-full bg-gray-100 px-3 py-1 font-medium">
                        Capacity: {selectedItem.capacity}{" "}
                        {selectedItem.capacity === 1 ? "person" : "people"}
                      </div>
                    )}
                    {selectedItem.price != null && (
                      <div className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-green-900">
                        {pricingFormat(selectedItem.price)}
                      </div>
                    )}
                  </div>

                  {amenities.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-(--color-charcoal)">
                        Amenities
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((label) => (
                          <span
                            key={label}
                            className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-900"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-(--color-charcoal) transition hover:border-gray-300"
                    >
                      Back to previous page
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/create-booking")}
                      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
                    >
                      {bookCta}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold text-(--color-charcoal)">
                  {listLabel}
                </h3>
                <span className="text-sm text-gray-500">
                  {visibleList.length} {availableLabel} available
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleList.map((item) => (
                  <CardItem
                    key={item.id}
                    id={item.id}
                    type={item.type}
                    name={item.name}
                    description={item.description}
                    capacity={item.capacity}
                    price={item.price}
                    amenities={item.amenities}
                    featured_image={item.featured_image}
                    gallery={item.gallery}
                    onClick={() => handleCardClick(item.id, item)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinglePage;
