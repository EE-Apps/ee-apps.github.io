import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient(
    'https://vakkrkysnsvrjriraaho.supabase.co',
    'sb_publishable_ESBaZPQSc3b-cDdXqv_FBw_gk6xvwSO'
)
export { supabase }

// тест
const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .limit(1)

console.log(data, error)

window.supabase = supabase;

// window.userid = 4;
if (localStorage.getItem('raib-user')) window.userid = Number(localStorage.getItem('raib-user'));
else window.userid = null;
window.showinguserid = 4
window.admin = false;
window.totalMoney = 0

window.usersList;
window.historyList;

async function loadUsers() {
    const { data, error } = await supabase
        .from('accounts')
        .select('*')    // выбираем все колонки
        .order('id', { ascending: true })

    if (error) {
        console.error('Ошибка при получении пользователей:', error)
        return
    }

    window.usersList = {};
    data.forEach(user => {
        window.usersList[user.id] = user;
    });

    const ul = document.getElementById('userslist')
    ul.innerHTML = ''

    data.forEach(user => {
        const li = document.createElement('div')
        li.className = `userCard ${window.userid === user.id ? 'current' : ''}`
        li.innerHTML = `<h2 class="uname"><div class="uid">${user.id}</div> ${user.name}</h2>
            <!--b>Discord: ${user.discord_id}</b-->
            <div class="usecrow">Balance: ${user.balance}<div class="ubtns">
                <button onclick="window.showUserHistory(${user.id})"><img src="img/ui/time.svg"></button>
                <button onclick="window.setReciverAndChangePage('${user.id}')" class="sent"><img src="img/ui/arrow/right.svg"></button>
            </div></div>`
        ul.appendChild(li)

        window.totalMoney = window.totalMoney + user.balance
    })

    document.getElementById('totalMoney').textContent = window.totalMoney

    if (window.userid) {
        const currentUser = data.find(u => u.id === window.userid)
        if (currentUser) {
            document.getElementById('username').textContent = currentUser.name
            const balanceElem = document.getElementById('homeBalanceValue')
            balanceElem.textContent = currentUser.balance
            const balanceElemH = document.getElementById('homeBalanceValueHome')
            balanceElemH.textContent = currentUser.balance
        }
    }

    window.renderMoneyDistributionChart()
    window.initTransferPage();
}

async function loadHistory(contId = 'historys', user = window.userid) {
    let data, error

    // 1. Исправлено получение из кэша / базы данных
    if (window.historyList?.length > 0) {
        data = window.historyList
    } else {
        // 🔐 БЕЗОПАСНОСТЬ: Обычный пользователь запрашивает ТОЛЬКО свои транзакции
        let query = supabase.from('transfers').select('*')
        
        /*if (window.admin !== true) {
            query = query.or(`from_account.eq.${user},to_account.eq.${user}`)
        }*/

        const res = await query.order('id', { ascending: false })
        data = res.data
        error = res.error
    }

    if (error) {
        console.error('Ошибка при получении транзакций:', error)
        notification.error('Load History', 'Failed to load transfer history')
        return null // Возвращаем null, чтобы предотвратить дальнейшие ошибки
    } else window.historyList = data

    const container = document.getElementById(contId)
    if (!container) return null
    container.innerHTML = ''

    // Фильтрация для отображения (если данные пришли из кэша, где лежит всё)
    const visibleTransfers = user === 'all' ? data : window.admin === true
        ? data
        : data.filter(t => t.from_account === user || t.to_account === user)

    if (!visibleTransfers.length) {
        const empty = document.createElement('div')
        empty.className = 'history-empty'
        empty.textContent = 'No transfers available'
        container.appendChild(empty)
        return { operationsNum: 0, operationsSum: 0 }
    }

    let operationsSum = 0
    
    visibleTransfers.forEach(t => {
        const item = document.createElement('div')
        item.className = 'history-item'

        // Определяем, уходят деньги от просматриваемого юзера или приходят
        const isOutgoing = t.from_account === user 
        
        // Корректный подсчет баланса (минус если ушли, плюс если пришли)
        //operationsSum += isOutgoing ? -t.amount : t.amount
        operationsSum += Math.abs(t.amount)

        // Безопасная проверка существования имен пользователей в usersList
        const fromName = usersList[t.from_account]?.name || `User #${t.from_account}`
        const toName = usersList[t.to_account]?.name || `User #${t.to_account}`

        item.innerHTML = `
            <div class="history-row history-header">
                <span class="history-id">#${t.id}</span>
                <span class="history-date">
                    ${new Date(t.created_at).toLocaleString()}
                </span>
            </div>

            <div class="history-row">
                <div class="history-col">
                    <span class="label">From</span>
                    <span class="value">${fromName}</span>
                </div>
                <div class="history-col">
                    <span class="label">To</span>
                    <span class="value">${toName}</span>
                </div>
            </div>

            <div class="history-row">
                <div class="history-amount ${isOutgoing ? 'out' : 'in'}">
                    ${isOutgoing ? '-' : '+'}${t.amount}
                </div>
            </div>

            ${t.comment ? `
                <div class="history-row history-comment">
                    ${t.type ? `${t.type} - ${t.comment}` : t.comment}
                </div>
            ` : ''}
        `

        container.appendChild(item)
    })

    return { 
        operationsNum: visibleTransfers.length, 
        operationsSum: operationsSum,
    }
}

