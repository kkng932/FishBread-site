import { showToast } from './toast.js';

/** 연락처의 이메일 버튼: 누르면 주소를 클립보드에 복사한다. */
export function initCopyEmail() {
  const button = document.getElementById('copy-email');
  const { email } = button.dataset;

  button.addEventListener('click', async () => {
    const copied = await copyText(email);
    showToast(copied ? '이메일 주소를 복사했어요' : `복사하지 못했어요: ${email}`);
  });
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한이 막힌 경우 아래 방식으로 다시 시도
    }
  }
  return copyWithTextarea(text);
}

// Clipboard API를 쓸 수 없는 환경(http, 일부 인앱 브라우저)용
function copyWithTextarea(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  textarea.remove();
  return copied;
}
