import React, { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { toPng } from "html-to-image";
import type {
  MoodboardElement,
  TextElement,
  SwatchElement,
  ImageElement,
} from "./types";
import { MoodboardCanvas } from "./MoodboardCanvas";
import { Sidebar } from "./Sidebar";

export type CanvasTheme = "grid" | "dots" | "paper" | "plain";

const initialElements: MoodboardElement[] = [];

type ProjectState = {
  elements: MoodboardElement[];
  canvasTheme: CanvasTheme;
};

function App() {
  const [elements, setElements] = useState<MoodboardElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("dots");

  const boardRef = useRef<HTMLDivElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  const addText = (text: string) => {
    const id = uuid();
    const el: TextElement = {
      id,
      type: "text",
      text,
      x: 100,
      y: 100,
      width: 180,
      height: 60,
      rotation: 0,
      color: "#ffffff",
      fontSize: 18,
      fontFamily: "Inter",
      zIndex:
        elements.length > 0
          ? Math.max(...elements.map((e) => e.zIndex)) + 1
          : 1,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(id);
  };

  const addSwatch = (color: string) => {
    const id = uuid();
    const el: SwatchElement = {
      id,
      type: "swatch",
      color,
      x: 120,
      y: 120,
      width: 80,
      height: 80,
      rotation: 0,
      zIndex:
        elements.length > 0
          ? Math.max(...elements.map((e) => e.zIndex)) + 1
          : 1,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(id);
  };

  // image helper
  const addImageAt = (src: string, x: number, y: number) => {
    const id = uuid();
    setElements((prev) => {
      const maxZ = prev.length > 0 ? Math.max(...prev.map((e) => e.zIndex)) : 0;
      const el: ImageElement = {
        id,
        type: "image",
        src,
        x,
        y,
        width: 220,
        height: 160,
        rotation: 0,
        zIndex: maxZ + 1,
      };
      return [...prev, el];
    });
    setSelectedId(id);
  };

  const addImage = (src: string) => {
    addImageAt(src, 140, 140);
  };

  const updateElement = (id: string, partial: Partial<MoodboardElement>) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? ({ ...el, ...partial } as MoodboardElement) : el
      )
    );
  };

  const bringForward = () => {
    if (!selectedId) return;
    setElements((prev) => {
      const maxZ = Math.max(...prev.map((e) => e.zIndex), 0);
      return prev.map((el) =>
        el.id === selectedId ? { ...el, zIndex: maxZ + 1 } : el
      );
    });
  };

  const sendBackward = () => {
    if (!selectedId) return;
    setElements((prev) => {
      const minZ = Math.min(...prev.map((e) => e.zIndex), 0);
      return prev.map((el) =>
        el.id === selectedId ? { ...el, zIndex: minZ - 1 } : el
      );
    });
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    const sel = elements.find((el) => el.id === selectedId) || null;
    if (!sel) return;

    const id = uuid();
    const clone: MoodboardElement = {
      ...sel,
      id,
      x: sel.x + 24,
      y: sel.y + 24,
      zIndex: sel.zIndex + 1,
    };
    setElements((prev) => [...prev, clone]);
    setSelectedId(id);
  };

  const handleExportPng = useCallback(async () => {
    if (!boardRef.current) return;
    const dataUrl = await toPng(boardRef.current, {
      cacheBust: true,
    });
    const link = document.createElement("a");
    link.download = "moodboard.png";
    link.href = dataUrl;
    link.click();
  }, []);

  const handleExportJson = () => {
    const state: ProjectState = {
      elements,
      canvasTheme,
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "moodboard.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(
          reader.result as string
        ) as Partial<ProjectState>;

        setElements(data.elements ?? []);
        if (data.canvasTheme) {
          setCanvasTheme(data.canvasTheme);
        }
        setSelectedId(null);
      } catch (err) {
        console.error("Invalid project JSON", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const sel = elements.find((el) => el.id === selectedId) || null;

      if ((e.key === "Delete" || e.key === "Backspace") && sel) {
        e.preventDefault();
        setElements((prev) => prev.filter((el) => el.id !== sel.id));
        setSelectedId(null);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && sel) {
        e.preventDefault();
        const id = uuid();
        const clone: MoodboardElement = {
          ...sel,
          id,
          x: sel.x + 24,
          y: sel.y + 24,
          zIndex: sel.zIndex + 1,
        };
        setElements((prev) => [...prev, clone]);
        setSelectedId(id);
        return;
      }

      if (!sel) return;

      const nudge = e.shiftKey ? 24 : 4;
      let dx = 0;
      let dy = 0;
      if (e.key === "ArrowLeft") dx = -nudge;
      if (e.key === "ArrowRight") dx = nudge;
      if (e.key === "ArrowUp") dy = -nudge;
      if (e.key === "ArrowDown") dy = nudge;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        setElements((prev) =>
          prev.map((el) =>
            el.id === sel.id
              ? {
                  ...el,
                  x: el.x + dx,
                  y: el.y + dy,
                }
              : el
          )
        );
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [elements, selectedId]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Moodboard Builder
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-200"
          >
            Save JSON
          </button>

          <div>
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-200"
            >
              Load JSON
            </button>
            <input
              ref={jsonInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportJson}
            />
          </div>

          <button
            onClick={handleExportPng}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-sm font-medium text-slate-900 shadow-sm transition-colors"
          >
            Export PNG
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <Sidebar
          onAddText={addText}
          onAddSwatch={addSwatch}
          onAddImage={addImage}
          selected={selectedElement}
          onUpdateSelected={(patch) =>
            selectedElement && updateElement(selectedElement.id, patch)
          }
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          onDelete={deleteSelected}
          canvasTheme={canvasTheme}
          onChangeCanvasTheme={(theme) => setCanvasTheme(theme)}
        />

        <MoodboardCanvas
          ref={boardRef}
          elements={elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdateElement={updateElement}
          canvasTheme={canvasTheme}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          onDeleteSelected={deleteSelected}
          onDuplicateSelected={duplicateSelected}
          onCreateImageAt={addImageAt}
        />
      </main>
    </div>
  );
}

export default App;
