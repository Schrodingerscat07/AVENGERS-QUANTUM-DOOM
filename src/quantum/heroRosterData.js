/**
 * heroRosterData.js
 *
 * 24 Multiverse Heroes mapped to real GLB models in "3d models/".
 * Used for Act 1 Cross-Reality Quantum Search.
 *
 * Encodings:
 * - 3 slots: Slot 1 (Tactical/Lead), Slot 2 (Specialist), Slot 3 (Force/Anchor)
 * - 5 bits per slot -> 15 logical qubits total.
 * - 2^15 = 32,768 computational basis states.
 * - 24 usable hero IDs (0-23). IDs 24-31 are invalid/padding.
 * - Valid ordered combinations without duplicates = 24 * 23 * 22 = 12,144 teams.
 */

export const HERO_ROSTER = [
  {
    id: 0,
    name: 'THOR',
    file: '3d%20models/thor_main.glb',
    originReality: 'EARTH-118',
    roleTag: 'FORCE / ANCHOR',
    attributes: { mystic: false, technology: false, dimensional: true },
    power: 94,
    resilience: 92,
    tactical: 70,
    baseScale: 2.35,
    yOffset: 0,
    bio: 'Wielder of Stormbreaker, capable of channeling Bifrost dimensional energy.',
  },
  {
    id: 1,
    name: 'IRON MAN',
    file: '3d%20models/iron_man_the_avengers.glb',
    originReality: 'EARTH-902',
    roleTag: 'TACTICAL / SYSTEMS',
    attributes: { mystic: false, technology: true, dimensional: false },
    power: 78,
    resilience: 72,
    tactical: 92,
    baseScale: 2.25,
    yOffset: 0,
    bio: 'Genius-level engineer with nano-computational systems capable of breaching tech networks.',
  },
  {
    id: 2,
    name: 'DOCTOR STRANGE',
    file: '3d%20models/doctor_strange.glb',
    originReality: 'EARTH-417',
    roleTag: 'MYSTIC SPECIALIST',
    attributes: { mystic: true, technology: false, dimensional: true },
    power: 84,
    resilience: 71,
    tactical: 85,
    baseScale: 2.3,
    yOffset: 0,
    bio: 'Master of the Mystic Arts and guardian of reality fabric.',
  },
  {
    id: 3,
    name: 'STRANGE SUPREME',
    file: '3d%20models/doctor_strange_supreme.glb',
    originReality: 'EARTH-531',
    roleTag: 'MYSTIC TITAN',
    attributes: { mystic: true, technology: false, dimensional: true },
    power: 96,
    resilience: 88,
    tactical: 88,
    baseScale: 2.4,
    yOffset: 0,
    bio: 'Sorcerer who consumed arcane beings to bend cosmic law.',
  },
  {
    id: 4,
    name: 'SCARLET WITCH',
    file: '3d%20models/wanda.glb',
    originReality: 'EARTH-828',
    roleTag: 'CHAOS SPECIALIST',
    attributes: { mystic: true, technology: false, dimensional: true },
    power: 95,
    resilience: 75,
    tactical: 72,
    baseScale: 2.25,
    yOffset: 0,
    bio: 'Channeler of spontaneous Chaos Magic capable of altering probability.',
  },
  {
    id: 5,
    name: 'CAPTAIN AMERICA',
    file: '3d%20models/captain_america_season_4.glb',
    originReality: 'EARTH-199',
    roleTag: 'TACTICAL LEAD',
    attributes: { mystic: false, technology: false, dimensional: false },
    power: 65,
    resilience: 85,
    tactical: 98,
    baseScale: 2.25,
    yOffset: 0,
    bio: 'Unmatched battlefield tactician and inspirational squad commander.',
  },
  {
    id: 6,
    name: 'HULK',
    file: '3d%20models/hulk_avengers.glb',
    originReality: 'EARTH-616',
    roleTag: 'FORCE TITAN',
    attributes: { mystic: false, technology: false, dimensional: false },
    power: 96,
    resilience: 95,
    tactical: 50,
    baseScale: 2.85,
    yOffset: 0,
    bio: 'Raw gamma-fueled physical juggernaut with near-limitless durability.',
  },
  {
    id: 7,
    name: 'BLACK WIDOW',
    file: '3d%20models/black_widow.glb',
    originReality: 'EARTH-838',
    roleTag: 'COVERT INFILTRATION',
    attributes: { mystic: false, technology: true, dimensional: false },
    power: 55,
    resilience: 68,
    tactical: 90,
    baseScale: 2.15,
    yOffset: 0,
    bio: 'Master spy specializing in electronic and physical security neutralization.',
  },
  {
    id: 8,
    name: 'LOKI',
    file: '3d%20models/loki_-_the_chronicler.glb',
    originReality: 'EARTH-712',
    roleTag: 'MYSTIC SUBVERSION',
    attributes: { mystic: true, technology: false, dimensional: true },
    power: 82,
    resilience: 78,
    tactical: 86,
    baseScale: 2.3,
    yOffset: 0,
    bio: 'God of Stories with mastery over timeline illusions and temporal anchoring.',
  },
  {
    id: 9,
    name: 'WOLVERINE',
    file: '3d%20models/wolverine.glb',
    originReality: 'EARTH-10005',
    roleTag: 'RELENTLESS RECOVERY',
    attributes: { mystic: false, technology: false, dimensional: false },
    power: 80,
    resilience: 98,
    tactical: 72,
    baseScale: 2.15,
    yOffset: 0,
    bio: 'Adamantium-clawed mutant with regenerative healing factor.',
  },
  {
    id: 10,
    name: 'CYCLOPS',
    file: '3d%20models/cyclops.glb',
    originReality: 'EARTH-92131',
    roleTag: 'PRECISION TACTICIAN',
    attributes: { mystic: false, technology: false, dimensional: false },
    power: 75,
    resilience: 70,
    tactical: 92,
    baseScale: 2.25,
    yOffset: 0,
    bio: 'Spatial optic blast projection combined with disciplined field leadership.',
  },
  {
    id: 11,
    name: 'ROGUE',
    file: '3d%20models/rogue.glb',
    originReality: 'EARTH-97',
    roleTag: 'POWER ABSORPTION',
    attributes: { mystic: true, technology: false, dimensional: false },
    power: 88,
    resilience: 85,
    tactical: 68,
    baseScale: 2.2,
    yOffset: 0,
    bio: 'Absorbs opponent powers and memories upon physical contact.',
  },
  {
    id: 12,
    name: 'DEADPOOL',
    file: '3d%20models/deadpool_wade_wilson_the_spirit_squad.glb',
    originReality: 'EARTH-10006',
    roleTag: 'UNPREDICTABLE CHAOS',
    attributes: { mystic: false, technology: false, dimensional: false },
    power: 74,
    resilience: 99,
    tactical: 60,
    baseScale: 2.2,
    yOffset: 0,
    bio: 'Immortal mercenary with reality-breaking unpredictability.',
  },
  {
    id: 13,
    name: 'MR. FANTASTIC',
    file: '3d%20models/mr_fantastic.glb',
    originReality: 'EARTH-838B',
    roleTag: 'CALCULATION LEAD',
    attributes: { mystic: false, technology: true, dimensional: true },
    power: 70,
    resilience: 82,
    tactical: 96,
    baseScale: 2.3,
    yOffset: 0,
    bio: 'Smartest man alive, developer of dimensional bridge devices.',
  },
  {
    id: 14,
    name: 'INVISIBLE WOMAN',
    file: '3d%20models/invisible_woman_mcu.glb',
    originReality: 'EARTH-1216',
    roleTag: 'FORCE FIELD BARRIER',
    attributes: { mystic: false, technology: false, dimensional: true },
    power: 85,
    resilience: 90,
    tactical: 78,
    baseScale: 2.2,
    yOffset: 0,
    bio: 'Projects impenetrable psionic force constructs.',
  },
  {
    id: 15,
    name: 'EMMA FROST',
    file: '3d%20models/emma_frost.glb',
    originReality: 'EARTH-10007',
    roleTag: 'TELEPATHIC OVERRIDE',
    attributes: { mystic: true, technology: false, dimensional: false },
    power: 78,
    resilience: 88,
    tactical: 84,
    baseScale: 2.2,
    yOffset: 0,
    bio: 'Omega-class telepath with organic diamond armor form.',
  },
  {
    id: 16,
    name: 'DAREDEVIL',
    file: '3d%20models/daredevil.glb',
    originReality: 'EARTH-616B',
    roleTag: 'RADAR PERCEPTION',
    attributes: { mystic: false, technology: false, dimensional: false },
    power: 58,
    resilience: 75,
    tactical: 80,
    baseScale: 2.2,
    yOffset: 0,
    bio: 'Acrobatic vigilante with superhuman sensory radar sense.',
  },
  {
    id: 17,
    name: 'THE PUNISHER',
    file: '3d%20models/the_punisher.glb',
    originReality: 'EARTH-404',
    roleTag: 'BALLISTIC SPECIALIST',
    attributes: { mystic: false, technology: true, dimensional: false },
    power: 62,
    resilience: 74,
    tactical: 82,
    baseScale: 2.25,
    yOffset: 0,
    bio: 'Relentless combat veteran utilizing advanced heavy armaments.',
  },
  {
    id: 18,
    name: 'WINTER SOLDIER',
    file: '3d%20models/winter_soldier_mcu.glb',
    originReality: 'EARTH-712B',
    roleTag: 'CYBERNETIC ENFORCER',
    attributes: { mystic: false, technology: true, dimensional: false },
    power: 66,
    resilience: 78,
    tactical: 82,
    baseScale: 2.25,
    yOffset: 0,
    bio: 'Enhanced assassin equipped with vibranium cybernetic arm.',
  },
  {
    id: 19,
    name: 'SYLVIE',
    file: '3d%20models/sylvie.glb',
    originReality: 'EARTH-211',
    roleTag: 'ENCHANTMENT / TIMELINE',
    attributes: { mystic: true, technology: false, dimensional: true },
    power: 83,
    resilience: 76,
    tactical: 80,
    baseScale: 2.2,
    yOffset: 0,
    bio: 'Loki variant skilled in mind enchantment and multiverse survival.',
  },
  {
    id: 20,
    name: 'DAGGER',
    file: '3d%20models/dagger.glb',
    originReality: 'EARTH-389',
    roleTag: 'LIGHT PURIFICATION',
    attributes: { mystic: true, technology: false, dimensional: false },
    power: 68,
    resilience: 65,
    tactical: 65,
    baseScale: 2.15,
    yOffset: 0,
    bio: 'Generates daggers of pure living light.',
  },
  {
    id: 21,
    name: 'BLACK CAT',
    file: '3d%20models/black_cat_-_coastal_cat.glb',
    originReality: 'EARTH-616C',
    roleTag: 'PROBABILITY THEFT',
    attributes: { mystic: false, technology: true, dimensional: false },
    power: 54,
    resilience: 62,
    tactical: 75,
    baseScale: 2.15,
    yOffset: 0,
    bio: 'Master burglar equipped with probability-manipulating hex tech.',
  },
  {
    id: 22,
    name: 'SYMBIOTE SPIDER',
    file: '3d%20models/black_suite_spider.glb',
    originReality: 'EARTH-96283',
    roleTag: 'SYMBIOTIC AGILITY',
    attributes: { mystic: false, technology: false, dimensional: false },
    power: 82,
    resilience: 84,
    tactical: 78,
    baseScale: 2.2,
    yOffset: 0,
    bio: 'Spider-Man bonded with alien symbiote, drastically boosting physical strength.',
  },
  {
    id: 23,
    name: 'ULTRON RECLAIMED',
    file: '3d%20models/ultron_-_aaou_mcu.glb',
    originReality: 'EARTH-891',
    roleTag: 'SYSTEMS OVERLORD',
    attributes: { mystic: false, technology: true, dimensional: false },
    power: 92,
    resilience: 90,
    tactical: 88,
    baseScale: 2.45,
    yOffset: 0,
    bio: 'Reprogrammed vibranium AI unit dedicated to dismantling Doom’s networks.',
  },
];

