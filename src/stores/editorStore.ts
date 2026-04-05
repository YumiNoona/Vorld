import { create } from "zustand";

export type RenderMode = 'solid' | 'texture' | 'wireframe';
export type CameraMode = 'free' | 'top' | 'side';

export interface InteractionAction {
  id: string;
  type: "highlight" | "glow" | "scale" | "camera_focus" | "audio" | "animation" | "info_panel" | "toggle" | "url";
  config: Record<string, any>;
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
  projectTitle?: string;
}

interface EditorState {
  modelPath: string | null;
  projectTitle: string;
  selectedMeshes: Set<string>;
  primarySelection: string | null;
  interactions: Record<string, Interaction[]>;
  hiddenMeshes: Set<string>;
  previousHidden: Set<string> | null;
  isolatedId: string | null;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  isDirty: boolean;
  isLoading: boolean;
  previewMode: boolean;
  animations: string[];
  
  // High Priority Modes
  renderMode: RenderMode;
  cameraMode: CameraMode;
  
  viewerSettings: {
    showControls: boolean;
    autoRotate: boolean;
  };

  // Actions
  setProjectTitle: (title: string) => void;
  setModelPath: (path: string | null) => void;
  selectMesh: (meshId: string, modifiers?: { ctrl?: boolean, shift?: boolean }) => void;
  setSelectedMeshes: (meshIds: string[]) => void;
  toggleMeshVisibility: (meshId: string) => void;
  toggleIsolate: (meshId: string | null) => void;
  renameMesh: (meshId: string, newName: string) => void;
  
  addInteraction: (interaction: Interaction) => void;
  removeInteraction: (interactionId: string) => void;
  updateInteraction: (interactionId: string, updates: Partial<Interaction>) => void;
  addAction: (interactionId: string, action: InteractionAction) => void;
  removeAction: (interactionId: string, actionId: string) => void;
  updateAction: (interactionId: string, actionId: string, config: Record<string, any>) => void;
  reorderAction: (interactionId: string, oldIndex: number, newIndex: number) => void;
  setInteractions: (rawInteractions: string | StoredInteractions | Record<string, Interaction[]>) => void;
  setCamera: (position: [number, number, number], target: [number, number, number]) => void;
  setDirty: (isDirty: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setPreviewMode: (preview: boolean) => void;
  setAnimations: (animations: string[]) => void;
  
  setRenderMode: (mode: RenderMode) => void;
  setCameraMode: (mode: CameraMode) => void;
  
  setViewerSettings: (settings: Partial<{ showControls: boolean, autoRotate: boolean }>) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  modelPath: null,
  projectTitle: "Untitled Vorld",
  selectedMeshes: new Set(),
  primarySelection: null,
  interactions: {},
  hiddenMeshes: new Set(),
  previousHidden: null,
  isolatedId: null,
  camera: {
    position: [0, 2, 5],
    target: [0, 0, 0],
  },
  isDirty: false,
  isLoading: false,
  previewMode: false,
  animations: [],
  
  renderMode: 'texture',
  cameraMode: 'free',
  
  viewerSettings: {
    showControls: true,
    autoRotate: false,
  },

  setProjectTitle: (projectTitle) => set({ projectTitle, isDirty: true }),
  setModelPath: (path) => set({ modelPath: path }),
  
  setSelectedMeshes: (meshIds) => set({ 
    selectedMeshes: new Set(meshIds),
    primarySelection: meshIds.length > 0 ? meshIds[meshIds.length - 1] : null 
  }),

  selectMesh: (meshId, modifiers) => set((state) => {
    const { ctrl, shift } = modifiers || {};
    const newSelection = new Set(state.selectedMeshes);

    if (ctrl) {
      if (newSelection.has(meshId)) {
        newSelection.delete(meshId);
      } else {
        newSelection.add(meshId);
      }
    } else if (shift) {
      newSelection.add(meshId);
    } else {
      newSelection.clear();
      newSelection.add(meshId);
    }

    // Safeguard 2: Selection Pruning
    state.hiddenMeshes.forEach(id => newSelection.delete(id));

    return {
      selectedMeshes: newSelection,
      primarySelection: newSelection.has(meshId) ? meshId : (newSelection.size > 0 ? Array.from(newSelection).pop()! : null)
    };
  }),

  toggleMeshVisibility: (meshId) => set((state) => {
    const newHidden = new Set(state.hiddenMeshes);
    if (newHidden.has(meshId)) newHidden.delete(meshId);
    else newHidden.add(meshId);

    // Safeguard 2: Selection Pruning on visibility change
    const newSelection = new Set(state.selectedMeshes);
    newHidden.forEach(id => newSelection.delete(id));

    return { hiddenMeshes: newHidden, selectedMeshes: newSelection, isDirty: true };
  }),

  toggleIsolate: (meshId) => set((state) => {
    // Turning off isolation
    if (meshId === null || state.isolatedId === meshId) {
      return {
        isolatedId: null,
        hiddenMeshes: state.previousHidden || new Set(), // Restore state
        previousHidden: null
      };
    }
    
    // Starting isolation: Safeguard 1: Clone, don't reference
    return {
      isolatedId: meshId,
      previousHidden: new Set(state.hiddenMeshes),
      hiddenMeshes: new Set(), // During isolation, we might display only one mesh, but store-wise we clear hidden to handle the logic in Viewport
      isDirty: true
    };
  }),

  renameMesh: (meshId, newName) => set((state) => {
    // In Vorld, interactions are keyed by mesh name/id. 
    // We update the key in the mapping.
    const newInteractions = { ...state.interactions };
    if (newInteractions[meshId]) {
      newInteractions[newName] = newInteractions[meshId];
      delete newInteractions[meshId];
    }
    return { interactions: newInteractions, isDirty: true };
  }),
  
  addInteraction: (interaction) => set((state) => {
    if (state.selectedMeshes.size === 0) return state;
    const newInteractions = { ...state.interactions };
    
    state.selectedMeshes.forEach(meshId => {
      const meshInts = newInteractions[meshId] ? [...newInteractions[meshId]] : [];
      meshInts.push(JSON.parse(JSON.stringify(interaction)));
      newInteractions[meshId] = meshInts;
    });

    return { interactions: newInteractions, isDirty: true };
  }),

  removeInteraction: (interactionId) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;
    
    state.selectedMeshes.forEach(meshId => {
      if (newInteractions[meshId]) {
        const filtered = newInteractions[meshId].filter(i => i.id !== interactionId);
        if (filtered.length !== newInteractions[meshId].length) {
          newInteractions[meshId] = filtered;
          changed = true;
        }
      }
    });

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),

