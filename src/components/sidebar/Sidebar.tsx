"use client";

import { useEffect, useRef, useState } from "react";
import NodeButton from "./NodeButton";
import { NODE_TYPES, NODE_LABELS } from "@/constants/nodeTypes";
import { useHistoryStore } from "@/store/historyStore";
import { useFlowStore } from "@/store/flowStore";
import {
  ChevronDown,
  FileImage,
  History,
  Search,
  SearchIcon,
  Type,
  Download,
  Upload,
  Sparkles,
} from "lucide-react";
import { EditableWorkflowName } from "@/components/workflow/EditableWorkflowName";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { trpc } from "@/lib/trpc/client";

type TabType = "quick-access" | "search";

interface SidebarProps {
  workflowId?: string;
  workflowName?: string;
}

export default function Sidebar({ workflowId, workflowName }: SidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const setNodes = useFlowStore((state) => state.setNodes);
  const setEdges = useFlowStore((state) => state.setEdges);

  const createWorkflowMutation = trpc.workflow.create.useMutation();

  const nodeTypes = [
    {
      type: NODE_TYPES.TEXT_NODE,
      label: NODE_LABELS[NODE_TYPES.TEXT_NODE],
      icon: <Type size={20} strokeWidth={1} color="white" />,
    },
    {
      type: NODE_TYPES.IMAGE_NODE,
      label: NODE_LABELS[NODE_TYPES.IMAGE_NODE],
      icon: <FileImage size={20} strokeWidth={1} color="white" />,
    },
    {
      type: NODE_TYPES.LLM_NODE,
      label: NODE_LABELS[NODE_TYPES.LLM_NODE],
      icon: <Sparkles size={20} strokeWidth={1} color="white" />,
    },
  ];

  const filteredNodes = nodeTypes.filter((node) =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackToFiles = () => {
    router.push("/");
    setShowDropdown(false);
  };

  const handleCreateNewWorkflow = async () => {
    const newWorkflowId = nanoid();
    try {
      await createWorkflowMutation.mutateAsync({
        id: newWorkflowId,
        name: "untitled",
      });
      router.push(`/flow/${newWorkflowId}`);
      setShowDropdown(false);
    } catch (error) {
      console.error("Failed to create workflow:", error);
      alert("Failed to create workflow. Please try again.");
    }
  };

  const handleExportWorkflow = () => {
    if (!workflowId) return;

    const workflowData = {
      id: workflowId,
      name: workflowName || "untitled",
      nodes: nodes,
      edges: edges,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workflowName || "workflow"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDropdown(false);
  };

  const handleImportWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const workflowData = JSON.parse(content);

        if (workflowData.nodes && workflowData.edges) {
          setNodes(workflowData.nodes);
          setEdges(workflowData.edges);
          setShowDropdown(false);
        } else {
          alert("Invalid workflow file format.");
        }
      } catch (error) {
        console.error("Failed to import workflow:", error);
        alert("Failed to import workflow. Please check the file format.");
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "search") {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen, activeTab]);

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-14 bg-primary border-r border-[#3a3a3a]/50 z-50 flex flex-col gap-4 p-2 py-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportWorkflow}
          className="hidden"
        />

        <div className="relative mb-6">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="py-1.5 px-0.5 cursor-pointer flex justify-center items-center gap-1 rounded transition-colors"
          >
            <img src="/logo.svg" alt="logo" className="h-5 w-5" />
            <ChevronDown size={12} strokeWidth={1.2} color="white" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute left-0 top-7 z-20 bg-primary border border-[#3a3a3a] rounded-md shadow-xl p-2 min-w-60">
                <button
                  onClick={handleBackToFiles}
                  className="w-full cursor-pointer rounded-sm px-3 py-2 text-left text-xs text-white hover:bg-[#2a2a2a] flex items-center gap-3"
                >
                  Back to files
                </button>
                <div className="border-t border-[#3a3a3a] my-2" />

                <button
                  onClick={handleCreateNewWorkflow}
                  className="w-full cursor-pointer rounded-sm px-3 py-2 text-left text-xs text-white hover:bg-[#2a2a2a] flex items-center gap-3"
                >
                  Create new workflow
                </button>
                <div className="border-t border-[#3a3a3a] my-2" />
                <button
                  onClick={handleExportWorkflow}
                  disabled={!workflowId}
                  className="w-full cursor-pointer rounded-sm px-3 py-2 text-left text-xs text-white hover:bg-[#2a2a2a] flex justify-between items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export workflow (JSON)
                  <Download size={12} />
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowDropdown(false);
                  }}
                  className="w-full cursor-pointer rounded-sm px-3 py-2 text-left text-xs text-white hover:bg-[#2a2a2a] flex justify-between items-center gap-3"
                >
                  Import workflow (JSON)
                  <Upload size={12} />
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => {
            if (isOpen && activeTab === "search") {
              setIsOpen(false);
              setActiveTab(undefined);
            } else {
              setIsOpen(true);
              setActiveTab("search");
            }
          }}
          className={`p-2 cursor-pointer rounded-sm transition-colors ${
            activeTab === "search" && isOpen
              ? "bg-accent text-black"
              : "text-[#e5e5e5] hover:bg-[#2b2b2f]"
          }`}
          title="Search"
        >
          <Search strokeWidth={1} size={20} />
        </button>

        <button
          onClick={() => {
            if (isOpen && activeTab === "quick-access") {
              setIsOpen(false);
              setActiveTab(undefined);
            } else {
              setIsOpen(true);
              setActiveTab("quick-access");
            }
          }}
          className={`p-2 cursor-pointer rounded-sm transition-colors ${
            activeTab === "quick-access" && isOpen
              ? "bg-accent text-black"
              : "text-[#e5e5e5] hover:bg-[#2b2b2f]"
          }`}
          title="Quick access"
        >
          <History strokeWidth={1} size={20} />
        </button>
      </div>

      <div
        className={`
          fixed top-0 left-14 h-full w-60
          bg-primary border-r border-[#3a3a3a]
          z-40
          transform transition-transform duration-200 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full py-4 gap-4 ">
          {/* WORKFLOW NAME */}
          {workflowId && workflowName && (
            <div className="bg-primary  rounded-md px-3 py-2">
              <EditableWorkflowName
                workflowId={workflowId}
                initialName={workflowName}
              />
            </div>
          )}

          <div className="border-y border-[#3a3a3a]/30 w-full p-4 ">
            <div
              className="
    flex flex-row items-center gap-2
    rounded-sm
    border border-[#3a3a3a]
    px-1.5 py-0.5
    transition-colors duration-150 ease-out
    focus-within:border-accent/50
  "
            >
              <SearchIcon
                strokeWidth={1}
                size={14}
                className="text-[#9ca3af]"
              />

              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="
      w-full bg-transparent
      border-none
      py-0.5 text-xs text-white
      outline-none
      placeholder:text-[#9ca3af]
      placeholder:text-xs
    "
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4">
            <span className="text-md font-semibold ">Quick access</span>

            <div className="grid grid-cols-2 gap-2">
              {filteredNodes.map((node) => (
                <NodeButton
                  key={node.type}
                  type={node.type}
                  label={node.label}
                  icon={node.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
