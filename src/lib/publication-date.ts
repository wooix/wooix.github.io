const kstCalendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function isPublishedByKstDate(publishedAt: Date, now = new Date()) {
  // YYYY-MM-DD frontmatter is coerced to UTC midnight; its date is the publication day.
  return publishedAt.toISOString().slice(0, 10) <= kstCalendar.format(now);
}
