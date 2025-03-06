import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/components/ui/theme-toggle";
const Navbar = () => {
  return (
    <div className="flex flex-row items-center justify-between px-2 border-b">
      <SidebarTrigger className="bg-transparent border-none text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground" />
      <div className="flex flex-row items-center gap-0">
      <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
