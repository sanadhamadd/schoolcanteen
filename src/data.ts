// All demo data is illustrative and stored locally. Numbers are internally consistent:
// losses = pupils x nutrient per portion x share left.
export type ReasonId = 'taste' | 'texture' | 'cold' | 'portion';
export type Slot = 'main' | 'side' | 'bread' | 'fruit';

export const PUPILS = 412;
export const CLASS_WEEK_BASE = 38;

export const REASONS: Record<ReasonId, { label: string; emoji: string; tile: string; color: string }> = {
  taste: { label: 'Taste', emoji: '😖', tile: '#F9D9CE', color: '#EF7B51' },
  texture: { label: 'Texture', emoji: '🥄', tile: '#FCEBB3', color: '#8B5A3C' },
  cold: { label: 'Too cold', emoji: '🥶', tile: '#D7E8F8', color: '#7DB6E8' },
  portion: { label: 'Too much', emoji: '🍽️', tile: '#E6DDF8', color: '#B9A2EC' },
};
export const REASON_ORDER: ReasonId[] = ['taste', 'texture', 'cold', 'portion'];

export interface Dish {
  id: string; name: string; short: string; slot: Slot;
  protein: number; fibre: number; iron: number; portionG: number; cost: number; art: string;
}
const d = (id: string, name: string, short: string, slot: Slot, protein: number, fibre: number, iron: number, portionG: number, cost: number, art: string): Dish =>
  ({ id, name, short, slot, protein, fibre, iron, portionG, cost, art });

export const DISHES: Record<string, Dish> = {
  lentil: d('lentil', 'Lentil stew', 'lentil stew', 'main', 14, 10, 4.5, 220, 0.62, 'bowl-lentil'),
  chickpea: d('chickpea', 'Chickpea & spinach stew', 'chickpea stew', 'main', 12.5, 9, 3.5, 220, 0.58, 'bowl-chickpea'),
  hake: d('hake', 'Baked hake', 'baked hake', 'main', 20, 1, 1.2, 150, 0.95, 'plate-hake'),
  chicken: d('chicken', 'Chicken & rice', 'chicken & rice', 'main', 22, 2, 1.4, 230, 0.81, 'plate-chicken'),
  pasta: d('pasta', 'Wholemeal pasta bolognese', 'pasta', 'main', 16, 5, 2.5, 250, 0.7, 'plate-pasta'),
  salad: d('salad', 'Green salad', 'salad', 'side', 1.2, 1.9, 0.5, 60, 0.15, ''),
  tomato: d('tomato', 'Tomato salad', 'tomato salad', 'side', 1.0, 1.5, 0.3, 80, 0.18, ''),
  beans: d('beans', 'Green beans', 'green beans', 'side', 1.5, 2.8, 0.8, 90, 0.2, ''),
  bread: d('bread', 'Wholemeal bread', 'bread', 'bread', 3.0, 2.2, 0.8, 30, 0.06, ''),
  orange: d('orange', 'Orange', 'orange', 'fruit', 0.5, 1.2, 0.1, 120, 0.2, ''),
  apple: d('apple', 'Apple', 'apple', 'fruit', 0.3, 2.4, 0.1, 120, 0.2, ''),
  yogurt: d('yogurt', 'Natural yogurt', 'yogurt', 'fruit', 4.0, 0, 0.1, 125, 0.22, ''),
};

export interface Tray { id: string; day: string; short: string; theme: string; items: { dish: string; eaten: number }[] }
export const TRAYS: Tray[] = [
  { id: 'mon', day: 'Monday', short: 'Mon', theme: 'chickpea day', items: [{ dish: 'chickpea', eaten: 35 }, { dish: 'tomato', eaten: 75 }, { dish: 'bread', eaten: 90 }, { dish: 'yogurt', eaten: 100 }] },
  { id: 'tue', day: 'Tuesday', short: 'Tue', theme: 'lentil stew day', items: [{ dish: 'lentil', eaten: 20 }, { dish: 'salad', eaten: 60 }, { dish: 'bread', eaten: 100 }, { dish: 'orange', eaten: 95 }] },
  { id: 'wed', day: 'Wednesday', short: 'Wed', theme: 'fish day', items: [{ dish: 'hake', eaten: 30 }, { dish: 'beans', eaten: 55 }, { dish: 'bread', eaten: 100 }, { dish: 'apple', eaten: 70 }] },
  { id: 'thu', day: 'Thursday', short: 'Thu', theme: 'chicken & rice day', items: [{ dish: 'chicken', eaten: 95 }, { dish: 'salad', eaten: 80 }, { dish: 'bread', eaten: 100 }, { dish: 'orange', eaten: 100 }] },
];

