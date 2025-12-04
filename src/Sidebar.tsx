import React from "react";
import type { MoodboardElement, TextElement, SwatchElement } from "./types";

type Props = {
  onAddText: (text: string) => void;
  onAddSwatch: (color: string) => void;
  onAddImage: (src: string) => void;
  selected: MoodboardElement | null;
  onUpdateSelected: (patch: Partial<MoodboardElement>) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
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
}) => {
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

  return (
    <aside className="w-80 border-r border-slate-800 bg-slate-950/90 p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-200 mb-2">Elements</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-2.5 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-slate-700"
            onClick={() => onAddText("New label")}
          >
            + Text Label
          </button>

          <label className="px-2.5 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-slate-700 cursor-pointer">
            + Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
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
              className="w-6 h-6 rounded-md border border-slate-700"
              style={{ backgroundColor: c }}
              onClick={() => onAddSwatch(c)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-3">
        <h2 className="text-sm font-semibold text-slate-200 mb-2">
          Selected Element
        </h2>

        {!selected && (
          <p className="text-xs text-slate-500">
            Click an element on the board.
          </p>
        )}

        {selected && (
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-wide text-slate-400">
                Type
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">
                {selected.type.toUpperCase()}
              </span>
            </div>

            {selected.type === "text" && (
              <>
                <label className="flex flex-col gap-1">
                  <span>Label</span>
                  <textarea
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs resize-none"
                    rows={2}
                    value={(selected as TextElement).text}
                    onChange={(e) =>
                      onUpdateSelected({ text: e.target.value } as any)
                    }
                  />
                </label>

                <label className="flex items-center justify-between gap-2">
                  <span>Font size</span>
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
                  />
                </label>

                <label className="flex items-center justify-between gap-2">
                  <span>Color</span>
                  <input
                    type="color"
                    value={(selected as TextElement).color}
                    onChange={(e) =>
                      onUpdateSelected({ color: e.target.value } as any)
                    }
                  />
                </label>
              </>
            )}

            {selected.type === "swatch" && (
              <label className="flex items-center justify-between gap-2">
                <span>Color</span>
                <input
                  type="color"
                  value={(selected as SwatchElement).color}
                  onChange={(e) =>
                    onUpdateSelected({ color: e.target.value } as any)
                  }
                />
              </label>
            )}

            <label className="flex items-center justify-between gap-2">
              <span>Rotation</span>
              <input
                type="range"
                min={-45}
                max={45}
                value={selected.rotation}
                onChange={(e) =>
                  onUpdateSelected({ rotation: Number(e.target.value) })
                }
              />
            </label>

            <div className="flex items-center justify-between gap-2">
              <span>Layer</span>
              <div className="flex gap-1">
                <button
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
                  onClick={onSendBackward}
                >
                  Back
                </button>
                <button
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
                  onClick={onBringForward}
                >
                  Front
                </button>
              </div>
            </div>

            <button
              className="mt-2 w-full px-2 py-1.5 rounded-md bg-red-500/80 hover:bg-red-500 text-slate-50"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
