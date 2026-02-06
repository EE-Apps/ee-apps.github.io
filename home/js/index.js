// Set title
//document.title = chrome.i18n.getMessage("tabTitle");
// Set favicon
//function updateFavicon(e) {
//    const color = e.matches ? "light" : "dark";
//    document.querySelector('link[rel="icon"]').href = `favicon-${color}.png`;
//}
//const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
//darkMode.addEventListener("change", updateFavicon);
//updateFavicon(darkMode);

// Default settings
const defaultSettings = {
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
    },
    modules: {
        weather: false,
        qbar: true,
        assistant: true,
        sidebar: true,
        pins: true,
    },
    ai: {
        chatgpt: {
            enabled: true,
            link: "https://chatgpt.com",
            name: "ChatGPT",
        },
        deepseek: {
            enabled: true,
            link: "https://chat.deepseek.com",
            name: "DeepSeek",
        },
        gemini: {
            enabled: true,
            link: "https://gemini.google.com",
            name: "Gemini",
        },
        claude: {
            enabled: true,
            link: "https://claude.ai/new",
            name: "Claude",
        },
        copilot: {
            enabled: false,
            link: "https://copilot.microsoft.com",
            name: "Copilot",
        },
        alice: {
            enabled: false,
            link: "https://alice.yandex.ru",
            name: "Yandex Alice",
        },
        grok: {
            enabled: true,
            link: "https://grok.com",
            name: "Grok",
        },
        perplexity: {
            enabled: true,
            link: "https://www.perplexity.ai",
            name: "Perplexity",
            ext: "png",
        },
        qwen: {
            enabled: false,
            link: "https://chat.qwen.ai",
            name: "Qwen",
            ext: "png",
        },
        qwencode: {
            enabled: false,
            link: "https://coder.qwen.ai",
            name: "Qwen Code",
            ext: "png",
        },
        lmarena: {
            enabled: false,
            link: "https://lmarena.ai",
            name: "LMArena",
            ext: "png",
        },
    },
    company: {
        ee: {
            enabled: true,
        },
        microsoft: {
            enabled: true,
        },
        google: {
            enabled: true,
        },
        yandex: {
            enabled: true,
        },
        vk: {
            enabled: true,
        },
        desmos: {
            enabled: true,
        },
    },
    catalogs: [
        {
            name: 'Steam',
            link: 'https://store.steampowered.com/',
            img: 'img/company/steam.png',
            on: true,
        },
        {
            name: 'Microsoft Apps',
            link: 'https://apps.microsoft.com/home/',
            img: 'img/company/microsoft/apps.png',
            on: true,
        },
        {
            name: 'DeepWiki',
            link: 'https://deepwiki.com/',
            img: 'icons/deepwiki.png',
            on: true,
        },
    ],
};

const settingsSchema = {
    clock: {
        title: "Clock",
        items: [
            {
                type: "select",
                key: "clockFormat",
                label: "Clock Format",
                options: {
                    "12": "12-hour",
                    "24": "24-hour"
                }
            },
            { type: "toggle", key: "showSeconds", label: "Show Seconds" },
            { type: "toggle", key: "showDate", label: "Show Date" },
            {
                type: "select",
                key: "dateFormat",
                label: "Date Format",
                options: {
                    "DDMMYYYY": "DD/MM/YYYY",
                    "MMDDYYYY": "MM/DD/YYYY",
                    "YYYYMMDD": "YYYY/MM/DD"
                }
            },
            {
                type: "select",
                key: "timeZone",
                label: "Time Zone",
                options: {
                    local: "Local Time",
                    UTC: "UTC"
                    // дополнительные таймзоны можно добавить
                }
            },
            { type: "toggle", key: "showDayOfWeek", label: "Show Day of the Week" },
            { type: "toggle", key: "leadingZero", label: "Leading Zero for Hours" },
            { type: "toggle", key: "amPm", label: "AM/PM Indicator" },
            { type: "toggle", key: "showYear", label: "Show Year" },
            { type: "toggle", key: "monthAsText", label: "Month as Text" },
            {
                type: "select",
                key: "dateSeparator",
                label: "Date Separator",
                options: {
                    "/": "/",
                    "-": "-",
                    ".": ".",
                    " ": "Space"
                }
            },
            { type: "toggle", key: "jucheCalendar", label: "Juche calendar" }
        ]
    },

    weather: {
        title: "Weather",
        items: [
            {
                type: "toggle",
                key: "background",
                label: "Weather Background"
            },
            {
                type: "toggle",
                key: "pageBackground",
                label: "Page Background"
            },
            {
                type: "select",
                key: "unit",
                label: "Temperature Unit",
                options: {
                    "C": "Celsius",
                    "F": "Fahrenheit"
                }
            }
        ]
    },
};

// Function to load settings from localStorage
function loadSettingsFromStorage() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);

            // обычный merge
            settings = deepMerge(defaultSettings, parsed);

            // ДОПОЛНИТЕЛЬНО: синхронизация catalogs
            settings.catalogs = mergeCatalogs(
                defaultSettings.catalogs,
                parsed.catalogs || []
            );

        } catch (e) {
            console.error('Error parsing saved settings:', e);
            settings = JSON.parse(JSON.stringify(defaultSettings));
        }
    } else {
        settings = JSON.parse(JSON.stringify(defaultSettings));
    }
}


// Function to save settings to localStorage
function saveSettingsToStorage() {
    try {
        localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
}

// Функция глубокого слияния для правильного объединения объектов
function deepMerge(target, source) {
    const result = JSON.parse(JSON.stringify(target));
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
            result[key] = source[key];
            }
        }
    }
    return result;
}

// Initialize settings variable
let settings;

