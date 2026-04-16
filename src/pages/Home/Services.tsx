import {
	Hotel,
	CalendarDays,
	Search,
	FileText,
	type LucideIcon,
} from "lucide-react";

const services: {
	Icon: LucideIcon;
	title: string;
	description: string;
}[] = [
	{
		Icon: Hotel,
		title: "Hotel Booking",
		description:
			"Easily browse and reserve hotel rooms online. View room details, availability, and pricing — all in one place.",
	},
	{
		Icon: CalendarDays,
		title: "Event Reservation",
		description:
			"Book a space for events such as meetings, celebrations, or gatherings, with real-time availability and complete booking information.",
	},
	{
		Icon: Search,
		title: "Availability Checking",
		description:
			"Check available spaces in real time based on selected dates, ensuring accurate and up-to-date booking options.",
	},
	{
		Icon: FileText,
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
				className="font-display text-fluid-h2 font-light mb-4 text-ink">
				Everything You <em className="italic text-forest">Need</em>
			</h2>

			<p className="text-base md:text-lg leading-relaxed text-ink-soft max-w-[560px] mx-auto mb-16">
				Enjoy a complete resort experience without ever leaving the property.
			</p>

			<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1">
				{services.map((service, index) => (
					<div
						key={index}
						className="group bg-forest px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14 text-center transition-all duration-300 hover:bg-dark cursor-default">
						{/* Icon */}
						<service.Icon className="w-10 h-10 mb-5 mx-auto text-sand group-hover:text-cream transition-colors duration-300" />

						{/* Title */}
						<h3 className="font-display text-fluid-subtitle font-normal text-sand mb-3 transition-colors duration-300 group-hover:text-cream">
							{service.title}
						</h3>

						{/* Description */}
						<p className="text-base leading-relaxed text-sand transition-colors duration-300 group-hover:text-cream/70">
							{service.description}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

export default Services;