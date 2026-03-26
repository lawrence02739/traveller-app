export type ThemeName = 'gold' | 'wine' | 'blue' | 'purple' | 'green' | 'grey' | 'black';

export interface ThemePalette {
  name: ThemeName;
  primary: string;
  primarySoft: string;
  primaryStrong: string;
  textOnPrimary: string;
  pageBg: string;
  panelBg: string;
  panelMuted: string;
  border: string;
  title: string;
  body: string;
  subtle: string;
}
