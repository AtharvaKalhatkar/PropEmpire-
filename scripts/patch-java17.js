/**
 * Post-install script: patches Capacitor plugin build.gradle files
 * to use Java 17 instead of Java 21 (since we run JDK 17).
 * Run automatically via npm postinstall.
 */
import fs from 'fs';
import path from 'path';

const patches = [
  'node_modules/@capacitor/android/capacitor/build.gradle',
  'node_modules/@capacitor/filesystem/android/build.gradle',
  'node_modules/@capacitor/share/android/build.gradle',
];

let count = 0;
for (const rel of patches) {
  const file = path.resolve(rel);
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  const updated = content
    .replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17')
    .replace(/jvmToolchain\(21\)/g, 'jvmToolchain(17)');
  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    count++;
    console.log(`  ✓ Patched ${rel}`);
  }
}
console.log(`Java 17 patch: ${count} file(s) updated.`);
