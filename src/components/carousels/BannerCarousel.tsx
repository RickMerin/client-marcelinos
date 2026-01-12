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
import { Button } from "@/components/ui/button";
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
      <CarouselContent className="ml-0 gap-0 [&>*]:pl-0 [&>*]:mr-0">
        {Array.from({ length: 5 }).map((_, index) => {
          const isActive = index === activeIndex;

          return (
            <CarouselItem
              key={index}
              className="basis-full flex-shrink-0 flex-grow-0 pl-0 mr-0">
              <Card className="w-full px-0 py-0 cursor-grab rounded-none border-0">
                <CardContent className="relative p-0 overflow-hidden">
                  <img
                    src={image1}
                    alt="Banner 1"
                    loading="lazy"
                    className="w-full min-h-[600px] h-full object-cover object-center"
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
                            fontSize: "clamp(2rem, 6vw, 3.5rem)",
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

                      {/* Buttons animation */}
                      <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="flex flex-col w-1/2 md:flex-row items-center justify-center gap-4 md:gap-8">
                        <Button className="w-full md:w-auto py-4 md:py-5 font-bold uppercase border-2 border-transparent text-sm">
                          OUR ROOMS
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full md:w-auto py-4 md:py-5 font-bold uppercase border-2 text-white text-sm">
                          BOOK ROOM
                        </Button>
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