// Function to format time based on settings
function formatTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    
    // Handle time zone conversion
    let displayDate = now;
    if (settings.clock.timeZone === 'UTC') {
        displayDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        hours = displayDate.getHours();
        minutes = displayDate.getMinutes();
        seconds = displayDate.getSeconds();
    }
    
    // Handle 12/24 hour format
    let ampm = '';
    if (settings.clock.clockFormat === '12') {
        ampm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
    }
    
    // Add leading zeros if needed
    const hoursStr = settings.clock.leadingZero ? String(hours).padStart(2, '0') : String(hours);
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    
    return {
        hours: hoursStr,
        minutes: minutesStr,
        seconds: secondsStr,
        ampm: ampm
    };
}

// Function to format date based on settings
function formatDate() {
    const now = new Date();
    
    // Handle time zone conversion
    let displayDate = now;
    if (settings.clock.timeZone === 'UTC') {
        displayDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    }
    
    let dateStr = '';
    
    // Add date if enabled
    if (settings.clock.showDate) {
        const day = String(displayDate.getDate()).padStart(2, '0');
        const month = String(displayDate.getMonth() + 1).padStart(2, '0');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthText = monthNames[displayDate.getMonth()];
        let year = displayDate.getFullYear();
        if (settings.clock.jucheCalendar) year = year - 1911;
        
        let monthValue = settings.clock.monthAsText ? monthText : month;
        const sep = settings.clock.dateSeparator;
        
        switch (settings.clock.dateFormat) {
            case 'DDMMYYYY':
                dateStr = `${day}${sep}${monthValue}${settings.clock.showYear ? sep : ''}${settings.clock.showYear ? year : ''}`;
                break;
            case 'MMDDYYYY':
                dateStr = `${monthValue}${sep}${day}${settings.clock.showYear ? sep : ''}${settings.clock.showYear ? year : ''}`;
                break;
            case 'YYYYMMDD':
                dateStr = `${settings.clock.showYear ? year : ''}${settings.clock.showYear ? sep : ''}${monthValue}${sep}${day}`;
                break;
        }
        
        // Add year option for date format
        if (!settings.clock.showYear && settings.clock.dateFormat) {
            dateStr = dateStr.replace(/\/\d{4}/, '').replace(/\s\d{4}/, '');
        }
        
        // Add day of week if enabled
        if (settings.clock.showDayOfWeek) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[displayDate.getDay()];
            dateStr = `${dayName}, ${dateStr}`;
        }
    }
    
    return dateStr;
}

// Function to update the time display
function updateTimeDisplay() {
    const time = formatTime();
    
    // Update hours
    const timeHours = document.getElementById('timeHours');
    if (timeHours) {
        timeHours.textContent = time.hours + ':';
    }
    
    // Update minutes
    const timeMinutes = document.getElementById('timeMinutes');
    if (timeMinutes) {
        timeMinutes.textContent = time.minutes;
        if (settings.clock.showSeconds) {
            timeMinutes.textContent += ':';
        }
        if (settings.clock.clockFormat === '12' && settings.clock.amPm) {
            timeMinutes.textContent += time.ampm;
        }
    }
    
    // Update seconds
    const timSeconds = document.getElementById('timSeconds');
    if (timSeconds) {
        if (settings.clock.showSeconds) {
            timSeconds.style.display = 'inline';
            timSeconds.textContent = time.seconds;
        } else {
            timSeconds.style.display = 'none';
        }
    }
    
    // Update date
    const dateDiv = document.getElementById('date');
    if (dateDiv) {
        dateDiv.textContent = formatDate();
    }
}

let appsOpen = 'none';

window.spage = function(pageName) {
    document.querySelectorAll('.main-content').forEach(mc => mc.classList.remove('active')); 
    document.getElementById(pageName).classList.add('active');
}

