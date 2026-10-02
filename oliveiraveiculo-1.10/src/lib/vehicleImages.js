import { formatImageUrl } from './driveUtils';

export function photoUrl(photo) {
  const url = typeof photo === 'string' ? photo : photo?.url;
  return url ? formatImageUrl(url) : '';
}

export function photoThumbUrl(photo) {
  const url = typeof photo === 'string' ? photo : (photo?.thumbUrl || photo?.url);
  return url ? formatImageUrl(url) : '';
}

export function photoDimensions(photo, thumbnail = false) {
  if (typeof photo === 'object' && photo) {
    const width = thumbnail ? photo.thumbWidth : photo.width;
    const height = thumbnail ? photo.thumbHeight : photo.height;
    if (width && height) return { width, height };
  }
  return thumbnail ? { width: 400, height: 250 } : { width: 1600, height: 1000 };
}

export function formatPhotoForStorage(photo) {
  if (typeof photo === 'string') return formatImageUrl(photo);
  if (!photo?.url) return null;
  return {
    ...photo,
    url: formatImageUrl(photo.url),
    thumbUrl: formatImageUrl(photo.thumbUrl || photo.url),
  };
}
