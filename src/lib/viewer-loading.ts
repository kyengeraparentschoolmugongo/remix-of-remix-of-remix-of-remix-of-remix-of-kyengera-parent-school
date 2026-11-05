import logo from '@/assets/resource/images-logo.png.asset.json';

// Immediate full-screen logo loader for the lightbox flipbook; shown on tap so users see feedback at once.
let overlay: HTMLDivElement | undefined;
let poll: number | undefined;
let safety: number | undefined;

export function isViewerLoading() { return Boolean(overlay); }

export function showViewerLoading() {
  if (overlay || typeof document === 'undefined') return;
  overlay = document.createElement('div');
  overlay.className = 'viewer-loading-overlay';
  overlay.innerHTML = `<div class="logo-loader" role="status" aria-label="Opening document…"><span class="logo-loader-ring" aria-hidden="true"></span><img class="logo-loader-image" src="${logo.url}" alt="" aria-hidden="true"></div>`;
  document.body.appendChild(overlay);
  safety = window.setTimeout(hideViewerLoading, 30_000);
}

export function hideViewerLoading() {
  if (poll) window.clearInterval(poll);
  if (safety) window.clearTimeout(safety);
  poll = safety = undefined;
  overlay?.remove();
  overlay = undefined;
}

function visible(el: Element | null) {
  if (!el) return false;
  const style = getComputedStyle(el as HTMLElement);
  return style.display !== 'none' && style.visibility !== 'hidden' && (el as HTMLElement).getClientRects().length > 0;
}

// Hide once the lightbox is open and its first page has rendered.
export function hideViewerLoadingWhenReady() {
  if (!overlay) return;
  if (poll) window.clearInterval(poll);
  const started = Date.now();
  poll = window.setInterval(() => {
    const preloaderBusy = [...document.querySelectorAll('.flipbook-preloader')].some(visible);
    const page = [...document.querySelectorAll('.flipbook-overlay canvas, .flipbook-main-wrapper canvas')].some(c => visible(c) && (c as HTMLCanvasElement).width > 0);
    if ((page && !preloaderBusy) || Date.now() - started > 20_000) hideViewerLoading();
  }, 100);
}
