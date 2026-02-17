/**
 * Global realtime subscriber: listens to rooms, venues, gallery, reviews, blocked-dates
 * and refetches the corresponding queries so the UI updates without page reload
 * when admin creates/updates/deletes data.
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/realtime/echo";
import { RealtimeChannels } from "@/lib/realtime/channels";
import { queryKeys } from "@/lib/api/endpoints";

export function useRealtimeGlobalSubscriber(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const channels = [
      { channel: RealtimeChannels.blockedDates(), event: ".BlockedDatesUpdated", queryKey: queryKeys.blockedDates.all },
      { channel: RealtimeChannels.rooms(), event: ".RoomsUpdated", queryKey: queryKeys.rooms.all },
      { channel: RealtimeChannels.venues(), event: ".VenuesUpdated", queryKey: queryKeys.venues.all },
      { channel: RealtimeChannels.gallery(), event: ".GalleryUpdated", queryKey: queryKeys.galleries.all },
      { channel: RealtimeChannels.reviews(), event: ".ReviewsUpdated", queryKey: queryKeys.reviews.all },
    ] as const;

    channels.forEach(({ channel, event, queryKey }) => {
      const ch = echo.channel(channel);
      ch.listen(event, () => {
        // Invalidate + refetch so UI shows latest data without page reload (prefix match: e.g. ["rooms"] matches ["rooms","home"] and ["rooms",checkIn,checkOut])
        queryClient.invalidateQueries({ queryKey });
        queryClient.refetchQueries({ queryKey });
      });
    });

    return () => {
      channels.forEach(({ channel }) => echo.leave(channel));
    };
  }, [queryClient]);
}
