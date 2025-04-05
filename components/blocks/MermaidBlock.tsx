import { Block, BlockNoteEditor, defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import mermaid from "mermaid";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { FaEdit, FaTimes } from "react-icons/fa";
// Initialize Mermaid.js
mermaid.initialize({
  startOnLoad: true,
  theme: "default",
});

// Define the props for the render function
interface RenderProps {
  block: Block;
  editor: BlockNoteEditor;
}

// Create the custom Mermaid block
export const MermaidBlock = createReactBlockSpec(
  {
    type: "mermaid",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      code: {
        default: "graph TD;\nA-->B;\nA-->C;\nB-->D;\nC-->D;",
      },
    },
    content: "none", // No inline content
  },
  {
    render: ({ block, editor }) => {
      const [svg, setSvg] = useState<string>(""); // Holds the rendered SVG
      const [isEditing, setIsEditing] = useState(false); // Toggles editor visibility
      const [code, setCode] = useState(block.props.code as string); // Mermaid code
      const [error, setError] = useState<string | null>(null); // Error state
      const [isLoading, setIsLoading] = useState(true); // Add loading state

      // Render the Mermaid diagram asynchronously
      useEffect(() => {
        const renderDiagram = async () => {
          setIsLoading(true);
          if (!code) {
            setSvg("");
            setIsLoading(false);
            return;
          }
          try {
            // Clear previous SVG with the same ID if it exists
            const existingElement = document.getElementById(`mermaid-${block.id}`);
            if (existingElement) {
              existingElement.remove();
            }
            
            // Generate a unique ID for this render
            const uniqueId = `mermaid-${block.id}-${Date.now()}`;
            const { svg } = await mermaid.render(uniqueId, code);
            setSvg(svg);
            setError(null);
          } catch (err) {
            console.error("Failed to render Mermaid diagram:", err);
            setError("Error rendering diagram");
            setSvg("");
          } finally {
            setIsLoading(false);
          }
        };
        renderDiagram();
      }, [code, block.id]);

      // Toggle editing mode
      const toggleEdit = () => {
        if (isEditing) {
          // Save changes when exiting edit mode
          handleSave();
        }
        setIsEditing(!isEditing);
      };

      // Save the updated code to the block
      const handleSave = () => {
        editor.updateBlock(block, {
          type: "mermaid",
          props: {
            code,
            textAlignment: block.props.textAlignment,
          },
        });
      };

      // Update code state when edited
      const handleCodeChange = (value: string | undefined) => {
        if (value !== undefined) {
          setCode(value);
        }
      };

      // Handle keyboard events for ESC key
      const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape' && isEditing) {
          handleSave();
          setIsEditing(false);
        }
      };

      return (
        <div
          className={cn("relative p-4 border rounded-md", {
            "bg-neutral-50 dark:bg-neutral-800": !isEditing,
            "bg-white dark:bg-gray-900": isEditing,
            "w-full h-full": isEditing,
          })}
          style={{ minHeight: "100px" }}
          tabIndex={0} // Make the block focusable
          onKeyDown={handleKeyDown}
        >
          {/* Edit toggle button */}
          <button
            onClick={toggleEdit}
            className="absolute top-2 right-2 z-10 p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            title={isEditing ? "Close editor" : "Edit diagram"}
            contentEditable={false}
            style={{ cursor: "pointer" }}
          >
            {isEditing ? <FaTimes size={16} /> : <FaEdit size={16} />}
          </button>

          {isEditing ? (
            <div className="flex flex-col md:flex-row gap-2 h-80 mt-4">
              {/* Preview pane */}
              <div className="w-full md:w-2/3 overflow-auto p-2 bg-white dark:bg-gray-900 border rounded">
                {error ? (
                  <div style={{ color: "red" }}>{error}</div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: svg }} />
                )}
              </div>

              {/* Editor pane */}
              <div className="w-full md:w-1/3 h-full border rounded">
                <Editor
                  height="100%"
                  defaultLanguage="markdown"
                  value={code}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              {isLoading && <div className="text-sm text-gray-500">Rendering diagram...</div>}
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
          )}
        </div>
      ) 
    },
    
    // Add this toExternalHTML method for correct copy behavior
    toExternalHTML: ({ block }) => {
      const mermaidCode = block.props.code as string;
      
      // Create the HTML structure for copying
      return (
        <div>
          <pre>
            <code className="language-mermaid">
              {mermaidCode}
            </code>
          </pre>
        </div>
      );
    },
    
    // Optional: Add parse method if you want to support pasting mermaid code
    parse: (element) => {
      // Look for mermaid code blocks when pasting
      const codeElement = element.querySelector("code.language-mermaid");
      if (codeElement && codeElement.textContent) {
        return {
          code: codeElement.textContent
        };
      }
      return undefined;
    }
  }
);