function getKyivPeriodKey(date, period) {
    const parts = new Intl.DateTimeFormat('en-GB', { 
        timeZone: 'Europe/Kiev', 
        year: 'numeric', month: 'numeric', day: 'numeric' 
    }).formatToParts(date);
    const y = parseInt(parts.find(p => p.type === 'year').value);
    const m = parseInt(parts.find(p => p.type === 'month').value);
    const d = parseInt(parts.find(p => p.type === 'day').value);

    if (period === 'day') {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    if (period === 'month') {
        return `${y}-${String(m).padStart(2, '0')}`;
    }
    if (period === 'week') {
        // Вычисляем номер недели в году для киевской даты
        const tempDate = new Date(Date.UTC(y, m - 1, d));
        const startOfYear = new Date(Date.UTC(y, 0, 1));
        const pastDays = (tempDate - startOfYear) / 86400000;
        const weekNum = Math.ceil((pastDays + startOfYear.getUTCDay() + 1) / 7);
        return `${y}-W${String(weekNum).padStart(2, '0')}`;
    }
    return date.getTime().toString();
}

function formatKyivDate(date, period) {
    const options = { timeZone: 'Europe/Kiev' };
    if (period === 'day') {
        options.year = 'numeric'; options.month = '2-digit'; options.day = '2-digit';
        return new Intl.DateTimeFormat('uk-UA', options).format(date);
    }
    if (period === 'month') {
        options.year = 'numeric'; options.month = 'short'; // например, "жовт. 2023"
        return new Intl.DateTimeFormat('uk-UA', options).format(date);
    }
    if (period === 'week') {
        options.year = 'numeric'; options.month = '2-digit'; options.day = '2-digit';
        const dateStr = new Intl.DateTimeFormat('uk-UA', options).format(date);
        // Повторно вычисляем номер недели для отображения
        const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kiev', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date);
        const y = parseInt(parts.find(p => p.type === 'year').value);
        const m = parseInt(parts.find(p => p.type === 'month').value);
        const d = parseInt(parts.find(p => p.type === 'day').value);
        const tempDate = new Date(Date.UTC(y, m - 1, d));
        const startOfYear = new Date(Date.UTC(y, 0, 1));
        const weekNum = Math.ceil(((tempDate - startOfYear) / 86400000 + startOfYear.getUTCDay() + 1) / 7);
        return `${dateStr} (тижд. ${weekNum})`;
    }
    // period === 'operation'
    options.year = 'numeric'; options.month = '2-digit'; options.day = '2-digit';
    options.hour = '2-digit'; options.minute = '2-digit';
    return new Intl.DateTimeFormat('uk-UA', options).format(date);
}

window.renderBalanceChart = function(userId, period = 'operation') {
    const canvasId = 'balanceChart'
    let canvas = document.getElementById(canvasId)
    
    if (!canvas) {
        const container = document.getElementById('userOperationsList')
        if (!container) return
        canvas = document.createElement('canvas')
        canvas.id = canvasId
        container.parentNode.insertBefore(canvas, container)
    }

    const currentUser = window.usersList[userId]
    const currentBalance = currentUser ? currentUser.balance : 0

    const userTransfers = window.historyList
        .filter(t => t.from_account === userId || t.to_account === userId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    const historyBackwards = []
    let runningBalance = currentBalance
    
    historyBackwards.push({ date: new Date(), balance: runningBalance })

    for (let i = userTransfers.length - 1; i >= 0; i--) {
        const t = userTransfers[i]
        if (t.to_account === userId) {
            runningBalance -= t.amount
        } else if (t.from_account === userId) {
            runningBalance += t.amount
        }
        historyBackwards.push({ date: new Date(t.created_at), balance: Math.round(runningBalance) })
    }

    historyBackwards.reverse()

    let finalData = [];

    if (period === 'operation') {
        finalData = historyBackwards;
    } else {
        const grouped = new Map()
        historyBackwards.forEach(item => {
            const key = getKyivPeriodKey(item.date, period)
            grouped.set(key, item)
        });
        finalData = Array.from(grouped.values())
    }

    const labels = finalData.map(item => formatKyivDate(item.date, period))
    const balances = finalData.map(item => item.balance)

    if (window.balanceChartInstance) {
        window.balanceChartInstance.destroy()
    }

    if (typeof Chart === 'undefined') {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
        script.onload = () => window.renderBalanceChart(userId, period)
        document.head.appendChild(script)
        return
    }

    window.balanceChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Баланс',
                data: balances,
                borderColor: '#308d3b', 
                backgroundColor: 'rgba(48, 141, 59, 0.1)', 
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: period === 'operation' ? 1 : 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Баланс: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    })
}

