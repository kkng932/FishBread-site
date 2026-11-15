const VISIBLE_CLASS = 'is-visible';

/** 화면에 들어온 섹션을 아래에서 올라오며 나타나게 한다. */
export function initReveal({ reducedMotion }) {
  const targets = document.querySelectorAll('.reveal');

  if (reducedMotion) {
    targets.forEach(showReveal);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showReveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -40px 0px' },
  );

  targets.forEach((target) => observer.observe(target));
}

export function showReveal(element) {
  element.classList.add(VISIBLE_CLASS);
}
