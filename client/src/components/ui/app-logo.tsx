import { cn } from "@/lib/utils";
import { SidebarMenuButton } from "@/components/ui/sidebar";

const Logo = () => {
  return (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <div className={cn("font-mono px-2")}>Deep-ThreatModel</div>
    </SidebarMenuButton>
  );
};

export default Logo;