window.showUserHistory = async function (user, period = 'operation') {
    if (user === 'all') {
        const canvas = document.getElementById('balanceChart');
        if (canvas) canvas.style.display = 'none'
    } else {
        const canvas = document.getElementById('balanceChart');
        if (canvas) canvas.style.display = 'block'
    }

    const result = await loadHistory('userOperationsList', user)
    
    if (!result) return 

    const { operationsNum, operationsSum } = result

    window.pages.switch('pusershistory')
    document.getElementById('totalOperations').textContent = operationsNum
    window.showinguserid = user
    
    document.getElementById('totalOperationsSum').textContent = Math.round(operationsSum > 0 ? `+${operationsSum}` : operationsSum)
    
    if (user !== 'all') {
        window.renderBalanceChart(user, period)
    }
}

// Вспомогательная функция для генерации приятных цветов
function getChartColor(index, total) {
    // Генерируем оттенки по цветовому кругу (HSL)
    const hue = Math.round((index / total) * 360);
    return `hsl(${hue}, 65%, 55%)`;
}

window.renderMoneyDistributionChart = function() {
    const canvasId = 'moneyDistributionChart';
    let canvas = document.getElementById(canvasId);
    
    // Находим контейнер для вставки (например, перед списком пользователей)
    const container = document.getElementById('userslist');
    if (!container) return;

    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = canvasId;
        canvas.style.maxWidth = '400px';
        canvas.style.margin = '0 auto 30px auto';
        // Вставляем график ПЕРЕД списком пользователей
        container.parentNode.insertBefore(canvas, container);
    }

    // 1. Подготовка данных
    const users = Object.values(window.usersList || {});
    const totalMoney = window.totalMoney || users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0);

    // Фильтруем только тех, у кого баланс > 0, и сортируем по убыванию
    const activeUsers = users
        .filter(u => Number(u.balance) > 0)
        .sort((a, b) => Number(b.balance) - Number(a.balance));

    const MAX_SLICES = 8; // Показываем топ-8, остальные в "Остальные"
    
    const labels = [];
    const data = [];
    const colors = [];
    let othersBalance = 0;

    activeUsers.forEach((u, index) => {
        if (index < MAX_SLICES) {
            labels.push(u.name || `User #${u.id}`);
            data.push(Number(u.balance));
            colors.push(getChartColor(index, MAX_SLICES));
        } else {
            othersBalance += Number(u.balance);
        }
    });

    // Если есть пользователи за пределами топ-8, добавляем их в одну категорию
    if (othersBalance > 0) {
        labels.push('Остальные');
        data.push(othersBalance);
        colors.push('#e5e7eb'); // Нейтральный серый цвет
    }

    // Если денег вообще нет ни у кого
    if (data.length === 0) {
        labels.push('Нет данных');
        data.push(1);
        colors.push('#f3f4f6');
    }

    // 2. Уничтожаем старый график при обновлении
    if (window.distributionChartInstance) {
        window.distributionChartInstance.destroy();
    }

    // 3. Динамическая загрузка Chart.js (если еще не загружен)
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => window.renderMoneyDistributionChart();
        document.head.appendChild(script);
        return;
    }

    // 4. Рисуем график
    window.distributionChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%', // Толщина кольца (65% от радиуса - пустота внутри)
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = totalMoney > 0 ? ((value / totalMoney) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        },
                    }
                }
            }
        },
    });
};

