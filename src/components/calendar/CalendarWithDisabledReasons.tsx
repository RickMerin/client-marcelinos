import * as React from "react"
import { createPortal } from "react-dom"
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
  const [position, setPosition] = React.useState({
    top: 0,
    left: 0,
    transform: "none",
    width: 320,
  })
  const cellRef = React.useRef<HTMLDivElement>(null)
  const showTooltip = isHovering || activeTooltipDate === dateKey
  const tooltipReason = isBlocked
    ? reason
    : isOverlap
      ? (overlapInvalidReason ?? OVERLAP_DEFAULT_REASON)
      : null

  React.useLayoutEffect(() => {
    if (!showTooltip || !tooltipReason || !cellRef.current) return
    const rect = cellRef.current.getBoundingClientRect()
    const padding = 8
    const tooltipMaxWidth = Math.min(320, window.innerWidth - 24)
    const left = rect.left + rect.width / 2 - tooltipMaxWidth / 2
    const clampedLeft = Math.max(padding, Math.min(left, window.innerWidth - tooltipMaxWidth - padding))
    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom
    const preferAbove = spaceAbove >= spaceBelow
    const anchorY = preferAbove ? rect.top - padding : rect.bottom + padding
    setPosition({
      top: anchorY,
      left: clampedLeft,
      transform: preferAbove ? "translateY(-100%)" : "none",
      width: tooltipMaxWidth,
    })
  }, [showTooltip, tooltipReason])

  const tooltipEl =
    (isBlocked || isOverlap) && tooltipReason && showTooltip ? (
      createPortal(
        <div
          className="fixed rounded-md bg-black/95 px-3 py-2 text-sm text-white leading-normal shadow-lg z-[9999]"
          style={{
            top: position.top,
            left: position.left,
            transform: position.transform,
            width: position.width,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {tooltipReason}
        </div>,
        document.body
      )
    ) : null

  return (
    <div
      ref={cellRef}
      className="relative"
      onMouseEnter={() => {
        setIsHovering(true)
        setActiveTooltipDate(null)
      }}
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
          isBlocked && "bg-red-500 mx-[1px] text-white opacity-80 cursor-not-allowed hover:bg-red-600 focus:bg-red-600",
          isOverlap && "line-through opacity-70 cursor-not-allowed"
        )}
      />
      {tooltipEl}
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
