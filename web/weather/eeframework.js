window.eelib = {
    leftBtn: 'nav',
};

window.pages = [
    {
        id: 'home',
        title: 'Main',
        //description: 'General Elements',
        icon: 'img/ui/home.svg',
        active: true,
    },
    {
        id: 'about',
        title: 'About',
        icon: 'img/ui/user.svg',
        subpages: [
            'socials',
        ],
        subpagesmode: 'modal',
    },
    {
        id: 'socials',
        title: 'Socials',
        icon: 'img/ui/user.svg',
        noBottom: true,
        leftBtn: false,
    },
    {
        id: 'settings',
        title: 'Настройки',
        icon: 'img/ui/settings.svg',
        noBottom: true,
    },
];

// Wait for pages.js to be ready before initializing navigation
function initializeNav() {
    if (window.pagesManager && typeof window.pagesManager.createBtnList === 'function') {
        console.log('Initializing navigation...');
        window.cnavMgr.init(pages);
        window.cnavMgr.createNav(pages);
    } else {
        console.log('Waiting for pagesManager...');
        window.addEventListener('pagesManagerReady', () => {
            console.log('pagesManager ready, initializing navigation...');
            window.cnavMgr.init(pages);
            window.cnavMgr.createNav(pages);
        }, { once: true });
    }
}

// Initialize navigation
initializeNav();

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
    schema: {
        clock: {
        title: "Clock",
        items: [
            {
                type: "select",
                key: "clockFormat",
                label: "Clock Format",
                options: { "12": "12-hour", "24": "24-hour" }
            },
            { type: "toggle", key: "showSeconds", label: "Show Seconds" },
            { type: "toggle", key: "showDate", label: "Show Date" }
        ]
        },
        weather: {
        title: "Weather",
        items: [
            { type: "toggle", key: "background", label: "Weather Background" },
            { type: "toggle", key: "pageBackground", label: "Page Background" }
        ]
        }
    },
    onChange: (settings) => {
        // Вызывается при любом изменении настроек
        if (typeof updateTimeDisplay === 'function') {
        updateTimeDisplay();
        }
    }
});

// Генерация UI
settingsManager.generateUI('settings');

// Примеры использования:
// settingsManager.get('clock.clockFormat')
// settingsManager.set('clock.showSeconds', true)
// settingsManager.reset()

});