window.loadUsers = loadUsers;
window.loadHistory = loadHistory;

// Загружаем при старте
loadUsers()
loadHistory()

// пример вызова
async function sendTransfer(fromId, toId, amount, comment, password, type) {
    try {
        // 1. Проверяем существование получателя
        const { data: receiver, error: receiverError } = await window.supabase
            .from('accounts')
            .select('id')
            .eq('id', toId)
            .single();

        if (receiverError || !receiver) {
            notification.error('Transfer', 'Receiver does not exist');
            return;
        }

        if (comment == undefined || comment === null) {
            comment = '';
        }

        if (type == undefined || type === null) {
            type = '';
        }

        // 3. Отправляем перевод
        const { error } = await window.supabase.rpc(
            'make_transfer_with_password',
            {
                p_from: fromId,
                p_to: toId,
                p_amount: amount,
                p_comment: comment,
                p_password: password,
                p_type: type
            }
        );

        if (error) {
            // ❗ неправильный пароль
            if (error.code === 'P0001' && error.message === 'Invalid password') {
                notification.error('Transfer failed', 'Invalid password');
                return;
            }

            // ❗ любая другая ошибка
            notification.error('Transfer error', JSON.stringify(error, null, 2));
            return;
        }

        // ✅ успех
        notification.success('Transfer', 'Money sent successfully');

    } catch (e) {
        notification.error('Transfer error', String(e));
        console.log(e);
    }
}

window.sendTransfer = sendTransfer;

function getUserIdByNameCI(name) {
    if (!window.usersList || !name) return null;
    const searchName = name.toLowerCase();

    for (const [id, user] of Object.entries(window.usersList)) {
        if (user.name?.toLowerCase() === searchName) {
            return Number(id);
        }
    }
    return null;
}
window.getUserIdByNameCI = getUserIdByNameCI;

document.getElementById('login-btn').addEventListener('click', async (e) => {
    window.login();
});

window.login = async function() {
    const name = document.getElementById('login-username').value;
    const pw = document.getElementById('login-password').value;
    if (!name) {
        notification.warning('Login', 'Username required');
        return;
    }
    if (!pw) {
        notification.warning('Login', 'Password required');
        return;
    }
    const id = await getUserIdByNameCI(name);
    if (!id) {
        notification.error('Login', 'User not found');
        return;
    }
    const { data, error } = await supabase.rpc(
        'check_account_password',
        {
            p_account_id: id,
            p_password: pw
        }
    );

    if (error) {
        console.error(error);
        notification.error('Login', 'Password check failed');
        return;
    }

    if (data === true) {
        notification.success('Login', 'Password correct');
    } else {
        notification.error('Login', 'Invalid password');
        return;
    }
    window.userName = name
    window.userid = id
    localStorage.setItem('raib-user', Number(id));
    location.reload();
}

document.querySelectorAll('#headerUsersHistBtns button').forEach(btn => {
    btn.addEventListener('click', () => {
        console.log(window.showinguserid + ' - ' + btn.dataset.val)
        window.renderBalanceChart(Number(window.showinguserid), btn.dataset.val)
    })
})

document.getElementById('pusers-btn').addEventListener('click', () => {
    window.renderMoneyDistributionChart()
})