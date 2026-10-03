/**
 * scenesConfig.js — Declarative scene configuration for the opening cinematic.
 *
 * Each scene object drives the CinematicPlayer without hardcoding logic there.
 * Adding a new scene later = adding one entry here.
 *
 * Schema:
 * {
 *   id:         string        — unique identifier
 *   type:       'black' | 'image'
 *   image?:     string        — path to image asset (for type:'image')
 *   duration:   number        — total scene duration in ms
 *   camera?:    {             — CSS transform animation
 *     startScale: number,
 *     endScale:   number,
 *     startX?:    number,     — percent translateX
 *     endX?:      number,
 *     startY?:    number,
 *     endY?:      number,
 *   }
 *   grade?:     string        — CSS class for color grade overlay
 *   vignette?:  'normal' | 'heavy'
 *   effects?:   string[]      — e.g. ['shake', 'chromatic']
 *   textBeats:  Array<{
 *     text:       string,
 *     delay:      number,     — ms after scene start to show this line
 *     accent?:    boolean,    — gold accent color
 *   }>
 *   transition: {
 *     in:  number,            — fade-in ms
 *     out: number,            — fade-out ms (before scene end)
 *   }
 *   audio?:     string        — audio cue id (future use)
 * }
 */

export const cinematicScenes = [
  // ── SCENE 0: BLACK ──────────────────────────────────────────
  {
    id: 'black-open',
    type: 'black',
    duration: 1800,
    textBeats: [],
    transition: { in: 0, out: 600 },
  },

  // ── SCENE 1: DOOM ON THRONE ─────────────────────────────────
  {
    id: 'doom-throne',
    type: 'image',
    image: 'images/doom-on-chair.png',
    duration: 8000,
    camera: {
      startScale: 1.05,
      endScale: 1.14,
      startX: 0,
      endX: -0.8,
      startY: 0,
      endY: -0.4,
    },
    grade: 'doom',
    vignette: 'heavy',
    textBeats: [
      {
        text: 'You searched for me in one universe.',
        delay: 1800,
      },
    ],
    transition: { in: 1200, out: 900 },
    audio: 'doom-ambient',
  },

  // ── SCENE 2: THOR FALLS ─────────────────────────────────────
  {
    id: 'thor-defeated',
    type: 'image',
    image: 'images/thor-defeated.png',
    duration: 6000,
    camera: {
      startScale: 1.08,
      endScale: 1.14,
      startX: 0.5,
      endX: 0,
      startY: -0.5,
      endY: 0,
    },
    vignette: 'heavy',
    textBeats: [
      { text: 'Thor tried.',      delay: 1200 },
      { text: 'He fell.',         delay: 3000, accent: true },
    ],
    transition: { in: 900, out: 800 },
  },

  // ── SCENE 3: AVENGERS FALL ──────────────────────────────────
  {
    id: 'avengers-defeated',
    type: 'image',
    image: 'images/avengers-defeated.png',
    duration: 6500,
    camera: {
      startScale: 1.1,
      endScale: 1.16,
      startX: -0.5,
      endX: 0.3,
      startY: 0,
      endY: -0.3,
    },
    vignette: 'heavy',
    textBeats: [
      { text: 'Then the Avengers tried.',   delay: 1400 },
      { text: 'One by one, they fell.',     delay: 3500, accent: true },
    ],
    transition: { in: 900, out: 800 },
  },

  // ── SCENE 4: EARTHS DESTROYED ───────────────────────────────
  {
    id: 'earths-destroyed',
    type: 'image',
    image: 'images/earths-destroyed.png',
    duration: 7500,
    camera: {
      startScale: 1.05,
      endScale: 1.15,
      startX: 0,
      endX: -0.6,
      startY: 0.4,
      endY: 0,
    },
    vignette: 'normal',
    textBeats: [
      { text: 'One universe was not enough.',  delay: 1400 },
      { text: 'Then another fell.',            delay: 3800 },
      { text: 'And another.',                  delay: 5400, accent: true },
    ],
    transition: { in: 1000, out: 900 },
  },

  // ── SCENE 5: MULTIVERSE COLLAPSES ───────────────────────────
  {
    id: 'multiverse-collapse',
    type: 'image',
    image: 'images/multiverse-colapsing.png',
    duration: 9000,
    camera: {
      startScale: 1.0,
      endScale: 1.22,
      startX: 0,
      endX: 0,
      startY: 0,
      endY: -1.0,
    },
    grade: 'collapse',
    vignette: 'heavy',
    effects: ['shake', 'chromatic'],
    textBeats: [
      { text: 'The multiverse is collapsing.',   delay: 1600 },
      { text: 'Doctor Doom is winning.',         delay: 4200, accent: true },
      { text: 'And Thor has one chance.',        delay: 6500 },
    ],
    transition: { in: 1000, out: 1200 },
    audio: 'collapse-sting',
  },

  // ── SCENE 6: BLACK TRANSITION ───────────────────────────────
  {
    id: 'black-close',
    type: 'black',
    duration: 1600,
    textBeats: [],
    transition: { in: 400, out: 0 },
  },
];

