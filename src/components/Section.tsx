import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
  as?: "section" | "div";
  fullWidth?: boolean;
}

export default function Section({
  children,
  className = "",
  innerClassName = "",
  id,
  as: Tag = "section",
  fullWidth = false,
}: SectionProps) {
  return (
		<Tag id={id} className={cn("relative py-16 md:py-20 lg:py-24", className)}>
			{fullWidth ? (
				<div className="relative z-10">{children}</div>
			) : (
				<div
					className={cn(
						"relative z-10 max-w-[1200px] mx-auto px-3 lg:px-12",
						innerClassName,
					)}>
					{children}
				</div>
			)}
		</Tag>
	);
}
