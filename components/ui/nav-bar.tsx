import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/components/ui/theme-toggle";
import StartModelButton from "./start-model-button";
import ModelOptionDropdown from "./model-method-dropdown";
const Navbar = () => {
  return (
    <div className="flex flex-row items-center justify-between px-2 py-1 border-b">
      <div className="flex flex-row items-center gap-1">
        <SidebarTrigger className="bg-transparent border-none text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground" />
        <ThemeToggle />
      </div>
      <div className="flex flex-row items-center gap-1">
        <ModelOptionDropdown />
        <StartModelButton />
      </div>
    </div>
  );
};

export default Navbar;