export const TOTAL_HEROES = HERO_ROSTER.length; // 24
export const QUBITS_PER_SLOT = 5;
export const TOTAL_SLOTS = 3;
export const TOTAL_QUBITS = QUBITS_PER_SLOT * TOTAL_SLOTS; // 15
export const TOTAL_BASIS_STATES = 1 << TOTAL_QUBITS; // 32,768

/**
 * Decode a 15-bit basis state index into three hero IDs.
 *
 * @param {number} basisIndex (0 to 32767)
 * @returns {{ h1: number, h2: number, h3: number, isValid: boolean }}
 */
export function decodeBasisState(basisIndex) {
  const h1 = (basisIndex >> 10) & 0x1f; // Slot 1 (bits 10-14)
  const h2 = (basisIndex >> 5) & 0x1f;  // Slot 2 (bits 5-9)
  const h3 = basisIndex & 0x1f;         // Slot 3 (bits 0-4)

  // Valid if all within 0-23 and no duplicate heroes
  const isValid =
    h1 < TOTAL_HEROES &&
    h2 < TOTAL_HEROES &&
    h3 < TOTAL_HEROES &&
    h1 !== h2 &&
    h1 !== h3 &&
    h2 !== h3;

  return { h1, h2, h3, isValid };
}

/**
 * Encode three hero IDs into a 15-bit basis state index.
 */
