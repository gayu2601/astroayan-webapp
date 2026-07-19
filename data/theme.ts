import { Platform } from 'react-native';

export const COLORS = {
  // Backgrounds
  bg:       '#0d0a1a',
  bg2:      '#1a1330',
  bg3:      '#1e1228',
  card:     '#1a0f26',

  // Borders
  border:   'rgba(180,130,255,0.18)',
  border2:  'rgba(180,130,255,0.35)',

  // Gold tones
  gold:     '#c8980f',
  gold2:    '#e8c06a',
  gold3:    '#f5dda0',

  // Violet / purple
  violet:   '#7c3aed',
  violet2:  '#a855f7',
  violet3:  '#d4a1ff',
  violet4:  '#7031D9',
  violetBg: '#2d1f55',

  // Text
  text:     '#f0eaff',
  text2:    '#b8a8d0',
  text3:    '#7a6a90',

  // Semantic
  success:  '#39e8a0',
  danger:   '#e05555',
  warn:     '#d4892a',

  // Tithi — warm gold
  tithiBg:     '#261a00',
  tithiBorder: '#6b4c00',
  tithiText:   '#ffe9a0',
  tithiTitle:  '#ffd255',
  tithiLabel:  '#c8980f',

  // Vaaram — deep indigo
  vaaramBg:     '#0e0d2b',
  vaaramBorder: '#3a3670',
  vaaramText:   '#c8c4ff',
  vaaramTitle:  '#a89fff',
  vaaramLabel:  '#6e6bd4',

  // Natchathiram — rose pink
  natchBg:     '#280d1c',
  natchBorder: '#6b2446',
  natchText:   '#ffbedd',
  natchTitle:  '#ff88be',
  natchLabel:  '#c45d8a',

  // Yogam — teal
  yogamBg:     '#021f14',
  yogamBorder: '#0c5c3b',
  yogamText:   '#a0ffd6',
  yogamTitle:  '#39e8a0',
  yogamLabel:  '#1aaa6e',

  // Karanam — cyan
  karanamBg:     '#011820',
  karanamBorder: '#0a4a62',
  karanamText:   '#a8eeff',
  karanamTitle:  '#52d8f8',
  karanamLabel:  '#2096bb',

  // Maasam — coral
  maasamBg:     '#241008',
  maasamBorder: '#6b2c10',
  maasamText:   '#ffc8a8',
  maasamTitle:  '#ff8c55',
  maasamLabel:  '#bb5523',

  // Sun bar
  sunBg:      '#1a0f00',
  sunBorder:  '#7a4d00',
  sunLabel:   '#c87a10',
  sunTime:    '#ffbb44',
  sunMid:     '#9a7033',

  // Auspicious
  ausBg:     '#051f10',
  ausBorder: '#1a6636',
  ausPill:   '#0a4024',
  ausPillBorder: '#1a8050',
  ausText:   '#5affaa',
  ausTime:   '#3de090',
  ausLabel:  '#2a8c55',

  // Inauspicious
  inausBg:     '#1a0505',
  inausBorder: '#5a1a1a',
  inausLabel:  '#994444',
  rahuBg:      '#3a0a0a',
  rahuBorder:  '#aa3030',
  rahuText:    '#ff8080',
  yamaBg:      '#2a1800',
  yamaBorder:  '#885500',
  yamaText:    '#ffb855',
  guliBg:      '#1a1800',
  guliBorder:  '#776600',
  guliText:    '#ffee55',
  inausTime:   '#ffbbbb',

  // Hora
  horaBg:     '#0a0a1a',
  horaBorder: '#2a2a55',
  horaLabel:  '#5555aa',

  // Year bar
  yearBg:     '#120830',
  yearBorder: '#3a1a70',
  yearLabel:  '#6644bb',
  yearVal:    '#bb88ff',
  yearSub:    '#7755bb',
  disam:      '#cc88ff',
  disamBg:    '#1e0a44',
  disamBorder:'#6633bb',
};

export const FONTS = {
  cinzel:  Platform.select({ web: "'Cinzel', serif",   default: undefined }),
  raleway: Platform.select({ web: "'Raleway', sans-serif", default: undefined }),
  lora:    Platform.select({ web: "'Lora', serif",     default: undefined }),
};

export const RADIUS = { sm: 10, md: 14, lg: 20 };

export const SHADOW = {
  card: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

export function pseudoRand(s: number): number {
  return (((s * 1103515245 + 12345) & 0x7fffffff) % 100) / 100;
}

export function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}