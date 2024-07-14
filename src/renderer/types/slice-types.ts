
export enum SliceTypes {
  P = 0, // (P slice)
  B = 1, // (B slice)
  I = 2, // (I slice)
  SP = 3, // (SP slice)
  SI = 4, // (SI slice)
  // P = 5, // (P slice)
  // B = 6, // (B slice)
  // I = 7, // (I slice)
  // SP = 8, // (SP slice)
  // SI = 9, // (SI slice)
}

export const sliceTypesMap: Record<number, string> = {
  0: 'P', // (P slice)
  1: 'B', // (B slice)
  2: 'I', // (I slice)
  3: 'SP', // (SP slice)
  4: 'SI', // (SI slice)
  5: 'P', // (P slice)
  6: 'B', // (B slice)
  7: 'I', // (I slice)
  8: 'SP', // (SP slice)
  9: 'SI', // (SI slice)
}