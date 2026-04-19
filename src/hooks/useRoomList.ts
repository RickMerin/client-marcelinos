
function buildAvailabilityUrl(
  base: string,
  checkIn: string,
  checkOut: string,
): string {
  if (checkIn && checkOut) {
    return `${base}?check_in=${encodeURIComponent(checkIn)}&check_out=${encodeURIComponent(checkOut)}`;
  }
  return `${base}?is_all=1`;
}

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

function amenityNames(amenities: any[] | undefined): string {
  if (!Array.isArray(amenities) || amenities.length === 0) return "—";
  return (
    amenities
      .map((a: any) => (typeof a === "string" ? a : a?.name))
      .filter(Boolean)
      .join(", ") || "—"
  );
}

/** Amenity names as array for room card pills */
function amenityPills(amenities: any[] | undefined): string[] {
  if (!Array.isArray(amenities) || amenities.length === 0) return [];
  return amenities
    .map((a: any) => (typeof a === "string" ? a : a?.name))
    .filter(Boolean);
}

function roomImages(room: any): string[] {
  if (!room || typeof room !== "object") return [];
  const featured = room.featured_image;
  const gallery = Array.isArray(room.gallery) ? room.gallery : [];
  return [featured, ...gallery].filter((url): url is string => Boolean(url));
}

function venueImages(venue: any): string[] {
  if (!venue || typeof venue !== "object") return [];
  const featured = venue.featured_image;
  const gallery = Array.isArray(venue.gallery) ? venue.gallery : [];
  return [featured, ...gallery].filter((url): url is string => Boolean(url));
}

/** Format date string for summary card (e.g. "Feb 26") */
function formatShortDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


export{
    buildAvailabilityUrl,
    extractList,
    amenityNames,
    amenityPills,
    roomImages,
    venueImages,
    formatShortDate,
}