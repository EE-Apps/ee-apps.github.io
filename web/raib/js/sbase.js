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

window.showUserHistory = async function (user) {
    const result = await loadHistory('userOperationsList', user)
    
    // Проверка на случай ошибки внутри loadHistory
    if (!result) return 

    const { operationsNum, operationsSum } = result

    window.pages.switch('pusershistory')
    document.getElementById('totalOperations').textContent = operationsNum
    
    // Красивое отображение знака валюты/минуса
    document.getElementById('totalOperationsSum').textContent = Math.round(operationsSum > 0 ? `+${operationsSum}` : operationsSum)
}

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