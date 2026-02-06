// alert("1917")
let thisversion = "1.7.6";
const searchEngines = {
    google: {
        url: "https://www.google.com/search?q=",
        assistant: { url: "https://gemini.google.com/", icon: "./icons/gemini.svg" }
    },
    bing: {
        url: "https://www.bing.com/search?q=",
        assistant: { url: "https://copilot.microsoft.com/", icon: "./icons/copilot.svg" }
    },
    yandex: {
        url: "https://yandex.com/search/?text=",
        assistant: { url: "https://alice.yandex.ru/", icon: "./icons/alice.svg" }
    },
    openai: {
        url: "https://chatgpt.com/?temporary-chat=true&q=",
        assistant: { url: "https://chatgpt.com/", icon: "./icons/chatgpt.svg" }
    },
    wru: {
        url: "https://ru.wikipedia.org/w/index.php?search=",
        assistant: { url: "https://ru.wikipedia.org/wiki/", icon: "./icons/wikipedia.svg" }
    },
    wen: {
        url: "https://en.wikipedia.org/w/index.php?search=",
        assistant: { url: "https://en.wikipedia.org/wiki/", icon: "./icons/wikipedia.svg" }
    },
    wua: {
        url: "https://uk.wikipedia.org/w/index.php?search=",
        assistant: { url: "https://uk.wikipedia.org/wiki/", icon: "./icons/wikipedia.svg" }
    }
};

const searchEngineSelect = document.getElementById("search-engine-select");
const searchBar = document.getElementById("search-bar");
const assistantBtn = document.getElementById("assistant");
const assistantIcon = document.getElementById("assistant-icon");
const themeToggle = document.getElementById("theme-toggle");
const iframeWrapper = document.getElementById("iframe-wrapper");
const iframeDisplay = document.getElementById("iframe-display");
const updateExtension = document.getElementById("update-extension");
const devExtension = document.getElementById("dev-extension");

document.addEventListener("DOMContentLoaded", () => {
    // Retrieve and apply saved search engine settings
    const savedEngine = localStorage.getItem("searchEngine");
    if (savedEngine) {
        searchEngineSelect.value = savedEngine;
    }
    updateSearchSettings();

    // Apply saved theme (light or dark)
    const savedTheme = localStorage.getItem("theme");
    document.body.classList.add(savedTheme);
});

// Event listeners
searchEngineSelect.addEventListener("change", updateSearchSettings);
assistantBtn.addEventListener("click", () => window.open(getAssistantUrl()));
themeToggle.addEventListener("click", toggleTheme);
searchBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const query = searchBar.value.trim();

        if (query) {
            // 1. Проверка на внутреннюю команду app:
            if (query.startsWith("app:")) {
                const appName = query.slice(4).toLowerCase();
                loadIframe(appName);
                return;
            }

            // 2. Регулярное выражение для проверки, является ли запрос URL-адресом
            // Проверяет наличие точки (напр. google.com) и отсутствие пробелов
            const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/.*)?$/i;

            if (urlPattern.test(query)) {
                let url = query;
                
                // Если адрес не начинается с протокола, добавляем https://
                if (!/^https?:\/\//i.test(query)) {
                    url = "https://" + query;
                }
                
                window.location.href = url;
                return;
            }

            // 3. Если это не команда и не ссылка — выполняем поиск
            const engine = searchEngineSelect.value;
            const searchUrl = searchEngines[engine].url + encodeURIComponent(query);
            window.location.href = searchUrl;
        }
    }
});

// Update search engine and assistant settings
function updateSearchSettings() {
    const engine = searchEngineSelect.value;
    const engineData = searchEngines[engine];

    // Store selected search engine in localStorage
    localStorage.setItem("searchEngine", engine);
    assistantIcon.src = engineData.assistant.icon;
}

// Get the assistant URL based on the selected engine
function getAssistantUrl() {
    const engine = searchEngineSelect.value;
    return searchEngines[engine].assistant.url;
}

