document.addEventListener("DOMContentLoaded", () => {

    const modulesDiv = document.getElementById('settModules');
    const catalogsDiv = document.getElementById('settCatalogs');
    const aisDiv = document.getElementById('settAi');
    // Module elements
    document.querySelectorAll('.module').forEach(module => {

        const moduleSetting = document.createElement('div');
        moduleSetting.className = 'settingsBlock';
        moduleSetting.innerHTML = `
            <label for="toggle${module.id.charAt(0).toUpperCase() + module.id.slice(1)}" class="settingsLabel">${module.id.charAt(0).toUpperCase() + module.id.slice(1)}</label>
            <label class="oneui-switch">
                <input type="checkbox">
                <span class="slider"></span>
            </label>
        `;
        moduleSetting.querySelector('input').checked = settings.modules[module.id];
        moduleSetting.querySelector('input').addEventListener('change', (e) => {
            settings.modules[module.id] = e.target.checked;
            saveSettingsToStorage();
            renderModules();
        });
        modulesDiv.appendChild(moduleSetting);
    });
    Object.entries(settings.ai).forEach(([aiKey, aiSetting]) => {
        const aiBlock = document.createElement('div');
        aiBlock.className = 'settingsBlock';
        aiBlock.innerHTML = `
            <label for="toggle${aiKey}" class="settingsLabel">${aiSetting.name}</label>
            <label class="oneui-switch">
                <input type="checkbox">
                <span class="slider"></span>
            </label>
        `;
        aiBlock.querySelector('input').checked = aiSetting.enabled;
        aiBlock.querySelector('input').addEventListener('change', (e) => {
            settings.ai[aiKey].enabled = e.target.checked;
            saveSettingsToStorage();
            renderModules();
        });
        aisDiv.appendChild(aiBlock);
    });
    Object.keys(apps).forEach(company => {
        const appBlock = document.createElement('div');
        appBlock.className = 'settingsBlock';
        appBlock.innerHTML = `
            <label for="toggle${company}" class="settingsLabel">${apps[company].name}</label>
            <label class="oneui-switch">
                <input type="checkbox">
                <span class="slider"></span>
            </label>
        `;
        appBlock.querySelector('input').checked = settings.company[company];
        appBlock.querySelector('input').addEventListener('change', (e) => {
            settings.company[company] = e.target.checked;
            saveSettingsToStorage();
            renderModules();
        });
        document.getElementById('settCompanies').appendChild(appBlock);
    });
    settings.catalogs.forEach((catalog, i) => {
        console.log(catalog);
        const appBlock = document.createElement('div');
        appBlock.className = 'settingsBlock';
        appBlock.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <label for="toggle${catalog.name}" class="settingsLabel">${catalog.name}</label>
                <button style="border: 0; padding: 0;"><img src="img/ui/edit.svg"></button>
            </div>
            <label class="oneui-switch">
                <input type="checkbox">
                <span class="slider"></span>
            </label>
        `;
        appBlock.querySelector('button').addEventListener('click', () => {
            openCatalogEditor(i)
        })
        appBlock.querySelector('input[type="checkbox"]').checked = settings.catalogs[i].on;
        appBlock.querySelector('.oneui-switch').addEventListener('change', (e) => {
            settings.catalogs[i].on = e.target.checked;
            saveSettingsToStorage();
            renderModules();
        });
        document.getElementById('settCatalogs').appendChild(appBlock);
    });

    renderModules();
});

function renderModules() {
    loadCatalogs()

    document.querySelectorAll('.module').forEach(module => {
        if (settings.modules[module.id]) {
            module.classList.add('mactive');
            module.style.display = '';
        } else {
            module.style = 'display: none;';
            module.classList.remove('mactive');
        }
    });

    const aiContainer = document.getElementById('ais');
    aiContainer.innerHTML = '';
    Object.entries(settings.ai).forEach(([aiKey, aiSetting]) => {
        if (aiSetting.enabled) {
            const aiLink = document.createElement('a');
            aiLink.className = 'ais-ai';
            aiLink.href = aiSetting.link;
            //aiLink.target = '_blank';
            aiLink.rel = 'noopener noreferrer';
            const aiImg = document.createElement('img');
            aiImg.src = `./icons/${aiKey}.${aiSetting.ext? aiSetting.ext : 'svg'}`;
            aiImg.alt = aiSetting.name;
            aiLink.appendChild(aiImg);
            aiContainer.appendChild(aiLink);
        }
    });

    const companies = document.getElementById('companies');
    companies.innerHTML = ''; // Clear previous content
    Object.keys(apps).forEach(company => {
        if (['apple','amazon','samsung','huawei','adobe','meta'].includes(company)) return;
        if (!settings.company[company]) return; // Skip if module is disabled
        const companyItem = document.createElement('div');
        companyItem.className = 'app-btn';
        companyItem.onclick = () => loadApps(company);
        companyItem.dataset.company = company;
        companyItem.innerHTML = `
        <img src="${apps[company].icon}" alt="${apps[company].name}" class="sidebar-icon"/>
        <!--span class="sidebar-name">${apps[company].name}</span-->
        `;
        companies.appendChild(companyItem);
    });
}