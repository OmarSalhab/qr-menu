export type WorkingDay = {
  day: number; // 0=Sunday ... 6=Saturday
  open: string; // "HH:mm"
  close: string; // "HH:mm"
  closed?: boolean;
};

export type WorkingHours = WorkingDay[];

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getNowInTz(tz: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const wd = parts.find((p) => p.type === "weekday")?.value || "Sun";
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  return { day: WEEKDAY_MAP[wd] ?? 0, minutes: hour * 60 + minute };
}

function parseHM(hm: string): number {
  const [h, m] = hm.split(":" ).map((n) => parseInt(n, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

export type OpenStatus = {
  isOpen: boolean;
  label: string; // Arabic label for UI
  nextChangeMinutes: number; // minutes until open/close
};

export function computeOpenStatus(wh: WorkingHours | null | undefined, tz = "Asia/Amman"): OpenStatus {
  if (!wh || wh.length === 0) return { isOpen: false, label: "مغلق", nextChangeMinutes: 0 };
  const now = getNowInTz(tz);
  const today = wh.find((d) => d.day === now.day);
  const minutesNow = now.minutes;
  const fmtRemain = (mins: number, action: "فتح" | "إغلاق") => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (mins <= 0) return action === "فتح" ? "سيفتح قريباً" : "سيغلق قريباً";
    if (h === 0) return `${action} بعد ${m} دقيقة`;
    return `${action} بعد ${h} ساعة ${m} دقيقة`;
  };

  if (today && !today.closed) {
    const openM = parseHM(today.open);
    const closeM = parseHM(today.close);
    if (openM < closeM) {
      if (minutesNow < openM) {
        const diff = openM - minutesNow;
        return { isOpen: false, label: fmtRemain(diff, "فتح"), nextChangeMinutes: diff };
      }
      if (minutesNow >= openM && minutesNow < closeM) {
        const diff = closeM - minutesNow;
        return { isOpen: true, label: fmtRemain(diff, "إغلاق"), nextChangeMinutes: diff };
      }
    }
  }

  // Find next open day
  for (let i = 1; i <= 7; i++) {
    const d = (now.day + i) % 7;
    const day = wh.find((x) => x.day === d && !x.closed);
    if (day) {
      const diffDays = i * 24 * 60;
      const openM = parseHM(day.open) + diffDays - now.minutes;
      return { isOpen: false, label: fmtRemain(openM, "فتح"), nextChangeMinutes: openM };
    }
  }

  return { isOpen: false, label: "مغلق", nextChangeMinutes: 0 };
}

export function defaultWorkingHours(): WorkingHours {
  // 0=Sun..6=Sat, open 10:00 to 23:00 by default
  return Array.from({ length: 7 }, (_, d) => ({ day: d, open: "10:00", close: "23:00", closed: false }));
}
