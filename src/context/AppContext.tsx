// Global App State Context

import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppStep, WatchFaceConfig, GeneratedCode, ElementImage, WatchFaceElement } from '@/types';

// Initial state
const initialState: AppState = {
  currentStep: 'upload',
  backgroundImage: null,
  backgroundFile: null,
  fullDesignImage: null,
  fullDesignFile: null,
  watchFaceConfig: null,
  elementImages: [],
  generatedCode: null,
  zpkBlob: null,
  githubUrl: null,
  qrCodeDataUrl: null,
  isLoading: false,
  loadingMessage: '',
  error: null,
  githubToken: localStorage.getItem('githubToken') || '',
  githubRepo: localStorage.getItem('githubRepo') || 'AI-ERP-ITE/Watch-Faces',
};

// Action types
type Action =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SET_BACKGROUND_IMAGE'; payload: string | null }
  | { type: 'SET_BACKGROUND_FILE'; payload: File | null }
  | { type: 'SET_FULL_DESIGN_IMAGE'; payload: string | null }
  | { type: 'SET_FULL_DESIGN_FILE'; payload: File | null }
  | { type: 'SET_WATCH_FACE_CONFIG'; payload: WatchFaceConfig | null }
  | { type: 'SET_ELEMENT_IMAGES'; payload: ElementImage[] }
  | { type: 'SET_GENERATED_CODE'; payload: GeneratedCode | null }
  | { type: 'SET_ZPK_BLOB'; payload: Blob | null }
  | { type: 'SET_GITHUB_URL'; payload: string | null }
  | { type: 'SET_QR_CODE'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MESSAGE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GITHUB_TOKEN'; payload: string }
  | { type: 'SET_GITHUB_REPO'; payload: string }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; changes: Partial<WatchFaceElement> } }
  | { type: 'UPDATE_ELEMENTS_BATCH'; payload: Array<{ id: string; changes: Partial<WatchFaceElement> }> }
  | { type: 'RESET' };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_BACKGROUND_IMAGE':
      return { ...state, backgroundImage: action.payload };
    case 'SET_BACKGROUND_FILE':
      return { ...state, backgroundFile: action.payload };
    case 'SET_FULL_DESIGN_IMAGE':
      return { ...state, fullDesignImage: action.payload };
    case 'SET_FULL_DESIGN_FILE':
      return { ...state, fullDesignFile: action.payload };
    case 'SET_WATCH_FACE_CONFIG':
      return { ...state, watchFaceConfig: action.payload };
    case 'SET_ELEMENT_IMAGES':
      return { ...state, elementImages: action.payload };
    case 'SET_GENERATED_CODE':
      return { ...state, generatedCode: action.payload };
    case 'SET_ZPK_BLOB':
      return { ...state, zpkBlob: action.payload };
    case 'SET_GITHUB_URL':
      return { ...state, githubUrl: action.payload };
    case 'SET_QR_CODE':
      return { ...state, qrCodeDataUrl: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LOADING_MESSAGE':
      return { ...state, loadingMessage: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_GITHUB_TOKEN':
      localStorage.setItem('githubToken', action.payload);
      return { ...state, githubToken: action.payload };
    case 'SET_GITHUB_REPO':
      localStorage.setItem('githubRepo', action.payload);
      return { ...state, githubRepo: action.payload };
    case 'UPDATE_ELEMENT': {
      if (!state.watchFaceConfig) return state;
      const updatedElements = state.watchFaceConfig.elements.map(el =>
        el.id === action.payload.id ? { ...el, ...action.payload.changes } : el
      );
      return {
        ...state,
        watchFaceConfig: { ...state.watchFaceConfig, elements: updatedElements },
      };
    }
    case 'UPDATE_ELEMENTS_BATCH': {
      if (!state.watchFaceConfig) return state;
      const changeMap = new Map(action.payload.map(p => [p.id, p.changes]));
      const batchUpdated = state.watchFaceConfig.elements.map(el => {
        const changes = changeMap.get(el.id);
        return changes ? { ...el, ...changes } : el;
      });
      return {
        ...state,
        watchFaceConfig: { ...state.watchFaceConfig, elements: batchUpdated },
      };
    }
    case 'RESET':
      return {
        ...initialState,
        githubToken: state.githubToken,
        githubRepo: state.githubRepo,
      };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Action helpers
export const actions = {
  setStep: (step: AppStep) => ({ type: 'SET_STEP' as const, payload: step }),
  setBackgroundImage: (image: string | null) => ({ type: 'SET_BACKGROUND_IMAGE' as const, payload: image }),
  setBackgroundFile: (file: File | null) => ({ type: 'SET_BACKGROUND_FILE' as const, payload: file }),
  setFullDesignImage: (image: string | null) => ({ type: 'SET_FULL_DESIGN_IMAGE' as const, payload: image }),
  setFullDesignFile: (file: File | null) => ({ type: 'SET_FULL_DESIGN_FILE' as const, payload: file }),
  setWatchFaceConfig: (config: WatchFaceConfig | null) => ({ type: 'SET_WATCH_FACE_CONFIG' as const, payload: config }),
  setElementImages: (images: ElementImage[]) => ({ type: 'SET_ELEMENT_IMAGES' as const, payload: images }),
  setGeneratedCode: (code: GeneratedCode | null) => ({ type: 'SET_GENERATED_CODE' as const, payload: code }),
  setZpkBlob: (blob: Blob | null) => ({ type: 'SET_ZPK_BLOB' as const, payload: blob }),
  setGithubUrl: (url: string | null) => ({ type: 'SET_GITHUB_URL' as const, payload: url }),
  setQrCode: (dataUrl: string | null) => ({ type: 'SET_QR_CODE' as const, payload: dataUrl }),
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING' as const, payload: loading }),
  setLoadingMessage: (message: string) => ({ type: 'SET_LOADING_MESSAGE' as const, payload: message }),
  setError: (error: string | null) => ({ type: 'SET_ERROR' as const, payload: error }),
  setGithubToken: (token: string) => ({ type: 'SET_GITHUB_TOKEN' as const, payload: token }),
  setGithubRepo: (repo: string) => ({ type: 'SET_GITHUB_REPO' as const, payload: repo }),
  updateElement: (id: string, changes: Partial<WatchFaceElement>) => ({ type: 'UPDATE_ELEMENT' as const, payload: { id, changes } }),
  updateElementsBatch: (updates: Array<{ id: string; changes: Partial<WatchFaceElement> }>) => ({ type: 'UPDATE_ELEMENTS_BATCH' as const, payload: updates }),
  reset: () => ({ type: 'RESET' as const }),
};
