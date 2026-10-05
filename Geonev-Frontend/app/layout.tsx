import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./Provider";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0E1A] text-white antialiased min-h-screen flex flex-col">
        <Providers>
          <Navbar />

          <main className="flex-1">{children}</main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}