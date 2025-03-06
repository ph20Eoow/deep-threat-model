import * as React from "react";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { LayersPanel } from "@/components/pages/Canvas/LayersPanel";
import CanvasEditor from "@/components/pages/Canvas/CanvasEditor";  
import TabPanel from "@/components/pages/Canvas/TabPanel";
import ThreatPanel from "@/components/pages/Canvas/ThreatPanel";
import EditorPanel from "./EditorPanel";
const Canvas = () => {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = React.useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = React.useState(true);

  const navCollapsedSize = 4; // Size in rem when collapsed

  

  return (
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes) => {
          document.cookie = `react-resizable-panels:layout:canvas=${JSON.stringify(sizes)}`;
        }}
        className="h-full items-stretch"
      >
        {/* <ResizablePanel
          defaultSize={20}
          collapsible={true}
          minSize={10}
          maxSize={30}
          collapsedSize={navCollapsedSize}
          onCollapse={() => {
            setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
            document.cookie = `react-resizable-panels:collapsed:left=${JSON.stringify(isLeftPanelCollapsed)}`;
          }}
          className={isLeftPanelCollapsed ? "min-w-[50px] transition-all duration-300 ease-in-out" : ""}
        >
          <LayersPanel isCollapsed={isLeftPanelCollapsed} />
        </ResizablePanel> */}
        
        {/* <ResizableHandle withHandle /> */}
        
        <ResizablePanel defaultSize={40}>
          <CanvasEditor />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30}>
          <EditorPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30}>
          <ThreatPanel />
        </ResizablePanel>
        
{/*         
        <ResizablePanel 
          defaultSize={20}
          collapsible={true}
          minSize={10}
          maxSize={50}
          collapsedSize={navCollapsedSize}
          onCollapse={() => {
            setIsRightPanelCollapsed(!isRightPanelCollapsed);
            document.cookie = `react-resizable-panels:collapsed:right=${JSON.stringify(isRightPanelCollapsed)}`;
          }}
          className={isRightPanelCollapsed ? "min-w-[50px] transition-all duration-300 ease-in-out" : ""}
        >
          <TabPanel
            isCollapsed={isRightPanelCollapsed}
            selectedNodes={[]}
            selectedEdges={[]}
          />
        </ResizablePanel> */}
      </ResizablePanelGroup>
    </div>
  );
};

export default Canvas;
