'use client';

import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { Plus, Search, LayoutGrid, List, Folder } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [files] = useState([
    { id: '1', name: 'untitled', edited: '13 seconds ago' },
    { id: '2', name: 'untitled', edited: '46 seconds ago' },
    { id: '3', name: 'My First Weavy', edited: '1 minute ago' },
    { id: '4', name: 'untitled', edited: '3 days ago' },
  ]);

  const handleCreateWorkflow = () => {
    const workflowId = nanoid();
    router.push(`/flow/${workflowId}`);
  };

  return (
    <div className="flex h-screen w-screen bg-[#0e0f13] text-white">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-64 bg-[#0b0c10] border-r border-[#1f1f1f] flex flex-col p-4">
        {/* Profile */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm">
            A
          </div>
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
                  className="bg-transparent outline-none text-sm"
                />
              </div>
              <LayoutGrid size={18} />
              <List size={18} />
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-4 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => router.push(`/flow/${file.id}`)}
                className="cursor-pointer"
              >
                <div className="h-40 bg-[#14151a] border border-[#1f1f1f] rounded-xl flex items-center justify-center mb-2">
                  ⬚
                </div>
                <div className="text-sm">{file.name}</div>
                <div className="text-xs text-[#6b7280]">
                  Last edited {file.edited}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
