// URL до текстового файлу з вхідними даними
const DATA_URL =
  "https://raw.githubusercontent.com/igorg74/data/refs/heads/main/data.txt";

// Отримуємо елементи сторінки для виводу результатів і даних
const resultDiv = document.getElementById("result");
const inputDataDiv = document.getElementById("inputData");
const dataLink = document.getElementById("dataLink");

// Підставляємо реальне посилання на data.txt в HTML
if (dataLink) dataLink.href = DATA_URL;

// Функція для виводу результату або повідомлення про помилку
function showResult(text, isError = false, prefix = "") {
  if (!resultDiv) return;

  // Змінюємо стилі залежно від того, помилка це чи ні
  resultDiv.className = isError
    ? "border rounded-lg p-3 bg-red-100 text-red-800 font-semibold"
    : "border rounded-lg p-3 bg-gray-50 font-semibold";

  // Виводимо текст (з префіксом типу помилки, якщо потрібно)
  resultDiv.textContent = prefix ? `${prefix}: ${text}` : text;
}

// Функція для показу завантажених вхідних даних (масиву a)
function showInputs(a) {
  if (!inputDataDiv) return;

  // Формуємо текст вигляду: a[0] = ..., a[1] = ...
  inputDataDiv.textContent = a.map((v, i) => `a[${i}] = ${v}`).join("\n");
}

// Асинхронна функція завантаження та обробки даних
async function getData() {
  // Завантажуємо файл з інтернету
  const res = await fetch(DATA_URL, { cache: "no-store" });

  // Якщо сервер повернув помилку — зупиняємо виконання
  if (!res.ok) {
    throw new Error(`Помилка завантаження data.txt (HTTP ${res.status})`);
  }

  // Отримуємо текст і розбиваємо його на числа
  const text = await res.text();
  const parts = text.trim().split(/\s+/);
  const a = parts.map((s) => Number.parseFloat(s));

  // Перевірка кількості елементів (повинно бути 11)
  if (a.length !== 11) {
    throw new RangeError(`Очікувалось 11 чисел, отримано: ${a.length}`);
  }

  // Перевірка, що всі значення — коректні числа
  if (a.some((x) => !Number.isFinite(x))) {
    throw new TypeError("data.txt містить некоректні значення (NaN/Infinity)");
  }

  return a; // Повертаємо масив a[0]..a[10]
}

// Головна функція розрахунку
async function calculate() {
  try {
    // Повідомляємо користувача, що почався розрахунок
    showResult("Завантаження даних та обчислення...", false);

    // Отримуємо вхідні дані
    const a = await getData();
    showInputs(a);

    let S = 0; // Змінна для накопичення суми
    const EPS = 1e-12; // Маленьке число для перевірки ділення на нуль

    // Обчислюємо суму за формулою
    for (let i = 1; i <= 11; i++) {
      const ai = a[i - 1]; // Враховуємо, що індексація з 0
      const denom = 1 - Math.sin(2 * ai); // Знаменник формули

      // Перевірка ділення на нуль
      if (Math.abs(denom) < EPS) {
        throw new RangeError(
          `Ділення на нуль: 1 - sin(2*a_${i}) ≈ 0 (a_${i} = ${ai})`
        );
      }

      const term = Math.cos(2 * ai) / denom;

      // Додаткова перевірка коректності обчислення
      if (!Number.isFinite(term)) {
        throw new RangeError(`Некоректний доданок для i=${i}`);
      }

      S += term; // Додаємо поточний елемент до суми
    }

    // Формальна асинхронність (наступний цикл подій)
    await new Promise((r) => setTimeout(r, 0));

    // Виводимо фінальний результат з точністю до 7 знаків
    showResult(`S = ${S.toFixed(7)}`, false);
  } catch (e) {
    // Визначаємо тип помилки для більш зрозумілого повідомлення
    let prefix = "Помилка";

    if (e instanceof RangeError) prefix = "RangeError";
    else if (e instanceof TypeError) prefix = "TypeError";
    else if (e instanceof ReferenceError) prefix = "ReferenceError";
    else if (e instanceof Error) prefix = "Error";

    // Виводимо повідомлення про помилку
    showResult(e?.message ?? "невідома помилка", true, prefix);
  }
}

// Обробник натискання кнопки Calculate
document
  .getElementById("calcBtn")
  ?.addEventListener("click", () => void calculate());
