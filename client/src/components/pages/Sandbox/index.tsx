import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  DefaultReactSuggestionItem,
} from "@blocknote/react";
import { MermaidBlock } from "@/components/blocks/MermaidBlock";
import { FaProjectDiagram } from "react-icons/fa";
import { useTheme } from "@/components/providers/theme-provider";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { TerminalPanel } from "@/components/pages/Sandbox/TerminalPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/stores/app";

// Create schema with custom block
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    mermaid: MermaidBlock,
  },
});

const SandboxEditor = () => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<any>(null);
  const { updateUserInput } = useAppStore();
  
  // Create editor with custom schema
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: "heading",
        props: {
          level: 1,
        },
        content: "Threat Model",
      },
    ],
  });

  // Create custom slash menu items
  const getCustomSlashMenuItems = (editor: any): DefaultReactSuggestionItem[] => {
    // Get the default slash menu items
    const defaultItems = getDefaultReactSlashMenuItems(editor);
    
    // Add custom mermaid item
    const mermaidItem = {
      title: "Mermaid Diagram",
      onItemClick: () => {
        const currentBlock = editor.getTextCursorPosition().block;
        // Insert a new mermaid block after the current block
        editor.insertBlocks(
          [
            {
              type: "mermaid",
              props: {
                code: "graph TD;\nA-->B;\nA-->C;\nB-->D;\nC-->D;",
                textAlignment: "left",
              },
            },
          ],
          currentBlock,
          "after"
        );
      },
      aliases: ["diagram", "mermaid", "flowchart", "chart"],
      group: "Diagrams",
      icon: <FaProjectDiagram size={18} />,
      subtext: "Insert a Mermaid diagram",
    };
    
    return [...defaultItems, mermaidItem];
  };

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

  // Update Zustand store when editor content changes
  const handleEditorChange = async () => {
    // Convert editor blocks to markdown
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    // Update description in the store
    updateUserInput(markdown, "description");
  };

  // Initial content update
  useEffect(() => {
    handleEditorChange();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <ResizablePanelGroup direction="vertical" className="h-full">
        <ResizablePanel defaultSize={75} minSize={30}>
          <div className="p-2 h-full">
            <ScrollArea className="h-[calc(100vh-100px)]">
              <BlockNoteView 
                editor={editor} 
                slashMenu={false}
                theme={theme === "dark" ? "dark" : "light"}
                onChange={handleEditorChange}
              >
                <SuggestionMenuController
                  triggerCharacter="/"
                  getItems={async (query) => 
                    filterSuggestionItems(getCustomSlashMenuItems(editor), query)
                  }
                />
              </BlockNoteView>
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
};

export default SandboxEditor;
