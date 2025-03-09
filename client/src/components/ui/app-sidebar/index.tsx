import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Logo from "@/components/ui/app-logo";
import { NavMain } from "./nav-main";
import { SquareTerminal, Bot, BookOpen, Settings2 } from "lucide-react";
import React from "react";
export function AppSidebar() {
  const data = {
    navMain: [
      {
        title: "Playground",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Sandbox",
            url: "/sandbox",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "#",
          },
        ],
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
