import { randomBetween, CONTENT_MAX_WIDTH } from './utils.js';

/*
 * 김 연출. 게임의 SteamManager와 같은 규칙:
 * 1~5초 무작위 간격으로 하나씩, 1.5초 동안 떠오르며 투명도 0.5 → 0.
 * 웹에서는 글을 가리지 않도록 화면 양쪽 가장자리에서만 생성한다.
 */

const SPAWN_MIN_MS = 1000;
const SPAWN_MAX_MS = 5000;
const RISE_DISTANCE = 450; // 60fps 기준 프레임당 5px × 1.5초

// 원본 이미지 너비 (게임의 SetNativeSize 크기). 화면 너비에 맞춰 줄여 쓴다.
const SPRITES = [
  { src: 'assets/images/steam-1.png', width: 334 },
  { src: 'assets/images/steam-2.png', width: 245 },
];

const EDGE_RATIO = 0.12;    // 여백이 없을 때 쓰는 가장자리 폭 (화면 너비 비율)
const MAX_OVERLAP = 0.25;   // 본문 쪽으로 걸쳐도 되는 정도 (김 너비 비율)

export function initSteam() {
  const layer = document.getElementById('steam-layer');

  function spawn() {
    if (document.hidden) return;

    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const scale = Math.min(0.6, Math.max(0.36, vw / CONTENT_MAX_WIDTH));
    const sprite = SPRITES[Math.floor(Math.random() * SPRITES.length)];
    const width = Math.round(sprite.width * scale);

    const sideGutter = (vw - Math.min(CONTENT_MAX_WIDTH, vw - 32)) / 2;
    const band = Math.max(sideGutter, vw * EDGE_RATIO);
    const minOffset = -width * MAX_OVERLAP;
    const maxOffset = Math.max(minOffset, band - width * MAX_OVERLAP);
    const offset = randomBetween(minOffset, maxOffset);

    const steam = new Image();
    steam.src = sprite.src;
    steam.alt = '';
    steam.className = 'steam';
    steam.style.width = `${width}px`;
    steam.style.left = `${Math.random() < 0.5 ? offset : vw - offset}px`;
    steam.style.top = `${Math.random() * vh}px`;
    steam.style.setProperty('--rise', `${-RISE_DISTANCE * scale}px`);
    steam.addEventListener('animationend', () => steam.remove(), { once: true });

    layer.append(steam);
  }

  function scheduleNext() {
    setTimeout(() => {
      spawn();
      scheduleNext();
    }, randomBetween(SPAWN_MIN_MS, SPAWN_MAX_MS));
  }

  scheduleNext();
}
