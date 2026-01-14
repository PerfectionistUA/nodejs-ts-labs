// шукаємо по DOM елемент за id result та зберігаємо в resultDiv, щоб потім швидко міняти текст і стиль
const resultDiv = document.getElementById("result");

function num(id) {
  // шукаємо input за його id (editX, editY, editZ)
  const el = document.getElementById(id);

  if (!el) throw new ReferenceError(`Немає елемента з id=${id}`);

  // перетворюємо на число
  const v = Number(el.value);

  // перевіряємо, що це справді нормальне число (не NaN, не Infinity).
  if (!Number.isFinite(v)) throw new TypeError(`Некоректне число у полі ${id}`);

  // повертаємо готове число
  return v;
}

// функція розрахунку
async function calculate() {

  try {
    // отримуємо x, y, z з інпутів
    const x = num("editX");
    const y = num("editY");
    const z = num("editZ");

    // перевірки ділення на 0
    if (x === 0) throw new RangeError("x = 0 → ділення на нуль");

    const denominator = x - y + 1.6 * z;

    if (denominator === 0)
      throw new RangeError("знаменник = 0 → ділення на нуль");

    // обчислення формули
    const S = (x - (2.24 * y * z) / x - 5) / denominator + 12 * x;

    // для демонстрації (переносить продовження виконання на наступний цикл подій браузера)
    await new Promise((r) => setTimeout(r, 0));

    // прибираємо клас помилки (якщо до цього була)
    resultDiv.className = "";

    // показуємо результат до 7 знаків після крапки
    resultDiv.textContent = `S = ${S.toFixed(7)}`;
  } catch (e) {
    let prefix = "Помилка";

    // перехоплення помилок по типах
    if (e instanceof RangeError) prefix = "RangeError";
    if (e instanceof TypeError) prefix = "TypeError";
    if (e instanceof ReferenceError) prefix = "ReferenceError";

    // виводимо повідомлення помилки червоним
    resultDiv.className = "border rounded-lg p-3 bg-red-100 text-red-800";
    resultDiv.textContent = `${prefix}: ${e?.message ?? "невідома помилка"}`;
  }

}

// підключаємо функцію calculate до кнопки та запускаємо при кліку
document
  .getElementById("calcBtn")
  ?.addEventListener("click", () => void calculate());
