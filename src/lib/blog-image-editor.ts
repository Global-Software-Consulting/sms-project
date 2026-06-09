/**
 * Client-side image variation generator for the Blog Image Auto Editor.
 *
 * Takes a source image and produces N visually distinct copies by applying
 * crop, saturation, brightness, and contrast transforms via the Canvas API.
 * Re-encoding through canvas implicitly strips EXIF metadata. Output can be
 * WebP (smaller, modern) or the original mime type.
 *
 * Pure browser code — no backend dependency.
 */

export interface ImageEditorRanges {
  /** four discrete crop percentages — one variant per value */
  cropValues: number[];
  /** saturation range: [min, max] percent (e.g. 1..15 = +1% to +15%) */
  saturationRange: [number, number];
  /** brightness range: [min, max] percent */
  brightnessRange: [number, number];
  /** contrast range: [min, max] percent */
  contrastRange: [number, number];
  convertWebP: boolean;
  /** stripEXIF is implicit when re-encoding via canvas — kept for UI parity */
  stripEXIF: boolean;
}

export interface VariantResult {
  blob: Blob;
  previewUrl: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  appliedCropPct: number;
  appliedSaturationPct: number;
  appliedBrightnessPct: number;
  appliedContrastPct: number;
}

export interface ProcessedImage {
  sourceFile: File;
  variants: VariantResult[];
}

const randomInRange = (min: number, max: number): number => {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return lo + Math.random() * (hi - lo);
};

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to decode image: ${file.name}`));
    };
    img.src = url;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas encoding produced no blob'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });

const sanitizeFilename = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';

/**
 * Produce one transformed variant of the source image.
 */
const renderVariant = async (
  img: HTMLImageElement,
  cropPct: number,
  saturationPct: number,
  brightnessPct: number,
  contrastPct: number,
  outputMime: string,
): Promise<{ blob: Blob; width: number; height: number }> => {
  const cropFactor = Math.max(0, Math.min(cropPct, 49)) / 100;
  const sx = img.width * cropFactor;
  const sy = img.height * cropFactor;
  const sw = img.width - sx * 2;
  const sh = img.height - sy * 2;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sw));
  canvas.height = Math.max(1, Math.round(sh));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');

  const saturate = 100 + saturationPct;
  const brightness = 100 + brightnessPct;
  const contrast = 100 + contrastPct;
  ctx.filter = `saturate(${saturate}%) brightness(${brightness}%) contrast(${contrast}%)`;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  const blob = await canvasToBlob(canvas, outputMime, 0.9);
  return { blob, width: canvas.width, height: canvas.height };
};

export const processImage = async (
  file: File,
  ranges: ImageEditorRanges,
  baseName: string,
): Promise<ProcessedImage> => {
  const img = await loadImage(file);
  const outputMime = ranges.convertWebP ? 'image/webp' : file.type || 'image/jpeg';
  const extension = ranges.convertWebP ? 'webp' : file.name.split('.').pop() ?? 'jpg';
  const safeBase = sanitizeFilename(baseName || file.name.replace(/\.[^.]+$/, ''));

  const variants: VariantResult[] = [];
  for (let i = 0; i < ranges.cropValues.length; i++) {
    const cropPct = ranges.cropValues[i];
    if (cropPct === undefined || Number.isNaN(cropPct)) continue;

    const saturationPct = randomInRange(
      ranges.saturationRange[0],
      ranges.saturationRange[1],
    );
    const brightnessPct = randomInRange(
      ranges.brightnessRange[0],
      ranges.brightnessRange[1],
    );
    const contrastPct = randomInRange(
      ranges.contrastRange[0],
      ranges.contrastRange[1],
    );

    const { blob, width, height } = await renderVariant(
      img,
      cropPct,
      saturationPct,
      brightnessPct,
      contrastPct,
      outputMime,
    );

    variants.push({
      blob,
      previewUrl: URL.createObjectURL(blob),
      filename: `${safeBase}-${i + 1}.${extension}`,
      size: blob.size,
      width,
      height,
      appliedCropPct: cropPct,
      appliedSaturationPct: Number(saturationPct.toFixed(2)),
      appliedBrightnessPct: Number(brightnessPct.toFixed(2)),
      appliedContrastPct: Number(contrastPct.toFixed(2)),
    });
  }

  return { sourceFile: file, variants };
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