export const WEEK = {
  label: 'Week of 17–21 Nov',
  days: [
    { d: 'Mon', day: 'Monday', dish: 'chickpea', left: 46 },
    { d: 'Tue', day: 'Tuesday', dish: 'lentil', left: 58 },
    { d: 'Wed', day: 'Wednesday', dish: 'hake', left: 39 },
    { d: 'Thu', day: 'Thursday', dish: 'chicken', left: 14 },
    { d: 'Fri', day: 'Friday', dish: 'pasta', left: 9 },
  ],
};

export const REASON_BASE: Record<string, Record<ReasonId, number>> = {
  lentil: { taste: 119, texture: 96, cold: 26, portion: 49 },
  chickpea: { taste: 64, texture: 47, cold: 26, portion: 77 },
  hake: { taste: 62, texture: 25, cold: 44, portion: 37 },
  chicken: { taste: 12, texture: 6, cold: 5, portion: 8 },
  pasta: { taste: 6, texture: 3, cold: 4, portion: 5 },
};

export const QUOTES: Record<string, Record<ReasonId, string>> = {
  lentil: { taste: '“tastes of nothing”', texture: '“too mushy”', cold: '“it was cold”', portion: '“way too much”' },
  chickpea: { taste: '“too strong”', texture: '“slimy spinach”', cold: '“lukewarm”', portion: '“too big a bowl”' },
  hake: { taste: '“tastes fishy”', texture: '“dry and bony”', cold: '“cold when I sit”', portion: '“too much fish”' },
};

export const TREND = [
  { w: '13 Oct', eaten: 61, protein: 13.1 }, { w: '20 Oct', eaten: 63, protein: 12.4 },
  { w: '27 Oct', eaten: 60, protein: 13.6 }, { w: '3 Nov', eaten: 64, protein: 11.9 },
  { w: '10 Nov', eaten: 65, protein: 11.5 }, { w: '17 Nov', eaten: 67, protein: 10.8 },
];

export interface Recipe {
  name: string; note: string; protein: number; fibre: number; iron: number; cost: number;
  allergens: string; why: string; steps: string[]; target: number; art: string;
}
const r = (name: string, note: string, protein: number, fibre: number, iron: number, cost: number, allergens: string, why: string, steps: string[], target: number, art: string): Recipe =>
  ({ name, note, protein, fibre, iron, cost, allergens, why, steps, target, art });

