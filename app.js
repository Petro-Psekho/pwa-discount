const prizes = ["5%", "10%", "15%", "20%", "Проигрыш", "Бесплатная доставка"];
const wheel = document.getElementById("wheel");
const result = document.getElementById("result");
const spinBtn = document.getElementById("spinBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usernameInput = document.getElementById("username");
const userNameDisplay = document.getElementById("userNameDisplay");
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const historyList = document.getElementById("historyList");
const installBtn = document.getElementById("installBtn");
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const installModal = document.getElementById("installModal");
const closeModalBtn = document.getElementById("closeModalBtn");

let currentRotation = 0;

loginBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    localStorage.setItem("username", name);
    showApp();
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("username");
  appSection.style.display = "none";
  loginSection.style.display = "block";
});

spinBtn.addEventListener("click", () => {
  spinBtn.disabled = true;
  result.textContent = "Крутим...";

  const index = Math.floor(Math.random() * prizes.length);
  const prize = prizes[index];
  const degreesPerSegment = 360 / prizes.length;
  const randomOffset = Math.floor(Math.random() * (degreesPerSegment - 5)); // небольшой разброс
  const segmentRotation = 360 * 5 + index * degreesPerSegment + randomOffset;

  currentRotation += segmentRotation;

  wheel.style.transition = "transform 4s cubic-bezier(0.33, 1, 0.68, 1)";
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    result.textContent = "Вы выиграли: " + prize + "!";

    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.push(prize);
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();

    spinBtn.disabled = false;
  }, 4000);
});

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  historyList.innerHTML = "";
  history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

function showApp() {
  const username = localStorage.getItem("username");
  if (username) {
    userNameDisplay.textContent = username;
    loginSection.style.display = "none";
    appSection.style.display = "block";
    renderHistory();
  }
}

showApp();

// Установка PWA
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";
});

installBtn.addEventListener("click", () => {
  if (isMobile) {
    // Показываем модальное окно с инструкцией
    installModal.style.display = "block";
  } else if (deferredPrompt) {
    // Десктопное стандартное поведение
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") {
        installBtn.style.display = "none";
      }
      deferredPrompt = null;
    });
  }
});

// Регистрация service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").then(() => {
    console.log("[PWA] Service Worker зарегистрирован");
  });
}

closeModalBtn.addEventListener("click", () => {
  installModal.style.display = "none";
});
