import { useState, useRef, useEffect } from "react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

const LCP_BANNER_SRC_1 = "/img/banner2.jpg";
const LCP_BANNER_SRC_2 = "/img/banner-3.webp";
const LCP_BANNER_SRC_3 = "/img/banner-4.webp";

const BANNER_IMAGES = [LCP_BANNER_SRC_1, LCP_BANNER_SRC_2, LCP_BANNER_SRC_3];

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
				{BANNER_IMAGES.map((src, index) => {
					const isActive = index === activeIndex;

					return (
						<CarouselItem
							key={index}
							className="basis-full shrink-0 grow-0 pl-0 mr-0">
							<div className="relative w-full h-[90vh] min-h-[600px] overflow-hidden">
								<img
									src={src}
									alt="Marcelino's Resort"
									loading="eager"
									fetchPriority="high"
									className="absolute inset-0 w-full h-full object-cover object-center"
								/>

								{/* Hero depth: multi-stop gradient + subtle blur for premium blend */}
								<div
									className="absolute inset-0 z-1"
									style={{
										background:
											"linear-gradient(to top, rgba(15,31,26,0.85) 0%, rgba(15,31,26,0.4) 50%, rgba(15,31,26,0.2) 100%)",
									}}
								/>

								{/* Bottom-aligned hero content */}
								{isActive && (
									<motion.div
										key={index}
										className="absolute inset-0 z-5 flex items-center lg:items-end justify-center lg:justify-start px-6 lg:px-16 xl:px-20 pb-0 lg:pb-24 md:lg:pb-28 text-center lg:text-left"
										initial="initial"
										animate="animate"
										transition={{ staggerChildren: 0.2 }}>
										<div className="max-w-[720px]">
											{/* Eyebrow */}
											<motion.p
											variants={fadeUp}
											transition={{ duration: 0.8, ease: "easeOut" }}
											className="flex items-center justify-center lg:justify-start gap-3.5 text-[10px] tracking-[0.25em] uppercase text-gold-light font-medium mb-4 text-center lg:text-left"
											>
											<span className="block w-9 h-[1.5px] bg-gold-light shrink-0" />
											Hilongos, Leyte, Philippines
											<span className="block w-9 h-[1.5px] bg-gold-light shrink-0" />
											</motion.p>

											{/* Title */}
											<motion.h1
												variants={fadeUp}
												transition={{ duration: 1, delay: 0.2 }}
												className="font-display text-fluid-display font-semibold uppercase leading-[0.95] max-md:leading-[1.05] tracking-[-0.02em] text-cream mb-2">
												MAKE YOUR <span className="text-gold-light">STAY</span>
												<br />
												COMFORTABLE
											</motion.h1>
											<motion.p
  variants={fadeUp}
  transition={{ duration: 0.8, delay: 0.4 }}
  className="
    text-base md:text-lg leading-relaxed 
    text-cream max-w-[520px] mb-5 italic

    bg-white/0.5 backdrop-blur-sm
    px-2 py-2 rounded-2xl md:rounded-3xl
	shadow-[0_8px_30px_rgba(0,0,0,0.08)]

    [mask-image:radial-gradient(ellipse_90%_70%_at_center,black_55%,transparent_100%)]
    [-webkit-mask-image:radial-gradient(ellipse_90%_70%_at_center,black_55%,transparent_100%)]
  "
>
  Experience refined comfort in thoughtfully designed
  rooms, complemented by quality amenities and warm
  hospitality.
</motion.p>
											{/* Actions */}
											<motion.div
												variants={fadeUp}
												transition={{ duration: 0.7, delay: 0.6 }}
												className="flex flex-wrap gap-4 
															max-md:flex-col 
															max-md:items-center mt-4"
												>
												<a
													href="#rooms"
													className="btn-primary-mockup w-fit min-w-[200px] text-center text-sm py-3 px-6"
												>
													Explore Rooms
												</a>

												<a
													href="#venues"
													className="btn-outline-hero-secondary w-fit min-w-[200px] text-center text-sm py-3 px-6"
												>
													View Venues
												</a>
												</motion.div>
										</div>
									</motion.div>
								)}

								{/* Scroll hint — desktop only */}
								<p
									className="hidden lg:flex absolute right-6 lg:right-16 xl:right-20 bottom-24 z-5 items-center gap-3.5 text-[11px] tracking-[0.25em] uppercase text-cream/45"
									style={{
										writingMode: "vertical-rl",
										animation: "fadeIn 1.5s ease 1.2s both",
									}}>
									Scroll to discover
									<span className="block w-px h-14 bg-linear-to-b from-cream/35 to-transparent" />
								</p>
							</div>
						</CarouselItem>
					);
				})}
			</CarouselContent>
		</Carousel>
	);
}