export const RECIPES: Record<string, Record<ReasonId, Recipe>> = {
  lentil: {
    texture: r('Lentil & carrot patties, yogurt dip', 'Same 60 g of lentils · baked crisp', 15, 9, 4.3, 0.68, 'milk, gluten (oats)',
      'Pupils call the stew “too mushy”. Baked patties keep the same lentils but add a crisp bite, and the mild dip also answers the taste complaints.',
      ['Blend cooked lentils with grated carrot and oats', 'Shape and bake at 200 °C for 18 min', 'Serve with a mild yogurt and cumin dip'], 75, 'patties'),
    taste: r('Lentil bolognese with wholemeal pasta', 'Same 60 g of lentils · tomato & sweet paprika', 16, 11, 4.6, 0.66, 'gluten',
      'Pupils find the stew bland. A familiar tomato sauce carries the same lentils, served the way children already like pasta.',
      ['Cook lentils into a tomato and sweet-paprika sofrito', 'Toss with wholemeal pasta', 'Finish with a little grated cheese (optional)'], 72, 'pasta-lentil'),
    cold: r('Hot lentil & pumpkin cream', 'Same 60 g of lentils · served at 65 °C', 14, 10, 4.4, 0.64, 'none of the 14 main allergens',
      'The stew cools in the queue. A smooth cream holds heat longer and is ladled last, straight from the bain-marie.',
      ['Blend lentils with roasted pumpkin', 'Hold at 65 °C in the bain-marie', 'Ladle it last, into pre-warmed bowls'], 66, 'cream'),
    portion: r('Half-ladle stew + lentil hummus & crudités', 'Same 60 g of lentils · two smaller formats', 14, 11, 4.4, 0.65, 'sesame',
      'The bowl looks too big. Two small, finger-food portions carry the same lentils without the full bowl.',
      ['Serve a half ladle of stew', 'Add 40 g of lentil hummus', 'With carrot and cucumber sticks'], 70, 'hummus'),
  },
  chickpea: {
    texture: r('Crispy roasted chickpeas & spinach rice', 'Same 55 g of chickpeas · oven-roasted', 13, 9, 3.4, 0.61, 'none of the 14 main allergens',
      'Pupils dislike the soft spinach. Roasting the chickpeas makes them crunchy, and the spinach disappears into the rice.',
      ['Roast chickpeas with olive oil at 210 °C', 'Stir chopped spinach into the rice', 'Serve the chickpeas on top'], 70, 'roast-chickpeas'),
    taste: r('Mild chickpea & spinach korma', 'Same 55 g of chickpeas · coconut & mild spices', 12.5, 9, 3.6, 0.66, 'none of the 14 main allergens',
      'The stew tastes too strong. A mild, slightly sweet coconut sauce is a flavour children already accept.',
      ['Swap the paprika base for mild korma spices', 'Simmer in light coconut milk', 'Serve with rice'], 71, 'korma'),
    cold: r('Chickpea & spinach soup, served first', 'Same 55 g of chickpeas · held at 65 °C', 12, 8.5, 3.4, 0.58, 'none of the 14 main allergens',
      'It arrives lukewarm. A thick soup served first, from the hot hold, reaches the table warm.',
      ['Blend half the stew into a thick soup', 'Hold at 65 °C', 'Serve it as the first course'], 63, 'soup'),
    portion: r('Mini chickpea falafel bites, spinach dip', 'Same 55 g of chickpeas · five small bites', 13, 9, 3.4, 0.64, 'sesame, milk',
      'The bowl feels too big. Five small baked bites feel like less, with the same chickpeas.',
      ['Blend chickpeas with herbs', 'Bake five small bites per pupil', 'Serve with a spinach and yogurt dip'], 73, 'falafel'),
  },
  hake: {
    taste: r('Hake & potato fishcakes, lemon mayo', 'Same 90 g of hake · mild herbs', 20, 1.5, 1.2, 0.97, 'fish, egg, milk',
      'Pupils say it “tastes fishy”. Mixing hake with potato and herbs softens the flavour without losing protein.',
      ['Flake hake into mashed potato and herbs', 'Shape and bake the fishcakes', 'Serve with a light lemon mayo'], 74, 'fishcakes'),
    texture: r('Crunchy oven-baked hake fingers', 'Same 90 g of hake · oat-crumb coating', 21, 1.6, 1.3, 0.99, 'fish, gluten (oats), egg',
      'Pupils find it dry. A crisp oat crumb keeps the fish moist and familiar.',
      ['Cut hake into fingers', 'Coat in egg and oat crumbs', 'Bake at 220 °C for 12 min'], 78, 'fingers'),
    cold: r('Hake in tomato sauce, from the hot hold', 'Same 90 g of hake · sauce keeps it warm', 20, 1.8, 1.4, 0.96, 'fish',
      'The fish is cold by the time pupils sit. A tomato sauce holds heat and keeps the fillet moist.',
      ['Bake hake in a light tomato sauce', 'Hold at 65 °C', 'Plate it last'], 68, 'fish-tomato'),
    portion: r('Hake tacos (×2) with crunchy slaw', 'Same 90 g of hake · two small tacos', 21, 2.5, 1.5, 0.99, 'fish, gluten',
      'A full fillet looks like too much. Two small tacos split it into a fun, hand-held format.',
      ['Flake baked hake', 'Fill two small wheat tortillas', 'Add a crunchy cabbage slaw'], 72, 'tacos'),
  },
};
export const DEFAULT_FOCUS: Record<string, ReasonId> = { lentil: 'texture', chickpea: 'portion', hake: 'taste' };
export const FIXABLE = ['lentil', 'chickpea', 'hake'];
export const VERIFY_RAMP = [0, 0.79, 0.94, 1];

export const fmt = (n: number, dec = 1) => n.toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const lossKg = (perPortion: number, leftPct: number) => (PUPILS * perPortion * leftPct) / 100 / 1000;
export function trayLeft(t: Tray) {
  let p = 0, f = 0, i = 0;
  t.items.forEach(({ dish, eaten }) => { const x = DISHES[dish], l = (100 - eaten) / 100; p += x.protein * l; f += x.fibre * l; i += x.iron * l; });
  return { protein: p, fibre: f, iron: i };
}
export const eatenColor = (eaten: number) => (eaten < 40 ? 'var(--coral)' : eaten < 80 ? 'var(--yellow)' : 'var(--green)');
export const leftColor = (left: number) => (left >= 50 ? 'var(--coral)' : left >= 25 ? 'var(--yellow)' : 'var(--green)');
