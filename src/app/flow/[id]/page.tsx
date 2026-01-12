'use client';

import dynamic from 'next/dynamic';
import Sidebar from '@/components/sidebar/Sidebar';
import Toolbar from '@/components/toolbar/Toolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useParams } from 'next/navigation';

// Dynamic import to avoid SSR issues with React Flow
const FlowCanvas = dynamic(() => import('@/components/flow/FlowCanvas'), {
  ssr: false,
});

export default function FlowPage() {
  const params = useParams();
  const workflowId = params.id as string;

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Note: Auto-save and load workflow disabled for now
  // Will implement database persistence later with workflowId

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* <Toolbar /> */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1">
          <FlowCanvas />
        </div>
      </div>
    </div>
  );
}
