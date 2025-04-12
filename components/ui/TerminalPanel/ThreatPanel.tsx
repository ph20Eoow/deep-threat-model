import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore, Threat } from "@/stores/app";
import { Loader2 } from "lucide-react";
import ThreatDetailsSheet from "./ThreatDetailsSheet";

const ThreatPanel = () => {
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { threats } = useAppStore();

  const handleThreatOnClick = (threat: Threat) => {
    setSelectedThreat(threat);
    setSheetOpen(true);
  };

  const renderScopePreview = (threat: Threat) => {
    if (!threat.scope) return "N/A";
    
    if (Array.isArray(threat.scope)) {
      if (threat.scope.length === 0) return "N/A";
      const first = threat.scope[0];
      return `${first.source} ${first.direction} ${first.target}`;
    } 
    else {
      return `${threat.scope.source} ${threat.scope.direction} ${threat.scope.target}`;
    }
  };

  const renderList = (items: string[] | string) => {
    if (!items) return "N/A";
    if (Array.isArray(items)) {
      if (items.length === 0) return "N/A";
      return items.join(", ");
    }
    return items;
  };

  const renderMitigation = (threat: Threat) => {
    if (threat.researchStatus === 'researching') {
      return (
        <div className="flex items-center text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Researching...</span>
        </div>
      );
    }
    if (threat.researchStatus === 'pending') {
      return <span className="text-gray-500">Pending...</span>;
    }
    if (threat.mitigation) {
      return (
        <p className="w-[200px] truncate" title={threat.mitigation.content}>
          {threat.mitigation.content}
        </p>
      );
    }
    return "No data";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="overflow-auto h-full">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="bg-slate-100 dark:bg-slate-800">
              <TableCell className="font-medium">Vector</TableCell>
              <TableCell className="font-medium text-left">Impacts</TableCell>
              <TableCell className="font-medium text-left">Category</TableCell>
              <TableCell className="font-medium text-left">Mitigation</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {threats.map((item) => (
              <TableRow 
                key={item.id} 
                onClick={() => handleThreatOnClick(item)}
                className={`hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer
                  ${item.researchStatus === 'researching' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <TableCell className="font-medium">
                  {renderScopePreview(item)}
                </TableCell>
                <TableCell className="text-left">
                  <p>{renderList(item.impacts)}</p>
                </TableCell>
                <TableCell className="text-left">
                  <p>{renderList(item.category)}</p>
                </TableCell>
                <TableCell className="text-left">
                  {renderMitigation(item)}
                </TableCell>
              </TableRow>
            ))}
            {threats.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No threats found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <ThreatDetailsSheet 
          isOpen={sheetOpen} 
          onOpenChange={setSheetOpen}
          threat={selectedThreat}
        />
      </div>
    </div>
  );
};

export default ThreatPanel;
