/**
 * ══════════════════════════════════════════════════════
 *  Лекарь Вэй — Предзаказы → Google Sheets
 *  Apps Script (вставить в редактор скриптов таблицы)
 * ══════════════════════════════════════════════════════
 *
 *  КАК ПОДКЛЮЧИТЬ:
 *  1. Открой Google Таблицу → Расширения → Apps Script
 *  2. Вставь весь этот код (замени всё что там было)
 *  3. Нажми «Сохранить» (Ctrl+S)
 *  4. Нажми «Развернуть» → «Новое развёртывание»
 *     - Тип: Веб-приложение
 *     - Выполнять от имени: Я (твой аккаунт)
 *     - Доступ: Все (в т.ч. анонимные пользователи)
 *  5. Скопируй URL вида https://script.google.com/macros/s/XXXX/exec
 *  6. Вставь этот URL в index.html — в переменную APPS_SCRIPT_URL
 */

// ── Конфигурация ──────────────────────────────────────
var SHEET_NAME = "Предзаказы"; // имя листа (создастся автоматически)

// ── Обработчик POST-запроса с сайта ──────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    writeRow(data);
    return jsonResponse({ status: "ok" });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

// ── Обработчик GET (для проверки в браузере) ──────────
function doGet(e) {
  return jsonResponse({ status: "ok", message: "Лекарь Вэй Apps Script работает" });
}

// ── Запись строки в таблицу ───────────────────────────
function writeRow(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  // Создать лист + шапку, если не существует
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Дата и время",
      "Имя",
      "Телефон",
      "Email",
      "Вариант",
      "Источник"
    ]);
    // Форматирование шапки
    var header = sheet.getRange(1, 1, 1, 6);
    header.setFontWeight("bold");
    header.setBackground("#2D1B4E");
    header.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160); // Дата
    sheet.setColumnWidth(2, 140); // Имя
    sheet.setColumnWidth(3, 140); // Телефон
    sheet.setColumnWidth(4, 200); // Email
    sheet.setColumnWidth(5, 160); // Вариант
    sheet.setColumnWidth(6, 120); // Источник
  }

  // Формат варианта заказа
  var variant = data.qty == 3
    ? "3 банки — Полный курс (4 800 ₽)"
    : "1 банка — Старт (1 800 ₽)";

  sheet.appendRow([
    new Date(),              // Дата и время (автоматически)
    data.name  || "",        // Имя
    data.phone || "",        // Телефон
    data.email || "",        // Email
    variant,                 // Вариант заказа
    data.source || "сайт"   // Источник (для A/B тестов)
  ]);
}

// ── Вспомогательная: JSON-ответ с CORS ───────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
