import { cn } from "@/lib/utils";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
const Logo = () => {
  return (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex-row"
    >
      <div className={cn("font-mono px-2")}>Deep-ThreatModel</div>
      <Link href="https://github.com/ph20Eoow/deep-threat-model">
          <FaGithub />
        </Link>
    </SidebarMenuButton>
  );
};

export default Logo;