let apps = {
    ee: {
        name: "EE Apps",
        icon: "img/company/ee.svg",
        apps: [
            { name: "EE Apps", link: "http://ee-apps.github.io", icon: "ee/apps.svg" },
            { name: "Calc EE", link: "http://ee-apps.github.io/web/calc/index.html", icon: "ee/calc.svg" },
            { name: "EEljur", link: "http://ee-apps.github.io/web/eeljur.html", icon: "ee/eeljur.svg" },
            { name: "Chemisry EE", link: "http://ee-apps.github.io/web/chemistry/index.html", icon: "ee/chemistry.svg" },
            { name: "EEditor", link: "http://eeditor-ws.github.io", icon: "ee/eeditor.svg" },
            { name: "EEditor Lib", link: "http://eeditor-ws.github.io/page/library/download", icon: "ee/eelib.svg" },
            { name: "Weather EE", link: "http://ee-apps.github.io/web/weather/index.html", icon: "ee/weather.png" },
            { name: "BattleBashns", link: "http://ee-apps.github.io/web/battlebashns/index.html", icon: "ee/battlebashns.svg" },
        ],
    },
    microsoft: {
        name: "Microsoft Apps",
        icon: "img/company/microsoft.svg",
        apps: [
            // === / Office / 365 ===
            { name: "365", link: "https://m365.cloud.microsoft", icon: "microsoft/365.svg" },
            { name: "Office", link: "https://www.office.com", icon: "microsoft/office.svg" },

            { name: "Word", link: "https://word.cloud.microsoft", icon: "microsoft/word.svg" },
            { name: "Excel", link: "https://excel.cloud.microsoft", icon: "microsoft/excel.svg" },
            { name: "PowerPoint", link: "https://powerpoint.cloud.microsoft", icon: "microsoft/powerpoint.svg" },
            { name: "OneNote", link: "https://onenote.cloud.microsoft", icon: "microsoft/onenote.svg" },
            { name: "Outlook", link: "https://outlook.cloud.microsoft", icon: "microsoft/outlook.svg" },
            { name: "Access", link: "https://www.microsoft.com/access", icon: "microsoft/access.svg" },
            { name: "Visio", link: "https://www.microsoft.com/visio", icon: "microsoft/visio.svg" },

            { name: "OneDrive", link: "https://onedrive.live.com", icon: "microsoft/onedrive.svg" },
            { name: "To Do", link: "https://to-do.live.com/tasks", icon: "microsoft/todo.svg" },
            { name: "Forms", link: "https://forms.office.com", icon: "microsoft/forms.svg" },
            { name: "Sway", link: "https://sway.office.com", icon: "microsoft/sway.svg" },
            { name: "Loop", link: "https://loop.cloud.microsoft", icon: "microsoft/loop.svg" },

            // === Коммуникации ===
            { name: "Teams", link: "https://teams.live.com/v2", icon: "microsoft/teams.svg" },

            // === Бизнес и корпоративные решения ===
            { name: "Dynamics 365", link: "https://dynamics.microsoft.com", icon: "microsoft/dynamics365.svg" },
            { name: "Power Apps", link: "https://make.powerapps.com", icon: "microsoft/powerapps.svg" },
            { name: "Power BI", link: "https://powerbi.microsoft.com", icon: "microsoft/powerbi.svg" },

            // === Облако и инфраструктура ===
            { name: "Azure", link: "https://portal.azure.com", icon: "microsoft/azure.svg" },

            // === Разработка ===
            { name: "Visual Studio", link: "https://visualstudio.microsoft.com", icon: "microsoft/visualstudio.svg" },
            { name: "Visual Studio Code", link: "https://vscode.dev", icon: "microsoft/visualstudiocode.svg" },

            // === Поиск, браузер, магазин ===
            { name: "Edge", link: "https://www.microsoft.com/edge", icon: "microsoft/edge.svg" },
            { name: "Bing", link: "https://www.bing.com", icon: "microsoft/bing.svg" },
            { name: "Store", link: "https://apps.microsoft.com", icon: "microsoft/store.svg" },

            // === Игры и развлечения ===
            { name: "Xbox", link: "https://www.xbox.com", icon: "microsoft/xbox.svg" },

            // === Обучение и ресурсы ===
            { name: "Learn", link: "https://learn.microsoft.com", icon: "microsoft/learning.svg" }
        ],
    },
    google: {
        name: "Google Apps",
        icon: "img/company/google.svg",
        apps: [
            // === / Account / Workspace ===
            { name: "Account", link: "https://myaccount.google.com", icon: "google/account.svg" },
            { name: "Workspace", link: "https://workspace.google.com", icon: "google/workspace.webp" },
            { name: "Admin", link: "https://admin.google.com", icon: "google/admin.svg" },

            // === Документы и офис ===
            { name: "Docs", link: "https://docs.google.com", icon: "google/docs.svg" },
            { name: "Sheets", link: "https://sheets.google.com", icon: "google/sheets.svg" },
            { name: "Slides", link: "https://slides.google.com", icon: "google/slides.svg" },
            { name: "Forms", link: "https://forms.google.com", icon: "google/forms.svg" },
            { name: "Sites", link: "https://sites.google.com", icon: "google/sites.svg" },
            { name: "Drive", link: "https://drive.google.com", icon: "google/drive.svg" },
            { name: "Keep", link: "https://keep.google.com", icon: "google/keep.svg" },

            // === Почта, календарь, контакты ===
            { name: "Gmail", link: "https://mail.google.com", icon: "google/gmail.svg" },
            { name: "Calendar", link: "https://calendar.google.com", icon: "google/calendar.svg" },
            { name: "Contacts", link: "https://contacts.google.com", icon: "google/contacts.svg" },

            // === Коммуникации ===
            { name: "Meet", link: "https://meet.google.com", icon: "google/meet.svg" },
            { name: "Chat", link: "https://chat.google.com", icon: "google/chat.svg" },

            // === Медиа и карты ===
            { name: "YouTube", link: "https://www.youtube.com", icon: "google/youtube.svg" },
            { name: "YouTube Studio", link: "https://studio.youtube.com", icon: "google/youtubestudio.svg" },
            { name: "Photos", link: "https://photos.google.com", icon: "google/photos.svg" },
            { name: "Maps", link: "https://maps.google.com", icon: "google/maps.svg" },
            { name: "Earth", link: "https://earth.google.com", icon: "google/earth.svg" },
            { name: "News", link: "https://news.google.com", icon: "google/news.svg" },

            // === Поиск, AI и перевод ===
            { name: "Search", link: "https://www.google.com", icon: "google/google.svg" },
            { name: "Translate", link: "https://translate.google.com", icon: "google/translate.svg" },
            { name: "Gemini", link: "https://gemini.google.com", icon: "google/gemini.svg" },

            // === Платформа, магазин, устройства ===
            { name: "Play", link: "https://play.google.com", icon: "google/play.svg" },
            { name: "Store", link: "https://store.google.com", icon: "google/store.webp" },
            { name: "Pay", link: "https://pay.google.com", icon: "google/pay.svg" },
            { name: "Wallet", link: "https://wallet.google", icon: "google/wallet.svg" },

            // === Бизнес, реклама и аналитика ===
            { name: "Ads", link: "https://ads.google.com", icon: "google/ads.svg" },
            { name: "Analytics", link: "https://analytics.google.com", icon: "google/analytics.svg" },
            { name: "Search Console", link: "https://search.google.com/search-console", icon: "google/searchconsole.svg" },
            { name: "Blogger", link: "https://www.blogger.com", icon: "google/blogger.svg" },

            // === Облако и инфраструктура ===
            { name: "Cloud", link: "https://console.cloud.google.com", icon: "google/cloud.svg" },
            { name: "Firebase", link: "https://firebase.google.com", icon: "google/firebase.svg" },

            // === Разработка ===
            { name: "Developers", link: "https://developers.google.com", icon: "google/developers.svg" },
            { name: "Colab", link: "https://colab.research.google.com", icon: "google/colab.webp" },
            { name: "Apps Script", link: "https://script.google.com", icon: "google/script.png" },
            { name: "Play Console", link: "https://play.google.com/console", icon: "google/console.svg" },

            // === Обучение и поддержка ===
            { name: "for Education", link: "https://edu.google.com", icon: "google/google.svg" },
            { name: "Safety Center", link: "https://safety.google", icon: "google/safety.svg" }
        ],
    },
    yandex: {
        name: "Yandex Apps",
        icon: "img/company/yandex.svg",
        apps: [
            // === / Аккаунт ===
            { name: "ID", link: "https://id.yandex.ru", icon: "yandex/id.svg" },

            // === Поиск и порталы ===
            { name: "Поиск", link: "https://yandex.ru", icon: "yandex/search.svg" },
            { name: "Новости", link: "https://news.yandex.ru", icon: "yandex/news.svg" },
            { name: "Дзен", link: "https://dzen.ru", icon: "yandex/dzen.svg" },

            // === Почта и организация ===
            { name: "Почта", link: "https://mail.yandex.ru", icon: "yandex/mail.svg" },
            { name: "Календарь", link: "https://calendar.yandex.ru", icon: "yandex/calendar.svg" },
            { name: "Контакты", link: "https://contacts.yandex.ru", icon: "yandex/contacts.svg" },
            { name: "Заметки", link: "https://notes.yandex.ru", icon: "yandex/notes.svg" },

            // === Диск и файлы ===
            { name: "Диск", link: "https://disk.yandex.ru", icon: "yandex/disk.svg" },
            { name: "Документы", link: "https://docs.yandex.ru", icon: "yandex/docs.svg" },

            // === Коммуникации ===
            { name: "Телемост", link: "https://telemost.yandex.ru", icon: "yandex/efir.svg" },
            { name: "Мессенджер", link: "https://messenger.yandex.ru", icon: "yandex/messenger.svg" },

            // === Карты, транспорт, навигация ===
            { name: "Карты", link: "https://maps.yandex.ru", icon: "yandex/maps.svg" },
            { name: "Навигатор", link: "https://navigator.yandex.ru", icon: "yandex/navigator.svg" },
            { name: "Транспорт", link: "https://transport.yandex.ru", icon: "yandex/maps.svg" },

            // === Медиа и развлечения ===
            { name: "Музыка", link: "https://music.yandex.ru", icon: "yandex/music.svg" },
            { name: "Кинопоиск", link: "https://www.kinopoisk.ru", icon: "yandex/kinopoisk.svg" },
            { name: "Афиша", link: "https://afisha.yandex.ru", icon: "yandex/afisha.svg" },
            { name: "Игры", link: "https://yandex.ru/games", icon: "yandex/games.svg" },

            // === Покупки и сервисы ===
            { name: "Маркет", link: "https://market.yandex.ru", icon: "yandex/market.svg" },
            { name: "Еда", link: "https://eda.yandex.ru", icon: "yandex/eats.svg" },
            { name: "Лавка", link: "https://lavka.yandex.ru", icon: "yandex/delivery.svg" },
            { name: "Go", link: "https://go.yandex", icon: "yandex/go.svg" },

            // === Бизнес и реклама ===
            { name: "Бизнес", link: "https://business.yandex.ru", icon: "yandex/business.svg" },
            { name: "Директ", link: "https://direct.yandex.ru", icon: "yandex/direct.svg" },
            { name: "Метрика", link: "https://metrika.yandex.ru", icon: "yandex/metrika.svg" },
            { name: "Вебмастер", link: "https://webmaster.yandex.ru", icon: "yandex/webmaster.svg" },

            // === Облако и инфраструктура ===
            { name: "Yandex Cloud", link: "https://cloud.yandex.ru", icon: "yandex/cloud.svg" },
            { name: "Yandex Object Storage", link: "https://cloud.yandex.ru/services/storage", icon: "yandex/storage.svg" },

            // === Разработка и технологии ===
            { name: "Разработчикам", link: "https://yandex.ru/dev", icon: "yandex/developers.svg" },
            { name: "Yandex API", link: "https://yandex.ru/dev/api", icon: "yandex/api.svg" },
            { name: "Yandex GPT", link: "https://ya.ru/ai", icon: "yandex/alisa.svg" },

            // === Образование и поддержка ===
            { name: "Практикум", link: "https://practicum.yandex.ru", icon: "yandex/practicum.svg" },
            { name: "Лицей", link: "https://yandexlyceum.ru", icon: "yandex/lyceum.svg" },
            { name: "Справка", link: "https://yandex.ru/support", icon: "yandex/help.svg" }
        ],
    },
    vk: {
        name: "VK Apps",
        icon: "img/company/vk.svg",
        apps: [
            // === VK / Аккаунт ===
            { name: "VK ID", link: "https://id.vk.com", icon: "vk/account.svg" },
            { name: "VK Account", link: "https://vk.com/settings", icon: "vk/settings.svg" },

            // === Социальные сети ===
            { name: "ВКонтакте", link: "https://vk.com", icon: "vk/vk.svg" },
            { name: "VK Clips", link: "https://vk.com/clips", icon: "vk/clips.svg" },
            { name: "VK Donut", link: "https://vk.com/donut", icon: "vk/donut.svg" },

            // === Коммуникации ===
            { name: "VK Messenger", link: "https://vk.com/im", icon: "vk/messenger.svg" },
            { name: "VK Calls", link: "https://vk.com/calls", icon: "vk/calls.svg" },

            // === Медиа и контент ===
            { name: "VK Video", link: "https://vk.com/video", icon: "vk/video.svg" },
            { name: "VK Music", link: "https://vk.com/music", icon: "vk/music.svg" },
            { name: "VK Podcasts", link: "https://vk.com/podcasts", icon: "vk/podcasts.svg" },

            // === Платформы и сервисы ===
            { name: "VK Mini Apps", link: "https://vk.com/services", icon: "vk/miniapps.svg" },
            { name: "VK Games", link: "https://vk.com/games", icon: "vk/games.svg" },
            { name: "VK Pay", link: "https://pay.vk.com", icon: "vk/pay.svg" },

            // === Работа и обучение ===
            { name: "VK Работа", link: "https://rabota.vk.com", icon: "vk/jobs.svg" },
            { name: "VK Образование", link: "https://education.vk.company", icon: "vk/education.svg" },

            // === Бизнес и реклама ===
            { name: "VK Business", link: "https://business.vk.com", icon: "vk/business.svg" },
            { name: "VK Реклама", link: "https://ads.vk.com", icon: "vk/ads.svg" },
            { name: "VK Target", link: "https://target.my.com", icon: "vk/target.svg" },
            { name: "VK Маркетплейс", link: "https://vk.com/market", icon: "vk/market.svg" },

            // === Аналитика и управление ===
            { name: "VK Статистика", link: "https://vk.com/stats", icon: "vk/stats.svg" },
            { name: "VK Communities", link: "https://vk.com/groups", icon: "vk/communities.svg" },

            // === Облако и инфраструктура ===
            { name: "VK Cloud", link: "https://cloud.vk.com", icon: "vk/cloud.svg" },
            { name: "VK Cloud Storage", link: "https://cloud.vk.com/storage", icon: "vk/storage.svg" },

            // === Разработка и технологии ===
            { name: "VK Developers", link: "https://dev.vk.com", icon: "vk/developers.svg" },
            { name: "VK API", link: "https://dev.vk.com/api", icon: "vk/api.svg" },
            { name: "VK SDK", link: "https://dev.vk.com/sdk", icon: "vk/sdk.svg" },

            // === Поддержка и ресурсы ===
            { name: "VK Help", link: "https://vk.com/support", icon: "vk/help.svg" },
            { name: "VK Company", link: "https://vk.company", icon: "vk/company.svg" }
        ],
    },
    desmos: {
        name: "Desmos",
        icon: "img/company/desmos.png",
        apps: [
            // === Основные калькуляторы ===
            { name: "Graphing Calculator", link: "https://www.desmos.com/calculator", icon: "desmos/graphics.png" },
            { name: "Scientific Calculator", link: "https://www.desmos.com/scientific", icon: "desmos/scalc.png" },
            { name: "Four Function Calculator", link: "https://www.desmos.com/fourfunction", icon: "desmos/calc.png" },

            // === Геометрия и математика ===
            { name: "Geometry Tool", link: "https://www.desmos.com/geometry", icon: "desmos/geometry.png" },
            { name: "3D Calculator", link: "https://www.desmos.com/3d", icon: "desmos/3d.png" },
        ],
    },
    apple: {
        name: "Apple Apps",
        icon: "img/company/apple.png",
        apps: [
            // === Apple ID / Core ===
            { name: "Apple ID", link: "https://appleid.apple.com", icon: "apple/account.svg" },
            { name: "iCloud", link: "https://www.icloud.com", icon: "apple/icloud.svg" },

            // === Office / Productivity ===
            { name: "Pages", link: "https://www.icloud.com/pages", icon: "apple/pages.svg" },
            { name: "Numbers", link: "https://www.icloud.com/numbers", icon: "apple/numbers.svg" },
            { name: "Keynote", link: "https://www.icloud.com/keynote", icon: "apple/keynote.svg" },
            { name: "Notes", link: "https://www.icloud.com/notes", icon: "apple/notes.svg" },
            { name: "Reminders", link: "https://www.icloud.com/reminders", icon: "apple/reminders.svg" },

            // === Медиа ===
            { name: "Apple Music", link: "https://music.apple.com", icon: "apple/music.svg" },
            { name: "Apple TV+", link: "https://tv.apple.com", icon: "apple/tv.svg" },
            { name: "Apple Podcasts", link: "https://podcasts.apple.com", icon: "apple/podcasts.svg" },

            // === Платформа и магазин ===
            { name: "App Store", link: "https://www.apple.com/app-store/", icon: "apple/appstore.svg" },

            // === Разработка ===
            { name: "Apple Developer", link: "https://developer.apple.com", icon: "apple/developer.svg" }
        ],
    },
    amazon: {
        name: "Amazon Apps",
        icon: "img/company/amazon.png",
        apps: [
            // === Core ===
            { name: "Amazon", link: "https://www.amazon.com", icon: "amazon/store.svg" },
            { name: "Amazon Account", link: "https://www.amazon.com/gp/css/homepage.html", icon: "amazon/account.svg" },

            // === Облако ===
            { name: "AWS Console", link: "https://console.aws.amazon.com", icon: "amazon/aws.svg" },

            // === Медиа ===
            { name: "Prime Video", link: "https://www.primevideo.com", icon: "amazon/primevideo.svg" },
            { name: "Amazon Music", link: "https://music.amazon.com", icon: "amazon/music.svg" },
            { name: "Twitch", link: "https://www.twitch.tv", icon: "amazon/twitch.svg" },

            // === Устройства и сервисы ===
            { name: "Alexa", link: "https://alexa.amazon.com", icon: "amazon/alexa.svg" },
            { name: "Kindle", link: "https://read.amazon.com", icon: "amazon/kindle.svg" },

            // === Разработка ===
            { name: "AWS Developers", link: "https://aws.amazon.com/developer/", icon: "amazon/developers.svg" }
        ],
    },
    meta: {
        name: "Meta Apps",
        icon: "img/company/meta.png",
        apps: [
            // === Соцсети ===
            { name: "Facebook", link: "https://www.facebook.com", icon: "meta/facebook.svg" },
            { name: "Instagram", link: "https://www.instagram.com", icon: "meta/instagram.svg" },
            { name: "Threads", link: "https://www.threads.net", icon: "meta/threads.svg" },

            // === Коммуникации ===
            { name: "Messenger", link: "https://www.messenger.com", icon: "meta/messenger.svg" },
            { name: "WhatsApp", link: "https://web.whatsapp.com", icon: "meta/whatsapp.svg" },

            // === Бизнес ===
            { name: "Meta Business Suite", link: "https://business.facebook.com", icon: "meta/business.svg" },
            { name: "Meta Ads", link: "https://adsmanager.facebook.com", icon: "meta/ads.svg" },

            // === Разработка ===
            { name: "Meta Developers", link: "https://developers.facebook.com", icon: "meta/developers.svg" }
        ],
    },
    adobe: {
        name: "Adobe Apps",
        icon: "img/company/adobe.jpg",
        apps: [
            // === Core ===
            { name: "Adobe Account", link: "https://account.adobe.com", icon: "adobe/account.svg" },
            { name: "Creative Cloud", link: "https://creativecloud.adobe.com", icon: "adobe/creativecloud.svg" },

            // === Графика ===
            { name: "Photoshop", link: "https://photoshop.adobe.com", icon: "adobe/photoshop.svg" },
            { name: "Illustrator", link: "https://www.adobe.com/products/illustrator.html", icon: "adobe/illustrator.svg" },
            { name: "Lightroom", link: "https://lightroom.adobe.com", icon: "adobe/lightroom.svg" },

            // === Видео ===
            { name: "Premiere Pro", link: "https://www.adobe.com/products/premiere.html", icon: "adobe/premiere.svg" },
            { name: "After Effects", link: "https://www.adobe.com/products/aftereffects.html", icon: "adobe/aftereffects.svg" },

            // === Документы ===
            { name: "Adobe Acrobat", link: "https://www.adobe.com/acrobat.html", icon: "adobe/acrobat.svg" }
        ],
    },
    samsung: {
        name: "Samsung Apps",
        icon: "img/company/samsung.svg",
        apps: [
            // === Samsung Account / Core ===
            { name: "Samsung Account", link: "https://account.samsung.com", icon: "samsung/account.svg" },
            { name: "Samsung Members", link: "https://members.samsung.com", icon: "samsung/members.svg" },

            // === Galaxy / Device ecosystem ===
            { name: "Galaxy Store", link: "https://galaxystore.samsung.com", icon: "samsung/store.svg" },
            { name: "Samsung Cloud", link: "https://support.samsungcloud.com", icon: "samsung/cloud.svg" },
            { name: "SmartThings", link: "https://www.smartthings.com", icon: "samsung/smartthings.svg" },

            // === Productivity ===
            { name: "Samsung Notes", link: "https://www.samsung.com/apps/samsung-notes/", icon: "samsung/notes.svg" },
            { name: "Samsung Calendar", link: "https://www.samsung.com/apps/calendar/", icon: "samsung/calendar.svg" },
            { name: "Samsung Contacts", link: "https://www.samsung.com/apps/contacts/", icon: "samsung/contacts.svg" },
            { name: "Samsung Internet", link: "https://www.samsung.com/apps/samsung-internet/", icon: "samsung/internet.svg" },

            // === Медиа ===
            { name: "Samsung Music", link: "https://www.samsung.com/apps/samsung-music/", icon: "samsung/music.svg" },
            { name: "Samsung TV Plus", link: "https://www.samsungtvplus.com", icon: "samsung/tvplus.svg" },
            { name: "Samsung Gallery", link: "https://www.samsung.com/apps/gallery/", icon: "samsung/gallery.svg" },

            // === Платежи и сервисы ===
            { name: "Samsung Pay", link: "https://www.samsung.com/samsung-pay/", icon: "samsung/pay.svg" },
            { name: "Samsung Wallet", link: "https://www.samsung.com/wallet/", icon: "samsung/wallet.svg" },

            // === Здоровье и устройства ===
            { name: "Samsung Health", link: "https://www.samsung.com/apps/samsung-health/", icon: "samsung/health.svg" },
            { name: "Galaxy Wearable", link: "https://www.samsung.com/apps/galaxy-wearable/", icon: "samsung/wearable.svg" },

            // === Разработка и бизнес ===
            { name: "Samsung Developers", link: "https://developer.samsung.com", icon: "samsung/developers.svg" },
            { name: "Samsung Knox", link: "https://www.samsungknox.com", icon: "samsung/knox.svg" },
            { name: "Samsung Business", link: "https://www.samsung.com/business/", icon: "samsung/business.svg" }
        ],
    },
    huawei: {
        name: "Huawei Apps",
        icon: "img/company/huawei.svg",
        apps: [
            // === Huawei Account / Core ===
            { name: "Huawei ID", link: "https://id.huawei.com", icon: "huawei/account.svg" },
            { name: "My Huawei", link: "https://consumer.huawei.com", icon: "huawei/myhuawei.svg" },

            // === App ecosystem ===
            { name: "AppGallery", link: "https://appgallery.huawei.com", icon: "huawei/appgallery.svg" },
            { name: "Huawei Cloud", link: "https://cloud.huawei.com", icon: "huawei/cloud.svg" },
            { name: "Huawei Browser", link: "https://consumer.huawei.com/browser/", icon: "huawei/browser.svg" },

            // === Productivity ===
            { name: "Huawei Docs", link: "https://cloud.huawei.com/#/documents", icon: "huawei/docs.svg" },
            { name: "Huawei Notes", link: "https://consumer.huawei.com/notes/", icon: "huawei/notes.svg" },
            { name: "Huawei Calendar", link: "https://consumer.huawei.com/calendar/", icon: "huawei/calendar.svg" },

            // === Медиа ===
            { name: "Huawei Music", link: "https://consumer.huawei.com/music/", icon: "huawei/music.svg" },
            { name: "Huawei Video", link: "https://consumer.huawei.com/video/", icon: "huawei/video.svg" },
            { name: "Huawei Themes", link: "https://consumer.huawei.com/themes/", icon: "huawei/themes.svg" },

            // === Карты и навигация ===
            { name: "Petal Maps", link: "https://petalmaps.com", icon: "huawei/maps.svg" },
            { name: "Petal Search", link: "https://petalsearch.com", icon: "huawei/search.svg" },

            // === Платежи и сервисы ===
            { name: "Huawei Wallet", link: "https://consumer.huawei.com/wallet/", icon: "huawei/wallet.svg" },

            // === Облако и бизнес ===
            { name: "Huawei Cloud (Enterprise)", link: "https://www.huaweicloud.com", icon: "huawei/enterprisecloud.svg" },
            { name: "Huawei Business", link: "https://e.huawei.com", icon: "huawei/business.svg" },

            // === Разработка и платформа ===
            { name: "Huawei Developers", link: "https://developer.huawei.com", icon: "huawei/developers.svg" },
            { name: "HarmonyOS", link: "https://www.harmonyos.com", icon: "huawei/harmonyos.svg" },
            { name: "Huawei HMS Core", link: "https://developer.huawei.com/consumer/en/hms", icon: "huawei/hms.svg" }
        ],
    },
};

