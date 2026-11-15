import { showReveal } from './reveal.js';

const OFFSET_BELOW_HEADER = 24;

/*
 * 페이지 안 링크(#...)를 누르면 고정 헤더에 가리지 않는 위치로 이동한다.
 * #intro는 물고기빵 틀이 다 열린 지점이라 스크롤 위치를 따로 계산한다.
 */
export function initAnchorScroll({ header, getGateOpenY, reducedMotion }) {
  function getTargetY(hash) {
    if (hash === '#top') return 0;
    if (hash === '#intro') return getGateOpenY();

    const target = document.querySelector(hash);
    if (!target) return null;

    // 등장 애니메이션 전이면 위치가 아래로 밀려 있으므로 먼저 보이게 한다
    if (target.classList.contains('reveal')) showReveal(target);

    const headerBottom = header.getBoundingClientRect().bottom;
    return target.getBoundingClientRect().top + window.scrollY - headerBottom - OFFSET_BELOW_HEADER;
  }

  function scrollToHash(hash, smooth) {
    const y = getTargetY(hash);
    if (y === null) return false;

    window.scrollTo({ top: Math.max(0, y), behavior: smooth && !reducedMotion ? 'smooth' : 'auto' });
    return true;
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (hash.length < 2 || !scrollToHash(hash, true)) return;

    event.preventDefault();
    const url = hash === '#top' ? location.pathname + location.search : hash;
    history.replaceState(null, '', url);
  });

  // 주소에 #이 붙은 채로 들어왔을 때
  if (location.hash.length > 1) {
    window.addEventListener('load', () => {
      requestAnimationFrame(() => scrollToHash(location.hash, false));
    });
  }
}
