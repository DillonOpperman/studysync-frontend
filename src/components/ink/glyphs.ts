/**
 * Bookhand stroke paths for dynamic ink writing.
 * Coordinates sit in a 36-unit em square; width varies per glyph.
 */

export const INK_EM = 36;

export type InkGlyph = {
  width: number;
  strokes: string[];
};

const LETTERS: Record<string, InkGlyph> = {
  ' ': { width: 10, strokes: [] },
  ',': { width: 8, strokes: ['M 3 30 Q 4 34 2 36'] },
  '.': { width: 8, strokes: ['M 3.5 31.5 L 3.6 31.6'] },
  "'": { width: 8, strokes: ['M 3 6 L 2.2 12'] },
  '-': { width: 12, strokes: ['M 2 20 L 10 20'] },
  A: {
    width: 22,
    strokes: ['M 2 32 L 11 6 L 20 32', 'M 6.5 22 L 15.5 22'],
  },
  B: {
    width: 20,
    strokes: [
      'M 4 6 L 4 32',
      'M 4 6 L 13 6 Q 19 6 19 12 Q 19 18 13 18 L 4 18',
      'M 4 18 L 14 18 Q 20 18 20 25 Q 20 32 14 32 L 4 32',
    ],
  },
  C: {
    width: 20,
    strokes: ['M 18 10 Q 16 6 11 6 Q 3 6 3 19 Q 3 32 11 32 Q 16 32 18 28'],
  },
  D: {
    width: 22,
    strokes: ['M 4 6 L 4 32', 'M 4 6 L 12 6 Q 21 8 21 19 Q 21 30 12 32 L 4 32'],
  },
  E: {
    width: 18,
    strokes: ['M 16 6 L 4 6 L 4 32 L 16 32', 'M 4 19 L 13 19'],
  },
  F: {
    width: 18,
    strokes: ['M 4 32 L 4 6 L 16 6', 'M 4 19 L 13 19'],
  },
  G: {
    width: 22,
    strokes: [
      'M 18 10 Q 16 6 11 6 Q 3 6 3 19 Q 3 32 11 32 Q 19 32 19 22 L 12 22',
    ],
  },
  H: {
    width: 22,
    strokes: ['M 4 6 L 4 32', 'M 18 6 L 18 32', 'M 4 19 L 18 19'],
  },
  I: { width: 10, strokes: ['M 5 6 L 5 32'] },
  J: {
    width: 16,
    strokes: ['M 13 6 L 13 26 Q 13 32 7 32 Q 3 32 3 28'],
  },
  K: {
    width: 20,
    strokes: ['M 4 6 L 4 32', 'M 17 6 L 4 20 L 18 32'],
  },
  L: { width: 18, strokes: ['M 4 6 L 4 32 L 16 32'] },
  M: {
    width: 26,
    strokes: ['M 3 32 L 3 6 L 13 24 L 23 6 L 23 32'],
  },
  N: { width: 22, strokes: ['M 4 32 L 4 6 L 18 32 L 18 6'] },
  O: {
    width: 22,
    strokes: ['M 11 6 Q 3 6 3 19 Q 3 32 11 32 Q 19 32 19 19 Q 19 6 11 6'],
  },
  P: {
    width: 20,
    strokes: ['M 4 32 L 4 6', 'M 4 6 L 13 6 Q 19 6 19 13 Q 19 20 13 20 L 4 20'],
  },
  Q: {
    width: 22,
    strokes: [
      'M 11 6 Q 3 6 3 19 Q 3 32 11 32 Q 19 32 19 19 Q 19 6 11 6',
      'M 13 24 L 20 33',
    ],
  },
  R: {
    width: 20,
    strokes: [
      'M 4 32 L 4 6',
      'M 4 6 L 13 6 Q 19 6 19 13 Q 19 20 13 20 L 4 20',
      'M 11 20 L 18 32',
    ],
  },
  S: {
    width: 18,
    strokes: [
      'M 15 10 Q 14 6 9 6 Q 3 6 3 11 Q 3 16 9 18 Q 16 20 16 26 Q 16 32 9 32 Q 3 32 3 27',
    ],
  },
  T: { width: 20, strokes: ['M 2 6 L 18 6', 'M 10 6 L 10 32'] },
  U: {
    width: 22,
    strokes: ['M 4 6 L 4 24 Q 4 32 11 32 Q 18 32 18 24 L 18 6'],
  },
  V: { width: 22, strokes: ['M 2 6 L 11 32 L 20 6'] },
  W: { width: 28, strokes: ['M 2 6 L 8 32 L 14 12 L 20 32 L 26 6'] },
  X: { width: 20, strokes: ['M 3 6 L 17 32', 'M 17 6 L 3 32'] },
  Y: { width: 20, strokes: ['M 3 6 L 10 19 L 17 6', 'M 10 19 L 10 32'] },
  Z: { width: 20, strokes: ['M 3 6 L 17 6 L 3 32 L 17 32'] },
  a: {
    width: 18,
    strokes: [
      'M 14 16 Q 12 14 9 14 Q 4 14 4 23 Q 4 32 9 32 Q 14 32 14 23 L 14 32',
    ],
  },
  b: {
    width: 18,
    strokes: [
      'M 4 4 L 4 32',
      'M 4 16 Q 6 14 10 14 Q 16 14 16 23 Q 16 32 10 32 Q 6 32 4 28',
    ],
  },
  c: {
    width: 16,
    strokes: ['M 14 17 Q 12 14 9 14 Q 3 14 3 23 Q 3 32 9 32 Q 12 32 14 29'],
  },
  d: {
    width: 18,
    strokes: [
      'M 14 4 L 14 32',
      'M 14 16 Q 12 14 8 14 Q 3 14 3 23 Q 3 32 8 32 Q 12 32 14 28',
    ],
  },
  e: {
    width: 16,
    strokes: [
      'M 3 23 L 13 23 Q 13 14 8 14 Q 3 14 3 23 Q 3 32 8 32 Q 12 32 14 29',
    ],
  },
  f: {
    width: 14,
    strokes: ['M 12 8 Q 10 4 7 4 Q 5 4 5 8 L 5 32', 'M 3 16 L 10 16'],
  },
  g: {
    width: 18,
    strokes: [
      'M 14 14 L 14 34 Q 14 40 8 40 Q 3 40 3 36',
      'M 14 16 Q 12 14 8 14 Q 3 14 3 23 Q 3 32 8 32 Q 12 32 14 28',
    ],
  },
  h: {
    width: 18,
    strokes: ['M 4 4 L 4 32', 'M 4 16 Q 6 14 11 14 Q 15 14 15 20 L 15 32'],
  },
  i: {
    width: 10,
    strokes: ['M 5 14 L 5 32', 'M 5 8 L 5.2 8.2'],
  },
  j: {
    width: 12,
    strokes: ['M 8 14 L 8 34 Q 8 40 4 40 Q 2 40 2 37', 'M 8 8 L 8.2 8.2'],
  },
  k: {
    width: 16,
    strokes: ['M 4 4 L 4 32', 'M 14 14 L 4 22 L 15 32'],
  },
  l: { width: 10, strokes: ['M 5 4 L 5 32'] },
  m: {
    width: 24,
    strokes: [
      'M 3 14 L 3 32',
      'M 3 16 Q 5 14 8 14 Q 12 14 12 20 L 12 32',
      'M 12 16 Q 14 14 18 14 Q 22 14 22 20 L 22 32',
    ],
  },
  n: {
    width: 18,
    strokes: ['M 4 14 L 4 32', 'M 4 16 Q 6 14 11 14 Q 15 14 15 20 L 15 32'],
  },
  o: {
    width: 18,
    strokes: ['M 9 14 Q 3 14 3 23 Q 3 32 9 32 Q 15 32 15 23 Q 15 14 9 14'],
  },
  p: {
    width: 18,
    strokes: [
      'M 4 14 L 4 40',
      'M 4 16 Q 6 14 10 14 Q 16 14 16 23 Q 16 32 10 32 Q 6 32 4 28',
    ],
  },
  q: {
    width: 18,
    strokes: [
      'M 14 14 L 14 40',
      'M 14 16 Q 12 14 8 14 Q 3 14 3 23 Q 3 32 8 32 Q 12 32 14 28',
    ],
  },
  r: {
    width: 14,
    strokes: ['M 4 14 L 4 32', 'M 4 16 Q 6 14 12 14'],
  },
  s: {
    width: 14,
    strokes: [
      'M 12 17 Q 11 14 8 14 Q 3 14 3 18 Q 3 21 8 23 Q 13 25 13 28 Q 13 32 8 32 Q 3 32 3 29',
    ],
  },
  t: {
    width: 14,
    strokes: ['M 7 6 L 7 28 Q 7 32 11 32', 'M 3 16 L 12 16'],
  },
  u: {
    width: 18,
    strokes: ['M 4 14 L 4 24 Q 4 32 9 32 Q 14 32 14 24 L 14 14 L 14 32'],
  },
  v: { width: 16, strokes: ['M 2 14 L 8 32 L 14 14'] },
  w: { width: 22, strokes: ['M 2 14 L 6 32 L 11 16 L 16 32 L 20 14'] },
  x: { width: 16, strokes: ['M 3 14 L 13 32', 'M 13 14 L 3 32'] },
  y: {
    width: 16,
    strokes: ['M 2 14 L 8 32', 'M 14 14 L 8 32 Q 6 40 3 40'],
  },
  z: { width: 16, strokes: ['M 3 14 L 13 14 L 3 32 L 13 32'] },
};

