import React from "react";
import {
  getBezierPath,
  useInternalNode,
  useEdges,
  EdgeProps,
  Position,
} from "@xyflow/react";
import { getEdgeParams } from "@/utils/simpleFloatingEdgeUtils";

const SimpleFloatingEdge = (props: EdgeProps) => {
  const sourceNode = useInternalNode(props.source);
  const targetNode = useInternalNode(props.target);
  const edges = useEdges();

  if (!sourceNode || !targetNode) {
    return null;
  }

  // Check if there's a reverse edge (for bidirectional detection)
  const reverseEdge = edges.find(
    (edge) =>
      edge.source === props.target &&
      edge.target === props.source &&
      edge.id !== props.id
  );

  const isBidirectional = !!reverseEdge;

  // Find all edges with the same source or target to distribute them
  const sourceEdges = edges.filter((edge) => edge.source === props.source);
  const targetEdges = edges.filter((edge) => edge.target === props.target);

  // Get edge index in the list of edges from the same source
  const sourceEdgeIndex = sourceEdges.findIndex((edge) => edge.id === props.id);
  const targetEdgeIndex = targetEdges.findIndex((edge) => edge.id === props.id);

  // Calculate the offset based on position in the list and total count
  const sourceEdgeCount = sourceEdges.length;
  const targetEdgeCount = targetEdges.length;

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  // Define the edge label rendering function with improved visibility
  const renderEdgeLabel = (x: number, y: number, label: string | undefined) => {
    if (!label) return null;

    return (
      <foreignObject
        x={x - 50}
        y={y - 15}
        width={100}
        height={30}
        className="edge-label-container"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div
          style={{
            background: "transparent",
            padding: "2px 4px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: 500,
            textAlign: "center",
            border: "1px solid #e0e0e0",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {label}
        </div>
      </foreignObject>
    );
  };

  // For bidirectional edges, ensure each edge uses a distinctly different curve path
  if (isBidirectional) {
    const dx = tx - sx;
    const dy = ty - sy;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Explicitly determine curve direction - this edge chooses one side, the other edge goes on the opposite
    const isTopEdge = props.source < props.target; 
    
    // Use different curvature factors for top and bottom edges
    const curve1 = isTopEdge ? 0.5 : -0.5;  // Top edge curves up, bottom curves down
    const curve2 = isTopEdge ? -0.5 : 0.5;  // Opposite curvature for the other edge
    
    // Choose the curve factor based on whether this is a forward or reverse edge
    const curveSign = props.source < props.target ? curve1 : curve2;
    
    // Calculate absolute offset distance - larger for longer edges
    const curveDistance = Math.min(length * 0.3, 50); // Cap max curve distance
    
    // Generate control points for the curve using polar coordinates
    // This gives us complete control over curve direction
    const controlX = (sx + tx) / 2 + Math.sin(angle) * curveDistance * curveSign;
    const controlY = (sy + ty) / 2 - Math.cos(angle) * curveDistance * curveSign;
    
    // Create a quadratic bezier curve path
    const path = `M ${sx} ${sy} Q ${controlX} ${controlY}, ${tx} ${ty}`;
    
    // Position label at the control point (peak of the curve)
    const labelX = controlX;
    const labelY = controlY;
    
    return (
      <>
        <path
          id={props.id}
          className="react-flow__edge-path"
          d={path}
          markerEnd={props.markerEnd}
          style={props.style}
        />
        {props.label && renderEdgeLabel(labelX, labelY, props.label as string)}
      </>
    );
  }

  // For non-bidirectional edges, use standard bezier paths
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });
  
  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;
  
  return (
    <>
      <path
        id={props.id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={props.markerEnd}
        style={props.style}
      />
      {props.label && renderEdgeLabel(midX, midY, props.label as string)}
    </>
  );
};

export default SimpleFloatingEdge;
