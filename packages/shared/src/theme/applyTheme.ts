import type { ThemePalette } from './types';

export const applyTheme = (theme: ThemePalette): void => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-soft', theme.primarySoft);
  root.style.setProperty('--color-primary-strong', theme.primaryStrong);
  root.style.setProperty('--color-on-primary', theme.textOnPrimary);
  root.style.setProperty('--color-page-bg', theme.pageBg);
  root.style.setProperty('--color-panel-bg', theme.panelBg);
  root.style.setProperty('--color-panel-muted', theme.panelMuted);
  root.style.setProperty('--color-border', theme.border);
  root.style.setProperty('--color-title', theme.title);
  root.style.setProperty('--color-body', theme.body);
  root.style.setProperty('--color-subtle', theme.subtle);
};
