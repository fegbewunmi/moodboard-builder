import React from "react";
import type { MoodboardElement, TextElement, SwatchElement } from "./types";

type CanvasTheme = "grid" | "dots" | "paper" | "plain";

type Props = {
  onAddText: (text: string) => void;
  onAddSwatch: (color: string) => void;
  onAddImage: (src: string) => void;
  selected: MoodboardElement | null;
  onUpdateSelected: (patch: Partial<MoodboardElement>) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  canvasTheme: CanvasTheme;
  onChangeCanvasTheme: (theme: CanvasTheme) => void;
};

export const Sidebar: React.FC<Props> = ({
  onAddText,
  onAddSwatch,
  onAddImage,
  selected,
  onUpdateSelected,
  onBringForward,
  onSendBackward,
  onDelete,
  canvasTheme,
  onChangeCanvasTheme,
}) => {
  const FONT_OPTIONS = ["Inter", "Playfair Display", "Poppins", "DM Sans"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onAddImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const themeButton = (theme: CanvasTheme, label: string) => (
    <button
      key={theme}
      onClick={() => onChangeCanvasTheme(theme)}
      className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wide border ${
        canvasTheme === theme
          ? "bg-emerald-500/90 text-slate-950 border-emerald-400"
          : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
      } transition-colors`}
    >
      {label}
    </button>
  );

  return (
    <aside className="w-80 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-sm p-4 flex flex-col gap-4">
      {/* Elements panel */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Elements</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="px-2.5 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/70 transition-colors"
            onClick={() => onAddText("New label")}
          >
            + Text Label
          </button>

          <label className="px-2.5 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/70 cursor-pointer transition-colors">
            + Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-300 mb-1">
            Color Swatches
          </h3>
          <div className="flex gap-2">
            {[
              "#f97316",
              "#0ea5e9",
              "#22c55e",
              "#eab308",
              "#ec4899",
              "#ffffff",
            ].map((c) => (
              <button
                key={c}
                className="w-6 h-6 rounded-md border border-slate-700 shadow-sm shadow-slate-950/40 hover:-translate-y-0.5 transition-transform"
                style={{ backgroundColor: c }}
                onClick={() => onAddSwatch(c)}
              />
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/60 mt-1">
          <h3 className="text-xs font-semibold text-slate-300 mb-1">
            Canvas Theme
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {themeButton("dots", "Dots")}
            {themeButton("grid", "Grid")}
            {themeButton("paper", "Paper")}
            {themeButton("plain", "Plain")}
          </div>
        </div>
      </section>

      {/* Selected element panel */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 flex-1 flex flex-col">
        {!selected && (
          <p className="text-xs text-slate-500">
            Click an element on the board to edit its properties.
          </p>
        )}

        {selected && (
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-slate-100 mb-2">
                Selected Element
              </h2>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] border border-slate-700 text-slate-200">
                {selected.type.toUpperCase()}
              </span>
            </div>

            {/* text controls */}
            {selected.type === "text" && (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-slate-300">Label</span>
                  <textarea
                    className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
                    rows={2}
                    value={(selected as TextElement).text}
                    onChange={(e) =>
                      onUpdateSelected({ text: e.target.value } as any)
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Font</span>
                  <select
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
                    value={(selected as TextElement).fontFamily || "Inter"}
                    onChange={(e) =>
                      onUpdateSelected({
                        fontFamily: e.target.value,
                      } as any)
                    }
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Font size</span>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={(selected as TextElement).fontSize}
                    onChange={(e) =>
                      onUpdateSelected({
                        fontSize: Number(e.target.value),
                      } as any)
                    }
                    className="flex-1 accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Color</span>
                  <input
                    type="color"
                    value={(selected as TextElement).color}
                    onChange={(e) =>
                      onUpdateSelected({ color: e.target.value } as any)
                    }
                    className="h-6 w-10 rounded-md border border-slate-600 bg-slate-900"
                  />
                </label>
              </>
            )}

            {/* swatch controls */}
            {selected.type === "swatch" && (
              <label className="flex items-center justify-between gap-2">
                <span className="text-slate-300">Color</span>
                <input
                  type="color"
                  value={(selected as SwatchElement).color}
                  onChange={(e) =>
                    onUpdateSelected({ color: e.target.value } as any)
                  }
                  className="h-6 w-10 rounded-md border border-slate-600 bg-slate-900"
                />
              </label>
            )}

            {/* common transform controls */}
            <label className="flex items-center justify-between gap-2">
              <span className="text-slate-300">Rotation</span>
              <input
                type="range"
                min={-45}
                max={45}
                value={selected.rotation}
                onChange={(e) =>
                  onUpdateSelected({ rotation: Number(e.target.value) })
                }
                className="flex-1 accent-emerald-500"
              />
            </label>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300">Layer</span>
              <div className="flex gap-1">
                <button
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] transition-colors"
                  onClick={onSendBackward}
                >
                  Back
                </button>
                <button
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] transition-colors"
                  onClick={onBringForward}
                >
                  Front
                </button>
              </div>
            </div>

            <button
              className="mt-3 w-full px-2 py-1.5 rounded-md bg-red-500/85 hover:bg-red-500 text-slate-50 text-xs font-medium shadow-sm shadow-red-900/40 transition-colors"
              onClick={onDelete}
            >
              Delete Element
            </button>
          </div>
        )}
      </section>
    </aside>
  );
};
