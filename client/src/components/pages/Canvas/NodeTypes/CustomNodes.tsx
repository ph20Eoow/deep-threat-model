import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

export const IconNode: React.FC<NodeProps> = memo(
  ({ data, isConnectable, selected }) => {
    const { label, icon, color } = data;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className={`node ${selected ? "selected" : ""}`}
        style={{
          padding: 10,
          borderRadius: 5,
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
          border: color
            ? `${selected ? "2" : "1"}px solid ${
                selected ? `#3a43ff` : `var(--${color}, ${color})`
              }`
            : "2px solid #ba9898 !important",
          position: "relative",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Always render handles, but control visibility with opacity */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{
            opacity: isHovered || selected ? 1 : 0.3, // Make slightly visible even when not hovered
            background: "#c4c5ff",
            border: "1px solid #3a43ff",
            width: 10,
            height: 10,
            top: -10,
            transition: "opacity 0.2s ease",
          }}
          id="top"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{
            opacity: isHovered || selected ? 1 : 0.3,
            background: "#c4c5ff",
            border: "1px solid #3a43ff",
            width: 10,
            height: 10,
            bottom: -10,
            transition: "opacity 0.2s ease",
          }}
          id="bottom"
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{
            opacity: isHovered || selected ? 1 : 0.3,
            background: "#c4c5ff",
            border: "1px solid #3a43ff",
            width: 10,
            height: 10,
            right: -10,
            transition: "opacity 0.2s ease",
          }}
          id="right"
        />
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{
            opacity: isHovered || selected ? 1 : 0.3,
            background: "#c4c5ff",
            border: "1px solid #3a43ff",
            width: 10,
            height: 10,
            left: -10,
            transition: "opacity 0.2s ease",
          }}
          id="left"
        />

        <>
          {icon && (
            <div style={{ fontSize: 24, color: `var(--${color}, ${color})` }}>
              {icon as string}
            </div>
          )}
          <div style={{ fontSize: 12, fontWeight: "normal" }}>
            {label as string}
          </div>
        </>
      </div>
    );
  }
);

export const GroupNode: React.FC<NodeProps> = memo(
  ({ data, isConnectable, selected }) => {
    const { label, color } = data;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className={`group-node ${selected ? "selected" : ""}`}
        style={{
          border: color
            ? `2px solid var(--${color}, ${color}) !important`
            : "1px dashed #5d5d5d !important",
          padding: 10,
          borderRadius: 5,
          background: "rgba(250, 250, 250, 0.7)",
          minWidth: 200,
          minHeight: 150,
          boxShadow: "none",
          position: "relative",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            position: "absolute",
            top: -12,
            left: 10,
            background: "white",
            padding: "2px 8px",
            border: color
              ? `1px solid var(--${color}, ${color})`
              : "1px solid #5b5b5b",
            borderRadius: 3,
          }}
        >
          {label as string}
        </div>

        {/* Show handles on hover or selection */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{
            opacity: isHovered || selected ? 1 : 0,
            background: color ? `var(--${color}, ${color})` : "#5d5d5d",
            border: "2px solid white",
            width: 12,
            height: 12,
            top: -6,
            transition: "opacity 0.2s ease",
          }}
          id="top"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{
            opacity: isHovered || selected ? 1 : 0,
            background: color ? `var(--${color}, ${color})` : "#5d5d5d",
            border: "2px solid white",
            width: 12,
            height: 12,
            bottom: -6,
            transition: "opacity 0.2s ease",
          }}
          id="bottom"
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{
            opacity: isHovered || selected ? 1 : 0,
            background: color ? `var(--${color}, ${color})` : "#5d5d5d",
            border: "2px solid white",
            width: 12,
            height: 12,
            right: -6,
            transition: "opacity 0.2s ease",
          }}
          id="right"
        />
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{
            opacity: isHovered || selected ? 1 : 0,
            background: color ? `var(--${color}, ${color})` : "#5d5d5d",
            border: "2px solid white",
            width: 12,
            height: 12,
            left: -6,
            transition: "opacity 0.2s ease",
          }}
          id="left"
        />
      </div>
    );
  }
);
