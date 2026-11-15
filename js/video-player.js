/** 영상은 재생 버튼을 누를 때만 YouTube 플레이어를 불러온다 (첫 로딩을 가볍게). */
export function initVideoPlayer() {
  const player = document.getElementById('player');
  const poster = player.querySelector('.player__poster');
  const { videoId, videoTitle } = player.dataset;

  poster.addEventListener('click', () => {
    const params = new URLSearchParams({
      autoplay: '1',
      playsinline: '1',
      rel: '0',
      cc_load_policy: '1', // 자막 켜기
      cc_lang_pref: 'ko',
      hl: 'ko',
    });

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
    iframe.title = videoTitle;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;

    player.replaceChildren(iframe);
    iframe.focus();
  }, { once: true });
}