// Add event listener for app buttons to load iframe content
document.querySelectorAll(".app-btn").forEach(button => {
    button.addEventListener("click", (event) => {
        const company = event.target.closest(".app-btn").dataset.company;
        if (company == 'deepwiki') return;
        spage(`${company}-apps`);
        //loadIframe(company);
    });
});

// Function to load iframe
function loadIframe(company) {
    const src = `apps/${company}.html`;

    if (iframeDisplay.src.includes(src)) {
        // Hide iframe if it's already showing the same content
        iframeWrapper.style.display = 'none';
        iframeDisplay.src = '';
    } else {
        // Show and load iframe with new content
        iframeWrapper.style.display = 'block';
        iframeDisplay.src = src;
    }
}

// Toggle between light and dark themes
function toggleTheme() {
//    let newTheme = document.body.classList.contains("dark") ? "light" : "dark";
//
//    if (navigator.userAgent.indexOf('Firefox') !== -1) {
//        if (document.body.classList.contains("dark")) {
//            document.body.classList.toggle("dark");
//        }
//        document.body.classList.toggle("moziladark"); // Браузер - Firefox
//    } else {
//        if (document.body.classList.contains("moziladark")) {
//            document.body.classList.toggle("moziladark");
//        }
//        document.body.classList.toggle("dark"); // Другой браузер
//    }


    let newTheme;

    if (navigator.userAgent.indexOf('Firefox') !== -1) {
        document.body.classList.toggle("moziladark"); // Браузер - Firefox
        document.body.classList.toggle("light");
        newTheme = localStorage.getItem("theme") == "moziladark" ? "light" : "moziladark";
        if (document.body.classList.contains("dark")) {
            document.body.classList.toggle("dark");
        }
    } else {
        document.body.classList.toggle("dark"); // Другой браузер
        document.body.classList.toggle("light");
        newTheme = localStorage.getItem("theme") == "dark" ? "light" : "dark";
        if (document.body.classList.contains("moziladark")) {
            document.body.classList.toggle("moziladark");
        }
    }

    // Save theme to localStorage
    localStorage.setItem("theme", newTheme);

    const iframe = document.getElementById('iframe-display');
    // Post message to iframe with specific origin (example: your site's domain)
    iframe.contentWindow.postMessage({ type: 'themeChanged', theme: newTheme }, 'https://your-website.com');
}

fetch("https://raw.githubusercontent.com/EE-Apps/site/refs/heads/main/home/ver.txt")
    .then(response => response.text())
    .then(data => {
        let version = data.trim(); // Получение и очистка данных версии
        console.log("Актуальная версия:", version);

        // Сравнение версий
        if (compareVersions(thisversion, version) < 0) {
            updateExtension.style.display = 'block';
        } else {
            if (compareVersions(thisversion, version) > 0) {
                devExtension.style.display = 'block';
            } else {
                updateExtension.style.display = 'none';
            }
        }
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });

// Функция сравнения версий
function compareVersions(version1, version2) {
    let v1parts = version1.split('.').map(Number);
    let v2parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); ++i) {
        let a = v1parts[i] || 0;
        let b = v2parts[i] || 0;

        if (a < b) return -1;
        if (a > b) return 1;
    }

    return 0;
}

function checkBrowserAndRedirect() {
    // Получаем информацию о браузере
    const userAgent = navigator.userAgent;

    // Проверяем, используется ли браузер Mozilla Firefox
    if (userAgent.indexOf("Firefox") !== -1) {
        window.location.href = "https://raw.githubusercontent.com/EE-Apps/site/refs/heads/main/home/ee-new-tab-extension-firefox.zip";
    } else {
        window.location.href = "https://raw.githubusercontent.com/EE-Apps/site/refs/heads/main/home/ee-new-tab-extension-chromium.zip";
    }
}

// Обработчик события для ссылки
document.getElementById("update-link").addEventListener("click", function (event) {
    console.log("download update")
    event.preventDefault(); // Предотвращает переход по ссылке
    checkBrowserAndRedirect(); // Вызывает функцию для проверки браузера и перенаправления
});
