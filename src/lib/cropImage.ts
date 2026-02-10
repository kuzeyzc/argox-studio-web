/**
 * Canvas ile görseli verilen piksel alanına göre kırpar ve data URL döndürür.
 * react-easy-crop'tan gelen croppedAreaPixels ile kullanılır.
 */
export type Area = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const onLoad = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      resolve(img);
    };
    const onError = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      reject(new Error("Görsel yüklenemedi"));
    };
    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);
    img.src = src;
  });
}

export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area,
  quality = 0.92
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context alınamadı");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg", quality);
}

/** Data URL (base64) → File; storage yüklemesi için. */
export function dataUrlToFile(dataUrl: string, filename = "image.jpg"): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime });
}
