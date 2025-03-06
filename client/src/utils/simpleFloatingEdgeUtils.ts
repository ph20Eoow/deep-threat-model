import { Position, InternalNode } from '@xyflow/react';

// Returns the position (top, right, bottom or left) of nodeA compared to nodeB
function getParams(nodeA: InternalNode, nodeB: InternalNode, handleType: 'source' | 'target') {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);
  
  if (!centerA || !centerB) {
    return [0, 0, Position.Top];
  }

  const horizontalDiff = centerB.x - centerA.x;
  const verticalDiff = centerB.y - centerA.y;

  let position;

  // Determine the appropriate handle position based on the relative positions of the nodes
  if (Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
    // Nodes are more horizontally separated
    position = horizontalDiff > 0 ? Position.Right : Position.Left;
  } else {
    // Nodes are more vertically separated
    position = verticalDiff > 0 ? Position.Bottom : Position.Top;
  }

  // Find the handle coordinates based on the determined position
  const [x, y] = getHandleCoordsByPosition(nodeA, position, handleType);
  return [x, y, position];
}

function getHandleCoordsByPosition(
  node: InternalNode, 
  handlePosition: Position,
  handleType: 'source' | 'target'
) {
  // Get the handle bounds based on the handle type (source or target)
  const handles = handleType === 'source' 
    ? node.internals.handleBounds?.source 
    : node.internals.handleBounds?.target;
    
  // Try to find the handle with the specified position
  const handle = handles?.find(h => h.position === handlePosition);

  // If no handle is found, use a default position based on node dimensions
  if (!handle) {
    // Calculate position on the node's perimeter based on the handlePosition
    const width = node.measured?.width || 0;
    const height = node.measured?.height || 0;
    const x = node.internals.positionAbsolute.x;
    const y = node.internals.positionAbsolute.y;
    
    switch (handlePosition) {
      case Position.Left:
        return [x, y + height / 2];
      case Position.Right:
        return [x + width, y + height / 2];
      case Position.Top:
        return [x + width / 2, y];
      case Position.Bottom:
        return [x + width / 2, y + height];
      default:
        return [x + width / 2, y + height / 2];
    }
  }
  
  // Calculate the exact position of the handle
  const x = node.internals.positionAbsolute.x + handle.x;
  const y = node.internals.positionAbsolute.y + handle.y;
  
  // Adjust the connection point to be at the outer edge of the handle
  switch (handlePosition) {
    case Position.Left:
      return [x, y + handle.height / 2];
    case Position.Right:
      return [x + handle.width, y + handle.height / 2];
    case Position.Top:
      return [x + handle.width / 2, y];
    case Position.Bottom:
      return [x + handle.width / 2, y + handle.height];
    default:
      return [x + handle.width / 2, y + handle.height / 2];
  }
}

function getNodeCenter(node: InternalNode) {
  if (!node?.measured?.width || !node?.measured?.height) {
    return null;
  }
  
  return {
    x: node.internals.positionAbsolute.x + node.measured.width / 2,
    y: node.internals.positionAbsolute.y + node.measured.height / 2,
  };
}

// Returns the parameters needed to create an edge
export function getEdgeParams(source: InternalNode, target: InternalNode) {
  const [sx, sy, sourcePos] = getParams(source, target, 'source');
  const [tx, ty, targetPos] = getParams(target, source, 'target');

  return {
    sx: sx as number,
    sy: sy as number,
    tx: tx as number,
    ty: ty as number,
    sourcePos: sourcePos as Position,
    targetPos: targetPos as Position,
  };
}