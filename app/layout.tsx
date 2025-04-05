import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/ui/nav-bar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Deep-ThreatModel",
  description: "An Open Source Threat Modeling Tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset />
            <main className="flex flex-col h-screen w-screen overflow-hidden">
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
