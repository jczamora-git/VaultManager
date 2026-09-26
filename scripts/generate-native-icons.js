import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BRAND_RED = '#B82825';
const BRAND_RED_RGB = { r: 184, g: 40, b: 37, alpha: 1 };
const SOURCE_LOGO = path.resolve('src/public/image/vault-key-logo.png');
const ASSETS_DIR = path.resolve('assets');
const RES_DIR = path.resolve('android/app/src/main/res');

async function run() {
  console.log('--- Step 1: Prepare Root assets/ Sources ---');
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // 1. icon-only.png (1024x1024 square from vault-key-logo.png)
  await sharp(SOURCE_LOGO)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon-only.png'));

  // 2. icon-background.png (1024x1024 solid brand red)
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: BRAND_RED_RGB,
    },
  })
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon-background.png'));

  // 3. icon-foreground.png (1024x1024, emblem inside 66.7% safe circle zone)
  // White circle diameter in source is 1574px centered at (1067.5, 1067)
  const circleSvg = `<svg width="1574" height="1574"><circle cx="787" cy="787" r="786" fill="#ffffff"/></svg>`;
  const emblemCropped = await sharp(SOURCE_LOGO)
    .extract({ left: 281, top: 280, width: 1574, height: 1574 })
    .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  // For Android adaptive icon 108dp canvas, safe zone is 72dp (66.7%).
  // Safe zone diameter at 1024px is ~680px. We use 640px for comfortable padding.
  const targetEmblemSize = 640;
  const emblemResized = await sharp(emblemCropped)
    .resize(targetEmblemSize, targetEmblemSize, { fit: 'contain' })
    .toBuffer();

  const padTop = Math.floor((1024 - targetEmblemSize) / 2);
  const padBottom = 1024 - targetEmblemSize - padTop;
  const padLeft = Math.floor((1024 - targetEmblemSize) / 2);
  const padRight = 1024 - targetEmblemSize - padLeft;

  await sharp(emblemResized)
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon-foreground.png'));

  console.log('--- Step 2: Generate Android Mipmap Resources ---');
  const densities = [
    { name: 'mdpi', iconSize: 48, adaptiveSize: 108, emblemSize: 68 },
    { name: 'hdpi', iconSize: 72, adaptiveSize: 162, emblemSize: 102 },
    { name: 'xhdpi', iconSize: 96, adaptiveSize: 216, emblemSize: 136 },
    { name: 'xxhdpi', iconSize: 144, adaptiveSize: 324, emblemSize: 204 },
    { name: 'xxxhdpi', iconSize: 192, adaptiveSize: 432, emblemSize: 272 },
  ];

  for (const d of densities) {
    const dir = path.join(RES_DIR, `mipmap-${d.name}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 2a. Legacy square/rounded icon (ic_launcher.png)
    await sharp(SOURCE_LOGO)
      .resize(d.iconSize, d.iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    // 2b. Legacy round icon (ic_launcher_round.png)
    const roundMaskSvg = `<svg width="${d.iconSize}" height="${d.iconSize}"><circle cx="${d.iconSize / 2}" cy="${d.iconSize / 2}" r="${d.iconSize / 2}" fill="#ffffff"/></svg>`;
    const roundResized = await sharp(SOURCE_LOGO)
      .resize(d.iconSize, d.iconSize, { fit: 'cover' })
      .composite([{ input: Buffer.from(roundMaskSvg), blend: 'dest-in' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // 2c. Adaptive foreground (ic_launcher_foreground.png)
    const dEmblemResized = await sharp(emblemCropped)
      .resize(d.emblemSize, d.emblemSize, { fit: 'contain' })
      .toBuffer();
    const dPadY = Math.floor((d.adaptiveSize - d.emblemSize) / 2);
    const dPadX = Math.floor((d.adaptiveSize - d.emblemSize) / 2);

    await sharp(dEmblemResized)
      .extend({
        top: dPadY,
        bottom: d.adaptiveSize - d.emblemSize - dPadY,
        left: dPadX,
        right: d.adaptiveSize - d.emblemSize - dPadX,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    // 2d. Adaptive background (ic_launcher_background.png)
    await sharp({
      create: {
        width: d.adaptiveSize,
        height: d.adaptiveSize,
        channels: 4,
        background: BRAND_RED_RGB,
      },
    })
      .png()
      .toFile(path.join(dir, 'ic_launcher_background.png'));

    console.log(`Generated mipmap-${d.name} assets`);
  }

  console.log('--- Step 3: Configure Adaptive Icon XML & Values ---');
  const anydpiDir = path.join(RES_DIR, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anydpiDir)) {
    fs.mkdirSync(anydpiDir, { recursive: true });
  }

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;

  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf-8');
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf-8');

  const valuesDir = path.join(RES_DIR, 'values');
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BRAND_RED}</color>
</resources>
`;
  fs.writeFileSync(path.join(valuesDir, 'ic_launcher_background.xml'), bgXml, 'utf-8');

  console.log('--- Step 4: Remove Obsolete Default Vectors ---');
  const obsoleteFiles = [
    path.join(RES_DIR, 'drawable', 'ic_launcher_background.xml'),
    path.join(RES_DIR, 'drawable-v24', 'ic_launcher_foreground.xml'),
  ];
  for (const f of obsoleteFiles) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      console.log(`Removed obsolete default vector: ${f}`);
    }
  }
  const v24Dir = path.join(RES_DIR, 'drawable-v24');
  if (fs.existsSync(v24Dir) && fs.readdirSync(v24Dir).length === 0) {
    fs.rmdirSync(v24Dir);
    console.log(`Removed empty directory: ${v24Dir}`);
  }

  console.log('--- Step 5: Update Splash Screen Assets ---');
  // Update splash screens to Vaultify branding
  const splashDensities = [
    { dir: 'drawable', width: 480, height: 800, logoW: 160 },
    { dir: 'drawable-land-hdpi', width: 800, height: 480, logoW: 160 },
    { dir: 'drawable-land-mdpi', width: 480, height: 320, logoW: 120 },
    { dir: 'drawable-land-xhdpi', width: 1280, height: 720, logoW: 240 },
    { dir: 'drawable-land-xxhdpi', width: 1600, height: 960, logoW: 320 },
    { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280, logoW: 400 },
    { dir: 'drawable-port-hdpi', width: 480, height: 800, logoW: 160 },
    { dir: 'drawable-port-mdpi', width: 320, height: 480, logoW: 120 },
    { dir: 'drawable-port-xhdpi', width: 720, height: 1280, logoW: 240 },
    { dir: 'drawable-port-xxhdpi', width: 960, height: 1600, logoW: 320 },
    { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920, logoW: 400 },
  ];

  for (const s of splashDensities) {
    const sDir = path.join(RES_DIR, s.dir);
    if (!fs.existsSync(sDir)) continue;
    const logoBuffer = await sharp(SOURCE_LOGO)
      .resize(s.logoW, s.logoW, { fit: 'contain' })
      .toBuffer();
    const posX = Math.floor((s.width - s.logoW) / 2);
    const posY = Math.floor((s.height - s.logoW) / 2);

    await sharp({
      create: {
        width: s.width,
        height: s.height,
        channels: 4,
        background: { r: 15, g: 17, b: 23, alpha: 1 }, // Dark background matching app theme
      },
    })
      .composite([{ input: logoBuffer, left: posX, top: posY }])
      .png()
      .toFile(path.join(sDir, 'splash.png'));
  }
  console.log('Updated splash drawables with Vaultify logo');

  console.log('--- Done Generating Native Assets ---');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
