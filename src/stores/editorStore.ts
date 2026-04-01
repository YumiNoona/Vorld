import { create } from "zustand";

interface Interaction {
  id: string;
  type: string;
  config: any;
}

interface EditorState {
  selectedMesh: string | null;
  interactions: Record<string, Interaction[]>;
  isDirty: boolean;
  
  // Actions
  setSelectedMesh: (meshName: string | null) => void;
  addInteraction: (meshName: string, interaction: Interaction) => void;
  removeInteraction: (meshName: string, interactionId: string) => void;
  updateInteraction: (meshName: string, interactionId: string, config: any) => void;
  setDirty: (isDirty: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedMesh: null,
  interactions: {},
  isDirty: false,

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

  setDirty: (isDirty) => set({ isDirty })
}));
