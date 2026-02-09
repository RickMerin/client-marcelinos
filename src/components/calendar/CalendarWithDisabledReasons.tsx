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
  function DayWithReason({
    day,
    modifiers,
    className,
    ...dayProps
  }: React.ComponentProps<typeof DayButton>) {
    const dateKey = day.date.toISOString().split("T")[0]
    const reason = blockedReasons[dateKey]

    return (
      <div className="relative group">
        <Button
          {...dayProps}
          variant="ghost"
          size="icon"
          disabled={modifiers.disabled}
          className={cn(className)}
        />

        {modifiers.disabled && reason && (
          <div
            className="
              pointer-events-none
              absolute bottom-full left-1/2 -translate-x-1/2
              hidden group-hover:block
              rounded bg-black px-2 py-1 text-xs text-white
              whitespace-nowrap
              z-50
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
