import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { WritingText } from "@/components/ui/shadcn-io/writing-text";
import { motion } from "framer-motion";

/** LCP image: same URL as preload in index.html so request is discoverable from initial document */
const LCP_BANNER_SRC = "/img/banner-1.webp";

export function BannerCarousel() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const plugin = useRef(Autoplay({ delay: 5000 }));

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Motion variants (clean and DRY)
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <Carousel
      id="home"
      opts={{ align: "start", loop: true }}
      plugins={[plugin.current]}
      setApi={setApi}>
      <CarouselContent className="ml-0 gap-0 *:pl-0 *:mr-0">
        {Array.from({ length: 5 }).map((_, index) => {
          const isActive = index === activeIndex;

          return (
            <CarouselItem
              key={index}
              className="basis-full shrink-0 grow-0 pl-0 mr-0">
              <Card className="w-full px-0 py-0 cursor-grab rounded-none border-0">
                <CardContent className="relative p-0 overflow-hidden">
                  <img
                    src={LCP_BANNER_SRC}
                    alt="Banner 1"
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-[88vh] object-cover object-center"
                  />
                  {/* Premium overlay: gradient for depth and readability */}
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(44,44,44,0.65) 50%, rgba(0,0,0,0.7) 100%)",
                    }}
                  />

                  {/* Animate all content inside - premium typography */}
                  {isActive && (
                    <motion.section
                      key={index}
                      className="absolute inset-0 z-20 flex flex-col space-y-5 items-center justify-center select-none px-4"
                      initial="initial"
                      animate="animate"
                      transition={{ staggerChildren: 0.2 }}>
                      {/* Header text - display font, sage accent */}
                      <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex items-center justify-center">
                        <div
                          className="block w-12 h-0.5 mr-4 md:mr-5"
                          style={{ backgroundColor: "var(--color-sage-light)" }}
                        />
                        <h4 className="font-display text-white text-sm md:text-base font-semibold uppercase tracking-[0.25em]">
                          Elegant Venue
                        </h4>
                        <div
                          className="block w-12 h-0.5 ml-4 md:ml-5"
                          style={{ backgroundColor: "var(--color-sage-light)" }}
                        />
                      </motion.div>

                      {/* Main headline - display font */}
                      <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex justify-center items-center w-full px-2">
                        <WritingText
                          text="MAKE YOUR STAY COMFORTABLE"
                          inView={true}
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(2rem, 6vw, 3rem)",
                            lineHeight: "1.2",
                            fontWeight: "700",
                            color: "white",
                            textAlign: "center",
                            textTransform: "uppercase",
                            width: "100%",
                            display: "flex",
                            gap: "0.7rem",
                            justifyContent: "center",
                            alignItems: "center",
                            flexWrap: "wrap",
                            wordBreak: "break-word",
                            letterSpacing: "0.02em",
                          }}
                          transition={{
                            type: "spring",
                            bounce: 0,
                            duration: 2,
                            delay: 0.3,
                          }}
                        />
                      </motion.div>

                      {/* Tagline - refined body */}
                      <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="flex justify-center items-center w-full max-w-xl">
                        <p className="font-display text-white/95 text-center text-sm md:text-base font-light tracking-wide leading-relaxed italic">
                          Experience refined comfort in thoughtfully designed
                          rooms, complemented by quality amenities and warm
                          hospitality.
                        </p>
                      </motion.div>
                    </motion.section>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      <CarouselPrevious
        variant="secondary"
        className="absolute left-2 md:left-10 z-30"
      />
      <CarouselNext
        variant="secondary"
        className="absolute right-2 md:right-10 z-30"
      />
    </Carousel>
  );
}
