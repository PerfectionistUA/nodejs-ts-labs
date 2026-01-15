// URL REST API: отримуємо назву країни та посилання на мапи
const API_URL = "https://restcountries.com/v3.1/all?fields=name,maps";

// Отримуємо елементи сторінки
const tbody = document.getElementById("tbody"); // тіло таблиці
const statusDiv = document.getElementById("status"); // рядок статусу (завантаження / помилки)
const filterInput = document.getElementById("filter"); // поле фільтра
const reloadBtn = document.getElementById("reloadBtn"); // кнопка перезавантаження

// Кеш, щоб не робити fetch кожен раз та фільтрувати на клієнті
let countriesCache = [];

/**
 * Вивід службового повідомлення
 * @param {string} text – текст повідомлення
 * @param {boolean} isError – чи це помилка
 */
function setStatus(text, isError = false) {
  if (!statusDiv) return;

  statusDiv.className = isError
    ? "text-sm text-red-700"
    : "text-sm text-gray-600";

  statusDiv.textContent = text;
}

// Отримання назви країни (може повернути неповні дані)
function safeCountryName(item) {
  return item?.name?.common ?? "Unknown";
}

// Отримання Google Maps URL
function safeMapUrl(item) {
  return item?.maps?.googleMaps ?? "";
}

// Очищаємо таблицю
function clearTable() {
  if (tbody) tbody.innerHTML = "";
}

/**
 * Додаємо один рядок у таблицю
 * @param {number} index – номер рядка
 * @param {string} countryName – назва країни
 * @param {string} mapUrl – посилання на Google Maps
 */
function addRow(index, countryName, mapUrl) {
  if (!tbody) return;

  const tr = document.createElement("tr");
  tr.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";

  // №
  const tdIndex = document.createElement("td");
  tdIndex.className = "px-3 py-2 border-b whitespace-nowrap";
  tdIndex.textContent = String(index);

  // Назва країни
  const tdCountry = document.createElement("td");
  tdCountry.className = "px-3 py-2 border-b";
  tdCountry.textContent = countryName;

  // Посилання на мапу
  const tdLink = document.createElement("td");
  tdLink.className = "px-3 py-2 border-b";

  if (mapUrl) {
    const a = document.createElement("a");
    a.href = mapUrl;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.className = "text-blue-600 underline break-all";
    a.textContent = mapUrl;
    tdLink.appendChild(a);
  } else {
    tdLink.textContent = "—";
    tdLink.className += " text-gray-400";
  }

  tr.appendChild(tdIndex);
  tr.appendChild(tdCountry);
  tr.appendChild(tdLink);

  tbody.appendChild(tr);
}

// Перемальовуємо таблицю з масиву країн
function renderTable(list) {
  clearTable();

  list.forEach((item, idx) => {
    addRow(idx + 1, safeCountryName(item), safeMapUrl(item));
  });

  setStatus(`Знайдено країн: ${list.length}`);
}

// Фільтрація по назві країни
function applyFilter() {
  const q = (filterInput?.value ?? "").trim().toLowerCase();

  if (!q) return renderTable(countriesCache);

  const filtered = countriesCache.filter((c) =>
    safeCountryName(c).toLowerCase().includes(q)
  );

  renderTable(filtered);
}

// Функція завантаження даних з REST API та збереження їх у кеш
async function loadCountries() {
  try {
    setStatus("Завантаження даних з REST API...");
    clearTable();

    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new TypeError("Очікувався масив країн");
    }

    // Сортуємо країни за алфавітом
    countriesCache = data
      .slice()
      .sort((a, b) => safeCountryName(a).localeCompare(safeCountryName(b)));

    renderTable(countriesCache);
  } catch (e) {
    setStatus(`Помилка: ${e?.message ?? "невідома"}`, true);
  }
}

// Події UI
filterInput?.addEventListener("input", applyFilter);
reloadBtn?.addEventListener("click", () => void loadCountries());

// Старт після завантаження сторінки
loadCountries();
