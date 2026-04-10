export const colors = {
  bg: '#F6F7F5',
  surface: '#FFFFFF',
  sand: '#F6F7F5',
  sandDark: '#DDE3D9',
  ink: '#1F2937',
  inkSoft: '#4B5563',
  gold: '#C6A15B',
  goldLight: '#E6D3A3',
  sea: '#2F5D50',
  seaLight: '#3F7A6B',
  forest: '#2F5D50',
  forestSoft: '#3F7A6B',
  leaf: '#7FAF9B',
  cream: '#F6F7F5',
  dark: '#0F1F1A',
  border: '#DDE3D9',
} as const;

export const spacing = {
  section: 'py-24 md:py-32 lg:py-40',
  container: 'px-6 lg:px-12',
} as const;

export const typography = {
  h1: 'text-fluid-h1 leading-tight tracking-tight font-display',
  h2: 'text-fluid-h2 leading-tight font-display',
  h3: 'text-fluid-h3 font-display',
  display: 'font-display tracking-tight',
  body: 'text-base md:text-lg leading-relaxed text-ink-soft',
  eyebrow: 'text-[13px] tracking-[0.25em] uppercase font-medium',
} as const;

export const layout = {
  maxWidth: 'max-w-[1200px]',
  sectionWrap: 'max-w-[1200px] mx-auto px-6 lg:px-12',
} as const;
