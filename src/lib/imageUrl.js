import { IMAGE_MANIFEST } from '../data/imageManifest';

/** konglishCorrect 값과 실제 파일명이 다른 경우 */
const KONGLISH_IMAGE_ALIASES = {
  'you can do it!': 'you can do it',
  'matching outfits': 'matching outfit',
  'after-sales service': 'repair service',
  'part-time job': 'part time job',
};

function normalizeKey(name) {
  const key = name.toLowerCase();
  return KONGLISH_IMAGE_ALIASES[key] || key;
}

function manifestKeyFromPath(imagePath) {
  const filename = imagePath.split('/').pop() || '';
  return filename.replace(/\.(jpe?g|png|webp|gif)$/i, '').toLowerCase();
}

/** 단어/경로로 public/images 안의 실제 이미지 경로를 찾음. 없으면 null */
export function resolveImagePath(name, explicitPath) {
  if (explicitPath) {
    const baseKey = manifestKeyFromPath(explicitPath);
    if (IMAGE_MANIFEST[baseKey]) return IMAGE_MANIFEST[baseKey];
    return explicitPath;
  }

  const key = normalizeKey(name);
  return IMAGE_MANIFEST[key] || null;
}

/** public/images 경로를 브라우저에서 안전하게 로드할 수 있는 URL로 변환 */
export function buildImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const path = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  const encoded = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `/${encoded}`;
}

/** 이미지 로드 실패 시 시도할 대체 경로 목록 */
export function getImageFallbacks(name, currentPath) {
  const fallbacks = [];
  const key = normalizeKey(name);
  const manifestPath = IMAGE_MANIFEST[key];

  if (manifestPath && manifestPath !== currentPath) {
    fallbacks.push(manifestPath);
  }

  if (currentPath) {
    for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
      const alt = currentPath.replace(/\.(jpe?g|png|webp|gif)$/i, ext);
      if (alt !== currentPath && !fallbacks.includes(alt)) {
        fallbacks.push(alt);
      }
    }
  }

  return fallbacks;
}

/** @deprecated resolveImagePath 사용 권장 */
export function defaultImagePath(name, ext = 'jpg') {
  return `images/${name.toLowerCase()}.${ext}`;
}
