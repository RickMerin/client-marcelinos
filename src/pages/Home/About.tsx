import logo from "/brand-logo.webp";
import diamond from "../../assets/img/diamond.svg";
import wine from "../../assets/img/wine-toast.svg";
import handshake from "../../assets/img/handshake.svg";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * About - About Section with SEO features and dynamic card rendering.
 * Adds semantic HTML and schema.org markup for SEO,
 * and renders feature cards from a data array.
 */
const aboutFeatures = [
  {
    icon: diamond,
    iconAlt: "diamond symbolizing elegance",
    title: "Timeless\nElegance",
    description:
      "Marcelino’s Place offers a refined venue where every celebration is crafted with sophistication and lasting beauty.",
  },
  {
    icon: wine,
    iconAlt: "wine toast symbolizing gatherings",
    title: "Elegant\nGatherings",
    description:
      "A sophisticated venue designed for weddings, parties, and life’s cherished occasions.",
  },
  {
    icon: handshake,
    iconAlt: "handshake symbolizing hospitality",
    title: "Refined\nHospitality",
    description:
      "We blend elegance with heartfelt service for every celebration.",
  },
];

function About() {
  return (
    <section
      id="about"
      className="text-center md:text-left p-10 grid md:grid-cols-[calc(100%-60%)_auto] grid-cols-1"
      itemScope
      itemType="https://schema.org/AboutPage"
      aria-labelledby="about-heading">
      {/* Logo (left side on desktop, top on mobile) */}
      <div
        className="flex justify-center items-center w-full"
        itemProp="image"
        itemScope
        itemType="https://schema.org/ImageObject">
        <img
          src={logo}
          alt="Marcelino's Logo"
          loading="lazy"
          className="w-1/2 md:w-[60%] lg:w-[60%] h-auto"
          itemProp="contentUrl"
        />
      </div>

      {/* Text and Cards (right side on desktop) */}
      <div className="flex flex-col items-center md:items-start justify-start">
        {/* Heading */}
        <h2
          id="about-heading"
          className="font-display text-3xl font-bold tracking-tight flex gap-2 mb-2 justify-center md:justify-start text-(--color-charcoal)"
          itemProp="headline">
          <span className="green">ABOUT</span>
          <span className="yellow">US</span>
        </h2>

        {/* Welcome Section */}
        <div className="text-center md:text-left" itemProp="description">
          <h3 className="font-display text-lg font-semibold mb-1 text-(--color-charcoal)">
            Welcome To Marcelino’s Resort!
          </h3>
          <p className="text-sm opacity-90 text-(--color-charcoal) leading-relaxed w-[85%] mx-auto md:mx-0 max-w-2xl">
            Where elegance meets celebration. Perfect for weddings, parties, and
            life’s most cherished moments, our venue blends timeless beauty with
            unforgettable experiences.
          </p>

          {/* Cards Section - grid, theme green default, complementary hover */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 w-full max-w-5xl"
            itemProp="mainEntity"
            itemScope
            itemType="https://schema.org/ItemList">
            {aboutFeatures.map((feature, idx) => (
              <Card
                key={idx}
                className="about-premium-card group text-center text-white rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:bg-(--color-cream) hover:text-green-900 hover:border-amber-200/60"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem">
                <meta itemProp="position" content={String(idx + 1)} />
                <CardHeader>
                  <div className="flex justify-center items-center mb-2">
                    <img
                      src={feature.icon}
                      alt={feature.iconAlt}
                      className="w-10 h-auto transition-transform duration-300 group-hover:scale-110"
                      itemProp="image"
                    />
                  </div>
                  <CardTitle
                    className="font-display text-lg font-semibold text-inherit"
                    itemProp="name">
                    {feature.title.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < feature.title.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </CardTitle>
                  <p
                    className="text-sm mt-2 opacity-90 text-inherit"
                    itemProp="description">
                    {feature.description}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
