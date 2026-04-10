import { useRef, useState, useCallback, useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
// @ts-ignore
import { Flip } from "gsap/Flip";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import CarouselSkeleton from "@/components/skeleton/RoomCarouselSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { roomInventoryGroupKey } from "@/lib/formatters/roomDisplayName";

gsap.registerPlugin(Flip);

interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
}

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

function useSlidesPerView() {
  const [slidesPerView, setSlidesPerView] = useState(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  });

  useLayoutEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setSlidesPerView(1);
      else if (window.innerWidth < 1024) setSlidesPerView(2);
      else setSlidesPerView(3);
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return slidesPerView;
}

const SLIDE_OFFSET = 60;
const DURATION_FLIP = 0.65;
const DURATION_ENTER_LEAVE = 0.45;
const ENTER_SCALE = 0.97;
const EASE_SMOOTH = "power2.inOut";

function RoomCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const directionRef = useRef(1);
  const isAnimatingRef = useRef(false);
  const slidesPerView = useSlidesPerView();
  const navigate = useNavigate();

  const {
    data: roomsResponse,
    isLoading,
    error,
  } = useApiQuery<ApiListResponse<Record<string, unknown>>>(
    ["rooms", "home"],
    "/rooms?is_all=1",
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
      const type = id.split('|')[0];
      if (type === "standard") {
        standardGroups.push(rooms);
      } else {
        if (!otherGroupsMap.has(type)) {
          otherGroupsMap.set(type, rooms);
        }
      }
    }

    const finals = [...standardGroups.slice(0, 2), ...Array.from(otherGroupsMap.values())];
    return finals.map((grp) => ({ ...grp[0], _available_count: grp.length }));
  }, [roomList]);

  const [startIndex, setStartIndex] = useState(0);

  const visibleRooms = useMemo(() => {
    if (!groupedRooms.length) return [];
    const n = Math.min(slidesPerView, groupedRooms.length);
    return Array.from({ length: n }, (_, i) => {
      const idx = (startIndex + i) % groupedRooms.length;
      return { ...groupedRooms[idx], _index: idx };
    });
  }, [groupedRooms, startIndex, slidesPerView]);

  const go = useCallback(
    (delta: number) => {
      if (!groupedRooms.length || !containerRef.current || isAnimatingRef.current)
        return;
      const selector = "[data-flip-id]";
      const targets = containerRef.current.querySelectorAll(selector);
      if (targets.length) {
        directionRef.current = delta;
        flipStateRef.current = Flip.getState(targets);
      }
      setStartIndex((i) => (i + delta + groupedRooms.length) % groupedRooms.length);
    },
    [groupedRooms.length],
  );

  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (!state || !containerRef.current) return;
    flipStateRef.current = null;
    isAnimatingRef.current = true;
    const direction = directionRef.current;
    const selector = "[data-flip-id]";
    const isSmallScreen = slidesPerView === 1;
    const enterFromX = isSmallScreen ? direction * SLIDE_OFFSET : 0;
    const leaveToX = isSmallScreen ? -direction * SLIDE_OFFSET : 0;

    const tl = Flip.from(state, {
			targets: selector,
			duration: DURATION_FLIP,
			ease: EASE_SMOOTH,
			absolute: true,
			onEnter: (elements: Element[]) =>
				gsap.fromTo(
					elements,
					{ opacity: 0, x: enterFromX, scale: ENTER_SCALE },
					{
						opacity: 1,
						x: 0,
						scale: 1,
						duration: DURATION_ENTER_LEAVE,
						ease: EASE_SMOOTH,
						overwrite: "auto",
					},
				),
			onLeave: (elements: Element[]) =>
				gsap.to(elements, {
					opacity: 0,
					x: leaveToX,
					scale: ENTER_SCALE,
					duration: DURATION_ENTER_LEAVE,
					ease: EASE_SMOOTH,
					overwrite: "auto",
				}),
			onComplete: () => {
				isAnimatingRef.current = false;
			},
		});
    return () => {
			tl.kill();
			isAnimatingRef.current = false;
		};
  }, [startIndex, slidesPerView]);

  if (error) {
    return (
			<div>
				<div className="flex justify-between items-end mb-14 flex-wrap gap-5">
					<div>
						<div
							className="section-eyebrow"
							style={{ color: "var(--color-gold-light)" }}>
							Accommodations
						</div>
						<h2 className="font-display text-[clamp(36px,4vw,54px)] font-light text-cream leading-[1.1]">
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
			{/* Header */}
			<div className="flex justify-between items-end mb-16 flex-wrap gap-5 max-md:flex-col max-md:items-start">
				<div>
					<div
						className="section-eyebrow"
						style={{ color: "var(--color-gold-light)" }}>
						Accommodations
					</div>
					<h2 className="font-display text-[clamp(36px,4vw,56px)] font-light text-cream leading-[1.1]">
						Sleep in <em className="italic text-gold-light">Refined</em> Comfort
					</h2>
				</div>
				<a
					href="/rooms"
					className="btn-ghost-mockup"
					style={{ color: "rgba(250,250,249,0.7)" }}>
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
				<div
					className="relative w-full max-w-[1200px] mx-auto min-h-[495px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-shadow duration-400 ease-out"
					ref={containerRef}>
					<div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-[420px]">
						{visibleRooms.map(
							(room: Record<string, unknown> & { _index?: number; _available_count?: number }, idx) => (
								<div
									key={String(room.id)}
									data-flip-id={String(room.id)}
									className="group bg-dark overflow-hidden relative cursor-pointer border border-white/[0.06] shadow-lg transition-transform duration-300 hover:scale-105 hover:z-50"
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
									}}>
									{/* Image */}
									<div
										className="relative overflow-hidden h-[340px] max-md:h-[280px]">
										<OptimizedImage
											src={
												(room.featured_image as string) ??
												"/placeholder-room.jpg"
											}
											alt={(room.name as string) ?? "Room"}
											containerClassName="w-full h-full"
											className="object-center transition-transform duration-650 ease-out group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-gold/12 opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
									</div>

									{/* Info */}
									<div className="p-6 pt-5">
										<p className="text-[13px] tracking-[0.2em] uppercase text-gold-light mb-2 font-medium">
											{(room.type as string) ?? "Room"}
										</p>
										<h3 className="font-display text-[clamp(24px,2.5vw,30px)] font-normal text-cream mb-3">
											{(room.name as string) ?? "—"}
										</h3>
										<p className="text-base leading-relaxed text-cream/70 mb-5 line-clamp-2">
											{(room.description as string) ?? ""}
										</p>
										<div className="flex items-baseline gap-2">
											<span className="font-display text-[clamp(26px,3vw,34px)] font-light text-cream">
												{room.price != null
													? pricingFormat(String(room.price))
													: "—"}
											</span>
											<span className="text-sm text-cream/55">/ night</span>
										</div>
									</div>
								</div>
							),
						)}
					</div>

					{groupedRooms.length > 1 && (
						<>
							<button
								type="button"
								onClick={() => go(-1)}
								className="absolute left-2 lg:-left-14 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/10 flex items-center justify-center text-cream hover:bg-cream/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
								aria-label="Previous rooms">
								<ChevronLeft className="w-5 h-5" />
							</button>
							<button
								type="button"
								onClick={() => go(1)}
								className="absolute right-2 lg:-right-14 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/10 flex items-center justify-center text-cream hover:bg-cream/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
								aria-label="Next rooms">
								<ChevronRight className="w-5 h-5" />
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
}

export default RoomCard;
