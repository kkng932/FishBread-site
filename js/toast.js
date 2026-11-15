const VISIBLE_MS = 2000;

let hideTimer;

export function showToast(message) {
  const toast = document.getElementById('toast');

  toast.textContent = message;
  toast.classList.add('is-visible');

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove('is-visible'), VISIBLE_MS);
}
