import { Position, Node, XYPosition } from '@xyflow/react';

// Returns the position (top,right,bottom,left) passed
export function getHandlePosition(position: Position): string {
  switch (position) {
    case Position.Top:
      return 'n';
    case Position.Right:
      return 'e';
    case Position.Bottom:
      return 's';
    case Position.Left:
      return 'w';
    default:
      return 'e';
  }
}

// This helper transforms an input node and handle into XY coordinates
export function getHandleCoordinates(node: Node, handleId: string | null): XYPosition {
  // Default to center of node if no handleId is provided
  if (!handleId) {
    return {
      x: node.position.x + (node.width || 0) / 2,
      y: node.position.y + (node.height || 0) / 2,
    };
  }
  
  // Calculate position based on handle position (n, e, s, w)
  switch (handleId) {
    case 'n':
      return {
        x: node.position.x + (node.width || 0) / 2,
        y: node.position.y,
      };
    case 'e':
      return {
        x: node.position.x + (node.width || 0),
        y: node.position.y + (node.height || 0) / 2,
      };
    case 's':
      return {
        x: node.position.x + (node.width || 0) / 2,
        y: node.position.y + (node.height || 0),
      };
    case 'w':
      return {
        x: node.position.x,
        y: node.position.y + (node.height || 0) / 2,
      };
    default:
      // Default to center if handle not recognized
      return {
        x: node.position.x + (node.width || 0) / 2,
        y: node.position.y + (node.height || 0) / 2,
      };
  }
}

// Calculate edge path between source and target
export function getEdgePath(
  source: XYPosition,
  target: XYPosition,
  sourceHandle: string | null,
  targetHandle: string | null
): string {
  const xOffset = Math.abs(target.x - source.x) * 0.5;
  const centerX = (source.x + target.x) / 2;
  const centerY = (source.y + target.y) / 2;
  
  let sourceControlX, sourceControlY, targetControlX, targetControlY;
  
  // Adjust control points based on source and target handles
  if (sourceHandle === 'n') {
    sourceControlX = source.x;
    sourceControlY = source.y - xOffset;
  } else if (sourceHandle === 's') {
    sourceControlX = source.x;
    sourceControlY = source.y + xOffset;
  } else if (sourceHandle === 'w') {
    sourceControlX = source.x - xOffset;
    sourceControlY = source.y;
  } else {
    // Default to 'e' or any other case
    sourceControlX = source.x + xOffset;
    sourceControlY = source.y;
  }
  
  if (targetHandle === 'n') {
    targetControlX = target.x;
    targetControlY = target.y - xOffset;
  } else if (targetHandle === 's') {
    targetControlX = target.x;
    targetControlY = target.y + xOffset;
  } else if (targetHandle === 'w') {
    targetControlX = target.x - xOffset;
    targetControlY = target.y;
  } else {
    // Default to 'e' or any other case
    targetControlX = target.x + xOffset;
    targetControlY = target.y;
  }
  
  // Generate path with two bezier curves for smoother edges
  return `M${source.x},${source.y} C${sourceControlX},${sourceControlY} ${centerX},${centerY} ${centerX},${centerY} S${targetControlX},${targetControlY} ${target.x},${target.y}`;
} 