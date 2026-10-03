// app/lib/stations.ts

export type ChargerType = "CCS" | "CHAdeMO" | "Type 2" | "Tesla";

export type StationStatus = "Available" | "Busy" | "Offline";

export interface Review {
  user: string;
  stars: number;
  text: string;
}

export interface Station {
  id: number;
  name: string;
  city: string;
  address: string;
  emoji: string;
  type: ChargerType;
  speed: number; // kW
  price: number; // ₹ per kWh
  status: StationStatus;
  slots: number;
  freeSlots: number;
  rating: number;
  reviewCount: number;
  distance: string;
  power: string; // e.g. "150 kW DC Fast"
  host: string;
  hostJoined: string;
  amenities: string[];
  hours: string;
  description: string;
  reviews: Review[];
}

export const stations: Station[] = [
  {
    id: 1,
    name: "PowerHub Central",
    city: "Mumbai",
    address: "Bandra West, Mumbai, 400050",
    emoji: "⚡",
    type: "CCS",
    speed: 150,
    price: 12,
    status: "Available",
    slots: 8,
    freeSlots: 5,
    rating: 4.8,
    reviewCount: 124,
    distance: "1.2 km",
    power: "150 kW DC Fast",
    host: "Rahul Sharma",
    hostJoined: "2023",
    amenities: ["WiFi", "Café", "Restroom", "Parking"],
    hours: "24/7",
    description:
      "State-of-the-art charging facility in the heart of Bandra with premium amenities and ultra-fast CCS chargers. Ideal for both short top-ups and long charging sessions.",
    reviews: [
      { user: "Ankit M.", stars: 5, text: "Super fast charging, great café nearby. Fully charged in 25 mins!" },
      { user: "Priya S.", stars: 5, text: "Clean, safe and very accessible. The staff was incredibly helpful." },
      { user: "Vikram D.", stars: 4, text: "Excellent location. Slightly pricey but worth it for the speed." },
    ],
  },
  {
    id: 2,
    name: "GreenWave Depot",
    city: "Bangalore",
    address: "Koramangala, Bangalore, 560034",
    emoji: "🌿",
    type: "Type 2",
    speed: 22,
    price: 8,
    status: "Available",
    slots: 12,
    freeSlots: 9,
    rating: 4.5,
    reviewCount: 89,
    distance: "0.8 km",
    power: "22 kW AC",
    host: "Meera Iyer",
    hostJoined: "2022",
    amenities: ["WiFi", "Parking", "CCTV"],
    hours: "6 AM – 11 PM",
    description:
      "Eco-friendly charging station powered by solar energy. Perfect for overnight or extended charging sessions in the heart of Koramangala.",
    reviews: [
      { user: "Sandeep K.", stars: 5, text: "Love that it's solar powered. Great value for money." },
      { user: "Nisha P.", stars: 4, text: "Good charging speed for AC. Very peaceful area." },
    ],
  },
  {
    id: 3,
    name: "Tesla Supercharger Hub",
    city: "Delhi",
    address: "Cyber City, Gurugram, 122002",
    emoji: "🔥",
    type: "Tesla",
    speed: 250,
    price: 18,
    status: "Busy",
    slots: 16,
    freeSlots: 2,
    rating: 4.9,
    reviewCount: 312,
    distance: "3.1 km",
    power: "250 kW V3",
    host: "TeslaIN Host",
    hostJoined: "2021",
    amenities: ["WiFi", "Lounge", "Valet", "Restroom"],
    hours: "24/7",
    description:
      "Flagship Tesla V3 Supercharger with 250 kW peak power. Exclusive lounge, valet service and premium experience for Tesla owners.",
    reviews: [
      { user: "Arjun V.", stars: 5, text: "Fastest charge I've ever had. 10–80% in under 20 minutes!" },
      { user: "Deepika R.", stars: 5, text: "The lounge is amazing. Worth every rupee." },
      { user: "Mohit B.", stars: 5, text: "Premium experience. Only 2 free slots so plan ahead." },
    ],
  },
  {
    id: 4,
    name: "CityCharge Station",
    city: "Chennai",
    address: "Anna Nagar, Chennai, 600040",
    emoji: "🏙️",
    type: "CHAdeMO",
    speed: 50,
    price: 9,
    status: "Available",
    slots: 6,
    freeSlots: 4,
    rating: 4.3,
    reviewCount: 56,
    distance: "2.4 km",
    power: "50 kW DC",
    host: "Karthik Rajan",
    hostJoined: "2023",
    amenities: ["Parking", "CCTV"],
    hours: "8 AM – 10 PM",
    description:
      "Convenient urban charging point in Anna Nagar. CHAdeMO standard with reliable connectivity and secure parking for mid-range EVs.",
    reviews: [
      { user: "Lakshmi N.", stars: 4, text: "Reliable station. Good for mid-range EVs." },
      { user: "Suresh K.", stars: 4, text: "Easy to find, quick booking through the app." },
    ],
  },
  {
    id: 5,
    name: "EcoPoint Express",
    city: "Hyderabad",
    address: "HITEC City, Hyderabad, 500081",
    emoji: "💚",
    type: "CCS",
    speed: 100,
    price: 11,
    status: "Available",
    slots: 10,
    freeSlots: 7,
    rating: 4.6,
    reviewCount: 178,
    distance: "1.7 km",
    power: "100 kW DC",
    host: "Ravi Teja",
    hostJoined: "2022",
    amenities: ["WiFi", "Café", "Parking", "Restroom"],
    hours: "24/7",
    description:
      "Modern charging station in HITEC City tech corridor. Popular with IT professionals — great coffee, fast charging, and reliable uptime.",
    reviews: [
      { user: "Aditya R.", stars: 5, text: "Perfect for charging while working remotely from the café." },
      { user: "Pooja M.", stars: 4, text: "Great service, well maintained chargers." },
    ],
  },
  {
    id: 6,
    name: "Volt Valley Charging",
    city: "Pune",
    address: "Hinjewadi Phase 2, Pune, 411057",
    emoji: "⚡",
    type: "Type 2",
    speed: 11,
    price: 6,
    status: "Available",
    slots: 20,
    freeSlots: 15,
    rating: 4.1,
    reviewCount: 43,
    distance: "4.5 km",
    power: "11 kW AC",
    host: "Shweta Patil",
    hostJoined: "2024",
    amenities: ["Parking", "WiFi"],
    hours: "24/7",
    description:
      "Affordable and accessible charging in Hinjewadi IT park. Great for employees who need to top up during the work day.",
    reviews: [
      { user: "Rohan S.", stars: 4, text: "Very affordable. Perfect for charging during work." },
      { user: "Amrita B.", stars: 4, text: "Lots of parking space and easy to use." },
    ],
  },
  {
    id: 7,
    name: "FastCharge Nexus",
    city: "Mumbai",
    address: "Lower Parel, Mumbai, 400013",
    emoji: "🚗",
    type: "CCS",
    speed: 200,
    price: 16,
    status: "Busy",
    slots: 8,
    freeSlots: 1,
    rating: 4.7,
    reviewCount: 201,
    distance: "2.2 km",
    power: "200 kW DC Ultra",
    host: "Neha Kapoor",
    hostJoined: "2022",
    amenities: ["WiFi", "Lounge", "CCTV", "Restroom"],
    hours: "24/7",
    description:
      "Ultra-fast charging in Lower Parel's commercial hub. 200 kW chargers with premium lounge access — built for busy professionals.",
    reviews: [
      { user: "Kabir M.", stars: 5, text: "Insanely fast charger. Worth the premium price." },
      { user: "Sneha T.", stars: 4, text: "Usually busy but the lounge makes the wait enjoyable." },
    ],
  },
  {
    id: 8,
    name: "SolarShift Station",
    city: "Ahmedabad",
    address: "SG Road, Ahmedabad, 380015",
    emoji: "☀️",
    type: "Type 2",
    speed: 22,
    price: 7,
    status: "Available",
    slots: 14,
    freeSlots: 11,
    rating: 4.4,
    reviewCount: 67,
    distance: "1.1 km",
    power: "22 kW AC Solar",
    host: "Jayesh Patel",
    hostJoined: "2023",
    amenities: ["Solar Powered", "Parking", "CCTV"],
    hours: "7 AM – 9 PM",
    description:
      "100% solar-powered charging with zero grid energy. The eco-friendly choice for conscious EV owners in Ahmedabad.",
    reviews: [
      { user: "Divya P.", stars: 5, text: "Love supporting solar energy. Great green initiative." },
      { user: "Nikhil S.", stars: 4, text: "Reliable and eco-friendly. Recommend to all EV owners." },
    ],
  },
  {
    id: 9,
    name: "MetroVolt Point",
    city: "Bangalore",
    address: "MG Road, Bangalore, 560001",
    emoji: "🔵",
    type: "CCS",
    speed: 120,
    price: 13,
    status: "Offline",
    slots: 6,
    freeSlots: 0,
    rating: 4.2,
    reviewCount: 92,
    distance: "0.5 km",
    power: "120 kW DC",
    host: "Venkat Rao",
    hostJoined: "2021",
    amenities: ["WiFi", "Restroom", "Parking"],
    hours: "9 AM – 8 PM",
    description:
      "Central city charging near MG Road metro. Currently undergoing a maintenance upgrade — expected back online soon.",
    reviews: [
      { user: "Ruchika B.", stars: 4, text: "Usually great. Hope maintenance finishes soon." },
      { user: "Sanjay M.", stars: 4, text: "Best location in the city when it's online." },
    ],
  },
];

// Utility helpers
export function getStationById(id: number): Station | undefined {
  return stations.find((s) => s.id === id);
}

export function getStationsByCity(city: string): Station[] {
  return stations.filter((s) => s.city.toLowerCase() === city.toLowerCase());
}

export function getAvailableStations(): Station[] {
  return stations.filter((s) => s.status === "Available");
}