export function encodeBasisState(h1, h2, h3) {
  return ((h1 & 0x1f) << 10) | ((h2 & 0x1f) << 5) | (h3 & 0x1f);
}

/**
 * Deterministic Team Scoring System
 *
 * Evaluates tactical synergy across the 3 positions:
 * - Slot 1: Tactical/Lead (weighs tactical score heavily)
 * - Slot 2: Specialist (weighs power and specific counters)
 * - Slot 3: Force/Anchor (weighs power and resilience)
 * - Cross-reality diversity bonus: heroes from different origin realities gain quantum coherence
 * Normalized to 0–100.
 */
export function calculateTeamScore(h1, h2, h3) {
  const hero1 = HERO_ROSTER[h1];
  const hero2 = HERO_ROSTER[h2];
  const hero3 = HERO_ROSTER[h3];
  if (!hero1 || !hero2 || !hero3) return 0;

  // Base averages
  const avgPower = (hero1.power + hero2.power + hero3.power) / 3;
  const avgResilience = (hero1.resilience + hero2.resilience + hero3.resilience) / 3;

  // Role alignments
  const slot1Fit = hero1.tactical / 100;
  const slot2Fit = (hero2.power * 0.6 + hero2.tactical * 0.4) / 100;
  const slot3Fit = (hero3.power * 0.5 + hero3.resilience * 0.5) / 100;
  const roleScore = ((slot1Fit + slot2Fit + slot3Fit) / 3) * 20;

  // Cross-reality synergy bonus: reward cross-timeline composition
  const uniqueRealities = new Set([hero1.originReality, hero2.originReality, hero3.originReality]).size;
  const diversityBonus = uniqueRealities === 3 ? 12 : uniqueRealities === 2 ? 6 : 0;

  // Raw score sum
  const raw = avgPower * 0.35 + avgResilience * 0.35 + roleScore + diversityBonus;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

/**
 * Evaluate whether a team satisfies Doom's defense conditions:
 * 1. At least one Mystic Counter
 * 2. At least one Technological Counter
 * 3. At least one Dimensional Anchor
 * 4. Team Score >= Threshold
 *
 * @param {number} h1
 * @param {number} h2
 * @param {number} h3
 * @param {number} [threshold=75]
 */
export function evaluateCrossRealityTeam(h1, h2, h3, threshold = 75) {
  const hero1 = HERO_ROSTER[h1];
  const hero2 = HERO_ROSTER[h2];
  const hero3 = HERO_ROSTER[h3];

  if (!hero1 || !hero2 || !hero3) {
    return { viable: false, hasMystic: false, hasTech: false, hasDim: false, score: 0 };
  }

  const hasMystic = hero1.attributes.mystic || hero2.attributes.mystic || hero3.attributes.mystic;
  const hasTech = hero1.attributes.technology || hero2.attributes.technology || hero3.attributes.technology;
  const hasDim = hero1.attributes.dimensional || hero2.attributes.dimensional || hero3.attributes.dimensional;

  const score = calculateTeamScore(h1, h2, h3);
  const viable = hasMystic && hasTech && hasDim && score >= threshold;

  return {
    viable,
    hasMystic,
    hasTech,
    hasDim,
    score,
    team: [hero1, hero2, hero3],
  };
}

/**
 * Pre-calculated statistics about the 15-qubit search space:
 * Count valid teams for any given score threshold.
 */
export function countValidTeams(threshold = 75) {
  let count = 0;
  for (let h1 = 0; h1 < TOTAL_HEROES; h1++) {
    for (let h2 = 0; h2 < TOTAL_HEROES; h2++) {
      if (h2 === h1) continue;
      for (let h3 = 0; h3 < TOTAL_HEROES; h3++) {
        if (h3 === h1 || h3 === h2) continue;
        const res = evaluateCrossRealityTeam(h1, h2, h3, threshold);
        if (res.viable) count++;
      }
    }
  }
  return count;
}