function loadApps(company) {
    if (appsOpen === company) {
        spage('main');
        appsOpen = 'none';
        spage('main');
        return;
    } else {
        appsOpen = company;
    }

    // Сначала создаём элемент, если его нет
    if (!document.getElementById(`${company}-apps`)) {
        let workWith = document.createElement('main');
        workWith.className = `main-content all apps`;
        workWith.id = `${company}-apps`;
        workWith.innerHTML = `
        <button id="backBtn" onclick="spage('main');">
            <img src="imgcopy/back.svg" alt="Back">
        </button>
        <div class="settingsNameCool"><h1>${apps[company].name}</h1></div>
        <div class="app-grid" id="${company}-apps-section">
            <!-- Apps will be loaded here -->
        </div>
        `;
        document.getElementById('body').appendChild(workWith);
        document.querySelectorAll('#backBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                spage('main');
            });
        });
    }
    
    // Затем загружаем приложения в секцию
    const appsSection = document.getElementById(`${company}-apps-section`);
    appsSection.innerHTML = ''; // Clear previous content
    if (apps[company]) {
        apps[company].apps.forEach(app => {
            const appLink = document.createElement('a');
            appLink.className = 'app-item';
            appLink.href = app.link;
            //appLink.target = '_blank';
            appLink.rel = 'noopener noreferrer';
            appLink.innerHTML = `
            <img src="img/company/${app.icon}" alt="${app.name}" class="app-icon"/>
            <span class="app-name">${app.name}</span>
            `;
            appsSection.appendChild(appLink);
        });
    }
    
    // Наконец, активируем страницу
    document.querySelectorAll('.main-content').forEach(mc => mc.classList.remove('active'));
    document.getElementById(`${company}-apps`).classList.add('active');
}

