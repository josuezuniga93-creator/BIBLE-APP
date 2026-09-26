export function createReminderCalendar(hour: number, minute: number, devotional = false, now = new Date()): string {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error("Choose a valid reminder time.");
  }
  const start = new Date(now);
  start.setHours(hour, minute, 0, 0);
  if (start <= now) start.setDate(start.getDate() + 1);
  const pad = (value: number) => String(value).padStart(2, "0");
  const localDate = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(hour)}${pad(minute)}00`;
  const route = devotional ? "/family-worship" : "/lexicon";
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tulip Bible//Reading Reminder//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:tulip-${devotional ? "devotional" : "scripture"}-${hour}-${minute}@tulip-bible-app.vercel.app`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `DTSTART:${localDate}`, "DURATION:PT15M", "RRULE:FREQ=DAILY",
    `SUMMARY:${devotional ? "Daily devotional" : "Read Scripture"} - Tulip Bible`,
    `URL:https://tulip-bible-app.vercel.app${route}`, "TRANSP:TRANSPARENT",
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Time for your daily reading", "TRIGGER:PT0M", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
}

export function downloadReadingReminder(hour: number, minute: number, devotional = false) {
  const url = URL.createObjectURL(new Blob([createReminderCalendar(hour, minute, devotional)], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = devotional ? "tulip-devotional-reminder.ics" : "tulip-scripture-reminder.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
