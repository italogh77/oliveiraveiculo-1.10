export const DEFAULT_PHOTO_ADJUSTMENT = Object.freeze({ zoom: 1, x: 50, y: 50, fit: 'cover' });
const clamp = (value, min, max, fallback) => Number.isFinite(Number(value))
  ? Math.min(max, Math.max(min, Number(value))) : fallback;

export function normalizePhotoAdjustment(value = {}) {
  return {
    zoom: clamp(value?.zoom, 1, 3, 1),
    x: clamp(value?.x, 0, 100, 50),
    y: clamp(value?.y, 0, 100, 50),
    fit: value?.fit === 'contain' ? 'contain' : 'cover',
  };
}

export function photoStyle(value) {
  const { zoom, x, y, fit } = normalizePhotoAdjustment(value);
  return {
    objectFit: fit,
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  };
}

export function movePhotoWithAdjustment(form, from, to) {
  const photos = [...(form.fotos || [])];
  if (from === to || from < 0 || to < 0 || from >= photos.length || to >= photos.length) return form;
  const adjustments = photos.map((_, i) => normalizePhotoAdjustment(form.fotosAjustes?.[i]));
  photos.splice(to, 0, photos.splice(from, 1)[0]);
  adjustments.splice(to, 0, adjustments.splice(from, 1)[0]);
  return { ...form, fotos: photos, fotosAjustes: adjustments };
}
