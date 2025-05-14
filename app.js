const button = document.getElementById("drawButton");
const result = document.getElementById("result");

const discounts = [0, 5, 10, 15, 20]; // возможные скидки

button.addEventListener("click", () => {
  const random = Math.floor(Math.random() * discounts.length);
  const value = discounts[random];

  if (value === 0) {
    result.textContent = "Увы, сегодня без скидки 😢 Попробуйте позже!";
  } else {
    result.innerHTML = `Поздравляем! Ваша скидка: <strong>${value}%</strong><br><a href="https://example.com/product?discount=${value}">Перейти к товару</a>`;
  }
});

// Регистрация Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("Service Worker зарегистрирован"))
    .catch((err) => console.error("Ошибка регистрации SW:", err));
}
