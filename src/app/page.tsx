"use client";

import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Network } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayName =
    user?.username ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User";

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const { data: workflows, isLoading } = trpc.workflow.search.useQuery(
    { query: debouncedQuery },
    { enabled: true }
  );

  const createWorkflowMutation = trpc.workflow.create.useMutation();

  const handleCreateWorkflow = async () => {
    const workflowId = nanoid();

    try {
      await createWorkflowMutation.mutateAsync({
        id: workflowId,
        name: "untitled",
      });

      router.push(`/flow/${workflowId}`);
    } catch (error) {
      console.error("Failed to create workflow:", error);
      alert("Failed to create workflow. Please try again.");
    }
  };

  const getRelativeTime = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minute${
        Math.floor(diffInSeconds / 60) > 1 ? "s" : ""
      } ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hour${
        Math.floor(diffInSeconds / 3600) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(diffInSeconds / 86400)} day${
      Math.floor(diffInSeconds / 86400) > 1 ? "s" : ""
    } ago`;
  };

  return (
    <div className="flex h-screen w-screen bg-[#0e0f12] text-white">
      <aside className="w-60 bg-[#0e0f12] border-r border-[#1f1f1f] flex flex-col px-2 py-4">
        <div className="flex items-center gap-2 mb-6">
          <UserButton />
          <span className="text-sm">{displayName}</span>
        </div>

        <button
          onClick={handleCreateWorkflow}
          disabled={createWorkflowMutation.isPending}
          className="mb-6 cursor-pointer flex items-center justify-center gap-1 bg-[#f4fcb0] text-black text-sm px-3 py-1.5 rounded-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Create New File
        </button>
      </aside>

      <main className="flex-1 p-8 px-14 overflow-y-auto bg-[#0e0f12]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-sm">{displayName}&apos;s Workspace</h1>

          <button
            onClick={handleCreateWorkflow}
            disabled={createWorkflowMutation.isPending}
            className="flex cursor-pointer items-center gap-2 bg-[#f4fcb0] text-black text-sm px-3 py-1.5 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Create New File
          </button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm">My files</h2>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-background border border-primary2 px-3 py-2 rounded-md text-sm">
                <Search size={14} className="text-[#6b7280]" />
                <input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-[#6b7280] py-8">
              Loading workflows...
            </div>
          ) : workflows && workflows.length > 0 ? (
            <div className="flex gap-4 gap-y-8 flex-wrap">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  onClick={() => router.push(`/flow/${workflow.id}`)}
                  className="cursor-pointer"
                >
                  <div className="h-60 min-w-52 bg-primary border border-primary2 rounded-xl flex items-center justify-center mb-2 hover:bg-primary2 transition-colors">
                    <Network size={26} strokeWidth={1} className="-rotate-90" />
                  </div>
                  <div className="text-sm pl-2">{workflow.name}</div>
                  <div className="text-xs pl-2 text-[#6b7280]">
                    Last edited {getRelativeTime(workflow.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-[#6b7280] py-8">
              {searchQuery
                ? "No workflows found matching your search"
                : "No workflows yet. Create your first workflow!"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
