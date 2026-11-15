import { clamp01, lerp, easeInOutQuad, MOBILE_MAX_WIDTH, CONTENT_MAX_WIDTH } from './utils.js';

/*
 * 첫 화면의 물고기빵 틀.
 * 스크롤 진행도(0 → 1)에 따라 뚜껑이 열리고, 틀이 본문 너비까지 넓어지며
 * 그 안의 소개 상자가 나타난다. 진행도가 1이 되면 sticky가 풀리고 본문으로 이어진다.
 */

const MOLD_ASPECT = 563 / 318; // mold.png 세로 / 가로
const MOLD_MAX_HEIGHT = 620;
const MOLD_MIN_HEIGHT = 200;
const PROMPT_AREA = 200;       // 닫힌 틀 아래 안내 상자 자리
const HEADER_GAP = 12;
const MIN_TOP_SPACE = 24;      // 열린 틀 위 최소 여백

const OPEN_SCROLL_RATIO = 1.2; // 틀이 다 열리기까지 스크롤 거리 (화면 높이 배수)
const LID_OPEN_END = 0.55;     // 뚜껑이 다 젖혀지는 진행도
const GROW_START = 0.08;       // 틀이 넓어지기 시작하는 진행도
const HERO_FADE_START = 0.376; // 뚜껑이 약 80% 열린 시점
const HERO_FADE_LENGTH = 0.14;
const PROMPT_FADE_END = 0.25;

// 모바일 주소창이 숨거나 나타날 때 생기는 높이 변화는 무시한다 (틀이 덜컥이지 않게)
const VIEWPORT_JITTER = 140;

export function initMoldGate({ header, reducedMotion }) {
  const gate = document.getElementById('top');
  const anchor = document.getElementById('intro');
  const sticky = document.getElementById('gate-sticky');
  const prompt = document.getElementById('gate-prompt');
  const openButton = document.getElementById('gate-open');
  const mold = document.getElementById('mold');
  const moldBg = document.getElementById('mold-bg');
  const lid = document.getElementById('mold-lid');
  const hero = document.getElementById('hero');

  let viewportWidth = 0;
  let viewportHeight = 0;
  let headerBottom = 0;
  let heroHeight = 0;
  let openScrollY = 1;
  let frameRequested = false;

  function measure() {
    const width = document.documentElement.clientWidth;
    let height = window.innerHeight;

    if (viewportWidth === width && Math.abs(height - viewportHeight) < VIEWPORT_JITTER) {
      height = viewportHeight;
    }

    viewportWidth = width;
    viewportHeight = height;
    headerBottom = header.offsetHeight + HEADER_GAP;
    heroHeight = hero.offsetHeight;
    render();
  }

  function render() {
    const vw = viewportWidth;
    const vh = viewportHeight;
    const isMobile = vw <= MOBILE_MAX_WIDTH;

    openScrollY = Math.round(vh * (1 + OPEN_SCROLL_RATIO)) - vh;
    const progress = clamp01(window.scrollY / openScrollY);
    const lidProgress = easeInOutQuad(clamp01(progress / LID_OPEN_END));
    const growProgress = easeInOutQuad(clamp01((progress - GROW_START) / (1 - GROW_START)));

    // 열린 틀 = 본문 너비
    const openWidth = Math.min(CONTENT_MAX_WIDTH, vw - (isMobile ? 24 : 32));
    const sidePadding = isMobile ? 16 : 24;
    const bottomPadding = isMobile ? 16 : 24;

    // 닫힌 틀 크기
    let closedHeight = Math.min(MOLD_MAX_HEIGHT, Math.max(MOLD_MIN_HEIGHT, vh - headerBottom - PROMPT_AREA - 10));
    let closedWidth = closedHeight / MOLD_ASPECT;
    const maxClosedWidth = Math.min(vw * 0.4, (vw - 48) / 2) * (isMobile ? 1.15 : 1);
    if (closedWidth > maxClosedWidth) {
      closedWidth = maxClosedWidth;
      closedHeight = closedWidth * MOLD_ASPECT;
    }

    const closedTop = headerBottom + Math.max(8, (vh - headerBottom - PROMPT_AREA - closedHeight) / 2);
    const heroSpace = heroHeight + sidePadding + bottomPadding;
    const openTop = headerBottom + Math.max(MIN_TOP_SPACE, ((vh - headerBottom - heroSpace) * 2) / 3);
    const openBottom = Math.ceil(Math.max(vh, openTop + heroSpace));

    const width = lerp(closedWidth, openWidth, growProgress);
    const height = lerp(closedHeight, openBottom - openTop, growProgress);
    const top = lerp(closedTop, openTop, growProgress);
    // 뚜껑이 열리는 동안 오른쪽 절반(아래 틀)이 화면 가운데에 오도록 밀어 준다
    const shiftX = (closedWidth / 2) * lidProgress * (1 - growProgress);

    gate.style.height = `${openScrollY + openBottom}px`;
    anchor.style.top = `${openScrollY}px`;
    sticky.style.height = `${Math.ceil(Math.max(vh, top + height))}px`;

    const promptOpacity = 1 - clamp01(progress / PROMPT_FADE_END);
    prompt.style.top = `${closedTop + closedHeight + 16}px`;
    prompt.style.opacity = promptOpacity;
    prompt.style.visibility = promptOpacity > 0.02 ? 'visible' : 'hidden';

    mold.style.left = `${(vw - width) / 2 + shiftX}px`;
    mold.style.top = `${top}px`;
    mold.style.width = `${width}px`;
    mold.style.height = `${height}px`;

    const closedEdge = 1 - growProgress;
    moldBg.style.borderBottom = `${4 * closedEdge}px solid var(--color-ink)`;
    moldBg.style.borderRadius = `10px 10px ${10 * closedEdge}px ${10 * closedEdge}px`;

    lid.style.width = `${closedWidth}px`;
    lid.style.height = `${closedHeight}px`;
    lid.style.transform = `rotateY(${-180 * lidProgress}deg)`;
    lid.style.opacity = 1 - clamp01((lidProgress - 0.85) / 0.15);

    // 소개 상자는 열린 틀 기준 크기로 두고, 틀이 넓어지는 동안 비율대로 줄여서 보여 준다
    const heroWidth = openWidth - sidePadding * 2;
    const scale = Math.min(
      1,
      (width - sidePadding * 2) / heroWidth,
      (height - sidePadding - bottomPadding) / Math.max(1, heroHeight),
    );
    const heroOpacity = clamp01((progress - HERO_FADE_START) / HERO_FADE_LENGTH);
    hero.style.width = `${Math.round(heroWidth)}px`;
    hero.style.bottom = `${bottomPadding}px`;
    hero.style.transform = `translateX(-50%) scale(${scale})`;
    hero.style.opacity = heroOpacity;
    hero.style.visibility = heroOpacity > 0.02 ? 'visible' : 'hidden';
  }

  function requestRender() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(() => {
      frameRequested = false;
      render();
    });
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  new ResizeObserver(measure).observe(hero);
  document.fonts?.ready.then(measure);
  measure();

  openButton.addEventListener('click', () => {
    window.scrollTo({ top: openScrollY, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  return {
    getOpenScrollY: () => openScrollY,
  };
}
