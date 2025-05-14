const discounts = [0, 5, 10, 15, 20];
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const userNameDisplay = document.getElementById("userNameDisplay");
const result = document.getElementById("result");
const spinButton = document.getElementById("spinButton");
const historyList = document.getElementById("historyList");
const wheel = document.getElementById("wheel");

let user = null;

loginBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    user = name;
    localStorage.setItem("pwa-user", user);
    showApp();
  }
});

function showApp() {
  loginSection.style.display = "none";
  appSection.style.display = "block";
  userNameDisplay.textContent = user;
  loadHistory();
}

function loadHistory() {
  historyList.innerHTML = "";
  const history = JSON.parse(localStorage.getItem(`history-${user}`)) || [];
  history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `Скидка: ${item}%`;
    historyList.appendChild(li);
  });
}

spinButton.addEventListener("click", () => {
  spinButton.disabled = true;
  const rotation = Math.floor(Math.random() * 360) + 720; // минимум 2 оборота
  wheel.style.transform = `rotate(${rotation}deg)`;

  // Определим выигрыш через 4 секунды
  setTimeout(() => {
    const index = Math.floor(Math.random() * discounts.length);
    const discount = discounts[index];

    if (discount === 0) {
      result.textContent = "Увы, сегодня без скидки 😢";
    } else {
      result.innerHTML = `Вы выиграли <strong>${discount}%</strong> скидки!<br><a href="https://example.com/product?discount=${discount}" target="_blank">Перейти к товару</a>`;
    }

    // Запись в историю
    const history = JSON.parse(localStorage.getItem(`history-${user}`)) || [];
    history.unshift(discount);
    localStorage.setItem(`history-${user}`, JSON.stringify(history));
    loadHistory();

    spinButton.disabled = false;
  }, 4000);
});

// Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((registration) => {
        console.log("Service Worker зарегистрирован");

        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          newWorker.onstatechange = () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("Найдено обновление. Обновляем...");
                newWorker.postMessage({ action: "skipWaiting" });
              }
            }
          };
        };
      })
      .catch((err) => console.error("Ошибка регистрации SW:", err));
  });

  let refreshing;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });
}

// Автоавторизация
window.addEventListener("load", () => {
  const savedUser = localStorage.getItem("pwa-user");
  if (savedUser) {
    user = savedUser;
    showApp();
  }
});

// 🚪 Выход
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("pwa-user");
  location.reload();
});

// 💾 Установка на устройство
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

// Проверка, установлено ли уже PWA
const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

if (!isInStandaloneMode()) {
  installBtn.style.display = "inline-block";
}

// Сохраняем событие установки
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";
});

// Кнопка установки
installBtn.addEventListener("click", () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Пользователь установил приложение");
        installBtn.style.display = "none";
      } else {
        console.log("Пользователь отменил установку");
      }
      deferredPrompt = null;
    });
  }
});

// 🔔 Push-уведомления
const notifyBtn = document.getElementById("notifyBtn");
notifyBtn.addEventListener("click", () => {
  Notification.requestPermission().then((perm) => {
    if (perm === "granted") {
      new Notification("Уведомления включены 🎉", {
        body: "Теперь вы будете получать новости!",
        icon: "/icons/icon-192.png",
      });
    } else {
      alert("Разрешите уведомления в настройках браузера");
    }
  });
});

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  return "standalone" in window.navigator && window.navigator.standalone;
}

if (isIos() && !isInStandaloneMode()) {
  document.getElementById("iosInstallHint").style.display = "block";
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  return "standalone" in window.navigator && window.navigator.standalone;
}

// Показываем кастомный баннер только если iOS и не установлено
if (isIos() && !isInStandaloneMode()) {
  const banner = document.getElementById("iosBanner");
  const closeBtn = document.getElementById("closeIosBanner");

  // Не показывать повторно, если пользователь уже закрыл баннер
  if (!localStorage.getItem("iosBannerDismissed")) {
    banner.style.display = "block";
  }

  closeBtn.addEventListener("click", () => {
    banner.style.display = "none";
    localStorage.setItem("iosBannerDismissed", "true");
  });
}
