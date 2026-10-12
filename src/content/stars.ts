/**
 * Approximate properties of well-known stars, compiled from published values (e.g. NASA, ESO
 * and university astronomy references). Values vary between sources by up to tens of percent,
 * particularly for luminous supergiants; they are used for an illustrative H–R diagram.
 */
export interface Star {
  name: string;
  /** effective (surface) temperature, K */
  T: number;
  /** luminosity in solar units */
  L: number;
  cls: string;
  type: 'main sequence' | 'giant' | 'supergiant' | 'white dwarf';
  note: string;
}

export const STARS: Star[] = [
  { name: 'Sun', T: 5772, L: 1, cls: 'G2V', type: 'main sequence', note: 'Our star — a typical main-sequence G dwarf.' },
  { name: 'Sirius A', T: 9940, L: 25, cls: 'A1V', type: 'main sequence', note: 'Brightest star in the night sky.' },
  { name: 'Vega', T: 9600, L: 40, cls: 'A0V', type: 'main sequence', note: 'Historic zero point of the magnitude scale.' },
  { name: 'Altair', T: 7700, L: 10.6, cls: 'A7V', type: 'main sequence', note: 'Rapid rotator.' },
  { name: 'Procyon A', T: 6530, L: 6.9, cls: 'F5IV–V', type: 'main sequence', note: 'Nearby F star.' },
  { name: 'Alpha Centauri A', T: 5790, L: 1.5, cls: 'G2V', type: 'main sequence', note: 'Nearest Sun-like star (visible from Australia).' },
  { name: 'Alpha Centauri B', T: 5260, L: 0.5, cls: 'K1V', type: 'main sequence', note: 'Companion of α Cen A.' },
  { name: 'Proxima Centauri', T: 3040, L: 0.0017, cls: 'M5.5V', type: 'main sequence', note: 'Nearest star to the Sun; a red dwarf.' },
  { name: 'Barnard’s Star', T: 3130, L: 0.0035, cls: 'M4V', type: 'main sequence', note: 'Red dwarf with high proper motion.' },
  { name: 'Spica', T: 25300, L: 20000, cls: 'B1V', type: 'main sequence', note: 'Hot, massive B star.' },
  { name: 'Achernar', T: 15000, L: 3500, cls: 'B6V', type: 'main sequence', note: 'Hot B star in the southern sky.' },
  { name: 'Arcturus', T: 4290, L: 170, cls: 'K1.5III', type: 'giant', note: 'Orange giant.' },
  { name: 'Aldebaran', T: 3900, L: 440, cls: 'K5III', type: 'giant', note: 'Red giant in Taurus.' },
  { name: 'Pollux', T: 4600, L: 43, cls: 'K0III', type: 'giant', note: 'Nearest giant star to the Sun.' },
  { name: 'Canopus', T: 7350, L: 10700, cls: 'A9II', type: 'supergiant', note: 'Second-brightest star; bright giant/supergiant.' },
  { name: 'Betelgeuse', T: 3600, L: 100000, cls: 'M1–2Ia', type: 'supergiant', note: 'Red supergiant; will end as a supernova.' },
  { name: 'Antares', T: 3400, L: 75000, cls: 'M1.5Iab', type: 'supergiant', note: 'Red supergiant in Scorpius.' },
  { name: 'Rigel', T: 12100, L: 120000, cls: 'B8Ia', type: 'supergiant', note: 'Blue supergiant in Orion.' },
  { name: 'Deneb', T: 8500, L: 200000, cls: 'A2Ia', type: 'supergiant', note: 'Very luminous white supergiant.' },
  { name: 'Sirius B', T: 25200, L: 0.056, cls: 'DA2', type: 'white dwarf', note: 'White dwarf companion of Sirius A.' },
  { name: 'Procyon B', T: 7740, L: 0.00049, cls: 'DQZ', type: 'white dwarf', note: 'White dwarf companion of Procyon A.' },
  { name: '40 Eridani B', T: 16500, L: 0.013, cls: 'DA4', type: 'white dwarf', note: 'First white dwarf identified.' },
];

/** Spectral class temperature ranges (approximate, main-sequence). */
export const SPECTRAL_CLASSES = [
  { cls: 'O', range: '> 30 000 K', Tmin: 30000, Tmax: 50000, colour: '#9bb0ff', lines: 'Ionised helium (He II); weak hydrogen.', example: 'ζ Puppis' },
  { cls: 'B', range: '10 000–30 000 K', Tmin: 10000, Tmax: 30000, colour: '#aabfff', lines: 'Neutral helium; hydrogen strengthening.', example: 'Rigel, Spica' },
  { cls: 'A', range: '7 500–10 000 K', Tmin: 7500, Tmax: 10000, colour: '#cad7ff', lines: 'Strongest hydrogen Balmer lines.', example: 'Sirius A, Vega' },
  { cls: 'F', range: '6 000–7 500 K', Tmin: 6000, Tmax: 7500, colour: '#f8f7ff', lines: 'Hydrogen weaker; ionised metals (Ca II) appear.', example: 'Procyon A, Canopus' },
  { cls: 'G', range: '5 200–6 000 K', Tmin: 5200, Tmax: 6000, colour: '#fff4ea', lines: 'Ca II strong; many neutral metal lines.', example: 'Sun, α Cen A' },
  { cls: 'K', range: '3 700–5 200 K', Tmin: 3700, Tmax: 5200, colour: '#ffd2a1', lines: 'Neutral metals strong; weak hydrogen.', example: 'Arcturus, Aldebaran' },
  { cls: 'M', range: '2 400–3 700 K', Tmin: 2400, Tmax: 3700, colour: '#ffcc6f', lines: 'Molecular bands (TiO).', example: 'Betelgeuse, Proxima Centauri' },
];
