/**
 * One-time migration script: converts theme.duration from the old object format
 *   { value: string, type: 'fixed' | 'special' }
 * to a plain string.
 *
 * Prerequisites:
 *   1. Download a service account key from the Firebase console:
 *      Project settings → Service accounts → Generate new private key
 *      Save it as scripts/serviceAccountKey.json (never commit this file!)
 *   2. Install the Admin SDK (once):
 *      npm install firebase-admin --save-dev
 *
 * Usage:
 *   node scripts/migrate-duration.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

function migrateDuration(duration) {
  if (typeof duration === 'string') return null; // already migrated, skip
  if (duration && typeof duration === 'object' && 'value' in duration) {
    return duration.value || '3:00';
  }
  return '3:00';
}

async function migrate() {
  const snapshot = await db.collection('barillets').get();

  let migrated = 0;
  let skipped = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const themes = data.themes ?? [];

    let needsUpdate = false;
    const updatedThemes = themes.map((theme) => {
      const newDuration = migrateDuration(theme.duration);
      if (newDuration === null) return theme; // already a string
      needsUpdate = true;
      return { ...theme, duration: newDuration };
    });

    if (needsUpdate) {
      await docSnap.ref.update({ themes: updatedThemes });
      console.log(`Migrated: ${docSnap.id} ("${data.title}")`);
      migrated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone. Migrated: ${migrated}, already up-to-date: ${skipped}`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
