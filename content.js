function adjustVolumeWithScroll(video) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '10px';
  overlay.style.left = '10px';
  overlay.style.padding = '5px 10px';
  overlay.style.background = 'rgba(0, 0, 0, 0.7)';
  overlay.style.color = 'white';
  overlay.style.fontSize = '14px';
  overlay.style.borderRadius = '5px';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'none';
  overlay.style.pointerEvents = 'none';

  // Append overlay based on fullscreen status
  const appendOverlay = () => {
    const fsElement = document.fullscreenElement;
    if (fsElement) {
      fsElement.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }
  };
  appendOverlay();

  document.addEventListener('fullscreenchange', appendOverlay);

  video.addEventListener('wheel', (e) => {
    if (!video.contains(e.target)) return;

    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.05;
    video.volume = Math.min(Math.max(video.volume + delta, 0), 1);

    overlay.textContent = `Volume: ${(video.volume * 100).toFixed(0)}%`;
    const rect = video.getBoundingClientRect();
    overlay.style.top = `${rect.top + 10}px`;
    overlay.style.left = `${rect.left + 10}px`;
    overlay.style.display = 'block';

    clearTimeout(overlay.timeout);
    overlay.timeout = setTimeout(() => {
      overlay.style.display = 'none';
    }, 800);
  }, { passive: false });
}

function init() {
  const videos = document.querySelectorAll("video");
  videos.forEach(video => {
    if (!video.dataset.volumeScrollAdded) {
      video.dataset.volumeScrollAdded = "true";
      adjustVolumeWithScroll(video);
    }
  });
}

init();

const observer = new MutationObserver(init);
observer.observe(document.body, { childList: true, subtree: true });
