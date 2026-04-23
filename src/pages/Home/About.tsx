/**
 * Room and Venue About Section
 * room data count is dynamic from the backend
 * venue data count is dynamic from the backend
 * guest rating is static data
 */


import { useMemo } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";


interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
}

interface RoomItem {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface VenueItem {
  id: number;
  name: string;
  description: string;
  image: string;
}

function About() {
  const { data: roomData, isLoading: roomLoading, error: roomError } = useApiQuery<ApiListResponse<RoomItem>>(
    ["rooms", "home"],
    "/rooms?is_all=1&limit=12",
  );
  const { data: venueData, isLoading: venueLoading, error: venueError } = useApiQuery<ApiListResponse<VenueItem>>(
    ["venues", "home"],
    "/venues?is_all=1&limit=12",
  );
  const roomCount = useMemo(() => roomData?.data?.length ?? 0, [roomData, roomLoading, roomError]);
  const venueCount = useMemo(() => venueData?.data?.length ?? 0, [venueData, venueLoading, venueError]);
  return (
		<div
			className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 xl:gap-24 items-center"
			itemScope
			itemType="https://schema.org/AboutPage"
			aria-labelledby="about-heading">
			{/* Text */}
			<div className="about-text">
				<div className="section-eyebrow">
					About Us
				</div>
				<h2
					id="about-heading"
					className="font-display text-fluid-h2 font-light leading-[1.12] mb-7 text-ink"
					itemProp="headline">
					Welcome To <em className="italic text-forest">Marcelino’s Resort Hotel!</em>
				</h2>
				<p
					className="text-lg leading-relaxed text-black mb-5 max-w-[65ch]"
					itemProp="description">
					Where elegance meets celebration. Stay with us in comfortable rooms
					and suites, or gather in our venues for weddings, parties, and life’s
					most cherished moments—Marcelino’s Resort brings together restful
					accommodations, stunning event spaces, and unforgettable experiences.
				</p>

				{/* Stats */}
				<div className="flex flex-wrap gap-12 mt-12">
					<div className="flex flex-col gap-1.5">
						<span className="font-display text-fluid-stat font-light leading-none text-gold">
							{roomLoading ? "??" : roomError ? <p className="text-base text-red-600 text-center mb-6 font-medium">Error loading rooms.</p> : roomCount}
						</span>
						<span className="text-[13px] tracking-[0.15em] uppercase text-ink-soft font-medium">
							Rooms
						</span>
					</div>
					<div className="flex flex-col gap-1.5">
						<span className="font-display text-fluid-stat font-light leading-none text-gold">
							{venueLoading ? "??" : venueError ? <p className="text-base text-red-600 text-center mb-6 font-medium">Error loading venues.</p> : venueCount}
						</span>
						<span className="text-[13px] tracking-[0.15em] uppercase text-ink-soft font-medium">
							Event Venues
						</span>
					</div>
					<div className="flex flex-col gap-1.5">
						<span className="font-display text-fluid-stat font-light leading-none text-gold">
							★4.9
						</span>
						<span className="text-[13px] tracking-[0.15em] uppercase text-ink-soft font-medium">
							Guest Rating
						</span>
					</div>
				</div>
			</div>

			{/* Visual — overlapping images */}
			<div className="relative h-[340px] md:h-[420px] lg:h-[520px] order-first lg:order-last">
				<div
					className="absolute right-0 top-0 w-[86%] h-[84%] rounded-[4px] overflow-hidden"
					itemProp="image"
					itemScope
					itemType="https://schema.org/ImageObject">
					<OptimizedImage
						src="/img/banner-1.webp"
						alt="Beachfront View"
						containerClassName="w-full h-full"
						className="object-center transition-transform duration-700 hover:scale-105"
					/>
					<div className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent pointer-events-none" />
					<span className="absolute bottom-7 left-7 font-display italic text-xl text-cream/50">
						Beachfront View
					</span>
				</div>
				<div className="absolute left-0 bottom-0 w-[54%] h-[52%] rounded-[4px] border-[6px] border-cream overflow-hidden">
					<OptimizedImage
						src="https://i.pinimg.com/736x/ad/6d/37/ad6d378103197c3bd9b12f91e14ea8a0.jpg"
						alt="Pool & Gardens"
						containerClassName="w-full h-full"
						className="object-center transition-transform duration-700 hover:scale-105"
					/>
					<div className="absolute inset-0 bg-ink/25 flex items-center justify-center pointer-events-none"></div>
				</div>
			</div>
		</div>
	);
}

export default About;
