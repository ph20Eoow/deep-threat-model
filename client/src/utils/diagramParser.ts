import { Node, Edge, MarkerType, Position } from '@xyflow/react';

// Define types for parsing results
type ParsedNode = {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  parentId?: string;
  isGroup?: boolean;
  data: Record<string, any>;
  colorMode?: string;
  styleMode?: string;
  typeface?: string;
};

type ParsedEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: string;
  color?: string;
  sourceLineNumber: number;
};

type ParseResult = {
  nodes: ParsedNode[];
  edges: ParsedEdge[];
  direction: 'right' | 'left' | 'up' | 'down';
  lineMap: Map<number, { type: 'node' | 'edge' | 'direction' | 'style'; id: string }>;
};

export function parseCode(code: string): ParseResult {
  const lines = code.split('\n');
  const nodes: ParsedNode[] = [];
  const edges: ParsedEdge[] = [];
  const lineMap = new Map<number, { type: 'node' | 'edge' | 'direction' | 'style'; id: string }>();
  let direction: 'right' | 'left' | 'up' | 'down' = 'right';
  let globalColorMode = 'pastel';
  let globalStyleMode = 'shadow';
  let globalTypeface = 'rough';

  lines.forEach((line, index) => {
    // Skip empty lines and comments
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('//')) {
      return;
    }

    // Check for direction statement
    if (trimmedLine.startsWith('direction')) {
      const dir = trimmedLine.split(' ')[1];
      if (['right', 'left', 'up', 'down'].includes(dir)) {
        direction = dir as any;
        lineMap.set(index, { type: 'direction', id: `direction_${index}` });
      }
      return;
    }

    // Check for global styling
    if (trimmedLine.startsWith('colorMode') || 
        trimmedLine.startsWith('styleMode') || 
        trimmedLine.startsWith('typeface')) {
      const [property, value] = trimmedLine.split(' ');
      if (property === 'colorMode') globalColorMode = value;
      if (property === 'styleMode') globalStyleMode = value;
      if (property === 'typeface') globalTypeface = value;
      lineMap.set(index, { type: 'style', id: `style_${index}` });
      return;
    }

    // Check for connections
    if (trimmedLine.includes('>') || 
        trimmedLine.includes('<') || 
        trimmedLine.includes('--') || 
        trimmedLine.includes('-')) {
      // Parsing for connections
      let edgeType = 'default';
      let matcher;
      
      // Determine edge type based on syntax
      if (trimmedLine.includes('-->')) {
        matcher = '-->';
        edgeType = 'dotted-arrow';
      } else if (trimmedLine.includes('--')) {
        matcher = '--';
        edgeType = 'dotted';
      } else if (trimmedLine.includes('<>')) {
        matcher = '<>';
        edgeType = 'bidirectional';
      } else if (trimmedLine.includes('>')) {
        matcher = '>';
        edgeType = 'arrow';
      } else if (trimmedLine.includes('<')) {
        matcher = '<';
        edgeType = 'reverse-arrow';
      } else if (trimmedLine.includes('-')) {
        matcher = '-';
        edgeType = 'default';
      }
      
      if (matcher) {
        // Split the line to get source and target
        const parts = trimmedLine.split(matcher);
        if (parts.length === 2) {
          let source = parts[0].trim();
          let target = parts[1].trim();
          
          // Check for label and extract it
          let label = '';
          let color;
          
          if (target.includes(':')) {
            const targetParts = target.split(':');
            target = targetParts[0].trim();
            label = targetParts[1].trim();
            
            // Check for styling in label
            if (label.includes('[')) {
              const styleMatch = label.match(/\[(.*?)\]/);
              if (styleMatch) {
                const styleStr = styleMatch[1];
                label = label.replace(/\[.*?\]/, '').trim();
                
                // Extract color
                const colorMatch = styleStr.match(/color:\s*([^,\]]+)/);
                if (colorMatch) {
                  color = colorMatch[1].trim();
                }
              }
            }
          }
          
          // Create edge ID
          const edgeId = `edge_${source}_${target}_${index}`;
          
          // Add to edges array
          edges.push({
            id: edgeId,
            source,
            target,
            label,
            type: edgeType,
            color,
            sourceLineNumber: index
          });
          
          // Add to line map
          lineMap.set(index, { type: 'edge', id: edgeId });
          
          // Ensure nodes exist (implicit node creation)
          if (!nodes.some(n => n.id === source)) {
            nodes.push({
              id: source,
              label: source,
              data: {},
              isGroup: false
            });
          }
          
          if (!nodes.some(n => n.id === target)) {
            nodes.push({
              id: target,
              label: target,
              data: {},
              isGroup: false
            });
          }
        }
      }
      
      return;
    }
    
    // Node definition (if not a connection)
    const nodeMatch = trimmedLine.match(/^([^\[]+)(?:\s*\[(.*)\])?/);
    if (nodeMatch) {
      const nodeName = nodeMatch[1].trim();
      const nodeOptions = nodeMatch[2] ? nodeMatch[2].trim() : '';
      
      // Extract node properties
      let icon, color, parentId;
      let isGroup = false;
      
      if (nodeOptions) {
        // Extract icon
        const iconMatch = nodeOptions.match(/icon:\s*([^,\]]+)/);
        if (iconMatch) {
          icon = iconMatch[1].trim();
        }
        
        // Extract color
        const colorMatch = nodeOptions.match(/color:\s*([^,\]]+)/);
        if (colorMatch) {
          color = colorMatch[1].trim();
        }
        
        // Extract parent
        const parentMatch = nodeOptions.match(/parent:\s*([^,\]]+)/);
        if (parentMatch) {
          parentId = parentMatch[1].trim();
        }
        
        // Check if it's a group
        isGroup = nodeOptions.includes('type: group');
      }
      
      // Add node to nodes array
      nodes.push({
        id: nodeName,
        label: nodeName,
        icon,
        color,
        parentId,
        isGroup,
        data: {
          colorMode: globalColorMode,
          styleMode: globalStyleMode,
          typeface: globalTypeface
        }
      });
      
      // Add to line map
      lineMap.set(index, { type: 'node', id: nodeName });
    }
  });
  
  return {
    nodes,
    edges,
    direction,
    lineMap
  };
}

