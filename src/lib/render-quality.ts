export interface RenderQuality {
  frameRate: 30 | 60;
  maxDevicePixelRatio: number;
  maxCanvasPixels: number;
  maxAsciiCells: number;
  maxTextureSide: number;
  shapeWorkingSize: number;
}

type NavigatorWithCapabilities = Navigator & {
  connection?: {
    saveData?: boolean;
  };
  deviceMemory?: number;
};

const DESKTOP_MAX_PIXELS = 2560 * 1600 * 2;

export function getRenderQuality(): RenderQuality {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      frameRate: 60,
      maxDevicePixelRatio: 2,
      maxCanvasPixels: DESKTOP_MAX_PIXELS,
      maxAsciiCells: 56000,
      maxTextureSide: 2048,
      shapeWorkingSize: 512,
    };
  }

  const browserNavigator = navigator as NavigatorWithCapabilities;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const slowUpdate = window.matchMedia?.("(update: slow)").matches ?? false;
  const lowCoreCount = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const lowMemory = typeof browserNavigator.deviceMemory === "number" && browserNavigator.deviceMemory <= 4;
  const dataSaver = browserNavigator.connection?.saveData === true;
  const constrained = slowUpdate || lowCoreCount || lowMemory || dataSaver;

  if (constrained) {
    return {
      frameRate: 30,
      maxDevicePixelRatio: 1,
      maxCanvasPixels: 1_500_000,
      maxAsciiCells: 24000,
      maxTextureSide: 768,
      shapeWorkingSize: 320,
    };
  }

  if (coarsePointer) {
    return {
      frameRate: 60,
      maxDevicePixelRatio: 1.5,
      maxCanvasPixels: 2_500_000,
      maxAsciiCells: 36000,
      maxTextureSide: 1024,
      shapeWorkingSize: 384,
    };
  }

  return {
    frameRate: 60,
    maxDevicePixelRatio: 2,
    maxCanvasPixels: DESKTOP_MAX_PIXELS,
    maxAsciiCells: 56000,
    maxTextureSide: 2048,
    shapeWorkingSize: 512,
  };
}

export function getCanvasPixelRatio(
  width: number,
  height: number,
  preferredRatio: number,
  quality: RenderQuality,
) {
  let ratio = Math.max(1, Math.min(preferredRatio, quality.maxDevicePixelRatio));
  const pixels = width * height * ratio * ratio;
  if (pixels > quality.maxCanvasPixels) {
    ratio *= Math.sqrt(quality.maxCanvasPixels / pixels);
  }
  return ratio;
}