  updateInteraction: (interactionId, updates) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    state.selectedMeshes.forEach(meshId => {
      if (newInteractions[meshId]) {
        newInteractions[meshId] = newInteractions[meshId].map(i => {
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

    state.selectedMeshes.forEach(meshId => {
      if (newInteractions[meshId]) {
        newInteractions[meshId] = newInteractions[meshId].map(i => {
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

    state.selectedMeshes.forEach(meshId => {
      if (newInteractions[meshId]) {
        newInteractions[meshId] = newInteractions[meshId].map(i => {
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

    state.selectedMeshes.forEach(meshId => {
      if (newInteractions[meshId]) {
        newInteractions[meshId] = newInteractions[meshId].map(i => {
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

    state.selectedMeshes.forEach(meshId => {
      if (newInteractions[meshId]) {
        newInteractions[meshId] = newInteractions[meshId].map(i => {
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
    let parsed: any;
    try {
      if (!rawInteractions || typeof rawInteractions !== "string") {
        parsed = rawInteractions ?? {};
      } else if (rawInteractions.trim().startsWith("{") || rawInteractions.trim().startsWith("[")) {
        parsed = JSON.parse(rawInteractions);
      } else {
        parsed = {};
      }
    } catch {
      parsed = {};
    }

    if (!parsed || Object.keys(parsed).length === 0) {
      return { interactions: {}, isDirty: false };
    }

    if (parsed.version === 2) {
      return { 
        interactions: parsed.items || {}, 
        projectTitle: parsed.projectTitle || "Untitled Vorld",
        isDirty: false 
      };
    }

    const migratedItems: Record<string, Interaction[]> = {};
    const oldItems = parsed.items ? parsed.items : parsed;
    
    if (Array.isArray(oldItems)) {
        return { interactions: {}, isDirty: false }; 
    }

    Object.entries(oldItems).forEach(([meshName, ints]: [string, any]) => {
      if (!Array.isArray(ints)) return;
      migratedItems[meshName] = (ints as any[]).map((oldInt: any) => {
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
            id: Math.random().toString(36).substring(2, 11),
            type: newActionType as InteractionAction["type"],
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
  
  setRenderMode: (renderMode) => set({ renderMode, isDirty: true }),
  setCameraMode: (cameraMode) => set({ cameraMode, isDirty: true }),
  
  setViewerSettings: (settings) => set((state) => ({ 
    viewerSettings: { ...state.viewerSettings, ...settings },
    isDirty: true
  })),

  reset: () => set({
    modelPath: null,
    projectTitle: "Untitled Vorld",
    selectedMeshes: new Set(),
    primarySelection: null,
    interactions: {},
    hiddenMeshes: new Set(),
    previousHidden: null,
    isolatedId: null,
    camera: { position: [0, 2, 5], target: [0, 0, 0] },
    isDirty: false,
    isLoading: false,
    previewMode: false,
    animations: [],
    renderMode: 'texture',
    cameraMode: 'free'
  })
}));
