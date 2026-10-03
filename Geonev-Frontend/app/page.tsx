import Features from "@/components/Features";
import Hero from "@/components/Hero";
import HostCTA from "@/components/HostCTA";
import HowItWorks from "@/components/HowItWorks";
import PopularStations from "@/components/PopularStations";

export default function Home() {
  return (
   <div>
    <Hero/>
    <Features/>
    <HowItWorks/>
    <HostCTA/>
    <PopularStations/>
    
   </div>
  );
}