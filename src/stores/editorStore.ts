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
  primarySelectionName: string | null;
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
  selectMesh: (meshId: string, name: string | null, modifiers?: { ctrl?: boolean, shift?: boolean }) => void;
  setSelectedMeshes: (meshIds: string[], names: string[]) => void;
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

const areSetsEqual = (a: Set<string>, b: Set<string>) => {
  if (a.size !== b.size) return false;
  for (const item of a) if (!b.has(item)) return false;
  return true;
};

export const useEditorStore = create<EditorState>((set) => ({
  modelPath: null,
  projectTitle: "Untitled Vorld",
  selectedMeshes: new Set(),
  primarySelection: null,
  primarySelectionName: null,
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
  
  setSelectedMeshes: (meshIds, names) => set((state) => {
    const nextSelection = new Set(meshIds);
    if (areSetsEqual(state.selectedMeshes, nextSelection)) return state;
    return { 
      selectedMeshes: nextSelection,
      primarySelection: meshIds.length > 0 ? meshIds[meshIds.length - 1] : null,
      primarySelectionName: names.length > 0 ? names[names.length - 1] : null 
    };
  }),

  selectMesh: (meshId, name, modifiers) => set((state) => {
    const { ctrl, shift } = modifiers || {};
    const nextSelection = new Set(state.selectedMeshes);

    if (ctrl) {
      if (nextSelection.has(meshId)) {
        nextSelection.delete(meshId);
      } else {
        nextSelection.add(meshId);
      }
    } else if (shift) {
      nextSelection.add(meshId);
    } else {
      nextSelection.clear();
      nextSelection.add(meshId);
    }

    state.hiddenMeshes.forEach(id => nextSelection.delete(id));

    // Stabilize primary selection
    const nextPrimaryId = nextSelection.has(meshId) ? meshId : (nextSelection.size > 0 ? Array.from(nextSelection).pop()! : null);
    const nextPrimaryName = (nextPrimaryId === meshId) ? name : (nextPrimaryId ? null : null); // Fallback for name is tricky, but let's prioritize the provided name if it's the primary

    // IDEMPOTENCY CHECK
    if (areSetsEqual(state.selectedMeshes, nextSelection) && 
        state.primarySelection === nextPrimaryId && 
        state.primarySelectionName === (nextPrimaryName || name)) {
      return state;
    }

    return {
      selectedMeshes: nextSelection,
      primarySelection: nextPrimaryId,
      primarySelectionName: nextPrimaryName || name
    };
  }),

  toggleMeshVisibility: (meshId) => set((state) => {
    const newHidden = new Set(state.hiddenMeshes);
    if (newHidden.has(meshId)) newHidden.delete(meshId);
    else newHidden.add(meshId);

    // Safeguard 2: Selection Pruning on visibility change
    const newSelection = new Set(state.selectedMeshes);
    newHidden.forEach(id => newSelection.delete(id));

    const selectionUnchanged = areSetsEqual(state.selectedMeshes, newSelection);
    const hiddenUnchanged = areSetsEqual(state.hiddenMeshes, newHidden);

    if (selectionUnchanged && hiddenUnchanged) return state;

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
    
    // Store key priority: Name > UUID
    const targetKey = state.primarySelectionName || state.primarySelection;
    if (!targetKey) return state;

    const meshInts = newInteractions[targetKey] ? [...newInteractions[targetKey]] : [];
    // Only add if not already present by ID
    if (!meshInts.find(i => i.id === interaction.id)) {
      meshInts.push(JSON.parse(JSON.stringify(interaction)));
      newInteractions[targetKey] = meshInts;
    }

    return { interactions: newInteractions, isDirty: true };
  }),

  removeInteraction: (interactionId) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;
    
    const targetKey = state.primarySelectionName || state.primarySelection;
    if (targetKey && newInteractions[targetKey]) {
      const filtered = newInteractions[targetKey].filter(i => i.id !== interactionId);
      if (filtered.length !== newInteractions[targetKey].length) {
        newInteractions[targetKey] = filtered;
        changed = true;
      }
    }

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),

  updateInteraction: (interactionId, updates) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    const targetKey = state.primarySelectionName || state.primarySelection;
    if (targetKey && newInteractions[targetKey]) {
      newInteractions[targetKey] = newInteractions[targetKey].map(i => {
        if (i.id === interactionId) {
          changed = true;
          return { ...i, ...updates };
        }
        return i;
      });
    }

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),

  addAction: (interactionId, action) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    const targetKey = state.primarySelectionName || state.primarySelection;
    if (targetKey && newInteractions[targetKey]) {
      newInteractions[targetKey] = newInteractions[targetKey].map(i => {
        if (i.id === interactionId) {
          changed = true;
          return { ...i, actions: [...i.actions, JSON.parse(JSON.stringify(action))] };
        }
        return i;
      });
    }

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),

  removeAction: (interactionId, actionId) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    const targetKey = state.primarySelectionName || state.primarySelection;
    if (targetKey && newInteractions[targetKey]) {
      newInteractions[targetKey] = newInteractions[targetKey].map(i => {
        if (i.id === interactionId) {
           changed = true;
           return { ...i, actions: i.actions.filter(a => a.id !== actionId) };
        }
        return i;
      });
    }

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),

  updateAction: (interactionId, actionId, config) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    const targetKey = state.primarySelectionName || state.primarySelection;
    if (targetKey && newInteractions[targetKey]) {
      newInteractions[targetKey] = newInteractions[targetKey].map(i => {
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

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),
  
  reorderAction: (interactionId, oldIndex, newIndex) => set((state) => {
    const newInteractions = { ...state.interactions };
    let changed = false;

    const targetKey = state.primarySelectionName || state.primarySelection;
    if (targetKey && newInteractions[targetKey]) {
      newInteractions[targetKey] = newInteractions[targetKey].map(i => {
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

    return changed ? { interactions: newInteractions, isDirty: true } : state;
  }),
  
  setInteractions: (rawInteractions) => set((state) => {
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

    if (!parsed || (Object.keys(parsed).length === 0 && Object.keys(state.interactions).length === 0)) {
      return state;
    }

    let finalInteractions = {};
    if (parsed.version === 2) {
      finalInteractions = parsed.items || {};
    } else {
      // Migration logic ...
      const migratedItems: Record<string, Interaction[]> = {};
      const oldItems = parsed.items ? parsed.items : parsed;
      if (!Array.isArray(oldItems)) {
        Object.entries(oldItems).forEach(([meshName, ints]: [string, any]) => {
          if (!Array.isArray(ints)) return;
          migratedItems[meshName] = (ints as any[]).map((oldInt: any) => {
            const id = oldInt.id || Math.random().toString(36).substr(2, 9);
            const type = oldInt.type;
            const config = oldInt.config || {};
            let newTrigger: "onClick" | "onHover" = (type?.startsWith("hover") ? "onHover" : "onClick");
            return {
              id,
              trigger: newTrigger,
              revertOnLeave: true,
              actions: [{
                id: Math.random().toString(36).substring(2, 11),
                type: (type?.replace("click_", "").replace("hover_", "") || "highlight") as InteractionAction["type"],
                config: config
              }]
            };
          });
        });
      }
      finalInteractions = migratedItems;
    }

    // IDEMPOTENCY CHECK
    if (JSON.stringify(state.interactions) === JSON.stringify(finalInteractions)) {
      return state;
    }

    return { 
      interactions: finalInteractions, 
      isDirty: false 
    };
  }),
  
  setCamera: (position, target) => set((state) => {
    if (JSON.stringify(state.camera.position) === JSON.stringify(position) &&
        JSON.stringify(state.camera.target) === JSON.stringify(target)) return state;
    return { camera: { position, target }, isDirty: true };
  }),

  setDirty: (isDirty) => set((state) => (state.isDirty === isDirty ? state : { isDirty })),
  setLoading: (isLoading) => set((state) => (state.isLoading === isLoading ? state : { isLoading })),
  setPreviewMode: (previewMode) => set((state) => (state.previewMode === previewMode ? state : { previewMode })),
  setAnimations: (animations) => set((state) => {
    if (JSON.stringify(state.animations) === JSON.stringify(animations)) return state;
    return { animations };
  }),
  
  setRenderMode: (renderMode) => set((state) => (state.renderMode === renderMode ? state : { renderMode, isDirty: true })),
  setCameraMode: (cameraMode) => set((state) => (state.cameraMode === cameraMode ? state : { cameraMode, isDirty: true })),
  
  setViewerSettings: (settings) => set((state) => {
     const next = { ...state.viewerSettings, ...settings };
     if (JSON.stringify(state.viewerSettings) === JSON.stringify(next)) return state;
     return { viewerSettings: next, isDirty: true };
  }),

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
