import * as React from "react"
import { DayButton } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = React.ComponentProps<typeof Calendar> & {
  blockedReasons: Record<string, string>
}

const EMPTY_BLOCKED_REASONS: Record<string, string> = {}

type DayWithReasonProps = React.ComponentProps<typeof DayButton> & {
  blockedReasons: Record<string, string>
  activeTooltipDate: string | null
  setActiveTooltipDate: (value: string | null) => void
}

function DayWithReason({
  day,
  className,
  blockedReasons,
  activeTooltipDate,
  setActiveTooltipDate,
  ...dayProps
}: DayWithReasonProps) {
  const dateKey = day.isoDate
  const reason = blockedReasons[dateKey]
  const isBlocked = !!reason

  const [isHovering, setIsHovering] = React.useState(false)
  const showTooltip = isHovering || activeTooltipDate === dateKey

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
          if (isBlocked) {
            e.preventDefault()
            e.stopPropagation()
            setActiveTooltipDate(prev => (prev === dateKey ? null : dateKey))
            return
          }
          dayProps.onClick?.(e)
        }}
        className={cn(
          className,
          isBlocked && "bg-red-500 text-white opacity-80 cursor-not-allowed hover:bg-red-600 focus:bg-red-600"
        )}
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

export function CalendarWithDisabledReasons({
  blockedReasons = EMPTY_BLOCKED_REASONS,
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
          />
        ),
      }}
    />
  )
}
