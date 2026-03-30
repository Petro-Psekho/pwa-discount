const PRIZES = ["5%", "10%", "15%", "20%", "Проигрыш", "Бесплатная доставка"];
const STORAGE_KEYS = {
  username: "username",
  history: "history",
};
const SPIN_DURATION_MS = 4000;
const SPIN_EASING = "transform 4s cubic-bezier(0.33, 1, 0.68, 1)";

const el = {
  wheel: document.getElementById("wheel"),
  result: document.getElementById("result"),
  spinBtn: document.getElementById("spinBtn"),
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  usernameInput: document.getElementById("username"),
  userNameDisplay: document.getElementById("userNameDisplay"),
  loginSection: document.getElementById("loginSection"),
  appSection: document.getElementById("appSection"),
  historyTitle: document.getElementById("historyTitle"),
  historyList: document.getElementById("historyList"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  installBtn: document.getElementById("installBtn"),
  installModal: document.getElementById("installModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
};

const state = {
  currentRotation: 0,
  spinTimeoutId: null,
  deferredPrompt: null,
};

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function getStoredText(key) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function setStoredText(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // noop: storage may be unavailable in private contexts
  }
}

function removeStoredItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  } catch {
    // noop
  }
}

function renderHistory(history = getHistory()) {
  el.historyTitle.style.display = history.length ? "block" : "none";
  el.historyList.innerHTML = "";

  history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    el.historyList.appendChild(li);
  });
}

function clearHistory(withMessage = true) {
  removeStoredItem(STORAGE_KEYS.history);
  renderHistory([]);
  if (withMessage) {
    el.result.textContent = "История выигрышей удалена.";
  }
}

function setAuthView(isLoggedIn) {
  el.loginSection.style.display = isLoggedIn ? "none" : "block";
  el.appSection.style.display = isLoggedIn ? "block" : "none";
}

function resetWheelVisual() {
  state.currentRotation = 0;
  el.wheel.style.transition = "none";
  el.wheel.style.transform = "rotate(0deg)";
  void el.wheel.offsetHeight; // force reflow for immediate transform reset
  el.wheel.style.transition = SPIN_EASING;
}

function cancelSpinIfRunning() {
  if (!state.spinTimeoutId) {
    return;
  }

  clearTimeout(state.spinTimeoutId);
  state.spinTimeoutId = null;
  el.spinBtn.disabled = false;
}

function resetAppState() {
  cancelSpinIfRunning();
  resetWheelVisual();

  el.result.textContent = "";
  el.userNameDisplay.textContent = "";
  el.usernameInput.value = "";
  el.installModal.style.display = "none";

  renderHistory([]);
}

function handleLogin() {
  const username = el.usernameInput.value.trim();
  if (!username) {
    return;
  }

  setStoredText(STORAGE_KEYS.username, username);
  el.userNameDisplay.textContent = username;
  setAuthView(true);
  renderHistory();
}

function handleLogout() {
  removeStoredItem(STORAGE_KEYS.username);
  clearHistory(false);
  resetAppState();
  setAuthView(false);
}

function handleSpin() {
  if (state.spinTimeoutId) {
    return;
  }

  el.spinBtn.disabled = true;
  el.result.textContent = "Крутим...";

  const index = Math.floor(Math.random() * PRIZES.length);
  const prize = PRIZES[index];
  const degreesPerSegment = 360 / PRIZES.length;
  const randomOffset = Math.floor(Math.random() * (degreesPerSegment - 5));
  const segmentRotation = 360 * 5 + index * degreesPerSegment + randomOffset;

  state.currentRotation += segmentRotation;
  el.wheel.style.transition = SPIN_EASING;
  el.wheel.style.transform = `rotate(${state.currentRotation}deg)`;

  state.spinTimeoutId = setTimeout(() => {
    el.result.textContent = `Вы выиграли: ${prize}!`;

    const history = getHistory();
    history.push(prize);
    setHistory(history);
    renderHistory(history);

    el.spinBtn.disabled = false;
    state.spinTimeoutId = null;
  }, SPIN_DURATION_MS);
}

function initInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
  });

  el.installBtn.addEventListener("click", () => {
    if (isMobile || !state.deferredPrompt) {
      el.installModal.style.display = "block";
      return;
    }

    state.deferredPrompt.prompt();
    state.deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") {
        el.installBtn.style.display = "none";
      }
      state.deferredPrompt = null;
    });
  });

  el.closeModalBtn.addEventListener("click", () => {
    el.installModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === el.installModal) {
      el.installModal.style.display = "none";
    }
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => {
      console.log("[PWA] Service Worker зарегистрирован");
    })
    .catch((error) => {
      console.error("[PWA] Ошибка регистрации Service Worker:", error);
    });
}

function bindEvents() {
  el.loginBtn.addEventListener("click", handleLogin);
  el.logoutBtn.addEventListener("click", handleLogout);
  el.clearHistoryBtn.addEventListener("click", () => clearHistory(true));
  el.spinBtn.addEventListener("click", handleSpin);

  el.usernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  });
}

function init() {
  bindEvents();
  initInstallPrompt();
  registerServiceWorker();

  const username = getStoredText(STORAGE_KEYS.username);
  if (!username) {
    resetAppState();
    setAuthView(false);
    return;
  }

  el.userNameDisplay.textContent = username;
  setAuthView(true);
  renderHistory();
}

init();
