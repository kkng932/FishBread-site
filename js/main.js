import { prefersReducedMotion } from './utils.js';
import { initMoldGate } from './mold-gate.js';
import { initReveal } from './reveal.js';
import { initAnchorScroll } from './anchor-scroll.js';
import { initSteam } from './steam.js';
import { initDayFlow } from './day-flow.js';
import { initVideoPlayer } from './video-player.js';
import { initCopyEmail } from './copy-email.js';

const reducedMotion = prefersReducedMotion();
const header = document.getElementById('site-header');

const gate = initMoldGate({ header, reducedMotion });
initReveal({ reducedMotion });
initAnchorScroll({ header, getGateOpenY: gate.getOpenScrollY, reducedMotion });
initVideoPlayer();
initCopyEmail();

// 움직임 줄이기를 켠 사용자에게는 장식용 애니메이션을 넣지 않는다
if (!reducedMotion) {
  initSteam();
  initDayFlow();
}
