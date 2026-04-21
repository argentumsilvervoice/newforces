/**
 * ══════════════════════════════════════════════════════
 *  Лекарь Вэй — Предзаказы и Вопросы → Google Sheets
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
 *
 *  СТРУКТУРА ТАБЛИЦЫ:
 *  - Лист «Предзаказы» — имя, телефон, email, вариант, источник
 *  - Лист «Вопросы»    — имя, контакт, вопрос, источник
 */

// ── Конфигурация ──────────────────────────────────────
var ORDERS_SHEET   = "Предзаказы";
var QUESTIONS_SHEET = "Вопросы";

// ── Обработчик POST-запроса с сайта ──────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.type === "question") {
      writeQuestion(data);
    } else {
      writeOrder(data);
    }

    return jsonResponse({ status: "ok" });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

// ── Обработчик GET (для проверки в браузере) ──────────
function doGet(e) {
  return jsonResponse({ status: "ok", message: "Лекарь Вэй Apps Script работает" });
}

// ── Запись предзаказа ─────────────────────────────────
function writeOrder(data) {
  var sheet = getOrCreateSheet(ORDERS_SHEET, [
    "Дата и время", "Имя", "Телефон", "Email", "Вариант", "Источник"
  ], "#2D1B4E");

  var variant = data.qty == 3
    ? "3 банки — Полный курс (4 800 ₽)"
    : "1 банка — Старт (1 800 ₽)";

  sheet.appendRow([
    new Date(),
    data.name  || "",
    data.phone || "",
    data.email || "",
    variant,
    data.source || "сайт"
  ]);
}

// ── Запись вопроса ────────────────────────────────────
function writeQuestion(data) {
  var sheet = getOrCreateSheet(QUESTIONS_SHEET, [
    "Дата и время", "Имя", "Контакт", "Вопрос", "Источник"
  ], "#1B3A4E");

  sheet.appendRow([
    new Date(),
    data.name     || "",
    data.contact  || "",
    data.question || "",
    data.source   || "сайт"
  ]);
}

// ── Создать лист с шапкой, если не существует ─────────
function getOrCreateSheet(name, headers, headerColor) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);

    var header = sheet.getRange(1, 1, 1, headers.length);
    header.setFontWeight("bold");
    header.setBackground(headerColor || "#2D1B4E");
    header.setFontColor("#ffffff");
    sheet.setFrozenRows(1);

    // Ширина колонок
    sheet.setColumnWidth(1, 160);
    for (var i = 2; i <= headers.length; i++) {
      sheet.setColumnWidth(i, i === headers.length - 1 ? 360 : 160);
    }
  }

  return sheet;
}

// ── Вспомогательная: JSON-ответ ───────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
