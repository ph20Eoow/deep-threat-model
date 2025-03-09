import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ThreatPanel from "@/components/pages/Sandbox/TerminalPanel/ThreatPanel";

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
    <div className={cn("border-t border-border", className)}>
      <div className="flex items-center justify-between bg-muted p-1 px-2">
        <Tabs
          value={activeTab}
          onValueChange={handleTabClick}
          className="w-full"
        >
          <div className="flex items-center justify-between w-full">
            <TabsList className="h-8 bg-transparent">
              <TabsTrigger
                value="findings"
                className={cn(
                  "h-7 px-3 text-xs",
                  !isExpanded && "text-muted-foreground"
                )}
              >
                Findings
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className={cn(
                  "h-7 px-3 text-xs",
                  !isExpanded && "text-muted-foreground"
                )}
              >
                Logs
              </TabsTrigger>
            </TabsList>
            <button
              onClick={onToggleExpand}
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </Tabs>
      </div>

      <div className="h-[40vh] overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="findings" className="h-full m-0 p-0">
            <ThreatPanel />
          </TabsContent>

          <TabsContent value="logs" className="h-full m-0 p-0">
            <div className="h-full p-4 overflow-auto bg-black text-green-400 font-mono text-sm">
              <div className="space-y-1">
                <div>[2023-06-15 08:12:03] INFO: System initialized</div>
                <div>
                  [2023-06-15 08:12:04] DEBUG: Connection established to
                  database
                </div>
                <div>
                  [2023-06-15 08:12:05] INFO: User authentication service
                  started
                </div>
                <div>
                  [2023-06-15 08:12:15] WARNING: Rate limit threshold
                  approaching
                </div>
                <div>
                  [2023-06-15 08:13:22] ERROR: Failed to connect to external API
                </div>
                <div>
                  [2023-06-15 08:14:03] INFO: Retry successful, connection
                  established
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
