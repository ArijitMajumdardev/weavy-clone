'use client';

import { memo } from 'react';
import { EdgeProps, getStraightPath } from 'reactflow';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke="#a855f7"
        fill="none"
      />
      {/* Animated overlay */}
      <path
        d={edgePath}
        strokeWidth={2}
        stroke="#a855f7"
        fill="none"
        strokeDasharray="5,5"
        className="animate-dash"
      />
    </>
  );
}

export default memo(CustomEdge);
