import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceApk = path.resolve(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk');
const targetDir = path.resolve(__dirname, '../public/downloads');
const targetApk = path.resolve(targetDir, 'fuel-gain-tracker.apk');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

if (fs.existsSync(sourceApk)) {
  fs.copyFileSync(sourceApk, targetApk);
  console.log(`✅ Successfully exported APK to ${targetApk}`);
} else {
  console.log(`ℹ️ APK file not found at ${sourceApk}. Please build the APK in Android Studio or using gradlew.`);
}
