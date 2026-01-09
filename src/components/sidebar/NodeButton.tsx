'use client';

import { DragEvent } from 'react';

interface NodeButtonProps {
  type: string;
  label: string;
  icon?: string;
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
      className="cursor-grab active:cursor-grabbing bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-4 hover:border-[#a855f7] hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[80px]"
    >
      {icon && <div className="text-2xl">{icon}</div>}
      <div className="text-xs font-medium text-[#e5e5e5] text-center">{label}</div>
    </div>
  );
}
