window.eelib = {
    nav: {
        leftBtn: 'nav',
    },
};

window.eelib.pages = [
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
        id: 'settings',
        title: 'Настройки',
        icon: 'img/ui/settings.svg',
        noBottom: true,
    },
];

window.eelib.settingsConfig = {
    storageKey: 'appSettings',
    defaultSettings: {
        clock: {
            format: "24",
            showSeconds: false,
            showDate: true
        },
        main: {
            theme: "dark",
        },
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
        },
        main: {
            title: "Main",
            items: [
                {
                    type: "select",
                    key: "theme",
                    label: "Theme",
                    options: { "dark": "Dark", "light": "Light", "oled": "Black OLED" }
                },
            ]
        },
    },
    onChange: (settings) => {
        // Вызывается при любом изменении настроек
        if (typeof updateTimeDisplay === 'function') {
        updateTimeDisplay();
        }
    }
}
