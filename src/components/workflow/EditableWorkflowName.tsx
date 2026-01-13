'use client';

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';

interface EditableWorkflowNameProps {
  workflowId: string;
  initialName: string;
}

export function EditableWorkflowName({ workflowId, initialName }: EditableWorkflowNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateNameMutation = trpc.workflow.updateName.useMutation();

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    setIsEditing(false);

    // Only update if name changed
    if (name.trim() !== initialName && name.trim() !== '') {
      try {
        await updateNameMutation.mutateAsync({
          id: workflowId,
          name: name.trim(),
        });
      } catch (error) {
        console.error('Failed to update workflow name:', error);
        // Revert to initial name on error
        setName(initialName);
      }
    } else if (name.trim() === '') {
      // Revert to initial name if empty
      setName(initialName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setName(initialName);
      setIsEditing(false);
    }
  };

  return (
    <div className="inline-block">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-b border-[#3a3a3a] text-sm text-white outline-none px-1 py-0.5 min-w-[100px]"
        />
      ) : (
        <div
          onClick={handleClick}
          className="text-sm text-white cursor-pointer px-1 py-0.5 hover:bg-[#2a2a2a] rounded transition-colors"
        >
          {name}
        </div>
      )}
    </div>
  );
}
