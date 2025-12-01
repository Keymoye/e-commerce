import ProductSkeleton from "@/components/ui/productSkeleton";
import { homeMetadata } from "@/lib/seo";
import HomePageClient from "./home/client";

export const metadata = homeMetadata();

const HomePageClientTyped = HomePageClient as any;

export default function HomePage() {
  return <HomePageClientTyped />;
}
