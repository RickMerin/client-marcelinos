import logo from "/brand-logo.webp";
import { Bed, Gem, Handshake, Wine, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * About - About Section with SEO features and dynamic card rendering.
 * Adds semantic HTML and schema.org markup for SEO,
 * and renders feature cards from a data array.
 * Card styling matches OUR SERVICES (landing-premium-card + Lucide stroke icons).
 */
const aboutFeatures: {
  Icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    Icon: Gem,
    title: "Timeless\nElegance",
    description:
      "From guest rooms to event spaces, Marcelino’s offers a refined resort setting where stays and celebrations alike are crafted with sophistication and lasting beauty.",
  },
  {
    Icon: Wine,
    title: "Elegant\nGatherings",
    description:
      "Our venues are designed for weddings, parties, and life’s cherished occasions—beautiful backdrops for the moments that matter most.",
  },
  {
    Icon: Bed,
    title: "Comfortable\nStays",
    description:
      "Rest in thoughtfully appointed rooms and suites—your peaceful retreat after a day of celebration, or a relaxing getaway surrounded by nature.",
  },
  {
    Icon: Handshake,
    title: "Refined\nHospitality",
    description:
      "We blend warm resort hospitality with attentive service for overnight guests, families, and everyone hosting or attending an event.",
  },
];

function About() {
  return (
    <div
      className="w-full"
      itemScope
      itemType="https://schema.org/AboutPage"
      aria-labelledby="about-heading">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:gap-14">
        {/* Intro: copy left / logo right on large screens; stacked & centered on small */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex flex-col items-center space-y-4 text-center lg:items-start lg:text-left">
            <h2
              id="about-heading"
              className="font-display flex justify-center gap-2 text-3xl font-bold tracking-tight text-(--color-charcoal) lg:justify-start"
              itemProp="headline">
              <span className="green">ABOUT</span>
              <span className="yellow">US</span>
            </h2>

            <h3 className="font-display text-xl font-semibold text-(--color-charcoal)">
              Welcome To Marcelino’s Resort!
            </h3>
            <p
              className="max-w-prose text-base leading-relaxed text-(--color-charcoal) opacity-90 lg:max-w-none"
              itemProp="description">
              Where elegance meets celebration. Stay with us in comfortable
              rooms and suites, or gather in our venues for weddings, parties,
              and life’s most cherished moments—Marcelino’s Resort brings
              together restful accommodations, stunning event spaces, and
              unforgettable experiences.
            </p>
          </div>

          <div
            className="flex w-full justify-center "
            itemProp="image"
            itemScope
            itemType="https://schema.org/ImageObject">
            <img
              src={logo}
              alt="Marcelino's Logo"
              loading="lazy"
              className="h-auto w-full max-w-[220px] object-contain drop-shadow-sm sm:max-w-[260px] lg:max-w-[280px]"
              itemProp="contentUrl"
            />
          </div>
        </div>

        {/* Feature cards */}
        <div
          className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-4"
          itemProp="mainEntity"
          itemScope
          itemType="https://schema.org/ItemList">
          {aboutFeatures.map((feature, idx) => {
            const { Icon } = feature;
            return (
              <Card
                key={idx}
                className="landing-premium-card landing-card-interactive group flex h-full min-h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl text-center text-white transition-all duration-300 hover:scale-[1.03] hover:bg-(--color-cream) hover:text-green-900 hover:border-amber-200/60 focus-within:ring-2 focus-within:ring-(--color-sage) focus-within:ring-offset-2"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem">
                <meta itemProp="position" content={String(idx + 1)} />
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 text-white/95 transition-transform duration-300 group-hover:scale-110">
                    <Icon size={48} strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3
                    className="font-display mb-2 text-lg font-semibold text-inherit"
                    itemProp="name">
                    {feature.title.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < feature.title.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </h3>
                  <p
                    className="text-sm leading-relaxed text-inherit opacity-90"
                    itemProp="description">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default About;
