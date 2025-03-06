import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';

const elk = new ELK();

// ELK layout options
// See https://www.eclipse.org/elk/reference/options.html for more options
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

/**
 * Calculates a layout for the given nodes and edges using ELK
 */
export const getLayoutedElements = async (
  nodes: Node[],
  edges: Edge[],
  direction: 'DOWN' | 'RIGHT' = 'DOWN'
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  const isHorizontal = direction === 'RIGHT';
  
  // Create the input graph for ELK
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.direction': direction,
      ...elkOptions,
    },
    children: nodes.map((node) => ({
      ...node,
      // Adjust handle positions based on layout direction
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      
      // Provide dimensions for ELK
      width: node.width || 150,
      height: node.height || 50,
    })),
    edges: edges,
  };

  try {
    // Calculate the layout
    const layoutedGraph = await elk.layout(graph as any);
    
    // Transform the result back to React Flow format
    return {
      nodes: layoutedGraph.children?.map((node: any) => ({
        ...node,
        // Convert ELK's x/y to React Flow's position format
        position: { x: node.x, y: node.y },
      })) || [],
      edges: layoutedGraph.edges?.map((edge: any) => ({
        ...edge,
        source: edge.source,
        target: edge.target,
      })) || [],
    };
  } catch (error) {
    console.error('ELK layout error:', error);
    return { nodes, edges };
  }
}; 