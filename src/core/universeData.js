/**
 * universeData.js
 *
 * Defines the 8 candidate universes for Act 1A — Classical Multiverse Search.
 *
 * Doom Defense Profile requires:
 *   [ MYSTIC COUNTER ]
 *   [ TECHNOLOGICAL COUNTER ]
 *   [ DIMENSIONAL ANCHOR ]
 *
 * A universe is viable ONLY if its team satisfies ALL THREE conditions.
 * This predicate is deterministic and will become the basis for the quantum oracle.
 */

export const DoomConditions = {
  MYSTIC: 'MYSTIC COUNTER',
  TECH: 'TECHNOLOGICAL COUNTER',
  DIMENSIONAL: 'DIMENSIONAL ANCHOR',
};

export const HEROES = {
  THOR: {
    id: 'thor',
    name: 'THOR',
    role: 'DIMENSIONAL ANCHOR',
    attributes: ['DIMENSIONAL'],
    file: '3d%20models/thor_main.glb',
    baseScale: 2.35,
    yOffset: 0,
  },
  IRON_MAN: {
    id: 'iron_man',
    name: 'IRON MAN',
    role: 'TECHNOLOGICAL COUNTER',
    attributes: ['TECHNOLOGY'],
    file: '3d%20models/iron_man_the_avengers.glb',
    baseScale: 2.25,
    yOffset: 0,
  },
  DOCTOR_STRANGE: {
    id: 'doctor_strange',
    name: 'DOCTOR STRANGE',
    role: 'MYSTIC COUNTER',
    attributes: ['MYSTIC'],
    file: '3d%20models/doctor_strange.glb',
    baseScale: 2.3,
    yOffset: 0,
  },
  DOCTOR_STRANGE_SUPREME: {
    id: 'doctor_strange_supreme',
    name: 'STRANGE SUPREME',
    role: 'MYSTIC COUNTER',
    attributes: ['MYSTIC'],
    file: '3d%20models/doctor_strange_supreme.glb',
    baseScale: 2.35,
    yOffset: 0,
  },
  WANDA: {
    id: 'wanda',
    name: 'SCARLET WITCH',
    role: 'MYSTIC COUNTER',
    attributes: ['MYSTIC'],
    file: '3d%20models/wanda.glb',
    baseScale: 2.2,
    yOffset: 0,
  },
  HULK: {
    id: 'hulk',
    name: 'HULK',
    role: 'HEAVY COMBAT',
    attributes: ['COMBAT'],
    file: '3d%20models/hulk_avengers.glb',
    baseScale: 2.85,
    yOffset: 0,
  },
  CAPTAIN_AMERICA: {
    id: 'captain_america',
    name: 'CAPTAIN AMERICA',
    role: 'TACTICAL COMMAND',
    attributes: ['TACTICAL'],
    file: '3d%20models/captain_america_season_4.glb',
    baseScale: 2.25,
    yOffset: 0,
  },
  BLACK_WIDOW: {
    id: 'black_widow',
    name: 'BLACK WIDOW',
    role: 'COVERT INFILTRATION',
    attributes: ['COVERT'],
    file: '3d%20models/black_widow.glb',
    baseScale: 2.15,
    yOffset: 0,
  },
  LOKI: {
    id: 'loki',
    name: 'LOKI',
    role: 'MYSTIC DECEPTION',
    attributes: ['MYSTIC'],
    file: '3d%20models/loki_-_the_chronicler.glb',
    baseScale: 2.3,
    yOffset: 0,
  },
};

/**
 * 8 Candidate Universes with unique team compositions, spatial arrangements,
 * and deterministic defense predicate results.
 */
