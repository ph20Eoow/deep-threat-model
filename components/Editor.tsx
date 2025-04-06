"use client";
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
import { useAppStore } from "@/stores/app";
import { useEffect } from "react";

export default function Editor() {
  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      mermaid: MermaidBlock,
    },
  });

  const { theme } = useTheme();
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
  );
} 