"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gradientOptions, languageOptions } from "@/lib/site";

export type EditorFile = {
  id?: number;
  path: string;
  language: string;
  content: string;
  sortOrder: number;
};

export type ProjectPayload = {
  id?: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverEmoji: string;
  coverGradient: string;
  tags: string;
  repoUrl: string;
  demoUrl: string;
  readme: string;
  featured: boolean;
  sortOrder: number;
  files: EditorFile[];
};

const emojiSuggestions = [
  "🚀", "💻", "🧠", "✨", "⚡", "🛠️", "📱", "🌐", "🧩", "🎨",
  "📊", "🔒", "🤖", "☁️", "🕹️", "🔥", "🎯", "🧪", "📦", "🗂️",
];

function detectLangFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
    py: "python", php: "php", java: "java", c: "c", h: "c",
    cpp: "cpp", cs: "csharp", go: "go", rs: "rust", rb: "ruby",
    sql: "sql", html: "html", htm: "html", css: "css", scss: "scss",
    json: "json", yml: "yaml", yaml: "yaml", sh: "bash", bash: "bash",
    md: "markdown", xml: "xml",
  };
  return map[ext] || "plaintext";
}

export default function ProjectEditor({
  initial,
  mode,
}: {
  initial: ProjectPayload;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProjectPayload>(initial);
  const [activeFileIdx, setActiveFileIdx] = useState<number>(
    initial.files.length > 0 ? 0 : -1
  );

  const activeFile = activeFileIdx >= 0 ? form.files[activeFileIdx] : null;

  const previewSlug = useMemo(() => {
    return (form.slug || form.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [form.slug, form.title]);

  function update<K extends keyof ProjectPayload>(key: K, value: ProjectPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addFile(prefill?: Partial<EditorFile>) {
    const nf: EditorFile = {
      path: prefill?.path ?? "new-file.txt",
      language: prefill?.language ?? "plaintext",
      content: prefill?.content ?? "",
      sortOrder: form.files.length,
    };
    setForm((f) => ({ ...f, files: [...f.files, nf] }));
    setActiveFileIdx(form.files.length);
  }

  function updateFile(idx: number, patch: Partial<EditorFile>) {
    setForm((f) => {
      const files = [...f.files];
      files[idx] = { ...files[idx], ...patch };
      return { ...f, files };
    });
  }

  function removeFile(idx: number) {
    if (!confirm("Remove this file?")) return;
    setForm((f) => ({ ...f, files: f.files.filter((_, i) => i !== idx) }));
    if (activeFileIdx === idx) setActiveFileIdx(-1);
    else if (activeFileIdx > idx) setActiveFileIdx((i) => i - 1);
  }

  async function onUploadFiles(fl: FileList | null) {
    if (!fl) return;
    const added: EditorFile[] = [];
    for (const file of Array.from(fl)) {
      const text = await file.text();
      added.push({
        path: file.name,
        language: detectLangFromPath(file.name),
        content: text,
        sortOrder: form.files.length + added.length,
      });
    }
    setForm((f) => ({ ...f, files: [...f.files, ...added] }));
    if (added.length > 0) setActiveFileIdx(form.files.length);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, slug: previewSlug };
      const isEdit = mode === "edit" && form.id;
      const res = await fetch(
        isEdit ? `/api/admin/projects/${form.id}` : "/api/admin/projects",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to save");
      }
      const j = await res.json();
      startTransition(() => {
        router.push(`/admin/projects/${j.id}`);
        router.refresh();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {mode === "edit" ? "Edit project" : "New project"}
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-black text-white">
            {form.title || "Untitled project"}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || pending}
            className="rounded-lg bg-white text-black font-semibold px-5 py-2 text-sm hover:bg-slate-200 disabled:opacity-60"
          >
            {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create project"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Left: meta */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="My awesome project"
              className={inputCls}
            />
          </Field>
          <Field label="Slug" hint={`/projects/${previewSlug || "..."}`}>
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="auto-from-title"
              className={inputCls}
            />
          </Field>
          <Field label="Tagline">
            <input
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="One-line pitch that hooks the reader"
              className={inputCls}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Full write-up — what, why, how"
              rows={5}
              className={inputCls + " font-mono text-sm"}
            />
          </Field>
          <Field label="Tags (comma separated)">
            <input
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="React, Node.js, PostgreSQL"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Live demo URL">
              <input
                value={form.demoUrl}
                onChange={(e) => update("demoUrl", e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>
            <Field label="Source repo URL">
              <input
                value={form.repoUrl}
                onChange={(e) => update("repoUrl", e.target.value)}
                placeholder="https://github.com/..."
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Right: cover + flags */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Cover</div>
            <div className={`h-40 rounded-2xl bg-gradient-to-br ${form.coverGradient} grid place-items-center text-7xl relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.25),transparent_60%)]" />
              <span className="relative">{form.coverEmoji}</span>
            </div>
          </div>

          <Field label="Emoji">
            <div className="flex items-center gap-2">
              <input
                value={form.coverEmoji}
                onChange={(e) => update("coverEmoji", e.target.value.slice(0, 4))}
                className={inputCls + " w-24 text-center text-2xl"}
              />
              <div className="flex flex-wrap gap-1">
                {emojiSuggestions.map((e) => (
                  <button
                    key={e}
                    onClick={() => update("coverEmoji", e)}
                    className="w-8 h-8 grid place-items-center rounded-md hover:bg-white/10"
                    type="button"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field label="Gradient">
            <div className="grid grid-cols-4 gap-2">
              {gradientOptions.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => update("coverGradient", g)}
                  className={`h-10 rounded-lg bg-gradient-to-br ${g} border ${
                    form.coverGradient === g ? "border-white ring-2 ring-white/60" : "border-white/10"
                  }`}
                />
              ))}
            </div>
          </Field>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
            <div>
              <div className="text-sm text-white">Featured on homepage</div>
              <div className="text-xs text-slate-400">Show in the hero &quot;Selected work&quot; grid.</div>
            </div>
            <button
              type="button"
              onClick={() => update("featured", !form.featured)}
              className={`w-11 h-6 rounded-full relative transition ${
                form.featured ? "bg-fuchsia-500" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  form.featured ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <Field label="Sort order" hint="Lower numbers appear first">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>

          <Field label="README (plain text or markdown)">
            <textarea
              value={form.readme}
              onChange={(e) => update("readme", e.target.value)}
              rows={5}
              placeholder="# My project&#10;Installation, usage, notes..."
              className={inputCls + " font-mono text-sm"}
            />
          </Field>
        </div>
      </div>

      {/* Files editor */}
      <div className="mt-8 glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-white font-semibold">Source files</div>
            <div className="text-xs text-slate-400">
              Build a mini-repo for this project. Drag or upload files, or add manually.
            </div>
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-2 text-sm">
              📤 Upload files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => onUploadFiles(e.target.files)}
              />
            </label>
            <button
              type="button"
              onClick={() => addFile()}
              className="rounded-lg bg-white text-black px-3 py-2 text-sm font-semibold hover:bg-slate-200"
            >
              + Add file
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-[240px_1fr] min-h-[420px]">
          <aside className="border-r border-white/5 p-2 max-h-[520px] overflow-auto">
            {form.files.length === 0 ? (
              <div className="text-slate-500 text-sm p-4">
                No files yet. Upload some or add a file to get started.
              </div>
            ) : (
              form.files.map((f, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm ${
                    idx === activeFileIdx ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => setActiveFileIdx(idx)}
                    className="flex-1 text-left truncate"
                  >
                    <span className="text-slate-500 mr-1">📄</span>
                    {f.path}
                  </button>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-rose-400 hover:text-rose-300 text-xs opacity-70 hover:opacity-100"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </aside>

          <div className="p-4">
            {activeFile ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
                  <input
                    value={activeFile.path}
                    onChange={(e) => {
                      const path = e.target.value;
                      updateFile(activeFileIdx, {
                        path,
                        language: detectLangFromPath(path) !== "plaintext"
                          ? detectLangFromPath(path)
                          : activeFile.language,
                      });
                    }}
                    className={inputCls + " font-mono"}
                    placeholder="src/index.ts"
                  />
                  <select
                    value={activeFile.language}
                    onChange={(e) => updateFile(activeFileIdx, { language: e.target.value })}
                    className={inputCls}
                  >
                    {languageOptions.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={activeFile.content}
                  onChange={(e) => updateFile(activeFileIdx, { content: e.target.value })}
                  rows={18}
                  spellCheck={false}
                  className={inputCls + " font-mono text-[13px] leading-relaxed"}
                  placeholder="// paste or type your code here"
                />
                <div className="text-xs text-slate-500">
                  {activeFile.content.split("\n").length} lines · {activeFile.content.length} chars
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">Select a file on the left to edit.</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => router.push("/admin")}
          className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-4 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving || pending}
          className="rounded-lg bg-white text-black font-semibold px-5 py-2 text-sm hover:bg-slate-200 disabled:opacity-60"
        >
          {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create project"}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white outline-none focus:border-fuchsia-500/60 placeholder:text-slate-500";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-widest text-slate-400">
          {label}
        </label>
        {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
