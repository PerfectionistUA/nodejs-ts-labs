// Отримуємо canvas та контекст малювання 2D
const canvas = document.getElementById("plot");
const ctx = canvas?.getContext("2d");

// Елементи керування
const pointsInput = document.getElementById("points");
const drawBtn = document.getElementById("drawBtn");
const statusDiv = document.getElementById("status");

// Діапазон по X: [-2π; 2π]
const X_MIN = -2 * Math.PI;
const X_MAX = 2 * Math.PI;

// Діапазон по Y для sin(x): [-1; 1]
const Y_MIN = -1;
const Y_MAX = 1;

// Внутрішні поля (padding) для красивого відступу від країв
const PAD = 40;

// Службова функція для статусу
function setStatus(text, isError = false) {
  if (!statusDiv) return;
  statusDiv.className = isError
    ? "text-sm text-red-700 mt-3 text-center"
    : "text-sm text-gray-600 mt-3 text-center";
  statusDiv.textContent = text;
}

// Перетворення "математичних" координат (x,y) у координати canvas (px,py)
function mapToCanvas(x, y) {
  const w = canvas.width;
  const h = canvas.height;

  // Масштаб по X та Y
  const sx = (w - 2 * PAD) / (X_MAX - X_MIN);
  const sy = (h - 2 * PAD) / (Y_MAX - Y_MIN);

  // px: зліва направо
  const px = PAD + (x - X_MIN) * sx;

  // py: у canvas вісь Y росте вниз, тому робимо інверсію
  const py = h - PAD - (y - Y_MIN) * sy;

  return { px, py };
}

// Малюємо осі координат (X та Y)
function drawAxes() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.save();

  // Сітку не малюємо (як у прикладі), лише осі
  ctx.lineWidth = 1;

  // Вісь X: y = 0
  ctx.strokeStyle = "#93c5fd"; // light blue
  const xAxisLeft = mapToCanvas(X_MIN, 0);
  const xAxisRight = mapToCanvas(X_MAX, 0);
  ctx.beginPath();
  ctx.moveTo(xAxisLeft.px, xAxisLeft.py);
  ctx.lineTo(xAxisRight.px, xAxisRight.py);
  ctx.stroke();

  // Вісь Y: x = 0
  const yAxisBottom = mapToCanvas(0, Y_MIN);
  const yAxisTop = mapToCanvas(0, Y_MAX);
  ctx.beginPath();
  ctx.moveTo(yAxisBottom.px, yAxisBottom.py);
  ctx.lineTo(yAxisTop.px, yAxisTop.py);
  ctx.stroke();

  // Підпис y=sin(x)
  ctx.fillStyle = "#111827"; // gray-900
  ctx.font = "16px serif";
  const titlePos = mapToCanvas(0, 1);
  ctx.fillText("y = sin(x)", titlePos.px + 10, titlePos.py - 10);

  ctx.restore();
}

// Малюємо графік sin(x)
function drawSin(pointsCount) {
  ctx.save();

  ctx.strokeStyle = "#16a34a"; // green
  ctx.lineWidth = 1.2;

  ctx.beginPath();

  for (let i = 0; i < pointsCount; i++) {
    // Рівномірно пробігаємо по X від X_MIN до X_MAX
    const t = i / (pointsCount - 1);
    const x = X_MIN + t * (X_MAX - X_MIN);
    const y = Math.sin(x);

    const { px, py } = mapToCanvas(x, y);

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.stroke();
  ctx.restore();
}

// Головна функція малювання всього графіка
function draw() {
  try {
    if (!canvas || !ctx) throw new Error("Canvas або 2D контекст недоступний");

    const pointsCount = Number(pointsInput?.value ?? 1200);

    if (!Number.isFinite(pointsCount) || pointsCount < 50) {
      throw new RangeError("Кількість точок має бути коректним числом (>= 50)");
    }

    // Очищаємо полотно
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Малюємо осі та графік
    drawAxes();
    drawSin(pointsCount);

    setStatus(
      `Побудовано y=sin(x) на [-2π; 2π], точок: ${pointsCount}`
    );
  } catch (e) {
    setStatus(e?.message ?? "Невідома помилка", true);
  }
}

// Кнопка Draw
drawBtn?.addEventListener("click", draw);

// Авто-побудова при відкритті сторінки
draw();
