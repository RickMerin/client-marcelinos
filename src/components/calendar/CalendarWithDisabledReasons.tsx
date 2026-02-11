import * as React from "react"
import { DayButton } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = React.ComponentProps<typeof Calendar> & {
  blockedReasons: Record<string, string>
}

export function CalendarWithDisabledReasons({
  blockedReasons = {},
  components,
  ...props
}: Props) {
  // Track the date whose tooltip is currently open
  const [activeTooltipDate, setActiveTooltipDate] = React.useState<string | null>(null)

  // Close tooltip if user clicks anywhere outside the calendar
  React.useEffect(() => {
    function handleClickOutside() {
      setActiveTooltipDate(null)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Custom DayButton component
  function DayWithReason({
    day,
    className,
    ...dayProps
  }: React.ComponentProps<typeof DayButton>) {
    const dateKey = day.isoDate
    const reason = blockedReasons[dateKey]
    const isBlocked = !!reason

    // Track hover for desktop tooltip
    const [isHovering, setIsHovering] = React.useState(false)

    // Determine if tooltip should show
    const showTooltip = isHovering || activeTooltipDate === dateKey

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={(e) => e.stopPropagation()} // prevent outer document click from closing immediately
      >
        <Button
          {...dayProps}
          variant="ghost"
          size="icon"
          onClick={(e) => {
            if (isBlocked) {
              e.preventDefault()
              e.stopPropagation()
              // Toggle tooltip for this date
              setActiveTooltipDate(prev => (prev === dateKey ? null : dateKey))
              return
            }
            dayProps.onClick?.(e)
          }}
          className={cn(className, isBlocked && "opacity-15 cursor-pointer")}
        />

        {isBlocked && reason && showTooltip && (
          <div
            className="
              absolute bottom-full left-1/2 -translate-x-1/2
              rounded bg-black px-2 py-1 text-xs text-white
              whitespace-nowrap z-50 transition-opacity
            "
          >
            {reason}
          </div>
        )}
      </div>
    )
  }

  return (
    <Calendar
      {...props}
      components={{
        ...components,
        DayButton: DayWithReason,
      }}
    />
  )
}
