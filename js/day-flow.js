/*
 * 하루 장사 흐름 자동 넘김.
 * 화면에 보일 때만 일정 간격으로 한 칸씩 넘기고, 끝에 닿으면 처음으로 돌아간다.
 * 사용자가 마우스를 올리거나 직접 넘기면 잠시 멈춘다.
 */

const INTERVAL_MS = 3000;
const PAUSE_AFTER_TOUCH_MS = 6000;
const RESUME_DELAY_MS = 1500;
const ITEM_GAP = 16; // CSS의 .day-flow gap

export function initDayFlow() {
  const list = document.getElementById('day-flow');
  let isVisible = false;
  let pausedUntil = 0;

  const pause = (ms) => {
    pausedUntil = Date.now() + ms;
  };
  const pauseIndefinitely = () => pause(Infinity);
  const resumeSoon = () => pause(RESUME_DELAY_MS);

  function stepWidth() {
    const item = list.querySelector('li');
    return item ? item.getBoundingClientRect().width + ITEM_GAP : 240;
  }

  function advance() {
    if (!isVisible || document.hidden || Date.now() < pausedUntil) return;

    const maxScroll = list.scrollWidth - list.clientWidth - 2;
    if (maxScroll <= 0) return;

    const next = list.scrollLeft >= maxScroll ? 0 : list.scrollLeft + stepWidth();
    list.scrollTo({ left: next, behavior: 'smooth' });
  }

  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.4 }).observe(list);

  list.addEventListener('mouseenter', pauseIndefinitely);
  list.addEventListener('mouseleave', resumeSoon);
  list.addEventListener('focusin', pauseIndefinitely);
  list.addEventListener('focusout', resumeSoon);
  list.addEventListener('touchstart', () => pause(PAUSE_AFTER_TOUCH_MS), { passive: true });
  list.addEventListener('wheel', () => pause(PAUSE_AFTER_TOUCH_MS), { passive: true });

  setInterval(advance, INTERVAL_MS);
}
