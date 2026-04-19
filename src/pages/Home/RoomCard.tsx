import { useState, useEffect, useMemo } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import CarouselSkeleton from "@/components/skeleton/RoomCarouselSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { roomInventoryGroupKey } from "@/lib/formatters/roomDisplayName";
import { RoomTypeBadge } from "@/components/ui/RoomTypeBadge";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from "@/components/ui/carousel";

interface ApiListResponse<T> {
	success?: boolean;
	data?: T[];
}

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
	if (Array.isArray(response)) return response;
	if (response?.data && Array.isArray(response.data)) return response.data;
	return [];
}

/** Snappy scroll that still reads as premium (ms). Embla default is 25. */
const CAROUSEL_DURATION = 18;

/**
 * Embla only enables loop when there is enough scroll overflow. With few room
 * types, the grid can show every slide at once on desktop — duplicate the
 * sequence so prev/next and drag feel infinitely continuous.
 */
const MIN_SLIDES_FOR_LOOP = 9;

type CarouselSlide = {
	room: Record<string, unknown> & { _available_count?: number };
	key: string;
};

function buildLoopSlides(
	groupedRooms: Array<Record<string, unknown> & { _available_count?: number }>,
): CarouselSlide[] {
	const n = groupedRooms.length;
	if (n === 0) return [];
	if (n >= MIN_SLIDES_FOR_LOOP) {
		return groupedRooms.map((room, i) => ({
			room,
			key: `${String(room.id)}-${i}`,
		}));
	}
	const target = MIN_SLIDES_FOR_LOOP;
	return Array.from({ length: target }, (_, i) => {
		const room = groupedRooms[i % n]!;
		return { room, key: `${String(room.id)}-loop-${i}` };
	});
}

