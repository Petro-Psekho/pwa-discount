const prizes = ["5%", "10%", "15%", "20%", "Проигрыш", "Бесплатная доставка"];
const wheel = document.getElementById("wheel");
const result = document.getElementById("result");
const spinBtn = document.getElementById("spinBtn");

spinBtn.addEventListener("click", () => {
  const index = Math.floor(Math.random() * prizes.length);
  const prize = prizes[index];
  result.textContent = "Вы выиграли: " + prize + "!";
  localStorage.setItem("lastPrize", prize);
});

// Установка PWA
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});

installBtn.addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
      deferredPrompt = null;
    });
  }
});

// iOS баннер
if (isIos() && !isInStandaloneMode()) {
  const banner = document.getElementById('iosBanner');
  const closeBtn = document.getElementById('closeIosBanner');

  if (!localStorage.getItem('iosBannerDismissed')) {
    banner.style.display = 'block';
  }

  closeBtn.addEventListener('click', () => {
    banner.style.display = 'none';
    localStorage.setItem('iosBannerDismissed', 'true');
  });
}

// Регистрация service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}