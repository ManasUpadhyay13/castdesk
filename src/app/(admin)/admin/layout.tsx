import { generateOgMetadata } from "@/lib/metadata";

export const metadata = generateOgMetadata({
  title: "Admin Panel — CastDeck",
  description: "Manage users, workspaces, and platform settings.",
  section: "Admin",
  path: "/admin",
});

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
