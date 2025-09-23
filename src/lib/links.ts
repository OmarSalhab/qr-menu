// Utility to provide placeholder links when real values are missing
export type LinkKind =
  | "whatsapp"
  | "facebook"
  | "instagram"
  | "snapchat"
  | "x"
  | "maps"
  | "googleReviews"
  | "phone"
  | "email"
  | "website"
  | "bookings";

// Deterministic picker based on the kind string to avoid SSR/CSR hydration mismatches.
function pickFor<T>(kind: string, arr: T[]): T {
  if (arr.length === 0) throw new Error("pickFor: empty array");
  let h = 0;
  for (let i = 0; i < kind.length; i++) {
    h = (h * 31 + kind.charCodeAt(i)) >>> 0;
  }
  const idx = h % arr.length;
  return arr[idx];
}

export function getFallbackLink(kind: LinkKind): string {
  switch (kind) {
    case "whatsapp": {
      const nums = ["15551234567", "447700900123", "962777001122", "971500123456"];
      return `https://wa.me/${pickFor(kind, nums)}`;
    }
    case "facebook": {
      const urls = [
        "https://www.facebook.com/Meta",
        "https://www.facebook.com/Google",
        "https://www.facebook.com/nytimes",
        "https://www.facebook.com/YouTube",
      ];
      return pickFor(kind, urls);
    }
    case "instagram": {
      const urls = [
        "https://www.instagram.com/instagram/",
        "https://www.instagram.com/explore/",
        "https://www.instagram.com/foodnetwork/",
      ];
      return pickFor(kind, urls);
    }
    case "snapchat": {
      const urls = [
        "https://www.snapchat.com/add/team_snapchat",
        "https://www.snapchat.com/discover",
        "https://www.snapchat.com/",
      ];
      return pickFor(kind, urls);
    }
    case "x": {
      const urls = ["https://x.com/explore", "https://x.com/Twitter", "https://x.com/verge"];
      return pickFor(kind, urls);
    }
    case "maps": {
      const urls = [
        "https://www.google.com/maps/place/Amman",
        "https://www.google.com/maps/search/restaurants",
        "https://www.google.com/maps/dir//Amman",
      ];
      return pickFor(kind, urls);
    }
    case "googleReviews": {
      // Generic Google Maps search that shows reviews for nearby restaurants
      const urls = [
        "https://www.google.com/maps/search/google+reviews+restaurants",
        "https://www.google.com/maps/place/restaurant+reviews",
        "https://www.google.com/maps/search/%D8%AA%D9%82%D9%8A%D9%8A%D9%85%D8%A7%D8%AA+%D9%85%D8%B7%D8%B9%D9%85",
      ];
      return pickFor(kind, urls);
    }
    case "phone": {
      const nums = ["+962777000111", "+962798001122", "+15551234567"];
      return `tel:${pickFor(kind, nums)}`;
    }
    case "email": {
      const emails = ["info@example.com", "hello@example.com", "contact@example.com"];
      return `mailto:${pickFor(kind, emails)}`;
    }
    case "website": {
      const urls = ["https://example.com", "https://www.wikipedia.org", "https://vercel.com"];
      return pickFor(kind, urls);
    }
    case "bookings": {
      const urls = ["https://cal.com", "https://www.opentable.com/", "https://calendar.google.com/"];
      return pickFor(kind, urls);
    }
    default:
      return "https://example.com";
  }
}
