'use client';

import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useState, useEffect, useRef } from 'react';
import { Plus, Search, LayoutGrid, List, Folder } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch workflows based on search
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
        name: 'untitled',
      });

      router.push(`/flow/${workflowId}`);
    } catch (error) {
      console.error('Failed to create workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  };

  // Format relative time
  const getRelativeTime = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="flex h-screen w-screen bg-[#0e0f13] text-white">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-64 bg-[#0b0c10] border-r border-[#1f1f1f] flex flex-col p-4">
        {/* Profile */}
        <div className="flex items-center gap-2 mb-6">
          {/* <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm">
            A
          </div> */}
          <UserButton/>
          <span className="text-sm">Arijit Majumdar</span>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateWorkflow}
          className="mb-6 flex items-center justify-center gap-2 bg-[#f4fcb0] text-black text-sm px-3 py-2 rounded-md hover:opacity-90"
        >
          <Plus size={16} /> Create New File
        </button>

        {/* Navigation */}
        <nav className="space-y-2 text-sm text-[#9ca3af]">
          <div className="flex items-center justify-between bg-[#1a1b1f] px-3 py-2 rounded-md text-white">
            <span className="flex items-center gap-2">
              <Folder size={16} /> My Files
            </span>
            <Plus size={14} />
          </div>
          <div className="px-3 py-2">Shared with me</div>
          <div className="px-3 py-2">Apps</div>
        </nav>

        <div className="mt-auto text-xs text-[#6b7280]">Discord</div>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-lg">Arijit Majumdar&apos;s Workspace</h1>

          <button
            onClick={handleCreateWorkflow}
            className="flex items-center gap-2 bg-[#f4fcb0] text-black text-sm px-3 py-2 rounded-md"
          >
            <Plus size={16} /> Create New File
          </button>
        </div>


        {/* My Files */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm">My files</h2>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#14151a] border border-[#1f1f1f] px-3 py-2 rounded-md text-sm">
                <Search size={14} className="text-[#6b7280]" />
                <input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm"
                />
              </div>
              <LayoutGrid size={18} />
              <List size={18} />
            </div>
          </div>

          {/* Files Grid */}
          {isLoading ? (
            <div className="text-center text-[#6b7280] py-8">Loading workflows...</div>
          ) : workflows && workflows.length > 0 ? (
            <div className="grid grid-cols-4 gap-6">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  onClick={() => router.push(`/flow/${workflow.id}`)}
                  className="cursor-pointer"
                >
                  <div className="h-40 bg-[#14151a] border border-[#1f1f1f] rounded-xl flex items-center justify-center mb-2 hover:border-[#3a3a3a] transition-colors">
                    ⬚
                  </div>
                  <div className="text-sm">{workflow.name}</div>
                  <div className="text-xs text-[#6b7280]">
                    Last edited {getRelativeTime(workflow.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-[#6b7280] py-8">
              {searchQuery ? 'No workflows found matching your search' : 'No workflows yet. Create your first workflow!'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
