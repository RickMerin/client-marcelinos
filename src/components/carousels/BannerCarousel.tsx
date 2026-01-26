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
import image1 from "@/assets/img/banner-1.webp";

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
                    src={image1}
                    alt="Banner 1"
                    loading="eager"
<<<<<<< HEAD
                    fetchPriority="high"
                    className="w-full h-[88vh] object-cover object-center"
=======
                    className="w-full h-[90vh] object-cover object-center"
>>>>>>> 8ebcc28 (feat: Modify Hero Form)
                  />
                  <div className="absolute inset-0 bg-black/60 z-10" />

                  {/* Animate all content inside */}
                  {isActive && (
                    <motion.section
                      key={index}
                      className="absolute inset-0 z-20 flex flex-col space-y-5 items-center justify-center select-none"
                      initial="initial"
                      animate="animate"
                      transition={{ staggerChildren: 0.2 }}>
                      {/* Header text animation */}
                      <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex items-center justify-center">
                        <div className="block w-10 h-1 bg-[#F4C95D] mr-5" />
                        <h4 className="text-white text-md md:text-lg font-semibold uppercase">
                          Elegant Venue
                        </h4>
                        <div className="block w-10 h-1 bg-[#F4C95D] ml-5" />
                      </motion.div>

                      {/* Main WritingText animation */}
                      <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex justify-center items-center w-full px-2">
                        <WritingText
                          text="MAKE YOUR STAY COMFORTABLE"
                          inView={true}
                          style={{
                            fontSize: "clamp(2rem, 6vw, 3rem)",
                            lineHeight: "1.2",
                            fontWeight: "bold",
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
                          }}
                          transition={{
                            type: "spring",
                            bounce: 0,
                            duration: 2,
                            delay: 0.3,
                          }}
                        />
                      </motion.div>

                      {/* Description animation */}
                      <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="flex justify-center items-center w-3/4 md:w-1/2">
                        <i className="text-white text-center text-sm md:text-base font-cursive font-light tracking-wide leading-relaxed">
                          Experience refined comfort in thoughtfully designed
                          rooms, complemented by quality amenities and warm
                          hospitality.
                        </i>
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
