import './randomizer.js';

const defaultSettings = {
    clock: {
        format: "24",
        showSeconds: false,
        showDate: true
    },
    theme: {
        darkMode: false,
        accentColor: "#2196F3"
    }
};

const settingsSchema = {
    clock: {
        title: "Часы",
        items: [
            {
                type: "select",
                key: "format",
                label: "Формат времени",
                options: {
                    "12": "12-часовой",
                    "24": "24-часовой"
                }
            },
            { type: "toggle", key: "showSeconds", label: "Показывать секунды" },
            { type: "toggle", key: "showDate", label: "Показывать дату" }
        ]
    },
    theme: {
        title: "Тема",
        items: [
            { type: "toggle", key: "darkMode", label: "Темная тема" },
            { type: "text", key: "accentColor", label: "Цвет акцента" }
        ]
    }
};


// Инициализация настроек
document.addEventListener("DOMContentLoaded", () => {
window.settingsManager.init({
    storageKey: 'appSettings',
    defaultSettings: {
        weather: {
            town: '',
            location: [0, 0],
            unit: "C",
            background: false,
            pageBackground: false,
            },
        clock: {
            clockFormat: "24",
            showSeconds: false,
            showDate: true,
            dateFormat: "DDMMYYYY",
            timeZone: "local",
            showDayOfWeek: true,
            leadingZero: true,
            amPm: false,
            showYear: true,
            monthAsText: false,
            dateSeparator: "/",
            jucheCalendar: false,
        }
    },
    schema: {},
    onChange: (settings) => {
        // Вызывается при любом изменении настроек
        if (typeof updateTimeDisplay === 'function') {
        updateTimeDisplay();
        }
    }
});

// Генерация UI
settingsManager.generateUI('settings');

// Инициализация рандомайзера
if (typeof Randomizer !== 'undefined') {
    window.randomizer = new Randomizer();
}

// Примеры использования:
// settingsManager.get('clock.clockFormat')
// settingsManager.set('clock.showSeconds', true)
// settingsManager.reset()

});