function loadCatalogs() {
    if (settings?.catalogs) {
        const div = document.getElementById('catalogs');
        div.innerHTML = '';

        settings.catalogs.forEach(catalog => {
            if (!catalog.on) return;

            const el = document.createElement('a');
            el.className = 'app-btn';
            el.href = catalog.link;
            el.innerHTML = `<img src="${catalog.img}" alt="${catalog.name}">`

            div.appendChild(el);
        })
    }
}

function generateSettingsUI(containerId, schema, settings) {
    const container = document.getElementById(containerId);
    //container.innerHTML = "";

    Object.entries(schema).forEach(([sectionKey, section]) => {
        const sectionEl = document.createElement("div");
        sectionEl.className = "settings-section";

        sectionEl.innerHTML = `
            <div class="settings-header">
                <button class="hideSettSection" data-section="sett-${sectionKey}">
                    <img src="img/ui/arrow/down.svg">
                </button>
                <h2>${section.title}</h2>
            </div>
            <div id="sett-${sectionKey}" class="settingsSectionDiv"></div>
        `;

        const body = sectionEl.querySelector(".settingsSectionDiv");

        section.items.forEach(item => {
            body.appendChild(createSettingItem(sectionKey, item, settings));
        });

        container.appendChild(sectionEl);
    });
}

