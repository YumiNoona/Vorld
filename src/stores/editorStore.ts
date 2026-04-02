import { create } from "zustand";

export interface InteractionAction {
  id: string;
  type: "highlight" | "glow" | "scale" | "camera_focus" | "audio" | "animation" | "info_panel" | "toggle" | "url";
  config: any;
}

export interface Interaction {
  id: string;
  trigger: "onClick" | "onHover";
  conditions?: { once?: boolean };
  revertOnLeave?: boolean;
  actions: InteractionAction[];
}

export interface StoredInteractions {
  version: number;
  items: Record<string, Interaction[]>;
}

interface EditorState {
  modelPath: string | null;
  selectedMeshes: string[];
  interactions: Record<string, Interaction[]>;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  isDirty: boolean;
  isLoading: boolean;
  previewMode: boolean;
  animations: string[];
  viewerSettings: {
    showControls: boolean;
    autoRotate: boolean;
    shadingMode: "material" | "solid" | "wireframe";
  };

  // Actions
  setModelPath: (path: string | null) => void;
  setSelectedMeshes: (meshNames: string[]) => void;
  toggleMeshSelection: (meshName: string) => void;
  addInteraction: (interaction: Interaction) => void;
  removeInteraction: (interactionId: string) => void;
  updateInteraction: (interactionId: string, updates: Partial<Interaction>) => void;
  addAction: (interactionId: string, action: InteractionAction) => void;
  removeAction: (interactionId: string, actionId: string) => void;
  updateAction: (interactionId: string, actionId: string, config: any) => void;
  reorderAction: (interactionId: string, oldIndex: number, newIndex: number) => void;
  setInteractions: (rawInteractions: any) => void;
  setCamera: (position: [number, number, number], target: [number, number, number]) => void;
  setDirty: (isDirty: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setPreviewMode: (preview: boolean) => void;
  setAnimations: (animations: string[]) => void;
  setViewerSettings: (settings: Partial<{ showControls: boolean, autoRotate: boolean, shadingMode: "material" | "solid" | "wireframe" }>) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  modelPath: null,
  selectedMeshes: [],
  interactions: {},
  camera: {
    position: [0, 2, 5],
    target: [0, 0, 0],
  },
  isDirty: false,
  isLoading: false,
  previewMode: false,
  animations: [],
  viewerSettings: {
    showControls: true,
    autoRotate: false,
    shadingMode: "material"
  },

  setModelPath: (path) => set({ modelPath: path }),
  setSelectedMeshes: (meshNames) => set({ selectedMeshes: meshNames }),
  toggleMeshSelection: (meshName) => set((state) => {
    const isSelected = state.selectedMeshes.includes(meshName);
    return {
      selectedMeshes: isSelected 
        ? state.selectedMeshes.filter(m => m !== meshName)
        : [...state.selectedMeshes, meshName]
    };
  }),
  
  addInteraction: (interaction) => set((state) => {
    if (state.selectedMeshes.length === 0) return state;
    const newInteractions = { ...state.interactions };
    
    state.selectedMeshes.forEach(mesh => {
      const meshInts = newInteractions[mesh] ? [...newInteractions[mesh]] : [];
      // Deep clone interaction so each mesh has indepedent copy
      meshInts.push(JSON.parse(JSON.stringify(interaction)));
      newInteractions[mesh] = meshInts;
    });

    return { interactions: newInteractions, isDirty: true };
  }),

  removeInteraction: (interactionId) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;
    
    state.selectedMeshes.forEach(mesh => {
      if (newInteractions[mesh]) {
        const filtered = newInteractions[mesh].filter(i => i.id !== interactionId);
        if (filtered.length !== newInteractions[mesh].length) {
          newInteractions[mesh] = filtered;
          changed = true;
        }
      }
    });

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),

