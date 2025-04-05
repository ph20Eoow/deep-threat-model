"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Logo from "@/components/ui/app-logo";
import { NavMain } from "./nav-main";
import { SquareTerminal, BookOpen } from "lucide-react";
import BYOL from "./byol";
import { Separator } from "@/components/ui/separator";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <BYOL />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
