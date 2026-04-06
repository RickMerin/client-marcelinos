import { OptimizedImage } from "@/components/ui/OptimizedImage";

function About() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 xl:gap-24 items-center"
      itemScope
      itemType="https://schema.org/AboutPage"
      aria-labelledby="about-heading"
    >
      {/* Text */}
      <div className="about-text">
        <div className="section-eyebrow">Our Story</div>
        <h2
          id="about-heading"
          className="font-display text-[clamp(36px,4vw,60px)] font-light leading-[1.12] mb-7 text-ink"
          itemProp="headline"
        >
          A Legacy of <em className="italic text-forest">Philippine Hospitality</em>
        </h2>
        <p
          className="text-base md:text-lg leading-relaxed text-ink-soft mb-5 max-w-[65ch]"
          itemProp="description"
        >
          Nestled along the serene coastline of Hilongos, Leyte, Marcelino's Resort &amp;
          Hotel has been a cherished destination for families, couples, and groups seeking
          genuine Filipino warmth paired with modern comfort.
        </p>
        <p className="text-base md:text-lg leading-relaxed text-ink-soft mb-5 max-w-[65ch]">
          From the swaying palms along the shoreline to lovingly prepared local cuisine,
          every detail immerses you in the natural beauty of the Visayas.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-12 mt-12">
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-[clamp(36px,5vw,52px)] font-light leading-none text-gold">
              24
            </span>
            <span className="text-[13px] tracking-[0.15em] uppercase text-ink-soft font-medium">
              Rooms &amp; Suites
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-[clamp(36px,5vw,52px)] font-light leading-none text-gold">
              3
            </span>
            <span className="text-[13px] tracking-[0.15em] uppercase text-ink-soft font-medium">
              Event Venues
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-[clamp(36px,5vw,52px)] font-light leading-none text-gold">
              ★4.8
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
          itemType="https://schema.org/ImageObject"
        >
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
            src="/img/banner-1.webp"
            alt="Pool & Gardens"
            containerClassName="w-full h-full"
            className="object-center transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-ink/25 flex items-center justify-center pointer-events-none">
            <span className="font-display italic text-base text-cream/60">
              Pool &amp; Gardens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
