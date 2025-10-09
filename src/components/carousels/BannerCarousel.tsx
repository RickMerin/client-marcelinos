import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

import image1 from "@/assets/img/banner-1.webp";

export function BannerCarousel() {
  return (
    <Carousel>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <Card className="w-full px-0 py-0 cursor-grab">
              <CardContent className="relative p-0 overflow-hidden">
                {/* Background image */}
                <img
                  src={image1}
                  alt="Banner 1"
                  className="w-full min-h-[600px] h-full object-cover object-center"
                />

                {/* Dim overlay */}
                <div className="absolute inset-0 bg-black/60 z-10" />

                {/* Centered text */}
                <section className="absolute inset-0 z-20 flex flex-col space-y-5 items-center justify-center select-none">
                  <div className="flex items-center justify-center">
                    <div className="block w-10 h-1 bg-[#F4C95D]  mr-5" />{" "}
                    <h4 className="text-white text-md md:text-lg font-semibold uppercase">
                      Elegant Venue
                    </h4>
                    <div className="block w-10 h-1 bg-[#F4C95D]  ml-5" />{" "}
                  </div>

                  <h1 className="text-white text-4xl md:text-6xl/relaxed text-center font-bold ">
                    MAKE YOUR STAY <br /> COMFORTABLE
                  </h1>

                  <div className="flex gap-8">
                    <Button className="py-4 md:py-6 font-bold upppercase border-2 border-transparent text-xs md:text-sm">
                      OUR ROOMS
                    </Button>

                    <Button
                      variant="outline"
                      className="py-4 md:py-6 font-bold upppercase border-2 text-white text-xs md:text-sm">
                      OUR ROOMS
                    </Button>
                  </div>
                </section>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
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
