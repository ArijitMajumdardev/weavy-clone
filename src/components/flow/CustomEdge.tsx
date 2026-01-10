'use client';

import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

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

  // Determine edge color based on source node type
  // Text nodes: #f1a1fb (pink)
  // Image nodes: #6dd6af (green)
  const getEdgeColor = () => {
    if (data?.sourceType === 'imageNode') {
      return '#6dd6af';
    }
    // Default to text color for textNode and llmNode (both output text)
    return '#f1a1fb';
  };

  const edgeColor = getEdgeColor();

  return (
    <>
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        className="react-flow__edge-interaction"
      />

      {/* Visible edge path */}
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