/**
 * Doom Engine Briefing content — driven declaratively.
 * Each entry is revealed in sequence with individual delays.
 */
export const doomEngineBriefing = {
  tag: 'CLASSIFIED — TVA INTELLIGENCE DOSSIER',
  title: ['THE ', 'DOOM', ' ENGINE'],
  titleAccentIndex: 1, // index of word in title array that gets doom-orange color

  lines: [
    {
      id: 'line-1',
      text: 'Doctor Doom has built the Doom Engine — a machine capable of analyzing an enormous space of possible realities.',
      delay: 800,
    },
    {
      id: 'line-2',
      text: 'It evaluates combinations of universes, heroes, and battle conditions, searching for outcomes that benefit Doom.',
      delay: 2200,
    },
    {
      id: 'line-3',
      text: 'For almost every path, Doom already has a counter.',
      delay: 4000,
      dramatic: false,
    },
    {
      id: 'line-4',
      text: 'A conventional search would require checking those possibilities one by one.',
      delay: 5800,
    },
    {
      id: 'line-5',
      text: 'The search space is too large.',
      delay: 7800,
      dramatic: true,
    },
    {
      id: 'line-6',
      text: 'Thor cannot defeat Doom by searching harder.',
      delay: 9600,
      dramatic: true,
    },
    {
      id: 'line-7',
      text: 'He needs a different way to search.',
      delay: 12000,
      conclusion: true,
    },
  ],

  continueDelay: 14500,
};

/**
 * Act 2 — Doom Is Winning / Doom Weapon scenes.
 * These play as a cinematic AFTER the Doom Engine briefing.
 * Image: doom-winning.png (Doom + robot army under dramatic sky).
 * Two conceptual beats share the same image — a black cut between them
 * is handled by having a long duration with staggered text beats.
 */
