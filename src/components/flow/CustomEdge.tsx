"use client";

import { memo } from "react";
import { EdgeProps, getBezierPath } from "reactflow";

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getEdgeColor = () => {
    if (data?.sourceType === "imageNode") {
      return "#6dd6af";
    }
    return "#f1a1fb";
  };

  const edgeColor = getEdgeColor();

  return (
    <>
      <path
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        className="react-flow__edge-interaction"
      />

      <path
        id={id}
        d={edgePath}
        strokeWidth={selected ? 3 : 2}
        stroke={edgeColor}
        fill="none"
        style={{
          opacity: selected ? 1 : 0.8,
        }}
      />
    </>
  );
}

export default memo(CustomEdge);
