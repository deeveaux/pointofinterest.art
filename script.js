(() => {
  'use strict';

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const sign = document.querySelector('.park-sign');
  const progress = document.querySelector('.page-progress');
  const revealElements = [...document.querySelectorAll('[data-reveal]')];
  let observer;
  let scrollFrame = 0;

  // The HTML is readable without JavaScript; only offscreen content is enhanced.
  function setUpReveals() {
    observer?.disconnect();
    revealElements.forEach(element => {
      element.classList.remove('reveal-pending', 'reveal-ready', 'is-visible');
    });
    if (motionPreference.matches || !('IntersectionObserver' in window)) return;

    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    revealElements.forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.classList.add('reveal-pending', 'reveal-ready');
      observer.observe(element);
    });
  }

  function updateProgress() {
    scrollFrame = 0;
    if (!progress || motionPreference.matches) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
  }

  function scheduleProgress() {
    if (!scrollFrame && !motionPreference.matches) scrollFrame = requestAnimationFrame(updateProgress);
  }

  function resetTilt() {
    sign?.style.removeProperty('--tilt-x');
    sign?.style.removeProperty('--tilt-y');
  }

  sign?.addEventListener('pointermove', event => {
    if (motionPreference.matches || !finePointer.matches) return;
    const bounds = sign.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
    sign.style.setProperty('--tilt-x', `${-y * 3}deg`);
    sign.style.setProperty('--tilt-y', `${x * 4}deg`);
  });
  sign?.addEventListener('pointerleave', resetTilt);
  sign?.addEventListener('pointercancel', resetTilt);
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress, { passive: true });
  motionPreference.addEventListener('change', () => {
    resetTilt();
    setUpReveals();
    updateProgress();
  });
  setUpReveals();
  updateProgress();
})();