// Helper function to position nodes in a grid layout
function getPosition(index: number, total: number, isGroup: boolean) {
  const columns = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / columns);
  const col = index % columns;
  
  // Groups are positioned with more space
  const spacing = isGroup ? 300 : 200;
  
  return {
    x: col * spacing + 50,
    y: row * spacing + 50
  };
}

// Convert parsed diagram to ReactFlow format
export function convertToReactFlow(parseResult: ParseResult) {
  const { nodes: parsedNodes, edges: parsedEdges, direction } = parseResult;
  
  // Separate group nodes and regular nodes
  const groupNodes = parsedNodes.filter(node => node.isGroup);
  const regularNodes = parsedNodes.filter(node => !node.isGroup);
  
  // Convert parsed nodes to ReactFlow nodes
  const rfNodes: Node[] = [];
  
  // Add group nodes first
  groupNodes.forEach((node, index) => {
    rfNodes.push({
      id: node.id,
      position: getPosition(index, groupNodes.length, true),
      data: { 
        label: node.label,
        ...node.data,
        color: node.color
      },
      type: 'group',
      style: {
        width: 300,
        height: 200,
      }
    });
  });
  
  // Add regular nodes
  regularNodes.forEach((node, index) => {
    let position;
    
    // If node has a parent, position it within the parent
    if (node.parentId) {
      const parentNode = rfNodes.find(n => n.id === node.parentId);
      if (parentNode) {
        // Position within parent bounds
        const parentNodes = regularNodes.filter(n => n.parentId === node.parentId);
        const nodeIndexInParent = parentNodes.findIndex(n => n.id === node.id);
        
        // Simple grid layout within parent
        const cols = Math.ceil(Math.sqrt(parentNodes.length));
        const row = Math.floor(nodeIndexInParent / cols);
        const col = nodeIndexInParent % cols;
        
        position = {
          x: parentNode.position.x + 50 + col * 100,
          y: parentNode.position.y + 50 + row * 80
        };
      } else {
        // Parent not found, use default positioning
        position = getPosition(index, regularNodes.length, false);
      }
    } else {
      // Regular node without parent
      position = getPosition(index + groupNodes.length, regularNodes.length, false);
    }
    
    rfNodes.push({
      id: node.id,
      position,
      data: { 
        label: node.label,
        icon: node.icon,
        ...node.data,
        // Store color information in data instead of style
        color: node.color
      },
      // Explicitly set node dimensions
      style: {
        border: 'none',  // Explicitly remove any border
        background: 'transparent',  // Make background transparent
        padding: 10,  // Remove padding
        boxShadow: 'none',  // Remove box shadow
      },
      type: 'default',
      parentId: node.parentId,
    });
  });

  // Convert parsed edges to ReactFlow edges
  const rfEdges: Edge[] = parsedEdges.map((edge, index) => {
    // Determine the marker type based on edge type
    let markerEnd, markerStart, animated = false, style;
    
    switch(edge.type) {
      case 'arrow':
        markerEnd = { type: MarkerType.Arrow };
        break;
      case 'reverse-arrow':
        markerStart = { type: MarkerType.Arrow };
        break;
      case 'bidirectional':
        markerEnd = { type: MarkerType.Arrow };
        markerStart = { type: MarkerType.Arrow };
        break;
      case 'dotted':
      case 'dotted-arrow':
        style = { strokeDasharray: '5,5' };
        if (edge.type === 'dotted-arrow') {
          markerEnd = { type: MarkerType.Arrow };
        }
        break;
      default:
        // Default to arrow for any unspecified type
        markerEnd = { type: MarkerType.Arrow };
    }
    
    // Check if there's a reverse edge (for bidirectional detection)
    const reverseEdge = parsedEdges.find(
      (e) => e.source === edge.target && e.target === edge.source && e.id !== edge.id
    );
    
    // Determine if this is a bidirectional edge
    const isBidirectional = !!reverseEdge;
    
    // Add a labelOffset property to adjust label position for bidirectional edges
    let labelOffset = 0;
    
    if (isBidirectional) {
      // If this is the first edge of a bidirectional pair, offset the label upward
      if (edge.id < (reverseEdge?.id || '')) {
        labelOffset = -15; // Move label up
      } else {
        labelOffset = 15; // Move label down
      }
    }
    
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'floating', // Set all edges to floating type
      markerEnd,
      markerStart,
      animated,
      // Use null for handles to let React Flow choose the best connection points
      sourceHandle: null,
      targetHandle: null,
      style: {
        ...style,
        stroke: edge.color ? `var(--${edge.color}, ${edge.color})` : undefined,
        strokeWidth: 2,
      },
      data: {
        sourceLineNumber: edge.sourceLineNumber,
        color: edge.color,
        type: edge.type,
        label: edge.label,
        edgeType: edge.type,
        labelOffset, // Add the label offset to the edge data
        isBidirectional, // Add bidirectional flag to edge data
        reverseEdgeId: reverseEdge?.id // Store the ID of the reverse edge if it exists
      }
    };
  });

  return { nodes: rfNodes, edges: rfEdges };
} 