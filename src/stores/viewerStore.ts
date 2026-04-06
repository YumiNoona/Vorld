import { create } from "zustand";

interface InfoPanelData {
  title: string;
  description?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  layout?: "top" | "side";
}

interface ViewerState {
  infoPanel: InfoPanelData | null;
  setInfoPanel: (data: InfoPanelData | null) => void;
  previewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  infoPanel: null,
  setInfoPanel: (data) => set((state) => {
    // Basic structural equality check
    if (JSON.stringify(state.infoPanel) === JSON.stringify(data)) return state;
    return { infoPanel: data };
  }),
  previewMode: false,
  setPreviewMode: (preview) => set({ previewMode: preview }),
}));
