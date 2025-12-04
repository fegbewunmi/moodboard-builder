export type ElementType = "image" | "text" | "swatch";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
}

export interface SwatchElement extends BaseElement {
  type: "swatch";
  color: string;
}

export type MoodboardElement = ImageElement | TextElement | SwatchElement;
