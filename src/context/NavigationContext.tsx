import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface NavConfig {
  currentStepId: string;
  canContinue: boolean;
  onContinue?: () => void;
  continueLabel?: string;
}

interface NavigationContextValue {
  config: NavConfig | null;
  setConfig: (config: NavConfig) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<NavConfig | null>(null);
  return (
    <NavigationContext.Provider value={{ config, setConfig }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationConfig(config: NavConfig) {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigationConfig must be used within NavigationProvider');
  const { setConfig } = ctx;
  useEffect(() => {
    setConfig(config);
  }, [config.currentStepId, config.canContinue, config.continueLabel, setConfig]);
  // We need onContinue to be fresh but not trigger re-renders
  useEffect(() => {
    setConfig(config);
  });
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx.config;
}
