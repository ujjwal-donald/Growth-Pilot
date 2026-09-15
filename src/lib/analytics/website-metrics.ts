export function demoWebsiteMetrics(connected: boolean) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    source: connected ? "demo" : "demo",
    sessions: days.map((label, i) => ({ label, value: 420 + i * 36 })),
    queries: [
      { query: "ai marketing software", clicks: 184, impressions: 4200, position: 8.2 },
      { query: "social media scheduler", clicks: 96, impressions: 2100, position: 12.4 },
      { query: "seo audit tool", clicks: 71, impressions: 1804, position: 14.1 },
    ],
    note: connected
      ? "Live Google Analytics / Search Console property IDs are not set. Showing anonymized demo metrics while the connection is stored."
      : "Connect Google Analytics and Search Console to load property data. Development mode can connect a demo integration from Integrations.",
  };
}
