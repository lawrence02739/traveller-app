import type { ThemeName, ThemePalette } from './types';

export const themes: Record<ThemeName, ThemePalette> = {
  gold: {
    name: 'gold',
    primary: '#D9B65D',
    primarySoft: '#F7EBC6',
    primaryStrong: '#A98326',
    textOnPrimary: '#1B1B1B',
    pageBg: '#F8F5EE',
    panelBg: '#FFFFFF',
    panelMuted: '#F4EFE2',
    border: '#E7DECB',
    title: '#222222',
    body: '#666666',
    subtle: '#A79F91'
  },
  wine: {
    name: 'wine',
    primary: '#8F2D56',
    primarySoft: '#F4D9E4',
    primaryStrong: '#6B1136',
    textOnPrimary: '#FFFFFF',
    pageBg: '#FCF8FA',
    panelBg: '#FFFFFF',
    panelMuted: '#F7EDF1',
    border: '#EBCFDA',
    title: '#2C1420',
    body: '#70515D',
    subtle: '#9D7C88'
  },
  blue: {
    name: 'blue',
    primary: '#2F6FED',
    primarySoft: '#DDE9FF',
    primaryStrong: '#1E4EB2',
    textOnPrimary: '#FFFFFF',
    pageBg: '#F6F9FF',
    panelBg: '#FFFFFF',
    panelMuted: '#EEF4FF',
    border: '#D6E3FF',
    title: '#18243D',
    body: '#5D6C8A',
    subtle: '#8B99B7'
  },
  purple: {
    name: 'purple',
    primary: '#7B61FF',
    primarySoft: '#E6E0FF',
    primaryStrong: '#5A3FC0',
    textOnPrimary: '#FFFFFF',
    pageBg: '#F7F5FF',
    panelBg: '#FFFFFF',
    panelMuted: '#F0ECFF',
    border: '#DDD6FF',
    title: '#1F1A3D',
    body: '#6E6893',
    subtle: '#9A94B8'
  },
  green: {
    name: 'green',
    primary: '#22C55E',
    primarySoft: '#DCFCE7',
    primaryStrong: '#15803D',
    textOnPrimary: '#FFFFFF',
    pageBg: '#F4FFF7',
    panelBg: '#FFFFFF',
    panelMuted: '#E9FBEF',
    border: '#CFF7DA',
    title: '#123524',
    body: '#4B7C63',
    subtle: '#7FAF95'
  },
  grey: {
    name: 'grey',
    primary: '#6B7280',
    primarySoft: '#E5E7EB',
    primaryStrong: '#4B5563',
    textOnPrimary: '#FFFFFF',
    pageBg: '#F9FAFB',
    panelBg: '#FFFFFF',
    panelMuted: '#F3F4F6',
    border: '#E5E7EB',
    title: '#111827',
    body: '#4B5563',
    subtle: '#9CA3AF'
  },
  black: {
    name: 'black',
    primary: '#0F172A',          // deep slate (main dark tone)
    primarySoft: '#1E293B',      // lighter dark shade
    primaryStrong: '#020617',    // near-black
    textOnPrimary: '#FFFFFF',
    pageBg: '#020617',           // full dark background
    panelBg: '#0F172A',          // cards / panels
    panelMuted: '#1E293B',       // subtle sections
    border: '#334155',           // soft border
    title: '#F8FAFC',            // bright text
    body: '#CBD5F5',             // readable secondary text
    subtle: '#64748B'            // muted text
  }
};
