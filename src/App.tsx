import React, { useCallback, useRef, useState } from "react";
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

const initialElements: MoodboardElement[] = [];

function App() {
  const [elements, setElements] = useState<MoodboardElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  const addText = (text: string) => {
    const el: TextElement = {
      id: uuid(),
      type: "text",
      text,
      x: 100,
      y: 100,
      width: 180,
      height: 60,
      rotation: 0,
      color: "#ffffff",
      fontSize: 18,
      zIndex: elements.length + 1,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const addSwatch = (color: string) => {
    const el: SwatchElement = {
      id: uuid(),
      type: "swatch",
      color,
      x: 120,
      y: 120,
      width: 80,
      height: 80,
      rotation: 0,
      zIndex: elements.length + 1,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const addImage = (src: string) => {
    const el: ImageElement = {
      id: uuid(),
      type: "image",
      src,
      x: 140,
      y: 140,
      width: 220,
      height: 160,
      rotation: 0,
      zIndex: elements.length + 1,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
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

  const handleExport = useCallback(async () => {
    if (!boardRef.current) return;
    const dataUrl = await toPng(boardRef.current, { cacheBust: true });
    const link = document.createElement("a");
    link.download = "moodboard.png";
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Moodboard Builder
            </h1>
            <p className="text-xs text-slate-400">
              Drag, layer, and export moodboards like a design tool.
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-sm font-medium text-slate-900 shadow-sm transition-colors"
        >
          <span>Export PNG</span>
        </button>
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
        />

        <MoodboardCanvas
          ref={boardRef}
          elements={elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdateElement={updateElement}
        />
      </main>
    </div>
  );
}

export default App;
