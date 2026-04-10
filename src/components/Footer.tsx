import { FacebookIcon } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

function Footer() {
	const navigate = useNavigate();
	const location = useLocation();

	const exploreLinks = [
		{ name: "Rooms", href: "#rooms" },
		{ name: "Event Venues", href: "#venues" },
		{ name: "Services", href: "#services" },
		{ name: "Amenities", href: "#services" },
		{ name: "Gallery", href: "#gallery" },
	];

	const infoLinks = [
		{ name: "About Us", href: "#about" },
		{ name: "Blog", href: "/blog", isRoute: true },
		{ name: "Privacy Policy", href: "/privacy-policy", isRoute: true },
		{ name: "Refund Policy", href: "/refund-policy", isRoute: true },
		{
			name: "Terms and Conditions",
			href: "/terms-and-conditions",
			isRoute: true,
		},
		{ name: "Rules and Regulation", href: "/rules-regulation", isRoute: true },
		{ name: "Contact", href: "#contact" },
	];

	const contactLinks = [
		{ name: "Hilongos, Leyte, Philippines", href: "#location" },
		{ name: "09063034150", href: "tel:09063034150" },
		{ name: "09541865049", href: "tel:09541865049" },
		{
			name: "marcelinosresorthotel@gmail.com",
			href: "mailto:marcelinosresorthotel@gmail.com",
		},
		{ name: "Book Direct", href: "#booking-section" },
	];

	const handleSectionClick = (e: React.MouseEvent, hash: string) => {
		e.preventDefault();
		const id = hash.startsWith("#") ? hash.slice(1) : hash;
		const scrollToSection = () => {
			const el = document.getElementById(id);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "start" });
			} else {
				window.location.hash = hash;
			}
		};
		if (location.pathname !== "/") {
			navigate("/", { replace: false });
			setTimeout(scrollToSection, 350);
		} else {
			scrollToSection();
		}
	};

	const renderLink = (link: {
		name: string;
		href: string;
		isRoute?: boolean;
	}) => {
		if (link.isRoute) {
			return (
				<Link
					to={link.href}
					className="text-base text-white no-underline transition-colors duration-300 hover:text-gold-light">
					{link.name}
				</Link>
			);
		}
		if (link.href.startsWith("#")) {
			return (
				<button
					type="button"
					onClick={(e) => handleSectionClick(e, link.href)}
					className="text-base text-white bg-transparent border-none p-0 cursor-pointer text-left transition-colors duration-300 hover:text-gold-light font-inherit">
					{link.name}
				</button>
			);
		}
		return (
			<a
				href={link.href}
				className="text-base text-white no-underline transition-colors duration-300 hover:text-gold-light">
				{link.name}
			</a>
		);
	};

	return (
		<footer className="bg-dark pt-20 pb-10 px-3 lg:px-16 xl:px-20 text-white">
			<div className="max-w-[1200px] mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 lg:gap-14 mb-16">
					{/* Brand */}
					<div className="md:col-span-2 lg:col-span-1">
						<a
							href="/"
							className="font-display text-[24px] font-normal text-gold-light tracking-[0.04em] no-underline block mb-5">
							Marcelino's <span className=" italic">Resort Hotel</span>
						</a>
						<p className="text-base leading-relaxed mb-6">
							A tropical sanctuary offering resort living, event venues, and
							Filipino warmth in Hilongos, Leyte, Philippines.
						</p>
						<div className="flex gap-3">
							<a
								href="https://www.facebook.com/profile.php?id=61557457680496"
								target="_blank"
								rel="noopener noreferrer"
								className="text-white no-underline transition-all duration-300 hover:text-gold-light hover:-translate-y-0.5"
								aria-label="Facebook">
								<FacebookIcon size={24} />
							</a>
						</div>
					</div>

					{/* Explore */}
					<div>
						<h4 className="text-[13px] tracking-[0.2em] uppercase text-gold-light font-medium mb-6">
							Explore
						</h4>
						<ul className="list-none flex flex-col gap-3">
							{exploreLinks.map((link) => (
								<li key={link.name}>{renderLink(link)}</li>
							))}
						</ul>
					</div>

					{/* Information */}
					<div>
						<h4 className="text-[13px] tracking-[0.2em] uppercase text-gold-light font-medium mb-6">
							Information
						</h4>
						<ul className="list-none flex flex-col gap-3">
							{infoLinks.map((link) => (
								<li key={link.name}>{renderLink(link)}</li>
							))}
						</ul>
					</div>

					{/* Contact */}
					<div>
						<h4 className="text-[13px] tracking-[0.2em] uppercase text-gold-light font-medium mb-6">
							Contact
						</h4>
						<ul className="list-none flex flex-col gap-3">
							{contactLinks.map((link) => (
								<li key={link.name}>{renderLink(link)}</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom */}
				<div className="border-t border-cream/8 pt-8 flex justify-between items-center flex-wrap gap-4 text-sm max-md:flex-col max-md:items-start max-md:gap-3">
					<p>
						© {new Date().getFullYear()} Marcelino's Resort Hotel. All rights
						reserved.
					</p>
					<p>
						<Link
							to="/privacy-policy"
							className="text-white no-underline hover:text-gold-light transition-colors">
							Privacy Policy
						</Link>
						{" · "}
						<Link
							to="/terms-and-conditions"
							className="text-white no-underline hover:text-gold-light transition-colors">
							Terms and Conditions
						</Link>
					</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
