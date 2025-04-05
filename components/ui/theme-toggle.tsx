"use client"
import { useTheme } from "@/components/providers/theme-provider";
import { BsSun, BsMoon } from "react-icons/bs";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ThemeToggleProps {
  className?: string;
  iconClassName?: string;
}

const ThemeToggle = ({ className, iconClassName }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-md transition-colors duration-200 px-2",
        theme === "light" ? "bg-transparent" : "bg-background",
        className
      )}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? (
        <BsMoon className={cn("w-3 h-3 text-muted-foreground", iconClassName)} />
      ) : (
        <BsSun className={cn("w-3 h-3 text-muted-foreground", iconClassName)} />
      )}
    </Button>
  );
};

export default ThemeToggle;