export const act2DoomScenes = [
  // ── Black lead-in from briefing ──────────────────────────────
  {
    id: 'act2-black-in',
    type: 'black',
    duration: 1400,
    textBeats: [],
    transition: { in: 300, out: 500 },
  },

  // ── DOOM IS WINNING — full-screen cinematic ──────────────────
  {
    id: 'doom-winning',
    type: 'image',
    image: 'images/doom-winning.png',
    duration: 14000,
    camera: {
      startScale: 1.04,
      endScale: 1.14,
      startX: 0.4,
      endX: -0.3,
      startY: -0.3,
      endY: 0.2,
    },
    grade: 'doom',
    vignette: 'heavy',
    textBeats: [
      { text: "Doom isn't waiting for us.",                          delay: 1400 },
      { text: "He's already prepared for every move we know.",       delay: 4000 },
      { text: 'Every universe.',                                     delay: 6400 },
      { text: 'Every team.',                                         delay: 8000 },
      { text: 'Every outcome we can reach by searching the old way.', delay: 9400 },
      { text: 'Doom is winning.',                                    delay: 11800, accent: true },
    ],
    transition: { in: 1200, out: 1000 },
  },

  // ── DOOM'S WEAPON — same image, new camera angle ─────────────
  {
    id: 'doom-weapon',
    type: 'image',
    image: 'images/doom-winning.png',
    duration: 16000,
    camera: {
      startScale: 1.14,
      endScale: 1.22,
      startX: -0.3,
      endX: 0.5,
      startY: 0.2,
      endY: -0.5,
    },
    grade: 'doom',
    vignette: 'heavy',
    textBeats: [
      { text: "His weapon isn't just power.",                                                         delay: 1200 },
      { text: "It's information.",                                                                    delay: 3400, accent: true },
      { text: 'The Doom Engine searches an enormous space of possible realities, teams and battles.',  delay: 5600 },
      { text: 'It identifies the paths that lead to his victory...',                                  delay: 9000 },
      { text: '...and prepares for them before we arrive.',                                           delay: 11200 },
      { text: 'Search one possibility at a time...',                                                  delay: 13000 },
      { text: '...and Doom will always be waiting.',                                                  delay: 14400, accent: true },
    ],
    transition: { in: 800, out: 1000 },
  },

  // ── Bridge line before cut to black ──────────────────────────
  {
    id: 'doom-weapon-bridge',
    type: 'image',
    image: 'images/doom-winning.png',
    duration: 5000,
    camera: {
      startScale: 1.22,
      endScale: 1.28,
      startX: 0.5,
      endX: 0,
      startY: -0.5,
      endY: 0,
    },
    grade: 'doom',
    vignette: 'heavy',
    textBeats: [
      { text: 'Thor needs a way to search differently.', delay: 1200 },
    ],
    transition: { in: 600, out: 1200 },
  },

  // ── Cut to black ─────────────────────────────────────────────
  {
    id: 'act2-black-out',
    type: 'black',
    duration: 1800,
    textBeats: [],
    transition: { in: 400, out: 0 },
  },
];

/**
 * Act 2 — What Thor Has / Thor's Device scenes.
 * Play after act2DoomScenes.
 * Image A: thor-bifrost.png — Thor viewed from above inside the enormous maze pattern.
 * Image B: thor-strombreaker.png — Thor with his tool/device.
 */
export const act2ThorScenes = [
  // ── WHAT THOR HAS — thor-bifrost.png (maze from above) ──────
  {
    id: 'thor-has',
    type: 'image',
    image: 'images/thor-bifrost.png',
    duration: 18000,
    camera: {
      startScale: 1.04,
      endScale: 1.15,
      startX: 0,
      endX: 0,
      startY: 0.2,
      endY: -0.3,
    },
    vignette: 'heavy',
    textBeats: [
      { text: "Thor has one thing Doom doesn't have.",       delay: 1400 },
      { text: 'One last path.',                              delay: 3800, accent: true },
      { text: "But it doesn't lead to a single world.",      delay: 6000 },
      { text: 'It leads to all of them.',                    delay: 8200 },
      { text: 'Every path could be a universe.',             delay: 10400 },
      { text: 'Every universe could contain a different team.', delay: 12400 },
      { text: 'And somewhere in that space...',              delay: 14400 },
      { text: '...is a team capable of defeating Doom.',     delay: 15800, accent: true },
    ],
    transition: { in: 1200, out: 1200 },
  },

  // ── THOR'S DEVICE — thor-strombreaker.png ───────────────────
  {
    id: 'thor-device',
    type: 'image',
    image: 'images/thor-strombreaker.png',
    duration: 15000,
    camera: {
      startScale: 1.08,
      endScale: 1.18,
      startX: -0.4,
      endX: 0.3,
      startY: 0,
      endY: -0.5,
    },
    vignette: 'heavy',
    textBeats: [
      { text: 'Thor cannot examine every universe one by one.',   delay: 1600 },
      { text: 'But he can interact with the search itself.',      delay: 4200 },
      { text: 'The Asgardian system can represent the possibilities...', delay: 7000 },
      { text: '...and manipulate how they evolve.',               delay: 9800 },
      { text: "Thor doesn't need to search harder.",              delay: 11800 },
      { text: 'He needs to search differently.',                  delay: 13400, accent: true },
    ],
    transition: { in: 1200, out: 1200 },
  },

  // ── Final black before interactive screen ────────────────────
  {
    id: 'act2-black-final',
    type: 'black',
    duration: 1600,
    textBeats: [],
    transition: { in: 400, out: 0 },
  },
];
