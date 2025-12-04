# Moodboard Builder  
*A simple but very aesthetic drag-and-drop moodboard tool built with React, TypeScript, and Tailwind.*

I built this because I make moodboards for everything - interior design ideas, outfits, photography concepts etc.
I figured I might as well create my own tool that works with my preferences.

---

## Features

- **Drag & Drop Canvas**  
  Drop images straight from your computer or paste screenshots (yes, paste works). Move things around with snapping so everything stays neat.

- **Image Uploads & Resizing**  
  Add images, resize, rotate, and layer them.

- **Inline Text Editing**  
  Double-click any text block to edit directly on the canvas.

- **Color Swatches**  
  Add palette blocks for interior design, branding, outfits, etc.

- **Canvas Themes**  
  Choose between **Dots**, **Grid**, **Paper**, and **Plain** depending on your aesthetic.

- **Export to PNG**  
  Turn your moodboard into a shareable PNG in one click.

- **Save / Load JSON Projects**  
  Work on boards and return to them anytime.

- **Keyboard Shortcuts**  
  - Arrow keys → nudge  
  - Shift + arrows → nudge more  
  - Cmd/Ctrl + D → duplicate  
  - Delete → delete selected element  

---

## Built With

- **React + TypeScript**  
- **TailwindCSS**  
- **Vite**  
- **html-to-image** (for PNG export)

---

## 📸 Demo
[moodboard](https://moodboard-builder.vercel.app/)

---

## Running Locally
```bash
git clone <your-repo-url>
cd moodboard-builder
npm install
npm run dev
```

Then visit:
http://localhost:5173/

## Folder Structure
```
src/
  App.tsx             → Main app
  MoodboardCanvas.tsx → Canvas logic (drag, resize, paste, drop)
  Sidebar.tsx         → Tools + editing UI
  types.ts            → Element types
  assets/             → Fonts, icons, etc
```
