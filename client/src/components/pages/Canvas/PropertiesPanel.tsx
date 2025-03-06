import { ScrollArea } from "@/components/ui/scroll-area";
import { Node, Edge } from "@xyflow/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
interface PropertiesPanelProps {
  isCollapsed: boolean;
  selectedNodes: Node[];
  selectedEdges: Edge[];
}

export function PropertiesPanel({
  isCollapsed,
  selectedNodes,
  selectedEdges,
}: PropertiesPanelProps) {
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const selectedEdge = selectedEdges.length === 1 ? selectedEdges[0] : null;

  return (
    <div className="flex h-full flex-col p-2 space-y-2">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            <h2 className="text-sm font-medium">Assumptions</h2>
            <p className="text-xs text-muted-foreground">Optional</p>
          </div>
          <Textarea className="h-24" placeholder="Assumptions are optional, but can help the model generate more accurate results." />
        </div>
        <div className="flex items-center justify-between gap-1">
          <h2 className="text-sm font-medium">Threat Modeling Prompt</h2>
          <p className="text-xs text-muted-foreground">Required</p>
        </div>
        <Textarea className="h-24" placeholder="Describe your system (e.g. a web application focused on payments) and which modeling framework you want to use. (e.g. STRIDE, DREAD, etc.)" />
        <div className="flex justify-end">
          <Button variant="default" size="sm" className="w-fit">Start Modeling</Button>
        </div>
      </div>
      
    </div>
  );
}
