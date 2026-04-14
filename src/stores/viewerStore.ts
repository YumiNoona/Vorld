import { create } from "zustand";

interface InfoPanelData {
  title: string;
  description?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  layout?: "top" | "side";
}

export interface LabelPinData {
  id: string;
  meshUuid: string;
  text: string;
  fontSize: number;
  backgroundColor: string;
  position: [number, number, number];
}

interface ViewerState {
  infoPanel: InfoPanelData | null;
  setInfoPanel: (data: InfoPanelData | null) => void;
  previewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
  labels: LabelPinData[];
  addLabel: (label: LabelPinData) => void;
  removeLabel: (id: string) => void;
  clearLabels: () => void;
  environmentPreset: string;
  setEnvironmentPreset: (preset: string) => void;
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
  labels: [],
  addLabel: (label) => set((state) => ({
    labels: [...state.labels.filter(l => l.id !== label.id), label]
  })),
  removeLabel: (id) => set((state) => ({
    labels: state.labels.filter(l => l.id !== id)
  })),
  clearLabels: () => set({ labels: [] }),
  environmentPreset: "city",
  setEnvironmentPreset: (preset) => set({ environmentPreset: preset }),
}));

