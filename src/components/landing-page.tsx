
import { HeroSection } from "@/components/hero-section";
import { BlogHighlight } from "@/components/blog-highlight";
import { TournamentGrid } from "./tournament-grid";

export function LandingPage() {
  return (
    <div className="flex flex-col gap-8 md:gap-16">
      <HeroSection />
      <TournamentGrid />
      <BlogHighlight />
    </div>
  );
}
