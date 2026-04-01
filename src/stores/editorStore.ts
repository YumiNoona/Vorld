import { create } from "zustand";

interface Interaction {
  id: string;
  type: string;
  config: any;
}

interface EditorState {
  modelPath: string | null;
  selectedMesh: string | null;
  interactions: Record<string, Interaction[]>;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  isDirty: boolean;
  isLoading: boolean;
  
  // Actions
  setModelPath: (path: string | null) => void;
  setSelectedMesh: (meshName: string | null) => void;
  addInteraction: (meshName: string, interaction: Interaction) => void;
  removeInteraction: (meshName: string, interactionId: string) => void;
  updateInteraction: (meshName: string, interactionId: string, config: any) => void;
  setInteractions: (interactions: Record<string, Interaction[]>) => void;
  setCamera: (position: [number, number, number], target: [number, number, number]) => void;
  setDirty: (isDirty: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  modelPath: null,
  selectedMesh: null,
  interactions: {},
  camera: {
    position: [0, 2, 5],
    target: [0, 0, 0],
  },
  isDirty: false,
  isLoading: false,

  setModelPath: (path) => set({ modelPath: path }),
  setSelectedMesh: (meshName) => set({ selectedMesh: meshName }),
  
  addInteraction: (meshName, interaction) => set((state) => {
    const meshInteractions = state.interactions[meshName] || [];
    return {
      interactions: {
        ...state.interactions,
        [meshName]: [...meshInteractions, interaction]
      },
      isDirty: true
    };
  }),

  removeInteraction: (meshName, interactionId) => set((state) => {
    const meshInteractions = state.interactions[meshName] || [];
    return {
      interactions: {
        ...state.interactions,
        [meshName]: meshInteractions.filter(i => i.id !== interactionId)
      },
      isDirty: true
    };
  }),

  updateInteraction: (meshName, interactionId, config) => set((state) => {
    const meshInteractions = state.interactions[meshName] || [];
    return {
      interactions: {
        ...state.interactions,
        [meshName]: meshInteractions.map(i => 
          i.id === interactionId ? { ...i, config: { ...i.config, ...config } } : i
        )
      },
      isDirty: true
    };
  }),
  
  setInteractions: (interactions) => set({ interactions, isDirty: false }),
  
  setCamera: (position, target) => set({ 
    camera: { position, target },
    isDirty: true 
  }),

  setDirty: (isDirty) => set({ isDirty }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({
    modelPath: null,
    selectedMesh: null,
    interactions: {},
    camera: { position: [0, 2, 5], target: [0, 0, 0] },
    isDirty: false,
    isLoading: false
  })
}));
