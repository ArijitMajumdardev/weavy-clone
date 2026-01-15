"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";

interface EditableWorkflowNameProps {
  workflowId: string;
  initialName: string;
}

export function EditableWorkflowName({
  workflowId,
  initialName,
}: EditableWorkflowNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateNameMutation = trpc.workflow.updateName.useMutation();

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

    if (name.trim() !== initialName && name.trim() !== "") {
      try {
        await updateNameMutation.mutateAsync({
          id: workflowId,
          name: name.trim(),
        });
      } catch (error) {
        console.error("Failed to update workflow name:", error);

        setName(initialName);
      }
    } else if (name.trim() === "") {
      setName(initialName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setName(initialName);
      setIsEditing(false);
    }
  };

  return (
    <div className="inline-block w-full">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent rounded-sm transition-all duration-200 border border-white text-sm text-white outline-none px-1 py-0.5 min-w-25"
        />
      ) : (
        <div
          onClick={handleClick}
          className="text-sm w-full text-white cursor-pointer px-1 py-0.5 rounded transition-colors"
        >
          {name}
        </div>
      )}
    </div>
  );
}
