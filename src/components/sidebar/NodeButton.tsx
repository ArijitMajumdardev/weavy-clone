'use client';

import React, { DragEvent } from 'react';

interface NodeButtonProps {
  type: string;
  label: string;
  icon?: React.ReactNode;
}

export default function NodeButton({ type, label, icon }: NodeButtonProps) {
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="cursor-grab active:cursor-grabbing bg-primary border border-[#3a3a3a] rounded-sm p-4 hover:bg- hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 h-25 hover:bg-neutral-700"
    >
      {icon && <div className="text-2xl">{icon}</div>}
      <div className="text-xs font-medium text-[#e5e5e5] text-center">{label}</div>
    </div>
  );
}
