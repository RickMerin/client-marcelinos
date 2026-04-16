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
			{
				channel: RealtimeChannels.blockedDates(),
				event: ".BlockedDatesUpdated",
				queryKey: queryKeys.blockedDates.all,
			},
			{
				channel: RealtimeChannels.rooms(),
				event: ".RoomsUpdated",
				queryKey: queryKeys.rooms.all,
			},
			{
				channel: RealtimeChannels.venues(),
				event: ".VenuesUpdated",
				queryKey: queryKeys.venues.all,
			},
			{
				channel: RealtimeChannels.gallery(),
				event: ".GalleryUpdated",
				queryKey: queryKeys.galleries.all,
			},
			{
				channel: RealtimeChannels.reviews(),
				event: ".ReviewsUpdated",
				queryKey: queryKeys.reviews.all,
			},
		] as const;

		const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

		channels.forEach(({ channel, event, queryKey }) => {
			const ch = echo.channel(channel);

			ch.listen(event, () => {
				// Invalidate first (cheap)
				queryClient.invalidateQueries({ queryKey });

				const key = JSON.stringify(queryKey);

				const existing = debounceTimers.get(key);
				if (existing) {
					clearTimeout(existing);
				}

				debounceTimers.set(
					key,
					setTimeout(() => {
						debounceTimers.delete(key);
						void queryClient.refetchQueries({ queryKey, type: "active" });
					}, 350),
				);
			});
		});

		return () => {
			debounceTimers.forEach(clearTimeout);
			channels.forEach(({ channel }) => echo.leave(channel));
		};
	}, [queryClient]);
}
