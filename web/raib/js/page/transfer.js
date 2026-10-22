import { supabase } from '../sbase.js';

let receiverDropdown = null;

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', initTransferPage);

// Также инициализируем когда страница активируется
document.addEventListener('page-switched', (e) => {
    if (e.detail === 'ptransfer') {
        initTransferPage();
    }
});

function initTransferPage() {
    // Если dropdown уже инициализирован, очищаем его
    if (receiverDropdown) {
        receiverDropdown.remove();
    }

    // Создаём dropdown для выбора получателя
    const dropdownContainer = document.getElementById('transfer-receiver-dropdown');
    if (dropdownContainer) {
        dropdownContainer.innerHTML = '';
        
        // Получаем список пользователей из window.usersList
        const userOptions = [];
        if (window.usersList) {
            // Добавляем пустой вариант в начало
            userOptions.push({
                value: '',
                label: '--- Select receiver ---'
            });
            
            // Преобразуем объект в массив опций, исключая текущего пользователя
            for (const [id, user] of Object.entries(window.usersList)) {
                if (Number(id) !== window.userid) {
                    userOptions.push({
                        value: String(id),
                        label: `${user.name} (ID: ${id}, Country: ${user.state})`
                    });
                }
            }
            
            // Сортируем по label (пропускаем первый элемент - пустой вариант)
            const emptyOption = userOptions.shift();
            userOptions.sort((a, b) => a.label.localeCompare(b.label));
            userOptions.unshift(emptyOption);
        }

        // Используем функцию createCustomDropdown из dropdown.js
        receiverDropdown = window.createCustomDropdown(dropdownContainer, userOptions, {
            placeholder: 'Select receiver...',
            searchable: true
        });
    }

    // Обработчик отправки
    const submitBtn = document.getElementById('transfer-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleTransferSubmit);
    }

    // Очищаем форму при открытии страницы
    clearTransferForm();
}
window.initTransferPage = initTransferPage;

window.setReciverAndChangePage = function (reciver) {
    receiverDropdown.setValue(String(reciver))
    window.pages.switch('ptransfer')
}

async function handleTransferSubmit() {
    // Проверяем авторизацию
    if (!window.userid) {
        notification.error('Transfer', 'Please login first');
        return;
    }

    // Получаем значения из формы
    const receiverId = receiverDropdown?.getValue();
    const amount = Number(document.getElementById('transfer-amount').value);
    const type = document.getElementById('transfer-type').value.trim();
    const comment = document.getElementById('transfer-comment').value.trim();
    const password = document.getElementById('transfer-password').value;

    // Валидация
    if (!receiverId) {
        notification.warning('Transfer', 'Please select a receiver');
        return;
    }

    if (!amount || amount <= 0) {
        notification.warning('Transfer', 'Please enter a valid amount');
        return;
    }

    if (!password) {
        notification.warning('Transfer', 'Password is required');
        return;
    }

    // Отключаем кнопку во время отправки
    const submitBtn = document.getElementById('transfer-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        // Используем функцию sendTransfer из sbase.js
        await window.sendTransfer(
            window.userid,
            Number(receiverId),
            amount,
            comment || undefined,
            password,
            type || undefined
        );

        // Если успешно, очищаем форму
        clearTransferForm();

        // Перезагружаем историю
        if (window.loadHistory) {
            await window.loadHistory();
        }

    } catch (e) {
        console.error('Transfer error:', e);
        notification.error('Transfer', 'An error occurred');
    } finally {
        // Восстанавливаем кнопку
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Transfer';
    }
}

function clearTransferForm() {
    document.getElementById('transfer-amount').value = '';
    document.getElementById('transfer-type').value = '';
    document.getElementById('transfer-comment').value = '';
    document.getElementById('transfer-password').value = '';
    if (receiverDropdown && receiverDropdown.setValue) {
        receiverDropdown.setValue(null);
    }
}

// Обновляем список получателей когда обновляется список пользователей
const originalLoadUsers = window.loadUsers;
window.loadUsers = async function() {
    await originalLoadUsers.call(this);
    
    // Перезагружаем dropdown если он существует
    if (receiverDropdown) {
        const userOptions = [];
        if (window.usersList) {
            // Добавляем пустой вариант в начало
            userOptions.push({
                value: '',
                label: '--- Select receiver ---'
            });
            
            // Преобразуем объект в массив опций, исключая текущего пользователя
            for (const [id, user] of Object.entries(window.usersList)) {
                if (Number(id) !== window.userid) {
                    userOptions.push({
                        value: String(id),
                        label: `${user.name} (ID: ${id}, Country: ${user.state})`
                    });
                }
            }
            
            // Сортируем по label (пропускаем первый элемент - пустой вариант)
            const emptyOption = userOptions.shift();
            userOptions.sort((a, b) => a.label.localeCompare(b.label));
            userOptions.unshift(emptyOption);
        }
        if (receiverDropdown && receiverDropdown.setOptions) {
            receiverDropdown.setOptions(userOptions);
        }
    }
};

    window.initTransferPage();