function RoomCard() {
	const navigate = useNavigate();
	const [api, setApi] = useState<CarouselApi | null>(null);

	const {
		data: roomsResponse,
		isLoading,
		error,
	} = useApiQuery<ApiListResponse<Record<string, unknown>>>(
		["rooms", "home"],
		"/rooms?is_all=1&limit=18",
	);

	const roomList = useMemo(() => extractList(roomsResponse), [roomsResponse]);

	const groupedRooms = useMemo(() => {
		if (!roomList.length) return [];

		const map = new Map<string, any[]>();
		for (const r of roomList) {
			const type = (r.type as string)?.toLowerCase() || "standard";
			const key = roomInventoryGroupKey(r as any);
			const id = `${type}|${key}`;
			if (!map.has(id)) {
				map.set(id, []);
			}
			map.get(id)!.push(r);
		}

		const standardGroups: any[][] = [];
		const otherGroupsMap = new Map<string, any[]>();

		for (const [id, rooms] of map.entries()) {
			const type = id.split("|")[0];
			if (type === "standard") {
				standardGroups.push(rooms);
			} else {
				if (!otherGroupsMap.has(type)) {
					otherGroupsMap.set(type, rooms);
				}
			}
		}

		const finals = [
			...standardGroups.slice(0, 2),
			...Array.from(otherGroupsMap.values()),
		];
		return finals.map((grp) => ({ ...grp[0], _available_count: grp.length }));
	}, [roomList]);

	const carouselSlides = useMemo(
		() => buildLoopSlides(groupedRooms),
		[groupedRooms],
	);

	const carouselOpts = useMemo(
		() => ({
			align: "start" as const,
			loop: carouselSlides.length > 1,
			duration: CAROUSEL_DURATION,
			skipSnaps: false,
			dragFree: false,
		}),
		[carouselSlides.length],
	);

	useEffect(() => {
		if (!api) return;
		api.reInit();
	}, [api, carouselSlides]);

	if (error) {
		return (
			<div>
				<div className="flex justify-between items-end mb-14 flex-wrap gap-5">
					<div>
						<div
							className="section-eyebrow"
							style={{ color: "var(--color-gold-light)" }}
						>
							Accommodations
						</div>
						<h2 className="font-display text-fluid-h2 font-light text-cream leading-[1.1]">
							Sleep in <em className="italic text-gold-light">Refined</em>{" "}
							Comfort
						</h2>
					</div>
				</div>
				<p className="text-base text-red-400 text-center font-medium">
					Error loading rooms.
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-end mb-16 flex-wrap gap-5 max-md:flex-col max-md:items-start">
				<div>
					<div
						className="section-eyebrow"
						style={{ color: "var(--color-gold-light)" }}
					>
						Accommodations
					</div>
					<h2 className="font-display text-fluid-h2 font-light text-cream leading-[1.1]">
						Sleep in <em className="italic text-gold-light">Refined</em> Comfort
					</h2>
				</div>
				<a
					href="/rooms"
					className="btn-ghost-mockup"
					style={{ color: "rgba(250,250,249,0.7)" }}
				>
					View All Rooms
				</a>
			</div>

			{isLoading ? (
				<CarouselSkeleton />
			) : groupedRooms.length === 0 ? (
				<p className="text-base text-center text-cream/80">
					No rooms available.
				</p>
			) : (
				<div className="relative w-full max-w-[1200px] mx-auto min-h-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-shadow duration-400 ease-out">
					<Carousel
						opts={carouselOpts}
						setApi={setApi}
						className="w-full outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-forest-deep,#0f1f1a)] rounded-sm"
						tabIndex={0}
					>
						<CarouselContent>
							{carouselSlides.map(({ room, key }) => (
									<CarouselItem
										key={key}
										className="basis-full sm:basis-1/2 lg:basis-1/3"
									>
										<div
											className="group min-w-0 bg-dark overflow-hidden relative cursor-pointer border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.25)] origin-center transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] hover:z-10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-gold/25 will-change-transform"
											onClick={() =>
												navigate(`/rooms/${room.id}`, { state: { room } })
											}
											role="button"
											tabIndex={0}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													navigate(`/rooms/${room.id}`, { state: { room } });
												}
											}}
										>
											<div className="relative overflow-hidden h-[340px] max-md:h-[280px]">
												<OptimizedImage
													src={
														(room.featured_image as string) ??
														"/placeholder-room.jpg"
													}
													alt={(room.name as string) ?? "Room"}
													containerClassName="w-full h-full min-h-0 bg-cream/5"
													className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
												/>
												<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-90" />
												<div className="absolute inset-0 bg-gold/10 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
											</div>

											<div className="p-6 pt-5">
												<h3 className="font-display text-fluid-card-title font-normal text-cream mb-3">
													<RoomTypeBadge
														type={(room.type as string) ?? "Room"}
														isTitle
													/>
												</h3>
												{(room.description as string) && (
													<p className="text-sm leading-relaxed text-cream/70 mb-3 line-clamp-2">
														{room.description as string}
													</p>
												)}
												<p className="text-base leading-relaxed text-cream/70 mb-5 line-clamp-2">
													{(room.bed_specifications as string) ?? ""}
												</p>
												<div className="flex items-end justify-between">
													<div className="flex items-baseline gap-2">
														<span className="font-display text-fluid-price font-light text-cream">
															{room.price != null
																? pricingFormat(String(room.price))
																: "—"}
														</span>
														<span className="text-sm text-cream/55">/ night</span>
													</div>
													<div className="text-gold-light text-sm font-medium hover:underline">
														See more
													</div>
												</div>
											</div>
										</div>
									</CarouselItem>
								))}
						</CarouselContent>
					</Carousel>

					{carouselSlides.length > 1 && (
						<>
							<button
								type="button"
								onClick={() => api?.scrollPrev()}
								className="absolute left-2 lg:-left-14 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.08] text-cream backdrop-blur-md transition-[transform,background-color,border-color] duration-200 ease-out hover:scale-105 hover:bg-cream/15 hover:border-gold/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
								aria-label="Previous rooms"
							>
								<ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
							</button>
							<button
								type="button"
								onClick={() => api?.scrollNext()}
								className="absolute right-2 lg:-right-14 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.08] text-cream backdrop-blur-md transition-[transform,background-color,border-color] duration-200 ease-out hover:scale-105 hover:bg-cream/15 hover:border-gold/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
								aria-label="Next rooms"
							>
								<ChevronRight className="h-5 w-5" strokeWidth={1.75} />
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
}

export default RoomCard;
