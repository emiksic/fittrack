import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { FitnessDataProvider } from "@/context/FitnessDataContext";
import { AddMealModalProvider } from "@/context/AddMealModalContext";
import NavBar from "@/components/NavBar";
import AddMealModal from "@/components/AddMealModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FitTrack",
  description: "Fitness tracking dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <FitnessDataProvider>
          <AddMealModalProvider>
            <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f2f2f2", paddingBottom: 60 }}>
              <NavBar />
              <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>{children}</div>
            </div>
            <AddMealModal />
          </AddMealModalProvider>
        </FitnessDataProvider>
      </body>
    </html>
  );
}