export type PlacedStroke = {
  d: string;
  x: number;
  length: number;
};

export function approxPathLength(d: string): number {
  const parts = d.trim().split(/(?=[MLHVCSQZmlhvcsqz])/);
  let x = 0;
  let y = 0;
  let length = 0;

  function lineTo(nx: number, ny: number) {
    length += Math.hypot(nx - x, ny - y);
    x = nx;
    y = ny;
  }

  for (const part of parts) {
    const cmd = part[0];
    const nums = (part.slice(1).match(/-?\d*\.?\d+/g) ?? []).map(Number);
    if (cmd === 'M') {
      x = nums[0] ?? x;
      y = nums[1] ?? y;
    } else if (cmd === 'L') {
      for (let i = 0; i < nums.length; i += 2) {
        lineTo(nums[i] ?? x, nums[i + 1] ?? y);
      }
    } else if (cmd === 'H') {
      lineTo(nums[0] ?? x, y);
    } else if (cmd === 'V') {
      lineTo(x, nums[0] ?? y);
    } else if (cmd === 'Q') {
      for (let i = 0; i < nums.length; i += 4) {
        const x1 = nums[i] ?? x;
        const y1 = nums[i + 1] ?? y;
        const x2 = nums[i + 2] ?? x;
        const y2 = nums[i + 3] ?? y;
        const chord = Math.hypot(x2 - x, y2 - y);
        const control =
          Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1);
        length += (chord + control) / 2;
        x = x2;
        y = y2;
      }
    } else if (cmd === 'C') {
      for (let i = 0; i < nums.length; i += 6) {
        const nx = nums[i + 4] ?? x;
        const ny = nums[i + 5] ?? y;
        lineTo(nx, ny);
        length += 12;
      }
    }
  }
  return Math.max(8, length);
}

export function inkGlyph(char: string): InkGlyph | undefined {
  return LETTERS[char];
}

export function canWriteInInk(text: string): boolean {
  return [...text].every(char => Boolean(inkGlyph(char)));
}

export function layoutInk(text: string): {
  width: number;
  height: number;
  strokes: PlacedStroke[];
} {
  const strokes: PlacedStroke[] = [];
  let x = 0;
  for (const char of text) {
    const glyph = inkGlyph(char);
    if (!glyph) {
      continue;
    }
    for (const d of glyph.strokes) {
      strokes.push({
        d,
        x,
        length: approxPathLength(d),
      });
    }
    x += glyph.width;
  }
  return { width: Math.max(x, 1), height: INK_EM, strokes };
}
