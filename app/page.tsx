import { homeMetadata } from "@/lib/seo";
import HomePageClient from "./home/client";

export const metadata = homeMetadata();

export default function HomePage() {
  return <HomePageClient />;
}
