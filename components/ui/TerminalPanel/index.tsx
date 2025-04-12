import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import ThreatPanel from "./ThreatPanel";

interface TerminalPanelProps {
  className?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTabClick: (tab: string) => void;
}

export function TerminalPanel({
  className,
  isExpanded,
  onToggleExpand,
  onTabClick,
}: TerminalPanelProps) {
  const [activeTab, setActiveTab] = useState("findings");

  const handleTabClick = (value: string) => {
    setActiveTab(value);
    onTabClick(value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-1 px-2">
        <Tabs
          value={activeTab}
          onValueChange={handleTabClick}
          className="w-full"
        >
          <div className="flex items-center justify-between w-full">
            <button
              onClick={onToggleExpand}
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent"
            >
              {isExpanded ? (
                <ChevronRight className="text-muted-foreground" />
              ) : (
                <ChevronLeft className="text-muted-foreground" />
              )}
            </button>
            {isExpanded && (
              <TabsList className="h-8 bg-transparent">
                <TabsTrigger value="findings" className="h-7 px-3 text-xs">
                  Findings
                </TabsTrigger>
                {/* <TabsTrigger
                  value="logs"
                  className={cn(
                    "h-7 px-3 text-xs",
                    !isExpanded && "text-muted-foreground"
                  )}
                >
                  Logs
                </TabsTrigger> */}
              </TabsList>
            )}
          </div>
        </Tabs>
      </div>
      {isExpanded && (
        <div className="h-[calc(100%-48px)] overflow-hidden">
          <Tabs value={activeTab} className="h-full flex flex-col">
            <TabsContent
              value="findings"
              className="flex-1 m-0 p-0 overflow-hidden"
            >
              <ThreatPanel />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
