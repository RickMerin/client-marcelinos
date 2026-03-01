import * as React from "react"
import { DayButton } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const OVERLAP_DEFAULT_REASON =
  "Your stay would include blocked dates. Pick another check-in or fewer days."

type Props = React.ComponentProps<typeof Calendar> & {
  blockedReasons: Record<string, string>
  /** Reason shown in tooltip for dates disabled because they would cause stay to overlap blocked dates */
  overlapInvalidReason?: string
  /** Returns true if this date is disabled only due to overlap (not blocked, not past) */
  isOverlapInvalid?: (date: Date) => boolean
}

const EMPTY_BLOCKED_REASONS: Record<string, string> = {}

type DayWithReasonProps = React.ComponentProps<typeof DayButton> & {
  blockedReasons: Record<string, string>
  activeTooltipDate: string | null
  setActiveTooltipDate: React.Dispatch<React.SetStateAction<string | null>>
  overlapInvalidReason?: string
  isOverlapInvalid?: (date: Date) => boolean
}

function DayWithReason({
  day,
  className,
  blockedReasons,
  activeTooltipDate,
  setActiveTooltipDate,
  overlapInvalidReason,
  isOverlapInvalid,
  ...dayProps
}: DayWithReasonProps) {
  const dateKey = day.isoDate
  const reason = blockedReasons[dateKey]
  const isBlocked = !!reason
  const dayDate = new Date(dateKey + "T00:00:00")
  const isOverlap = (isOverlapInvalid?.(dayDate) ?? false) && !isBlocked

  const [isHovering, setIsHovering] = React.useState(false)
  const showTooltip = isHovering || activeTooltipDate === dateKey
  const tooltipReason = isBlocked
    ? reason
    : isOverlap
      ? (overlapInvalidReason ?? OVERLAP_DEFAULT_REASON)
      : null

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Button
        {...dayProps}
        variant="ghost"
        size="icon"
        onClick={(e) => {
          if (isBlocked || isOverlap) {
            e.preventDefault()
            e.stopPropagation()
            setActiveTooltipDate((prev) =>
              prev === dateKey ? null : dateKey,
            );
            return
          }
          dayProps.onClick?.(e)
        }}
        className={cn(
          className,
          isBlocked && "bg-red-500 text-white opacity-80 cursor-not-allowed hover:bg-red-600 focus:bg-red-600",
          isOverlap && "line-through opacity-70 cursor-not-allowed"
        )}
      />

      {(isBlocked || isOverlap) && tooltipReason && showTooltip && (
        <div
          className="
            absolute bottom-full left-1/2 -translate-x-1/2
            rounded bg-black px-2 py-1 text-xs text-white
            whitespace-nowrap z-50 transition-opacity
          "
        >
          {tooltipReason}
        </div>
      )}
    </div>
  )
}

export function CalendarWithDisabledReasons({
  blockedReasons = EMPTY_BLOCKED_REASONS,
  overlapInvalidReason,
  isOverlapInvalid,
  components,
  ...props
}: Props) {
  const [activeTooltipDate, setActiveTooltipDate] = React.useState<string | null>(null)

  React.useEffect(() => {
    function handleClickOutside() {
      setActiveTooltipDate(null)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <Calendar
      {...props}
      components={{
        ...components,
        DayButton: (dayButtonProps) => (
          <DayWithReason
            {...dayButtonProps}
            blockedReasons={blockedReasons}
            activeTooltipDate={activeTooltipDate}
            setActiveTooltipDate={setActiveTooltipDate}
            overlapInvalidReason={overlapInvalidReason}
            isOverlapInvalid={isOverlapInvalid}
          />
        ),
      }}
    />
  )
}
