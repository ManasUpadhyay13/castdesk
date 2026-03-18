import { generateOgMetadata } from "@/lib/metadata";

export const metadata = generateOgMetadata({
  title: "Dashboard — CastDeck",
  description: "Manage your pitch decks, view narrations, and start investor roleplay sessions.",
  section: "Dashboard",
  path: "/dashboard",
});

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
