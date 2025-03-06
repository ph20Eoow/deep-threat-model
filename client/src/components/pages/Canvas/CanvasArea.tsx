import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  useReactFlow,
  MarkerType,
  ConnectionMode,
  Panel,
  reconnectEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { IconNode, GroupNode } from './NodeTypes/CustomNodes';
import SimpleFloatingEdge from './EdgeTypes/SimpleFloatingEdge';
// Define node types
const nodeTypes = {
  default: IconNode,
  group: GroupNode,
};

const edgeTypes = {
  floating: SimpleFloatingEdge,
};

interface CanvasAreaProps {
  nodes: Node[];
  edges: Edge[];
  focusedLineNumber: number | null;
  onDiagramChange: (nodes: Node[], edges: Edge[]) => void;
  onUserAction: () => void;
  setFocusedNodeId: (id: string | null) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  focusedLineNumber,
  onDiagramChange,
  onUserAction,
  setFocusedNodeId,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const { fitView, zoomTo } = useReactFlow();
  const reactFlowInstance = useReactFlow();
  
  // Update local nodes when props change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update local edges when props change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);
  
  // Handle focusing a node when a line is focused in the code editor
  useEffect(() => {
    if (focusedLineNumber === null) return;
    
    // Find the node or edge that corresponds to the focused line
    const nodeToFocus = nodes.find((node: Node) => 
      node.data?.sourceLineNumber === focusedLineNumber
    );
    
    const edgeToFocus = edges.find((edge: Edge) => 
      edge.data?.sourceLineNumber === focusedLineNumber
    );
    
    // If we found a matching node, focus it
    if (nodeToFocus) {
      // Highlight the node somehow (e.g., by adding a selected class)
      setNodes((prev: Node[]) => 
        prev.map((node: Node) => ({
          ...node,
          selected: node.id === nodeToFocus.id,
          style: {
            ...node.style,
            boxShadow: node.id === nodeToFocus.id ? '0 0 0 2px #ff0072' : undefined,
          },
        }))
      );
      
      // Pan/zoom to the node
      const nodePosition = nodeToFocus.position;
      if (nodePosition) {
        setTimeout(() => {
          fitView({ padding: 0.2, nodes: [nodeToFocus] });
        }, 50);
      }
    }
    
    // If we found a matching edge, focus it
    if (edgeToFocus) {
      // Highlight the edge
      setEdges((prev: Edge[]) => 
        prev.map((edge: Edge) => ({
          ...edge,
          selected: edge.id === edgeToFocus.id,
          style: {
            ...edge.style,
            stroke: edge.id === edgeToFocus.id ? '#ff0072' : edge.style?.stroke,
            strokeWidth: edge.id === edgeToFocus.id ? 3 : 1,
          },
        }))
      );
      
      // Find source and target nodes to fit view
      const sourceNode = nodes.find((node: Node) => node.id === edgeToFocus.source);
      const targetNode = nodes.find((node: Node) => node.id === edgeToFocus.target);
      
      if (sourceNode && targetNode) {
        setTimeout(() => {
          fitView({ padding: 0.2, nodes: [sourceNode, targetNode] });
        }, 50);
      }
    }
  }, [focusedLineNumber, nodes, edges, setNodes, setEdges, fitView]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onUserAction();
    setFocusedNodeId(node.id);
  }, [onUserAction, setFocusedNodeId]);

  
  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      onUserAction();
      onDiagramChange([...nodes], [...edges]);
    },
    [nodes, edges, onNodesChange, onUserAction, onDiagramChange]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      onUserAction();
      onDiagramChange([...nodes], [...edges]);
    },
    [nodes, edges, onEdgesChange, onUserAction, onDiagramChange]
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      onUserAction();
      
      // Create a new edge with properties matching those from the parser
      const newEdge: Edge = {
        id: `${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        markerEnd: { type: MarkerType.Arrow },
        markerStart: { type: MarkerType.Arrow },
        animated: false,
        type: 'floating',
        style: {
          stroke: '#555555', // Default color
          strokeWidth: 2,
        },
        data: {
          sourceLineNumber: -1 // Negative to indicate manually added
        }
      };
      
      // Add the new edge
      setEdges((prevEdges: Edge[]) => [...prevEdges, newEdge]);
      
      // Notify parent about the change
      setTimeout(() => onDiagramChange(nodes, [...edges, newEdge]), 0);
    },
    [nodes, edges, onDiagramChange, onUserAction]
  );

  // Add a new node with 4 handles
  const addNode = useCallback(() => {
    onUserAction();
    
    const { x, y, zoom } = reactFlowInstance.getViewport();
    const newNodeId = `node_${Date.now()}`;
    const nodeNumber = nodes.filter((n: Node) => n.type !== 'group').length + 1;
    
    const newNode: Node = {
      id: newNodeId,
      position: {
        x: (window.innerWidth / 4 - x) / zoom,
        y: (window.innerHeight / 2 - y) / zoom,
      },
      data: { 
        label: `Asset ${nodeNumber}`,
        color: 'blue', // Add a default color to match parser nodes
        sourceLineNumber: -1 // Add a source line number (negative to indicate manually added)
      },
      style: {
        border: 'none',  // Explicitly remove any border
        background: 'transparent',  // Make background transparent
        padding: 0,  // Remove padding
        boxShadow: 'none',  // Remove box shadow
      },
      type: 'default',
    };
    
    // Add the new node to the nodes array
    setNodes((prevNodes: Node[]) => [...prevNodes, newNode]);
    
    // Notify parent about the change
    setTimeout(() => onDiagramChange([...nodes, newNode], edges), 0);
  }, [nodes, edges, reactFlowInstance, onDiagramChange, onUserAction]);
  
  // Add a new group node
  const addGroupNode = useCallback(() => {
    onUserAction();
    
    const { x, y, zoom } = reactFlowInstance.getViewport();
    const newNodeId = `group_${Date.now()}`;
    const groupNumber = nodes.filter((n: Node) => n.type === 'group').length + 1;
    
    const newNode: Node = {
      id: newNodeId,
      position: {
        x: (window.innerWidth / 4 - x) / zoom,
        y: (window.innerHeight / 2 - y) / zoom,
      },
      data: { 
        label: `Group ${groupNumber}`,
        color: 'gray', // Add a default color
        sourceLineNumber: -1 // Add a source line number (negative to indicate manually added)
      },
      style: {
        border: 'none',  // Explicitly remove any border
        background: 'transparent',  // Make background transparent
        padding: 0,  // Remove padding
        boxShadow: 'none',  // Remove box shadow
        width: 300,
        height: 200,
      },
      type: 'group',
    };
    
    // Add the new node to the nodes array
    setNodes((prevNodes: Node[]) => [...prevNodes, newNode]);
    
    // Notify parent about the change
    setTimeout(() => onDiagramChange([...nodes, newNode], edges), 0);
  }, [nodes, edges, reactFlowInstance, onDiagramChange, onUserAction]);

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      onUserAction();
      setEdges((els: Edge[]) => reconnectEdge(oldEdge, newConnection, els));
      
      // Notify parent about the change
      setTimeout(() => {
        const updatedEdges = edges.map((e: Edge) => 
          e.id === oldEdge.id ? {
            ...e,
            source: newConnection.source || e.source,
            target: newConnection.target || e.target,
            sourceHandle: newConnection.sourceHandle,
            targetHandle: newConnection.targetHandle,
          } : e
        );
        onDiagramChange(nodes, updatedEdges);
      }, 0);
    },
    [nodes, edges, onDiagramChange, onUserAction]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        onReconnect={onEdgeUpdate}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodeOrigin={[0.5, 0.5]}
        connectionMode={ConnectionMode.Loose}
        // connectionLineComponent={FloatingConnectionLine}
      >
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default CanvasArea;
