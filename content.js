// Create an overlay for volume display
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '10px';
  overlay.style.left = '10px';
  overlay.style.padding = '5px 10px';
  overlay.style.background = 'rgba(0, 0, 0, 0.7)';
  overlay.style.color = 'white';
  overlay.style.fontSize = '14px';
  overlay.style.borderRadius = '5px';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'none';
  overlay.style.pointerEvents = 'none';
  document.body.appendChild(overlay);
  return overlay;
}

let overlay = createOverlay();

// Reposition overlay in fullscreen mode
function appendOverlay() {
  const fsElement = document.fullscreenElement;
  if (fsElement) {
    fsElement.appendChild(overlay);
  } else {
    document.body.appendChild(overlay);
  }
}
document.addEventListener('fullscreenchange', appendOverlay);

// Volume control handler
function adjustVolumeWithScroll(video) {
  if (video.dataset.volumeScrollAdded === "true") return;
  video.dataset.volumeScrollAdded = "true";

  let timeout;

  video.addEventListener(
    'wheel',
    (e) => {
      if (!video.contains(e.target)) return;

      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.05;
      video.volume = Math.min(Math.max(video.volume + delta, 0), 1);

      overlay.textContent = `Volume: ${(video.volume * 100).toFixed(0)}%`;
      const rect = video.getBoundingClientRect();
      overlay.style.top = `${rect.top + window.scrollY + 10}px`;
      overlay.style.left = `${rect.left + window.scrollX + 10}px`;
      overlay.style.display = 'block';

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        overlay.style.display = 'none';
      }, 800);
    },
    { passive: false }
  );
}

// Scan and apply to all video elements
function findVideoElements() {
  const videos = document.querySelectorAll('video');
  videos.forEach(adjustVolumeWithScroll);

  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe, index) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      const iframeVideos = iframeDoc.querySelectorAll('video');
      iframeVideos.forEach(adjustVolumeWithScroll);
    } catch (e) {
      // Cross-origin iframe: cannot access due to browser restrictions.
      // Warning suppressed for cleaner console.
    }
  });
}

// Initialize on page load
window.addEventListener('load', () => {
  findVideoElements();

  // Observe DOM changes to handle dynamic content
  const observer = new MutationObserver(() => {
    findVideoElements();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
