import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PropertiesPanel } from "@/components/pages/Canvas/PropertiesPanel";
import { Edge, Node } from "@xyflow/react";
interface TabPanelProps {
    isCollapsed: boolean;
    selectedNodes: Node[];
    selectedEdges: Edge[];
  }

const TabPanel = ({ isCollapsed, selectedNodes, selectedEdges }: TabPanelProps) => {
  return (
    <Tabs defaultValue="stride" className="w-full">
      <div className="flex flex-row justify-center p-2">
      <TabsList>
        <TabsTrigger value="stride">STRIDE</TabsTrigger>
        <TabsTrigger value="attack-trees">Attack Trees</TabsTrigger>
      </TabsList>
      </div>
      <TabsContent value="stride">
      </TabsContent>
      <TabsContent value="attack-trees">
        <PropertiesPanel isCollapsed={isCollapsed} selectedNodes={selectedNodes} selectedEdges={selectedEdges} />
      </TabsContent>
    </Tabs>
  );
};

export default TabPanel;
