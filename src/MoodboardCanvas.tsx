import React, { forwardRef, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  ClipboardEvent as ReactClipboardEvent,
  DragEvent as ReactDragEvent,
} from "react";
import type { MoodboardElement } from "./types";
import type { CanvasTheme } from "./App";

type Props = {
  elements: MoodboardElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, patch: Partial<MoodboardElement>) => void;
  canvasTheme: CanvasTheme;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onCreateImageAt: (src: string, x: number, y: number) => void; // 👈 NEW
};

type ResizeCorner = "nw" | "ne" | "sw" | "se";

type DragState = null | {
  id: string;
  mode: "move" | "resize";
  corner?: ResizeCorner;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
};

const GRID_SIZE = 24;
const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

export const MoodboardCanvas = forwardRef<HTMLDivElement, Props>(
  (
    {
      elements,
      selectedId,
      onSelect,
      onUpdateElement,
      canvasTheme,
      onBringForward,
      onSendBackward,
      onDeleteSelected,
      onDuplicateSelected,
      onCreateImageAt,
    },
    ref
  ) => {
    const localRef = useRef<HTMLDivElement | null>(null);
    const combinedRef = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    const [drag, setDrag] = useState<DragState>(null);

    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState<string>("");

    const startEditingText = (el: MoodboardElement) => {
      if (el.type !== "text") return;
      setEditingTextId(el.id);
      setEditingValue(el.text ?? "");
    };

    const commitEditingText = () => {
      if (!editingTextId) return;
      onUpdateElement(editingTextId, {
        text: editingValue,
      } as any);
      setEditingTextId(null);
    };

    const cancelEditingText = () => {
      setEditingTextId(null);
    };

    const handleMouseDownElement = (
      e: ReactMouseEvent,
      el: MoodboardElement,
      mode: "move" | "resize" = "move",
      corner?: ResizeCorner
    ) => {
      if (editingTextId && editingTextId === el.id) return;

      e.preventDefault();
      e.stopPropagation();
      onSelect(el.id);

      if (!localRef.current) return;

      setDrag({
        id: el.id,
        mode,
        corner,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y,
        origW: el.width,
        origH: el.height,
      });
    };

    const handleMouseMove = (e: ReactMouseEvent) => {
      if (!drag) return;
      e.preventDefault();

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (drag.mode === "move") {
        const newX = snap(drag.origX + dx);
        const newY = snap(drag.origY + dy);
        onUpdateElement(drag.id, { x: newX, y: newY });
      } else if (drag.mode === "resize") {
        let { origX, origY, origW, origH } = drag;
        let x = origX;
        let y = origY;
        let w = origW;
        let h = origH;

        switch (drag.corner) {
          case "se":
            w = origW + dx;
            h = origH + dy;
            break;
          case "sw":
            w = origW - dx;
            h = origH + dy;
            x = origX + dx;
            break;
          case "ne":
            w = origW + dx;
            h = origH - dy;
            y = origY + dy;
            break;
          case "nw":
            w = origW - dx;
            h = origH - dy;
            x = origX + dx;
            y = origY + dy;
            break;
        }

        w = Math.max(60, w);
        h = Math.max(60, h);

        onUpdateElement(drag.id, {
          x: snap(x),
          y: snap(y),
          width: snap(w),
          height: snap(h),
        });
      }
    };

    const handleMouseUp = () => setDrag(null);

    const handleBoardMouseDown = (e: ReactMouseEvent) => {
      if (e.target === e.currentTarget) {
        onSelect(null);
        cancelEditingText();
      }
    };

    // 🔹 drag & drop helpers
    const handleDragOverBoard = (e: ReactDragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    };

    const handleDropBoard = (e: ReactDragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!localRef.current) return;

      const files = Array.from(e.dataTransfer.files);
      const file = files.find((f) => f.type.startsWith("image/"));
      if (!file) return;

      const { clientX, clientY } = e;
      const rect = localRef.current.getBoundingClientRect();

      // center the image around drop point
      const x = clientX - rect.left - 110;
      const y = clientY - rect.top - 80;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onCreateImageAt(reader.result, x, y);
        }
      };
      reader.readAsDataURL(file);
    };

    // paste images (e.g. screenshots)
    const handlePasteBoard = (e: ReactClipboardEvent<HTMLDivElement>) => {
      if (!localRef.current) return;
      const files = Array.from(e.clipboardData.files);
      const file = files.find((f) => f.type.startsWith("image/"));
      if (!file) return;

      e.preventDefault();

      const rect = localRef.current.getBoundingClientRect();
      const x = rect.width / 2 - 110;
      const y = rect.height / 2 - 80;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onCreateImageAt(reader.result, x, y);
        }
      };
      reader.readAsDataURL(file);
    };

    const selected = elements.find((el) => el.id === selectedId) || null;

    let backgroundColor = "#020617";
    let backgroundImage: string | undefined;
    let backgroundSize: string | undefined;

    if (canvasTheme === "dots") {
      backgroundImage =
        "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.24) 1px, transparent 0)";
      backgroundSize = `${GRID_SIZE}px ${GRID_SIZE}px`;
    } else if (canvasTheme === "grid") {
      backgroundImage =
        "linear-gradient(to right, rgba(148,163,184,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.22) 1px, transparent 1px)";
      backgroundSize = `${GRID_SIZE}px ${GRID_SIZE}px`;
    } else if (canvasTheme === "paper") {
      backgroundImage =
        "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.8))";
      backgroundSize = undefined;
    } else {
      backgroundImage = undefined;
      backgroundSize = undefined;
      backgroundColor = "#020617";
    }

    const boardStyle: React.CSSProperties = {
      backgroundColor,
      backgroundImage,
      backgroundSize,
    };

    return (
      <div
        className="flex-1 flex items-center justify-center bg-slate-950/90"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={combinedRef}
          style={boardStyle}
          className="relative bg-slate-900/90 rounded-2xl shadow-[0_24px_60px_rgba(15,23,42,0.85)] border border-slate-800/90 w-[920px] h-[620px] overflow-hidden"
          onMouseDown={handleBoardMouseDown}
          onDragOver={handleDragOverBoard}
          onDrop={handleDropBoard}
          onPaste={handlePasteBoard}
          tabIndex={0} // so the board can receive paste focus
        >
          <div className="absolute top-3 left-4 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] uppercase tracking-wide text-slate-300">
            Theme: {canvasTheme}
          </div>

          {selected && (
            <div
              className="absolute flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/95 border border-slate-700 shadow-md shadow-slate-900/70 text-[11px]"
              style={{
                left: selected.x + selected.width / 2,
                top: Math.max(selected.y - 36, 8),
                transform: "translateX(-50%)",
              }}
            >
              <button
                className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateSelected();
                }}
              >
                Duplicate
              </button>
              <button
                className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onBringForward();
                }}
              >
                Front
              </button>
              <button
                className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendBackward();
                }}
              >
                Back
              </button>
              <button
                className="px-2 py-0.5 rounded-full bg-red-500/80 hover:bg-red-500 text-slate-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSelected();
                }}
              >
                Delete
              </button>
            </div>
          )}

          {elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => {
              const isSelected = el.id === selectedId;
              const isEditing = el.id === editingTextId;
              const style: React.CSSProperties = {
                position: "absolute",
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                transform: `rotate(${el.rotation}deg)`,
                transformOrigin: "center center",
                zIndex: el.zIndex,
              };

              return (
                <div
                  key={el.id}
                  style={style}
                  className={`group rounded-xl transition-transform transition-shadow duration-150 ${
                    isSelected
                      ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/30"
                      : "shadow-md shadow-slate-950/60 hover:shadow-lg hover:shadow-slate-900/80"
                  } ${isEditing ? "cursor-text" : "cursor-move"}`}
                  onMouseDown={(e) => handleMouseDownElement(e, el, "move")}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (el.type === "text") {
                      startEditingText(el);
                    }
                  }}
                >
                  {el.type === "image" && (
                    <img
                      src={el.src}
                      alt=""
                      className="w-full h-full object-cover rounded-xl pointer-events-none select-none"
                      draggable={false}
                      onDragStart={(ev) => ev.preventDefault()}
                    />
                  )}

                  {el.type === "text" && !isEditing && (
                    <div className="w-full h-full flex items-center justify-center rounded-xl bg-slate-900/80 px-3 text-center border border-slate-700/80">
                      <p
                        style={{
                          color: el.color,
                          fontSize: el.fontSize,
                          fontFamily:
                            el.fontFamily ||
                            "Inter, system-ui, -apple-system, sans-serif",
                        }}
                        className="font-medium leading-snug tracking-tight whitespace-pre-wrap"
                      >
                        {el.text}
                      </p>
                    </div>
                  )}

                  {el.type === "text" && isEditing && (
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={commitEditingText}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          commitEditingText();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          cancelEditingText();
                        }
                      }}
                      autoFocus
                      className="w-full h-full rounded-xl bg-slate-900/90 px-3 py-2 text-center border border-slate-700/80 text-xs text-slate-50 resize-none outline-none"
                      style={{
                        fontSize: el.fontSize,
                        fontFamily:
                          el.fontFamily ||
                          "Inter, system-ui, -apple-system, sans-serif",
                      }}
                    />
                  )}

                  {el.type === "swatch" && (
                    <div
                      className="w-full h-full rounded-xl border border-slate-800"
                      style={{ backgroundColor: el.color }}
                    />
                  )}

                  {(["nw", "ne", "sw", "se"] as ResizeCorner[]).map(
                    (corner) => {
                      const cornerClasses =
                        corner === "nw"
                          ? "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"
                          : corner === "ne"
                          ? "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
                          : corner === "sw"
                          ? "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
                          : "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize";

                      return (
                        <div
                          key={corner}
                          onMouseDown={(e) =>
                            handleMouseDownElement(e, el, "resize", corner)
                          }
                          className={`absolute w-3 h-3 rounded-full bg-slate-100 shadow-sm border border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${cornerClasses}`}
                        />
                      );
                    }
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
);

MoodboardCanvas.displayName = "MoodboardCanvas";
