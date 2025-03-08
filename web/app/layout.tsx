import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import { AuthProvider } from "../lib/authContext"; // Import your AuthProvider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className="h-screen w-screen flex flex-col">
          {/* Navbar: Full width, stays at the top */}
          <nav className="fixed top-0 left-0 w-full h-16 bg-gray-800 text-white flex items-center px-4 z-50 shadow-md">
            <Navbar />
          </nav>

          {/* Layout Container */}
          <div className="flex flex-1 pt-16">
            {/* Sidebar: Fixed to the left, full height */}
            <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-16 shadow-md">
              <Sidebar />
            </aside>

            {/* Main Content: Takes up remaining space */}
            <main className="flex-1 p-6 bg-gray-100 overflow-auto ml-64">
              {children}
            </main>
          </div>
        </body>
      </html>
    </AuthProvider>
  );
}

/*
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
*/
export const metadata: Metadata = {
  title: "Task Manager Dashboard",
  description: "Manage your tasks efficiently",
};
