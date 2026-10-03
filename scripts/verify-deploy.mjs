/**
 * Pre-deploy checks: required HTML, Three.js, cinematic images, and hero GLBs exist on disk.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cinematicScenes, act2DoomScenes, act2ThorScenes } from '../src/cinematic/scenesConfig.js';
import { HERO_ROSTER } from '../src/quantum/heroRosterData.js';

const root = path.join(fileURLToPath(new URL('.', import.meta.url)), '..');
let failed = false;

function mustExist(relativePath) {
  const decoded = decodeURIComponent(relativePath);
  const absolute = path.join(root, decoded);
  if (!fs.existsSync(absolute)) {
    console.error(`Missing required file: ${relativePath}`);
    failed = true;
  }
}

mustExist('index.html');
mustExist('node_modules/three/build/three.module.js');

for (const scene of [...cinematicScenes, ...act2DoomScenes, ...act2ThorScenes]) {
  if (scene.image) mustExist(scene.image);
}

for (const hero of HERO_ROSTER) {
  if (hero.file) mustExist(hero.file);
}

if (failed) {
  process.exit(1);
}

console.log('Deploy verification passed.');
