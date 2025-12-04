import React, { forwardRef, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { MoodboardElement } from "./types";

type Props = {
  elements: MoodboardElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, patch: Partial<MoodboardElement>) => void;
};

type DragState = null | {
  id: string;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
};

export const MoodboardCanvas = forwardRef<HTMLDivElement, Props>(
  ({ elements, selectedId, onSelect, onUpdateElement }, ref) => {
    const localRef = useRef<HTMLDivElement | null>(null);
    const combinedRef = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    const [drag, setDrag] = useState<DragState>(null);

    const handleMouseDownElement = (
      e: ReactMouseEvent,
      el: MoodboardElement,
      mode: "move" | "resize" = "move"
    ) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(el.id);

      if (!localRef.current) return;

      setDrag({
        id: el.id,
        mode,
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
        onUpdateElement(drag.id, {
          x: drag.origX + dx,
          y: drag.origY + dy,
        });
      } else if (drag.mode === "resize") {
        onUpdateElement(drag.id, {
          width: Math.max(40, drag.origW + dx),
          height: Math.max(40, drag.origH + dy),
        });
      }
    };

    const handleMouseUp = () => setDrag(null);

    // only clear selection when clicking the empty board, not elements
    const handleBoardMouseDown = (e: ReactMouseEvent) => {
      if (e.target === e.currentTarget) {
        onSelect(null);
      }
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
          className="relative bg-slate-900 rounded-xl shadow-lg border border-slate-800 w-[900px] h-[600px] overflow-hidden"
          onMouseDown={handleBoardMouseDown}
        >
          {elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => {
              const isSelected = el.id === selectedId;
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
                  className={`group cursor-move ${
                    isSelected ? "ring-2 ring-emerald-400" : ""
                  }`}
                  onMouseDown={(e) => handleMouseDownElement(e, el, "move")}
                >
                  {el.type === "image" && (
                    <img
                      src={el.src}
                      alt=""
                      className="w-full h-full object-cover rounded-md pointer-events-none select-none"
                      draggable={false}
                      onDragStart={(ev) => ev.preventDefault()}
                    />
                  )}

                  {el.type === "text" && (
                    <div className="w-full h-full flex items-center justify-center rounded-md bg-slate-900/60 px-2 text-center">
                      <p
                        style={{
                          color: (el as any).color,
                          fontSize: (el as any).fontSize,
                        }}
                        className="font-medium leading-snug"
                      >
                        {(el as any).text}
                      </p>
                    </div>
                  )}

                  {el.type === "swatch" && (
                    <div
                      className="w-full h-full rounded-md border border-slate-800"
                      style={{ backgroundColor: (el as any).color }}
                    />
                  )}

                  {/* resize handle */}
                  <div
                    onMouseDown={(e) => handleMouseDownElement(e, el, "resize")}
                    className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-slate-100 text-slate-900 text-[9px] flex items-center justify-center shadow-sm cursor-se-resize opacity-0 group-hover:opacity-100"
                  >
                    ⇲
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
);

MoodboardCanvas.displayName = "MoodboardCanvas";