export const UNIVERSES = [
  {
    id: '01',
    name: 'UNIVERSE 01',
    code: 'EARTH-616.A',
    description: 'A timeline where raw force and tactical discipline spearheaded the counter-offensive.',
    team: [HEROES.THOR, HEROES.HULK, HEROES.CAPTAIN_AMERICA],
    layout: [
      { hero: HEROES.THOR, position: [0, 0, 0.4], rotation: [0, 0, 0], scaleMult: 1.0 },
      { hero: HEROES.HULK, position: [2.2, 0, -0.9], rotation: [0, -0.35, 0], scaleMult: 1.0 },
      { hero: HEROES.CAPTAIN_AMERICA, position: [-1.8, 0, -0.6], rotation: [0, 0.35, 0], scaleMult: 1.0 },
    ],
  },
  {
    id: '02',
    name: 'UNIVERSE 02',
    code: 'EARTH-838.T',
    description: 'A timeline relying on technological armor and stealth infiltration to breach Doomstad.',
    team: [HEROES.THOR, HEROES.IRON_MAN, HEROES.BLACK_WIDOW],
    layout: [
      { hero: HEROES.THOR, position: [0, 0, 0.3], rotation: [0, 0, 0], scaleMult: 1.0 },
      { hero: HEROES.IRON_MAN, position: [1.8, 0, -0.4], rotation: [0, -0.3, 0], scaleMult: 1.0 },
      { hero: HEROES.BLACK_WIDOW, position: [-1.7, 0, -0.3], rotation: [0, 0.3, 0], scaleMult: 1.0 },
    ],
  },
  {
    id: '03',
    name: 'UNIVERSE 03',
    code: 'EARTH-999.M',
    description: 'An alliance of sorcery and brute strength confronting the Doom Engine.',
    team: [HEROES.THOR, HEROES.DOCTOR_STRANGE, HEROES.HULK],
    layout: [
      { hero: HEROES.THOR, position: [0, 0, 0.3], rotation: [0, 0, 0], scaleMult: 1.0 },
      { hero: HEROES.DOCTOR_STRANGE, position: [-1.8, 0.2, -0.3], rotation: [0, 0.3, 0], scaleMult: 1.0 },
      { hero: HEROES.HULK, position: [2.3, 0, -0.9], rotation: [0, -0.35, 0], scaleMult: 1.0 },
    ],
  },
  {
    id: '04',
    name: 'UNIVERSE 04',
    code: 'EARTH-104.R',
    description: 'Chaos magic paired with Stark defense systems, lacking Asgardian dimensional tethering.',
    team: [HEROES.WANDA, HEROES.IRON_MAN, HEROES.CAPTAIN_AMERICA],
    layout: [
      { hero: HEROES.WANDA, position: [0, 0.15, 0.4], rotation: [0, 0, 0], scaleMult: 1.0 },
      { hero: HEROES.IRON_MAN, position: [1.8, 0, -0.4], rotation: [0, -0.3, 0], scaleMult: 1.0 },
      { hero: HEROES.CAPTAIN_AMERICA, position: [-1.8, 0, -0.4], rotation: [0, 0.3, 0], scaleMult: 1.0 },
    ],
  },
  {
    id: '05',
    name: 'UNIVERSE 05',
    code: 'EARTH-712.L',
    description: 'Asgardian royal bloodline combined with black ops tactics.',
    team: [HEROES.THOR, HEROES.LOKI, HEROES.BLACK_WIDOW],
    layout: [
      { hero: HEROES.THOR, position: [0, 0, 0.3], rotation: [0, 0, 0], scaleMult: 1.0 },
      { hero: HEROES.LOKI, position: [1.7, 0, -0.3], rotation: [0, -0.3, 0], scaleMult: 1.0 },
      { hero: HEROES.BLACK_WIDOW, position: [-1.7, 0, -0.3], rotation: [0, 0.3, 0], scaleMult: 1.0 },
    ],
  },
  {
    id: '06',
    name: 'UNIVERSE 06',
    code: 'EARTH-199.S',
    description: 'Supreme mystic intervention accompanied by tactical frontline command.',
    team: [HEROES.THOR, HEROES.DOCTOR_STRANGE_SUPREME, HEROES.CAPTAIN_AMERICA],
    layout: [
      { hero: HEROES.THOR, position: [0, 0, 0.3], rotation: [0, 0, 0], scaleMult: 1.0 },
      { hero: HEROES.DOCTOR_STRANGE_SUPREME, position: [-1.9, 0.3, -0.2], rotation: [0, 0.35, 0], scaleMult: 1.0 },
      { hero: HEROES.CAPTAIN_AMERICA, position: [1.8, 0, -0.4], rotation: [0, -0.3, 0], scaleMult: 1.0 },
    ],
  },
  {
    id: '07',
    name: 'UNIVERSE 07',
    code: 'EARTH-Ω.PRIME',
    description: 'A converged reality marshaling Asgardian dimensional power, dual mystic mastery, and Stark technology.',
    team: [HEROES.THOR, HEROES.DOCTOR_STRANGE, HEROES.WANDA, HEROES.IRON_MAN],
    layout: [
      { hero: HEROES.WANDA, position: [-2.4, 0.05, 0.0], rotation: [0, 0.28, 0], scaleMult: 1.0 },
      { hero: HEROES.DOCTOR_STRANGE, position: [-0.8, 0.1, -0.35], rotation: [0, 0.12, 0], scaleMult: 1.0 },
      { hero: HEROES.THOR, position: [0.8, 0, -0.35], rotation: [0, -0.12, 0], scaleMult: 1.0 },
      { hero: HEROES.IRON_MAN, position: [2.4, 0.05, 0.0], rotation: [0, -0.28, 0], scaleMult: 1.0 },
    ],
  },
  {
    id: '08',
    name: 'UNIVERSE 08',
    code: 'EARTH-404.V',
    description: 'An esoteric coven of supreme magic and covert infiltration, absent technological countermeasures.',
    team: [HEROES.DOCTOR_STRANGE_SUPREME, HEROES.WANDA, HEROES.BLACK_WIDOW],
    layout: [
      { hero: HEROES.DOCTOR_STRANGE_SUPREME, position: [0, 0.3, 0.3], rotation: [0, 0, 0], scaleMult: 1.0 },
      { hero: HEROES.WANDA, position: [1.8, 0.1, -0.4], rotation: [0, -0.3, 0], scaleMult: 1.0 },
      { hero: HEROES.BLACK_WIDOW, position: [-1.7, 0, -0.4], rotation: [0, 0.3, 0], scaleMult: 1.0 },
    ],
  },
];

