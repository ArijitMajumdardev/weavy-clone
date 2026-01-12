"use client";

import { useEffect, useRef, useState } from "react";
import NodeButton from "./NodeButton";
import { NODE_TYPES, NODE_LABELS } from "@/constants/nodeTypes";
import { useHistoryStore } from "@/store/historyStore";
import { useFlowStore } from "@/store/flowStore";
import { Bot, FileImage, History, Search, SearchIcon, Type } from "lucide-react";
type TabType = "quick-access" | "search";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>();
  const [searchQuery, setSearchQuery] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const past = useHistoryStore((state) => state.past);
  const nodes = useFlowStore((state) => state.nodes);

  const nodeTypes = [
    {
      type: NODE_TYPES.TEXT_NODE,
      label: NODE_LABELS[NODE_TYPES.TEXT_NODE],
      icon: <Type size={20} strokeWidth={1} color="white" />,
    },
    {
      type: NODE_TYPES.IMAGE_NODE,
      label: NODE_LABELS[NODE_TYPES.IMAGE_NODE],
      icon: <FileImage size={20} strokeWidth={1} color="white"/>,
    },
    {
      type: NODE_TYPES.LLM_NODE,
      label: NODE_LABELS[NODE_TYPES.LLM_NODE],
      icon: <Bot size={20} strokeWidth={1} color="white" />,
    },
  ];

  const filteredNodes = nodeTypes.filter((node) =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Focus search input ONLY when search tab opens
  useEffect(() => {
    if (isOpen && activeTab === "search") {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen, activeTab]);

  return (
    <>
      {/* LEFT ICON BAR */}
      <div className="fixed left-0 top-0 h-full w-14 bg-primary border-r border-[#3a3a3a] z-50 flex flex-col gap-4 p-2 py-4">
        <button className="p-1 cursor-pointer">
          <img src="/logo.svg" alt="logo" className="h-5 w-5" />
        </button>

        {/* SEARCH ICON */}
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
          className={`p-2 rounded-lg transition-colors ${
            activeTab === "search" && isOpen
              ? "bg-accent text-black"
              : "text-[#e5e5e5] hover:bg-[#2a2a2a]"
          }`}
          title="Search"
        >
          <Search strokeWidth={1} size={20} />
        </button>

        {/* QUICK ACCESS ICON */}
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
          className={`p-2 rounded-lg transition-colors ${
            activeTab === "quick-access" && isOpen
              ? "bg-accent text-black"
              : "text-[#e5e5e5] hover:bg-[#2a2a2a]"
          }`}
          title="Quick access"
        >
          <History strokeWidth={1} size={20} />
        </button>
      </div>

      {/* SLIDING SIDEBAR */}
      <div
        className={`
          fixed top-0 left-14 h-full w-60
          bg-primary border-r border-[#3a3a3a]
          z-40
          transform transition-transform duration-200 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full p-4 gap-4 ">
          {/* SEARCH BAR */}
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
            <SearchIcon strokeWidth={1} size={14} className="text-[#9ca3af]" />

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

          {/* QUICK ACCESS */}
          <div className="flex flex-col gap-3">
            <span className="text-md font-semibold ">
              Quick access
            </span>

            <div className="grid grid-cols-2 gap-3">
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
