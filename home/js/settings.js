document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.settings-header').forEach(header => {
        const button = header.querySelector('button')
        const sectionId = button.getAttribute('data-section');
        const sectionDiv = document.getElementById(sectionId);
        sectionDiv.style.height = sectionDiv.scrollHeight + 'px';
        button.querySelector('img').style.rotate = '-90deg';

        header.addEventListener('click', () => {
            if (sectionDiv.style.height === '0px') {
                sectionDiv.style.height = sectionDiv.scrollHeight + 'px';
                button.querySelector('img').style.rotate = '0deg';
            } else {
                sectionDiv.style.height = '0px';
                button.querySelector('img').style.rotate = '-90deg';
            }
        });
    });

});

function twoPages() {
    document.body.classList.toggle('twoPages');
    if (document.body.classList.contains('twoPages')) {
        document.querySelectorAll('.main-content').forEach(page => {
            page.classList.remove('active');
            page.classList.add('active');
        });
    } else {
        document.querySelectorAll('.main-content').forEach((page, index) => {
            if (index === 1) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
    }
};

function openCatalogEditor(index) {
    // Получаем конкретный каталог из настроек по индексу
    const catalog = settings.catalogs[index];
    if (!catalog) return;

    // Создаем или получаем модальное окно
    let modal = document.getElementById('pinEditModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pinEditModal';
        modal.className = 'pin-edit-modal';
        document.body.appendChild(modal);
    }

    // Рендерим контент, адаптированный под свойства catalog (name, link, img)
    modal.innerHTML = `
        <div class="pin-edit-backdrop"></div>
        <div class="pin-edit-dialog">
            <div class="pin-edit-header">
                <h3>Edit Catalog Item</h3>
                <button class="pin-edit-close" title="Close">
                    <img src="img/ui/cross.svg" alt="Close">
                </button>
            </div>
            <div class="pin-edit-body">
                <div class="pin-edit-preview">
                    <img id="pinEditPreviewImg" src="${catalog.img}" alt="${catalog.name}" onerror="this.src='img/ui/check/bookmark.svg'">
                </div>
                <div class="pin-edit-form">
                    <div class="pin-edit-field">
                        <label for="pinEditName">Name</label>
                        <input type="text" id="pinEditName" value="${catalog.name}" placeholder="Catalog name">
                    </div>
                    <div class="pin-edit-field">
                        <label for="pinEditLink">URL</label>
                        <input type="text" id="pinEditLink" value="${catalog.link}" placeholder="https://example.com">
                    </div>
                    <div class="pin-edit-field">
                        <label for="pinEditImg">Image Path</label>
                        <input type="text" id="pinEditImg" value="${catalog.img}" placeholder="img/path.png">
                    </div>
                </div>
            </div>
            <div class="pin-edit-footer">
                <button class="pin-edit-cancel">Cancel</button>
                <button class="pin-edit-save">Save Changes</button>
            </div>
        </div>
    `;

    // Показываем модалку
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Элементы для работы
    const imgInput = modal.querySelector('#pinEditImg');
    const previewImg = modal.querySelector('#pinEditPreviewImg');
    const nameInput = modal.querySelector('#pinEditName');
    const linkInput = modal.querySelector('#pinEditLink');

    // Обновление превью при вводе пути к картинке
    imgInput.addEventListener('input', () => {
        previewImg.src = imgInput.value;
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Закрытие по кнопкам и фону
    [modal.querySelector('.pin-edit-close'), modal.querySelector('.pin-edit-cancel'), modal.querySelector('.pin-edit-backdrop')]
        .forEach(btn => btn.addEventListener('click', closeModal));

    // Логика сохранения
    modal.querySelector('.pin-edit-save').addEventListener('click', () => {
        const newName = nameInput.value.trim();
        const newLink = linkInput.value.trim();
        const newImg = imgInput.value.trim();

        if (newName && newLink && newImg) {
            // Обновляем данные в основном объекте настроек
            settings.catalogs[index].name = newName;
            settings.catalogs[index].link = newLink;
            settings.catalogs[index].img = newImg;

            // Вызываем функции сохранения и перерисовки (как в вашем первом примере)
            saveSettingsToStorage();
            renderModules(); // или renderCatalogs(), смотря что обновляет UI
            closeModal();
        } else {
            alert('Please fill in all fields');
        }
    });

    // Автофокус
    setTimeout(() => nameInput.focus(), 100);
}

document.getElementById('twoBtn-settings').addEventListener('click', twoPages);