/**
 * Deterministic predicate function evaluating whether a universe satisfies Doom's defense profile.
 *
 * @param {object} universe
 * @returns {{
 *   mystic: boolean,
 *   technology: boolean,
 *   dimensional: boolean,
 *   viable: boolean,
 *   failureReason: string | null
 * }}
 */
export function evaluateUniverse(universe) {
  const hasMystic = universe.team.some(h => h.attributes.includes('MYSTIC'));
  const hasTech = universe.team.some(h => h.attributes.includes('TECHNOLOGY'));
  const hasDimensional = universe.team.some(h => h.attributes.includes('DIMENSIONAL'));
  const viable = hasMystic && hasTech && hasDimensional;

  let failureReason = null;
  if (!viable) {
    if (!hasMystic && !hasTech) {
      failureReason = 'Insufficient countermeasure coverage. Mystic and technological defenses unaddressed.';
    } else if (!hasMystic) {
      failureReason = 'Arcane vulnerability remains. No mystic countermeasure detected against Doom’s dark arts.';
    } else if (!hasTech) {
      failureReason = 'Technological countermeasure missing. Doom’s automated orbital nanotech will breach defense.';
    } else if (!hasDimensional) {
      failureReason = 'Reality anchor unstable. Team lacks dimensional anchor to withstand multiverse collapse.';
    }
  }

  return {
    mystic: hasMystic,
    technology: hasTech,
    dimensional: hasDimensional,
    viable,
    failureReason,
  };
}
