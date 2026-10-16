"use client";

import { useMemo, useState } from "react";

type FileItem = {
  id: number;
  path: string;
  language: string;
  content: string;
  highlighted: string;
};

type Node = {
  name: string;
  path: string;
  isFile: boolean;
  file?: FileItem;
  children: Record<string, Node>;
};

function buildTree(files: FileItem[]): Node {
  const root: Node = { name: "", path: "", isFile: false, children: {} };
  for (const f of files) {
    const parts = f.path.split("/").filter(Boolean);
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      if (!cur.children[name]) {
        cur.children[name] = {
          name,
          path: parts.slice(0, i + 1).join("/"),
          isFile,
          children: {},
          file: isFile ? f : undefined,
        };
      }
      cur = cur.children[name];
    }
  }
  return root;
}

function sortedEntries(node: Node): Node[] {
  return Object.values(node.children).sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const color =
    {
      ts: "text-sky-400",
      tsx: "text-sky-400",
      js: "text-yellow-400",
      jsx: "text-yellow-400",
      json: "text-amber-400",
      md: "text-slate-300",
      py: "text-emerald-400",
      php: "text-violet-400",
      html: "text-orange-400",
      css: "text-pink-400",
      scss: "text-pink-400",
      sql: "text-fuchsia-400",
    }[ext] || "text-slate-400";
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={color}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function TreeNode({
  node,
  activePath,
  onSelect,
  depth = 0,
}: {
  node: Node;
  activePath: string;
  onSelect: (f: FileItem) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  if (node.isFile && node.file) {
    const isActive = activePath === node.path;
    return (
      <button
        onClick={() => node.file && onSelect(node.file)}
        style={{ paddingLeft: 8 + depth * 12 }}
        className={`w-full text-left flex items-center gap-2 py-1.5 pr-2 text-sm rounded-md hover:bg-white/5 ${
          isActive ? "bg-white/10 text-white" : "text-slate-300"
        }`}
      >
        <FileIcon name={node.name} />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }
  const entries = sortedEntries(node);
  return (
    <div>
      {node.name && (
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ paddingLeft: 8 + depth * 12 }}
          className="w-full flex items-center gap-2 py-1.5 pr-2 text-sm text-slate-200 hover:bg-white/5 rounded-md"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition ${open ? "rotate-90" : ""}`}>
            <path d="M9 6l6 6-6 6" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
          <span className="truncate">{node.name}</span>
        </button>
      )}
      {open && (
        <div>
          {entries.map((c) => (
            <TreeNode key={c.path} node={c} activePath={activePath} onSelect={onSelect} depth={node.name ? depth + 1 : depth} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectRepo({ files }: { files: FileItem[] }) {
  const tree = useMemo(() => buildTree(files), [files]);
  const [active, setActive] = useState<FileItem | null>(files[0] ?? null);
  const [copied, setCopied] = useState(false);

  if (files.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">📁</div>
        No files uploaded for this project yet.
      </div>
    );
  }

  const copy = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const download = () => {
    if (!active) return;
    const blob = new Blob([active.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = active.path.split("/").pop() || "file.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 text-xs text-slate-400">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 font-mono">{active?.path ?? "—"}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md bg-white/5 border border-white/10">
            {active?.language || "text"}
          </span>
          <button
            onClick={copy}
            className="text-[11px] px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={download}
            className="text-[11px] px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200"
          >
            Download
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-[260px_1fr] min-h-[520px]">
        <aside className="border-r border-white/5 p-2 max-h-[70vh] overflow-y-auto">
          <TreeNode node={tree} activePath={active?.path ?? ""} onSelect={setActive} />
        </aside>
        <div className="p-5 overflow-auto max-h-[70vh]">
          {active ? (
            <pre className="hljs">
              <code
                dangerouslySetInnerHTML={{ __html: active.highlighted }}
              />
            </pre>
          ) : (
            <div className="text-slate-500 text-sm">Select a file</div>
          )}
        </div>
      </div>
    </div>
  );
}
