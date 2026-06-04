import sharp from 'sharp';

const input = 'src/assets/hero.png';
const outFavicon = 'public/favicon.png';
const outApple = 'public/apple-touch-icon.png';
const out192 = 'public/pwa-192x192.png';
const out512 = 'public/pwa-512x512.png';

async function generate() {
  try {
    await sharp(input)
      .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(outFavicon);
    await sharp(input)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(outApple);
    await sharp(input)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(out192);
    await sharp(input)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(out512);
    console.log('Icons successfully generated!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}
generate();
