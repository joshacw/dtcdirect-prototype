import { createContext, useContext, useRef, useCallback, useSyncExternalStore, type ReactNode } from 'react';

interface NavConfig {
  currentStepId: string;
  canContinue: boolean;
  onContinue?: () => void;
  continueLabel?: string;
}

interface NavigationStore {
  getConfig: () => NavConfig | null;
  setConfig: (config: NavConfig) => void;
  subscribe: (cb: () => void) => () => void;
}

function createNavigationStore(): NavigationStore {
  let config: NavConfig | null = null;
  const listeners = new Set<() => void>();

  return {
    getConfig: () => config,
    setConfig: (next: NavConfig) => {
      // Only notify if something actually changed
      if (
        config?.currentStepId === next.currentStepId &&
        config?.canContinue === next.canContinue &&
        config?.continueLabel === next.continueLabel &&
        config?.onContinue === next.onContinue
      ) {
        return;
      }
      config = next;
      listeners.forEach(cb => cb());
    },
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

const NavigationContext = createContext<NavigationStore | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<NavigationStore>(undefined);
  if (!storeRef.current) {
    storeRef.current = createNavigationStore();
  }

  return (
    <NavigationContext.Provider value={storeRef.current}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Called by each step to declare its navigation config.
 * Uses a ref to avoid triggering re-renders — writes directly
 * to the store on every render (synchronously, not in an effect).
 */
export function useNavigationConfig(config: NavConfig) {
  const store = useContext(NavigationContext);
  if (!store) throw new Error('useNavigationConfig must be used within NavigationProvider');

  // Use a ref to hold the latest onContinue so the store always
  // has a fresh callback without causing re-render loops
  const onContinueRef = useRef(config.onContinue);
  onContinueRef.current = config.onContinue;

  const stableOnContinue = useCallback(() => {
    onContinueRef.current?.();
  }, []);

  // Write to store — the store deduplicates by value
  store.setConfig({
    currentStepId: config.currentStepId,
    canContinue: config.canContinue,
    continueLabel: config.continueLabel,
    onContinue: config.onContinue ? stableOnContinue : undefined,
  });
}

/**
 * Called by SurveyLayout to read the current nav config.
 * Subscribes to the store so it re-renders only when config changes.
 */
export function useNavigation(): NavConfig | null {
  const store = useContext(NavigationContext);
  if (!store) throw new Error('useNavigation must be used within NavigationProvider');
  return useSyncExternalStore(store.subscribe, store.getConfig);
}