function createSettingItem(sectionKey, item, settings) {
    const value = settings[sectionKey][item.key];
    const block = document.createElement("div");
    block.className = "settingsBlock";

    if (item.type === "toggle") {
        block.innerHTML = `
            <label>${item.label}:</label>
            <label class="oneui-switch">
                <input type="checkbox" ${value ? "checked" : ""}>
                <span class="slider"></span>
            </label>
        `;

        block.querySelector("input").addEventListener("change", e => {
            settings[sectionKey][item.key] = e.target.checked;
            saveSettingsToStorage();
        });
    }

    if (item.type === "select") {
        const options = Object.entries(item.options)
            .map(([v, l]) =>
                `<option value="${v}" ${v === value ? "selected" : ""}>${l}</option>`
            ).join("");

        block.innerHTML = `
            <label>${item.label}:</label>
            <select class="settings-select">${options}</select>
        `;

        block.querySelector("select").addEventListener("change", e => {
            settings[sectionKey][item.key] = e.target.value;
            saveSettingsToStorage();
        });
    }

    return block;
}

// Event listeners for page navigation (replaces inline onclick handlers)
document.addEventListener('DOMContentLoaded', () => {

    loadSettingsFromStorage();
    generateSettingsUI("settings", settingsSchema, settings);
    loadCatalogs()

    // Settings button handler
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            document.querySelectorAll('.main-content').forEach(mc => mc.classList.remove('active'));
            document.getElementById('settings').classList.add('active');
        });
    }
    
    // Back button from settings
    const backBtnSettings = document.getElementById('backBtn-settings');
    if (backBtnSettings) {
        backBtnSettings.addEventListener('click', () => {
            document.querySelectorAll('.main-content').forEach(mc => mc.classList.remove('active'));
            document.getElementById('main').classList.add('active');
        });
    }
    
    // Back button from apps
    const backBtnApps = document.getElementById('backBtn-apps');
    if (backBtnApps) {
        backBtnApps.addEventListener('click', () => {
            spage('main');
        });
    }
    
    // iframe onload handler
    const iframe = document.getElementById('iframe-display');
    if (iframe) {
        iframe.onload = () => {
            // Определение высоты содержимого iframe
            const contentDocument = iframe.contentDocument;
            const contentBody = contentDocument.body;
            iframe.style.height = contentBody.scrollHeight + 'px';
        };
    }

    const timeDiv = document.getElementById('time');
    const dateDiv = document.getElementById('date');
    if (timeDiv || dateDiv) {
        setInterval(() => {
            updateTimeDisplay();
        }, 1000);
        updateTimeDisplay(); // Initial call
    }
    
    // Clock format settings
    const clockFormatSelect = document.getElementById('clockFormatSelect');
    if (clockFormatSelect) {
        clockFormatSelect.value = settings.clock.clockFormat;
        clockFormatSelect.addEventListener('change', (e) => {
            settings.clock.clockFormat = e.target.value;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // Show seconds toggle
    const showSecondsToggle = document.getElementById('showSecondsToggle');
    if (showSecondsToggle) {
        showSecondsToggle.checked = settings.clock.showSeconds;
        showSecondsToggle.addEventListener('change', (e) => {
            settings.clock.showSeconds = e.target.checked;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // Show date toggle
    const showDateToggle = document.getElementById('showDateToggle');
    if (showDateToggle) {
        showDateToggle.checked = settings.clock.showDate;
        showDateToggle.addEventListener('change', (e) => {
            settings.clock.showDate = e.target.checked;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // Date format select
    const dateFormatSelect = document.getElementById('dateFormatSelect');
    if (dateFormatSelect) {
        dateFormatSelect.value = settings.clock.dateFormat;
        dateFormatSelect.addEventListener('change', (e) => {
            settings.clock.dateFormat = e.target.value;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // Time zone select
    const timeZoneSelect = document.getElementById('timeZoneSelect');
    if (timeZoneSelect) {
        timeZoneSelect.value = settings.clock.timeZone;
        timeZoneSelect.addEventListener('change', (e) => {
            settings.clock.timeZone = e.target.value;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // Show day of week toggle
    const showDayOfWeekToggle = document.getElementById('showDayOfWeekToggle');
    if (showDayOfWeekToggle) {
        showDayOfWeekToggle.checked = settings.clock.showDayOfWeek;
        showDayOfWeekToggle.addEventListener('change', (e) => {
            settings.clock.showDayOfWeek = e.target.checked;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // Leading zero toggle
    const leadingZeroToggle = document.getElementById('leadingZeroToggle');
    if (leadingZeroToggle) {
        leadingZeroToggle.checked = settings.clock.leadingZero;
        leadingZeroToggle.addEventListener('change', (e) => {
            settings.clock.leadingZero = e.target.checked;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // AM/PM toggle
    const amPmToggle = document.getElementById('amPmToggle');
    if (amPmToggle) {
        amPmToggle.checked = settings.clock.amPm;
        amPmToggle.addEventListener('change', (e) => {
            settings.clock.amPm = e.target.checked;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // Show year toggle
    const showYearToggle = document.getElementById('showYearToggle');
    if (showYearToggle) {
        showYearToggle.checked = settings.clock.showYear;
        showYearToggle.addEventListener('change', (e) => {
            settings.clock.showYear = e.target.checked;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // Month as text toggle
    const monthAsTextToggle = document.getElementById('monthAsTextToggle');
    if (monthAsTextToggle) {
        monthAsTextToggle.checked = settings.clock.monthAsText;
        monthAsTextToggle.addEventListener('change', (e) => {
            settings.clock.monthAsText = e.target.checked;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }

    // Juche calendar toggle
    const jucheCalendarToggle = document.getElementById('jucheCalendarToggle');
    if (jucheCalendarToggle) {
        jucheCalendarToggle.checked = settings.clock.jucheCalendar;
        jucheCalendarToggle.addEventListener('change', (e) => {
            settings.clock.jucheCalendar = e.target.checked;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
    
    // Date separator select
    const dateSeparatorSelect = document.getElementById('dateSeparatorSelect');
    if (dateSeparatorSelect) {
        dateSeparatorSelect.value = settings.clock.dateSeparator;
        dateSeparatorSelect.addEventListener('change', (e) => {
            settings.clock.dateSeparator = e.target.value;
            saveSettingsToStorage();
            updateTimeDisplay();
        });
    }
});


/* ============================
   Пинать фоны
============================ */
function makeWeatherReactive(settings) {
    settings.weather = new Proxy(settings.weather, {
        set(target, prop, value) {
            if (target[prop] === value) return true;

            target[prop] = value;
            updateWeatherBackgrounds(); // 👈 пинаем обновление

            return true;
        }
    });
}
function makeClockReactive(settings) {
    settings.clock = new Proxy(settings.clock, {
        set(target, prop, value) {
            if (target[prop] === value) return true;

            target[prop] = value;
            updateTimeDisplay(); // 👈 пинаем обновление

            return true;
        }
    });
}