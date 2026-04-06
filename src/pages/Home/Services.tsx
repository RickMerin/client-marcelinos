import {
	Hotel,
	CalendarCheck2,
	SearchCheck,
	ClipboardList,
	type LucideIcon,
} from "lucide-react";

const services: {
	Icon: LucideIcon;
	emoji: string;
	title: string;
	description: string;
}[] = [
	{
		Icon: Hotel,
		emoji: "🏊",
		title: "Hotel Booking",
		description:
			"Easily browse and reserve hotel rooms online. View room details, availability, and pricing — all in one place.",
	},
	{
		Icon: CalendarCheck2,
		emoji: "🍜",
		title: "Event Reservation",
		description:
			"Book a space for events such as meetings, celebrations, or gatherings, with real-time availability and complete booking information.",
	},
	{
		Icon: SearchCheck,
		emoji: "🛥️",
		title: "Availability Checking",
		description:
			"Check available spaces in real time based on selected dates, ensuring accurate and up-to-date booking options.",
	},
	{
		Icon: ClipboardList,
		emoji: "💆",
		title: "Booking Summary",
		description:
			"Provides a clear overview of booking details including selected stay, chosen space, and booking total before confirmation.",
	},
];

function Services() {
	return (
		<div className="text-center" aria-labelledby="services-heading">
			<div className="section-eyebrow justify-center">Resort Life</div>
			<h2
				id="services-heading"
				className="font-display text-[clamp(36px,4vw,56px)] font-light mb-4 text-ink">
				Everything You <em className="italic text-forest">Need</em>
			</h2>
			<p className="text-base md:text-lg leading-relaxed text-ink-soft max-w-[560px] mx-auto mb-16">
				Enjoy a complete resort experience without ever leaving the property.
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
				{services.map((service, index) => (
					<div
						key={index}
						className="group bg-sand px-8 py-14 text-center transition-all duration-300 hover:bg-dark hover:-translate-y-1 cursor-default">
						<span className="text-[40px] mb-5 block">{service.emoji}</span>
						<h3 className="font-display text-[clamp(20px,2vw,24px)] font-normal text-ink mb-3 transition-colors duration-300 group-hover:text-cream">
							{service.title}
						</h3>
						<p className="text-base leading-relaxed text-ink-soft transition-colors duration-300 group-hover:text-cream/70">
							{service.description}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

export default Services;
