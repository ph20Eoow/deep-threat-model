"use client";
import NavBar from "@/components/ui/nav-bar";
import { useTheme } from "@/components/providers/theme-provider";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';

// Dynamically import the Editor component with SSR disabled
const Editor = dynamic(
  () => import('@/components/Editor'),
  { ssr: false }
);

export default function Home() {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<any>(null);

  // Use the imperative API to toggle panel expansion
  const togglePanel = () => {
    if (panelRef.current) {
      if (isExpanded) {
        panelRef.current.collapse();
      } else {
        panelRef.current.expand();
      }
      setIsExpanded(!isExpanded);
    }
  };

  const handleTabClick = (tab: string) => {
    if (!isExpanded) {
      if (panelRef.current) {
        panelRef.current.expand();
      }
      setIsExpanded(true);
    }
  };

  // Initialize panel state on first render
  useEffect(() => {
    if (panelRef.current && !isExpanded) {
      panelRef.current.collapse();
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <NavBar />
      <ResizablePanelGroup direction="vertical" className="h-full">
        <ResizablePanel defaultSize={75} minSize={30}>
          <div className="p-2 h-full">
            <ScrollArea className="h-[calc(100vh-100px)]">
              <Editor />
            </ScrollArea>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel 
          ref={panelRef}
          defaultSize={25} 
          minSize={5}
          collapsible={true}
          collapsedSize={5}
        >
          <TerminalPanel 
            isExpanded={isExpanded} 
            onToggleExpand={togglePanel}
            onTabClick={handleTabClick}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
