import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve("public/covers/portraits");

const portraits = [
  {
    slug: "bunyan",
    sourceFile: "bunyan.jpg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Portrait_of_John_Bunyan_(4672796).jpg?width=960",
    crop: { left: 120, top: 105, width: 720, height: 900 },
  },
  {
    slug: "augustine",
    sourceFile: "augustine.jpg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Saint_Augustine_by_Philippe_de_Champaigne.jpg?width=960",
    crop: { left: 475, top: 98, width: 310, height: 430 },
  },
  {
    slug: "kempis",
    sourceFile: "kempis.jpg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Portret_van_Thomas_%C3%A0_Kempis%2C_RP-P-OB-46.937.jpg?width=960",
    crop: { left: 240, top: 260, width: 500, height: 720 },
  },
  {
    slug: "calvin",
    sourceFile: "calvin.png",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/John_Calvin_Museum_Catharijneconvent_RMCC_s84_cropped.png?width=960",
    crop: { left: 90, top: 20, width: 700, height: 900 },
  },
  {
    slug: "ryle",
    sourceFile: "ryle.jpg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/JCRylePhoto.jpg?width=700",
    crop: { left: 0, top: 0, width: 340, height: 470 },
  },
  {
    slug: "spurgeon",
    sourceFile: "spurgeon.jpg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Portrait_of_Charles_Haddon_Spurgeon_(4674599).jpg?width=960",
    crop: { left: 170, top: 120, width: 620, height: 820 },
  },
  {
    slug: "edwards",
    sourceFile: "edwards.jpg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Jonathan_Edwards_(Princeton_Portrait).jpg?width=960",
    crop: { left: 160, top: 70, width: 640, height: 780 },
  },
  {
    slug: "owen",
    sourceFile: "owen.jpg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/John_Owen_by_John_Greenhill.jpg?width=960",
    crop: { left: 160, top: 70, width: 640, height: 820 },
  },
  {
    slug: "luther",
    sourceFile: "luther.jpg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Lucas_Cranach_d._%C3%84._-_Portrait_of_Martin_Luther_-_WGA05703.jpg?width=960",
    crop: { left: 92, top: 46, width: 510, height: 690 },
  },
  {
    slug: "watson",
    sourceFile: "watson.jpg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Thomas_Watson_(Puritan).jpg?width=960",
  },
  {
    slug: "hodge",
    sourceFile: "hodge.jpg",
    source: "https://upload.wikimedia.org/wikipedia/commons/0/09/PORTRAIT_OF_CHARLES_HODGE%2C_Rembrandt_Peale.jpg",
  },
  {
    slug: "boston",
    sourceFile: "boston.jpg",
    source: "https://upload.wikimedia.org/wikipedia/commons/d/de/Tboston.jpg",
    crop: { left: 70, top: 40, width: 390, height: 560 },
  },
  {
    slug: "tozer",
    sourceFile: "tozer.svg",
    source: "https://commons.wikimedia.org/wiki/Special:Redirect/file/AW_Tozer.svg",
  },
];

async function loadSource({ source, sourceFile }) {
  const localSourceDir = process.env.TULIP_PORTRAIT_SOURCE_DIR;

  if (localSourceDir) {
    try {
      return await fs.readFile(path.join(localSourceDir, sourceFile));
    } catch {
      // Fall through to downloading the public source.
    }
  }

  const response = await fetch(source, {
    headers: {
      "User-Agent": "TULIP-cover-generator/1.0 (local design asset generation)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${source}: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function makeVintagePortrait({ slug, source, sourceFile, crop }) {
  const sourceImage = await loadSource({ source, sourceFile });
  let image = sharp(sourceImage, { density: 144 }).rotate();

  if (crop) {
    image = image.extract(crop);
  }

  const base = await image
    .resize(420, 540, { fit: "cover", position: "north" })
    .modulate({ brightness: 1.04, saturation: 0.62 })
    .gamma(1.04)
    .sharpen({ sigma: 0.65, flat: 1, jagged: 1 })
    .png()
    .toBuffer();

  const finish = Buffer.from(`
    <svg width="420" height="540" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="v" cx="50%" cy="42%" r="64%">
          <stop offset="0" stop-color="#fff0c8" stop-opacity=".10"/>
          <stop offset=".58" stop-color="#8a5226" stop-opacity=".10"/>
          <stop offset="1" stop-color="#0b0604" stop-opacity=".50"/>
        </radialGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency=".86" numOctaves="2" seed="8"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 .16"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="420" height="540" fill="#d2a65f" opacity=".10"/>
      <rect width="420" height="540" fill="url(#v)"/>
      <rect width="420" height="540" filter="url(#grain)" opacity=".42"/>
      <path d="M0 0h420v540H0z" fill="none" stroke="#f3d58c" stroke-opacity=".25" stroke-width="10"/>
    </svg>`);

  const output = path.join(OUT_DIR, `${slug}.png`);
  await sharp(base)
    .composite([{ input: finish, blend: "overlay" }])
    .png({ compressionLevel: 9 })
    .toFile(output);

  console.log(`wrote ${path.relative(process.cwd(), output)}`);
}

await fs.mkdir(OUT_DIR, { recursive: true });

const forcePortraits = new Set();

for (const portrait of portraits) {
  const output = path.join(OUT_DIR, `${portrait.slug}.png`);
  if (!forcePortraits.has(portrait.slug)) {
    try {
      await fs.access(output);
      console.log(`kept ${path.relative(process.cwd(), output)}`);
      continue;
    } catch {
      // Missing portrait: create it below.
    }
  }
  await makeVintagePortrait(portrait);
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
