import { useRef, useState, useCallback, useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
// Use "gsap/Flip": "gsap/flip" points to flip.d.ts (global declarations, not a module). Capital F avoids that.
// @ts-ignore - flip.d.ts vs Flip.d.ts path casing in gsap package
import { Flip } from "gsap/Flip";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import CardItem from "@/components/cards/CardItem";
import CarouselSkeleton from "@/components/skeleton/RoomCarouselSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 4;
  });

  useLayoutEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setSlidesPerView(1);
      else if (window.innerWidth < 1024) setSlidesPerView(2);
      else setSlidesPerView(4);
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

  const {
    data: roomsResponse,
    isLoading,
    error,
  } = useApiQuery<ApiListResponse<Record<string, unknown>>>(
    ["rooms", "home"],
    "/rooms?is_all=1",
  );

  const roomList = useMemo(() => extractList(roomsResponse), [roomsResponse]);
  const [startIndex, setStartIndex] = useState(0);

  const visibleRooms = useMemo(() => {
    if (!roomList.length) return [];
    const n = Math.min(slidesPerView, roomList.length);
    return Array.from({ length: n }, (_, i) => {
      const idx = (startIndex + i) % roomList.length;
      return { ...roomList[idx], _index: idx };
    });
  }, [roomList, startIndex, slidesPerView]);

  const go = useCallback(
    (delta: number) => {
      if (!roomList.length || !containerRef.current || isAnimatingRef.current)
        return;
      const selector = "[data-flip-id]";
      const targets = containerRef.current.querySelectorAll(selector);
      if (targets.length) {
        directionRef.current = delta;
        flipStateRef.current = Flip.getState(targets);
      }
      setStartIndex((i) => (i + delta + roomList.length) % roomList.length);
    },
    [roomList.length],
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
          {
            opacity: 0,
            x: enterFromX,
            scale: ENTER_SCALE,
          },
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
      <section className="bg-gray-50 py-10">
        <h2 className="text-4xl font-bold text-center mb-10">
          <span className="text-green-900">OUR</span>{" "}
          <span className="text-yellow-500">ROOMS</span>
        </h2>
        <p className="text-red-500 text-center">Error loading rooms</p>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-10">
      <h2 className="text-4xl font-bold text-center mb-10">
        <span className="text-green-900">OUR</span>{" "}
        <span className="text-yellow-500">ROOMS</span>
      </h2>

      {isLoading ? (
        <CarouselSkeleton />
      ) : roomList.length === 0 ? (
        <p className="text-center text-gray-500">No rooms available.</p>
      ) : (
        <div
          className="relative w-[90%] max-w-[1200px] mx-auto pb-12"
          ref={containerRef}>
          {/* Fixed min-height reserves space so FLIP's absolute positioning doesn't collapse layout */}
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-[420px]">
            {visibleRooms.map(
              (room: Record<string, unknown> & { _index?: number }) => (
                <div
                  key={String(room.id)}
                  data-flip-id={String(room.id)}
                  className="flex justify-center">
                  <CardItem
                    id={room.id as number}
                    type={room.type as string}
                    name={room.name as string}
                    description={room.description as string}
                    capacity={room.capacity as number}
                    price={room.price as number}
                    amenities={room.amenities as unknown[]}
                    featured_image={room.featured_image as string | null}
                    gallery={room.gallery as string[]}
                  />
                </div>
              ),
            )}
          </div>

          {roomList.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-0 lg:-left-16 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-green-900 hover:bg-gray-50 transition-colors"
                aria-label="Previous rooms">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-0 lg:-right-16 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-green-900 hover:bg-gray-50 transition-colors"
                aria-label="Next rooms">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default RoomCard;
