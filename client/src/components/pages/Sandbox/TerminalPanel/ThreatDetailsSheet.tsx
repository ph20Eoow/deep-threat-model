import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Threat } from "@/stores/app";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";

interface ThreatDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  threat: Threat | null;
}

const ThreatDetailsSheet: React.FC<ThreatDetailsSheetProps> = ({
  isOpen,
  onOpenChange,
  threat,
}) => {
  if (!threat) return null;

  // Helper to render lists (impacts, techniques)
  const renderList = (items: string[] | string) => {
    if (!items) return "N/A";
    if (Array.isArray(items)) {
      if (items.length === 0) return "N/A";
      return (
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    return items; // If it's already a string
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[85%] sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">
            {threat.name || "Threat Details"}
          </SheetTitle>
          <SheetDescription className="text-base">
            {threat.summary}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="mt-6 h-[calc(100vh-180px)]">
          <div className="space-y-6 pr-4">
          <div>
              <h3 className="text-lg font-medium mb-2">Vector</h3>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded">
                {threat.scope.source} {threat.scope.direction} {threat.scope.target}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Severity</h3>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded">
                {threat.severity}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Likelihood</h3>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded">
                {threat.likelihood}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Impacts</h3>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded">
                {renderList(threat.impacts)}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Threat Category</h3>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded">
                {threat.category}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Mitigation Options</h3>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded">
                {threat.researchStatus === 'researching' ? (
                  <div className="flex items-center text-blue-600">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Researching mitigation strategies...</span>
                  </div>
                ) : threat.researchStatus === 'pending' ? (
                  <span className="text-gray-500">Mitigation research pending...</span>
                ) : (
                  <Markdown 
                    remarkPlugins={[remarkGfm]}
                  >
                    {threat.mitigation?.content || "No mitigation data available"}
                  </Markdown>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Sources</h3>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded">
                {threat.researchStatus === 'researching' ? (
                  <div className="flex items-center text-blue-600">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Researching sources...</span>
                  </div>
                ) : threat.researchStatus === 'pending' ? (
                  <span className="text-gray-500">Mitigation research pending...</span>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                   {threat.mitigation?.sources && threat.mitigation.sources.map((source, i) => (
                      <li key={i}>{source}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ThreatDetailsSheet; 