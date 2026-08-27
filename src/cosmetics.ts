export type CosmeticId = 'stock' | 'ash' | 'goldleaf' | 'wet' | 'blush' | 'midnight' | 'ruby' | 'babe'

export type Look = {
  id: CosmeticId
  name: string
  how: string
  pal: Record<string, string>
  smoke: [string, string, string]
  wings: [string, string, string, string]
  cig: [string, string]
  glasses: boolean
}

export const LOOKS: Look[] = [
  {
    id: 'stock',
    name: 'Stock Shell',
    how: 'The look you crawled in with.',
    pal: {
      a: '#2a1a0c',
      A: '#4a3020',
      H: '#6b3a18',
      h: '#9a5a28',
      D: '#3a1e0c',
      E: '#f0e8c8',
      o: '#111008',
      C: '#efe4c8',
      F: '#ff6a20',
      B: '#1a2418',
      b: '#314838',
      P: '#4a3020',
      L: '#2a1a10',
      S: '#140e08',
      W: '#5a3010',
      m: '#8a6828',
      M: '#f0d878',
      v: '#fff4c0',
    },
    smoke: ['#efe8dc', '#9a968c', '#5a5854'],
    wings: ['#fff4c0', '#f0d878', '#c8a050', '#5a3010'],
    cig: ['#ffee66', '#ff6a20'],
    glasses: false,
  },
  {
    id: 'ash',
    name: 'Ash',
    how: 'Talk to Nix in the Gutters.',
    pal: {
      a: '#1a1a18',
      A: '#3a3a36',
      H: '#5a5a52',
      h: '#8a8a80',
      D: '#2a2a26',
      E: '#e8e4d8',
      o: '#080808',
      C: '#e8e0d0',
      F: '#ff9040',
      B: '#1c1c1a',
      b: '#3a3c38',
      P: '#3a3a36',
      L: '#1a1a18',
      S: '#0c0c0a',
      W: '#4a4a44',
      m: '#7a7a70',
      M: '#d0d0c4',
      v: '#f4f4ea',
    },
    smoke: ['#d8d4cc', '#6a6864', '#3a3834'],
    wings: ['#f4f0e4', '#c8c4b8', '#7a7870', '#3a3830'],
    cig: ['#ffe080', '#ff7020'],
    glasses: false,
  },
  {
    id: 'goldleaf',
    name: 'Goldleaf',
    how: 'Talk to Gilt in the Filter.',
    pal: {
      a: '#3a2808',
      A: '#8a5a10',
      H: '#c49020',
      h: '#f0c040',
      D: '#5a3a08',
      E: '#fff4c8',
      o: '#201000',
      C: '#fff0c0',
      F: '#ff9a20',
      B: '#3a2a10',
      b: '#6a4a18',
      P: '#8a5a10',
      L: '#4a3008',
      S: '#201408',
      W: '#a07018',
      m: '#e0b040',
      M: '#ffe080',
      v: '#fff8d0',
    },
    smoke: ['#fff0c0', '#c4a060', '#6a4820'],
    wings: ['#fff8d0', '#ffe080', '#e0a030', '#8a5010'],
    cig: ['#fff080', '#ff8010'],
    glasses: false,
  },
  {
    id: 'wet',
    name: 'Wet',
    how: 'Talk to Brine in the Overflow.',
    pal: {
      a: '#0c2424',
      A: '#1a4848',
      H: '#2a6a68',
      h: '#4aa09a',
      D: '#0a3030',
      E: '#d8fff8',
      o: '#041010',
      C: '#e0fff8',
      F: '#40f0d0',
      B: '#0e2a28',
      b: '#1a4a46',
      P: '#1a4040',
      L: '#0c2828',
      S: '#061414',
      W: '#1a5854',
      m: '#3aa8a0',
      M: '#80f0e0',
      v: '#d8fff8',
    },
    smoke: ['#d8fff4', '#70b0a8', '#2a4a48'],
    wings: ['#d8fff8', '#80f0e0', '#3aa8a0', '#145048'],
    cig: ['#a0ffe8', '#20d0b0'],
    glasses: false,
  },
  {
    id: 'blush',
    name: 'Blush',
    how: 'Pick every crumb in the Gutters.',
    pal: {
      a: '#3a1020',
      A: '#6a2040',
      H: '#a03860',
      h: '#e07098',
      D: '#4a1828',
      E: '#ffe8f0',
      o: '#180810',
      C: '#ffe4ec',
      F: '#ff6a90',
      B: '#2a1420',
      b: '#4a2838',
      P: '#6a2040',
      L: '#3a1020',
      S: '#180810',
      W: '#8a2850',
      m: '#e07098',
      M: '#ffb0c8',
      v: '#ffe8f0',
    },
    smoke: ['#ffe8f0', '#d080a0', '#5a2838'],
    wings: ['#ffe8f0', '#ffb0c8', '#e07098', '#6a2040'],
    cig: ['#ffd0e0', '#ff5080'],
    glasses: false,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    how: 'Find the Filter stash above the beds.',
    pal: {
      a: '#100818',
      A: '#241038',
      H: '#3a2060',
      h: '#6a48a0',
      D: '#180c28',
      E: '#e8dcff',
      o: '#080410',
      C: '#ece0ff',
      F: '#c080ff',
      B: '#140c20',
      b: '#281848',
      P: '#241038',
      L: '#100818',
      S: '#080410',
      W: '#2a1848',
      m: '#6a48a0',
      M: '#b090e0',
      v: '#ece0ff',
    },
    smoke: ['#ece0ff', '#8060b0', '#2a1840'],
    wings: ['#ece0ff', '#b090e0', '#6a48a0', '#241038'],
    cig: ['#e0c0ff', '#a040ff'],
    glasses: true,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    how: 'Talk to Vex at the top of the Overflow shaft.',
    pal: {
      a: '#280808',
      A: '#5a1010',
      H: '#8a1818',
      h: '#d04040',
      D: '#3a0c0c',
      E: '#ffe0d8',
      o: '#100404',
      C: '#ffe8e0',
      F: '#ff4040',
      B: '#201010',
      b: '#401818',
      P: '#5a1010',
      L: '#280808',
      S: '#100404',
      W: '#6a1414',
      m: '#d04040',
      M: '#ff8080',
      v: '#ffe0d8',
    },
    smoke: ['#ffe0d8', '#c06060', '#401818'],
    wings: ['#ffe0d8', '#ff8080', '#d04040', '#5a1010'],
    cig: ['#ffc0b0', '#ff3030'],
    glasses: true,
  },
  {
    id: 'babe',
    name: 'Babe',
    how: 'She was waiting at the top of the line.',
    pal: {
      a: '#4a2030',
      A: '#8a3858',
      H: '#c86888',
      h: '#f098b0',
      D: '#5a2838',
      E: '#fff0f4',
      o: '#180810',
      C: '#ffe8ee',
      F: '#ff6a90',
      B: '#3a1828',
      b: '#6a3048',
      P: '#c05070',
      L: '#8a2848',
      S: '#3a1020',
      W: '#a03858',
      m: '#ffb0c8',
      M: '#ffe0ea',
      v: '#fff4f8',
    },
    smoke: ['#ffe8f0', '#e090b0', '#5a2838'],
    wings: ['#fff0f4', '#ffb0c8', '#e07098', '#6a2040'],
    cig: ['#ffd0e0', '#ff5080'],
    glasses: false,
  },
]

const KEY = 'pipe-roach-looks'

export type LookSave = {
  unlocked: CosmeticId[]
  equipped: CosmeticId
}

export function lookById(id: CosmeticId) {
  return LOOKS.find((l) => l.id === id) ?? LOOKS[0]
}

export function loadLooks(): LookSave {
  const fallback: LookSave = { unlocked: ['stock'], equipped: 'stock' }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const data = JSON.parse(raw) as LookSave
    if (!Array.isArray(data.unlocked) || !data.unlocked.includes('stock')) data.unlocked = ['stock', ...(data.unlocked ?? [])]
    if (!LOOKS.some((l) => l.id === data.equipped)) data.equipped = 'stock'
    return data
  } catch {
    return fallback
  }
}

export function saveLooks(save: LookSave) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save))
  } catch {
    /* ignore quota / private mode */
  }
}

export function unlockLook(save: LookSave, id: CosmeticId) {
  if (save.unlocked.includes(id)) return false
  save.unlocked.push(id)
  saveLooks(save)
  return true
}