  updateInteraction: (interactionId, updates) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    state.selectedMeshes.forEach(mesh => {
      if (newInteractions[mesh]) {
        newInteractions[mesh] = newInteractions[mesh].map(i => {
          if (i.id === interactionId) {
            changed = true;
            return { ...i, ...updates };
          }
          return i;
        });
      }
    });

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),

  addAction: (interactionId, action) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    state.selectedMeshes.forEach(mesh => {
      if (newInteractions[mesh]) {
        newInteractions[mesh] = newInteractions[mesh].map(i => {
          if (i.id === interactionId) {
            changed = true;
            return { ...i, actions: [...i.actions, JSON.parse(JSON.stringify(action))] };
          }
          return i;
        });
      }
    });

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),

  removeAction: (interactionId, actionId) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    state.selectedMeshes.forEach(mesh => {
      if (newInteractions[mesh]) {
        newInteractions[mesh] = newInteractions[mesh].map(i => {
          if (i.id === interactionId) {
             changed = true;
             return { ...i, actions: i.actions.filter(a => a.id !== actionId) };
          }
          return i;
        });
      }
    });

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),

  updateAction: (interactionId, actionId, config) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    state.selectedMeshes.forEach(mesh => {
      if (newInteractions[mesh]) {
        newInteractions[mesh] = newInteractions[mesh].map(i => {
          if (i.id === interactionId) {
             changed = true;
             return { 
               ...i, 
               actions: i.actions.map(a => a.id === actionId ? { ...a, config: { ...a.config, ...config } } : a)
             };
          }
          return i;
        });
      }
    });

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),
  
  reorderAction: (interactionId, oldIndex, newIndex) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    state.selectedMeshes.forEach(mesh => {
      if (newInteractions[mesh]) {
        newInteractions[mesh] = newInteractions[mesh].map(i => {
          if (i.id === interactionId) {
            changed = true;
            const newActions = [...i.actions];
            const [movedAction] = newActions.splice(oldIndex, 1);
            newActions.splice(newIndex, 0, movedAction);
            return { ...i, actions: newActions };
          }
          return i;
        });
      }
    });

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),
  
  setInteractions: (rawInteractions) => set(() => {
    // 1. JSON.parse Guard & Validation
    let parsed: any;
    try {
      if (!rawInteractions || typeof rawInteractions !== "string") {
        parsed = rawInteractions ?? {};
      } else if (rawInteractions.trim().startsWith("{") || rawInteractions.trim().startsWith("[")) {
        parsed = JSON.parse(rawInteractions);
      } else {
        console.warn("Invalid interactions format, expected JSON string or object:", typeof rawInteractions);
        parsed = {};
      }
    } catch (e) {
      console.error("Failed to parse interactions JSON:", e);
      parsed = {};
    }

    // Backend empty state
    if (!parsed || Object.keys(parsed).length === 0) {
      return { interactions: {}, isDirty: false };
    }

    // Check version
    if (parsed.version === 2) {
      return { interactions: parsed.items || {}, isDirty: false };
    }

    // Version 1 backward compatibility mapper
    console.log("Migrating V1 interactions to V2...");
    const migratedItems: Record<string, Interaction[]> = {};
    const oldItems = parsed.items ? parsed.items : parsed;
    
    // Safety check if it's an array for some reason
    if (Array.isArray(oldItems)) {
        return { interactions: {}, isDirty: false }; 
    }

    Object.entries(oldItems).forEach(([meshName, ints]: [string, any]) => {
      if (!Array.isArray(ints)) return;
      migratedItems[meshName] = ints.map((oldInt: any) => {
        const id = oldInt.id || Math.random().toString(36).substr(2, 9);
        const type = oldInt.type;
        const config = oldInt.config || {};
        
        let newTrigger: "onClick" | "onHover" = "onClick";
        let newActionType = type;
        let revertOnLeave = false;
        
        if (type === "hover_highlight") {
          newTrigger = "onHover";
          revertOnLeave = true;
          if (config.effect === "highlight" || config.effect === "glow") {
            newActionType = config.effect;
          } else if (config.effect === "scale") {
            newActionType = "scale";
          } else {
             newActionType = "highlight";
          }
        } else if (type === "click_info_panel") {
          newActionType = "info_panel";
        } else if (type === "click_url") {
          newActionType = "url"; 
        } else if (type === "click_animation") {
          newActionType = "animation";
        }

        return {
          id,
          trigger: newTrigger,
          revertOnLeave,
          actions: [{
            id: Math.random().toString(36).substr(2, 9),
            type: newActionType as any,
            config: config
          }]
        };
      });
    });

    return { interactions: migratedItems, isDirty: true };
  }),
  
  setCamera: (position, target) => set({ 
    camera: { position, target },
    isDirty: true 
  }),

  setDirty: (isDirty) => set({ isDirty }),
  setLoading: (isLoading) => set({ isLoading }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setAnimations: (animations) => set({ animations }),
  
  setViewerSettings: (settings) => set((state) => ({ 
    viewerSettings: { ...state.viewerSettings, ...settings },
    isDirty: true
  })),

  reset: () => set({
    modelPath: null,
    selectedMeshes: [],
    interactions: {},
    camera: { position: [0, 2, 5], target: [0, 0, 0] },
    isDirty: false,
    isLoading: false,
    previewMode: false,
    animations: []
  })
}));
