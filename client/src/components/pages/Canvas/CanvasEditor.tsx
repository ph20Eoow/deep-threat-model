import { useState, useCallback, useRef, useEffect } from 'react';
import CanvasArea from './CanvasArea';
import CodePanel from './CodePanel';
import { ReactFlowProvider } from '@xyflow/react';
import { parseCode, convertToReactFlow } from '@/utils/diagramParser';
import { useAppStore } from '@/stores/app';
import { Node, Edge } from '@xyflow/react';

// Default sample code to get started
const defaultCode = `// Diagram with groups, nodes, and floating edges
direction horizontal

// Nodes
Database [icon: server, color: green]
Server [icon: server, color: green]
Client [icon: user, color: blue]

// Connections
Client > Server: API Call
Server > Database: Query
Database > Server: Response
Server > Client: Display`;

const CanvasEditor = () => {
  const [code, setCode] = useState(defaultCode);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [focusedLineNumber, setFocusedLineNumber] = useState<number | null>(null);
  
  // Track the current diagram state
  const [diagramNodes, setDiagramNodes] = useState<Node[]>([]);
  const [diagramEdges, setDiagramEdges] = useState<Edge[]>([]);

  // Store mapping between lines and elements
  const [lineToElementMap, setLineToElementMap] = useState<Map<number, { type: string; id: string }>>(new Map());
  
  // Flag to prevent recursive updates
  const isCodeUpdateRef = useRef(true);
  
  // Parse code and update diagram
  useEffect(() => {
    if (!isCodeUpdateRef.current) {
      isCodeUpdateRef.current = true;
      return;
    }
    
    try {
      // Parse the code
      const parseResult = parseCode(code);
      
      console.log('parseResult', parseResult);
      // Store line-to-element mapping
      setLineToElementMap(parseResult.lineMap);
      
      // Convert to ReactFlow format
      const { nodes, edges } = convertToReactFlow(parseResult);
      console.log('edges', edges)
      console.log('nodes', nodes)
      // Update diagram
      setDiagramNodes(nodes);
      setDiagramEdges(edges);
    } catch (error) {
      console.error('Error parsing diagram code:', error);
    }
  }, [code]);

  // Send the diagram to app state
  useEffect(() => {
    useAppStore.getState().updateUserInput(code, "diagram");
  }, [code]);
  
  // When a node is selected in the diagram, find and highlight the corresponding code line
  useEffect(() => {
    if (!focusedNodeId) return;
    
    // Find line number that corresponds to the selected node
    const lineEntry = Array.from(lineToElementMap.entries()).find(
      ([_, value]) => value.id === focusedNodeId
    );
    
    if (lineEntry) {
      setFocusedLineNumber(lineEntry[0]);
    }
  }, [focusedNodeId, lineToElementMap]);

  // Handler for code changes from the editor
  const handleCodeChange = useCallback((newCode: string) => {
    isCodeUpdateRef.current = true;
    setCode(newCode);
  }, []);

  // Update the code when the diagram changes
  const handleDiagramChange = useCallback((nodes: Node[], edges: Edge[]) => {
    // This would need a more complex implementation to convert diagram changes back to code
    // For now, we'll just signal that the update is coming from the diagram
    isCodeUpdateRef.current = false;
    
    // Simple implementation could involve rebuilding the code from nodes and edges
    // This would need knowledge of the original code structure to preserve comments, etc.
    // ...
  }, []);

  // Signal that changes are coming from the diagram
  const handleUserDiagramAction = useCallback(() => {
    isCodeUpdateRef.current = false;
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-1/2 border-r">
        <ReactFlowProvider>
          <CanvasArea 
            nodes={diagramNodes}
            edges={diagramEdges}
            focusedLineNumber={focusedLineNumber}
            onDiagramChange={handleDiagramChange}
            onUserAction={handleUserDiagramAction}
            setFocusedNodeId={setFocusedNodeId}
          />
        </ReactFlowProvider>
      </div>
      <div className="w-full h-1/2">
        <CodePanel 
          code={code}
          onCodeChange={handleCodeChange}
          focusedNodeId={focusedNodeId}
          setFocusedLineNumber={setFocusedLineNumber}
          lineToElementMap={lineToElementMap}
        />
      </div>
    </div>
  );
};

export default CanvasEditor; 