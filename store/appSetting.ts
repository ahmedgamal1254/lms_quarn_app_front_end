import { create } from 'zustand';

interface AppSettings {
  app_name?: string;
  app_description?: string;
  logo?: string;
  favicon?: string;
  support_email?: string;
  support_phone?: string;
  [key: string]: any;
}

interface AppSettingsState {
  app_settings: AppSettings | null;
  setSettings: (settings: AppSettings) => void;
  clearSettings: () => void;
}

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  app_settings: null,
  setSettings: (app_settings) => set({ app_settings }),
  clearSettings: () => set({ app_settings: null }),
}));
