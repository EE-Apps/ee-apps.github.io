let nav = document.getElementById("nav");
let navc = document.getElementById('navcontent');
let navd = document.getElementById('navdown');

window.lastestPage = '';

let touchStartX = 0;
let touchStartY = 0;

window.leftBtns = {
    nav: {
        img: 'img/ui/lines',
        onclick: 'openNavPanel()',
    },
    back: {
        img: 'img/ui/back',
        onclick: 'returnToPage()',
    },
    none: {
        img: 'img/ui/blank',
        onclick: '',
    },
}
window.rightBtns = {
    add: {
        img: 'img/ui/add2',
    },
    search: {
        img: 'img/ui/search',
        onclick: 'openSearch()',
    },
    more: {
        img: 'img/ui/more',
    }
}

const HEADER_BTNS = ['add', 'search'];

function createHeadOfPage(page) {
    let head = document.createElement('header');
    head.className = 'page-header';
    head.innerHTML = `
        <h1>${page.title}</h1>
        <h3>${page.description ? page.description : ''}</h3>
    `;

    function generateLeftButton(type) {
        const data = leftBtns[type];
        return `<button class="leftBtnsNav"><img src="${data.img}.svg" onclick="${data.onclick}"></button>`;
    }

    function generateRightButton(page, i) {
        const btnData = page.btns[i];

        const img = btnData[1] ?? rightBtns[btnData[0]]?.img ?? 'img/ui/blank';
        const onclick = btnData[2] ?? rightBtns[btnData[0]]?.onclick ?? '';

        let btn = document.createElement('button');
        btn.onclick = onclick;
        btn.innerHTML = `<img src="${img}.svg">`;

        return btn;
    }

    function toggleNavRightMore(pageId) {
        document.getElementById(`${pageId}-navRightMore`).classList.toggle('active');
    }

    function generateTopSubpages(page) {
        if (!page.subcategories || page.subcategories.length === 0) {
            return null; 
        }
        const topNav = document.createElement('div');
        topNav.className = 'topNav';

        // Создаем кнопки и добавляем их в контейнер
        page.subcategories.forEach((curSub, i) => {
            const btn = document.createElement('button');
            btn.textContent = curSub;
            btn.className = i == 0? 'active' : '';
            topNav.appendChild(btn);
        });

        return topNav;
    }

    let leftBtn = page.leftBtn ? generateLeftButton(page.leftBtn) : generateLeftButton(eelib.leftBtn);

    let hnav = document.createElement('nav');
    hnav.className = 'page-header-btns';
    hnav.innerHTML = `
        ${leftBtn}
        <div class="lefthead"></div>
    `;
    try {
        hnav.appendChild(generateTopSubpages(page));
    } catch {}

    const headerBtns = [];
    const moreBtns = [];

    page.btns?.forEach((btnData, i) => {
        if (HEADER_BTNS.includes(btnData[0])) {
            headerBtns.push(i);
        } else {
            moreBtns.push(i);
        }
    });

    headerBtns.forEach(i => {
        hnav.querySelector('.lefthead').appendChild(generateRightButton(page, i));
    });

    if (moreBtns.length > 0) {
        let moreBtn = document.createElement('button');
        moreBtn.onclick = () => toggleNavRightMore(page.id);
        moreBtn.innerHTML = `<img src="${rightBtns.more.img}.svg">`;
        hnav.querySelector('.lefthead').appendChild(moreBtn);

        let navRightMore = document.createElement('div');
        navRightMore.id = `${page.id}-navRightMore`;
        navRightMore.className = 'navRightMore';
        moreBtns.forEach(i => {
            navRightMore.appendChild(generateRightButton(page, i));
        });
        hnav.appendChild(navRightMore);
    }

    document.getElementById(page.id).prepend(hnav);
    document.getElementById(page.id).prepend(head);
}

function createNavDownButton(page) {
    let btn = document.createElement('button');
    btn.classList.add('navbtn');
    btn.innerHTML = `<img src="${page.icon}"><span>${page.title}</span>`;
    btn.id = `${page.id}-navd`;
    if (page.active) {
        btn.classList.add('active')
        lastestPage = page.id;
    };
    btn.onclick = () => {
        if (page.id == 'MORE') {
            document.getElementById('content').classList.toggle('modal-open');
            document.getElementById('moreDiv').classList.toggle('active');
            return;
        } else {
            changePage(page.id);
        }
    };
    navd.appendChild(btn);
}

function createNavMoreButton(page) {
    let moreDiv = document.getElementById('moreDiv');
    let btn = document.createElement('button');
    btn.classList.add('navbtn');
    btn.innerHTML = `<img src="${page.icon}"><span>${page.title}</span>`;
    btn.onclick = () => {
        document.getElementById('content').classList.remove('modal-open');
        document.getElementById('moreDiv').classList.remove('active');
        document.querySelectorAll('.navbtn.active').forEach(element => {
            element.classList.remove('active');
        });
        switchPage(document.getElementById(page.id));
        btn.classList.add('active');
    };
    moreDiv.appendChild(btn);
}

function createNav(pages) {
    let i = 0;

    if (pages.length > 4) {
        if (!document.getElementById('moreDiv')) {
            let moreDiv = document.createElement('div');
            moreDiv.id = 'moreDiv';
            moreDiv.className = 'modal dialog';
            document.getElementById('content').appendChild(moreDiv);
        }
    }

    for (let page of pages) {
        i++;
        let btn = document.createElement('button');
        btn.classList.add('navbtn');
        if (page.active) {
            btn.classList.add('active');
            document.getElementById(page.id).classList.add('active');
        }
        btn.innerHTML = `<img src="${page.icon}"><span>${page.title}</span>`;
        btn.id = `${page.id}-navc`
        btn.onclick = () => {
            document.querySelectorAll('.navbtn.active').forEach(element => {
                element.classList.remove('active');
            });
            switchPage(document.getElementById(page.id));
            btn.classList.add('active');
        };
        page.id == 'settings' ? nav.appendChild(btn) : navc.appendChild(btn);

        if ( /*page.id != 'settings' &&*/ ( ( i < 5 && pages.length < 5) || ( i < 4 && pages.length > 4) ) ) createNavDownButton(page);
        if ( pages.length > 4 && i > 3 ) createNavMoreButton(page);
        createHeadOfPage(page, pages);
    }

    if (pages.length > 4) {
        createNavDownButton({
            id: 'MORE',
            title: 'Ещё',
            icon: 'img/ui/lines.svg',
        });
    }

    if (pages.length < 6) {
        document.body.classList.add('nav-fewpages');
    } else {
        document.body.classList.remove('nav-fewpages');
    }
}

function getActivePage() {
    return document.querySelector('.page.active');
}

function scrollToTop() {
    const container = getActivePage();
    if (container) {
        container.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

function scrollToBottom() {
    const container = getActivePage();
    if (container) {
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }
}

function switchPage(newpage) {
    let current = document.querySelector('.page.active');
    if (!newpage || newpage === current) return;
    lastestPage = current.id;

    current.classList.remove('active');
    current.classList.add('leave-left');

    newpage.classList.remove('leave-left', 'leave-right');
    newpage.classList.add('active');

    if (isMobile && document.getElementById('nav').classList.contains('active')) {
        openNavPanel()
    }

    setTimeout(() => {
        current.classList.remove('leave-left', 'leave-right');
    }, 400);
}

function changePage(newpage) {
    document.querySelectorAll('.navbtn.active').forEach(element => {
        element.classList.remove('active');
    });
    switchPage(document.getElementById(newpage));
    document.getElementById(`${newpage}-navc`).classList.add('active');
    document.getElementById(`${newpage}-navd`).classList.add('active');
}

function handleOutsideClick(event) {
    const nav = document.getElementById('nav');

    if (!nav.contains(event.target)) {
        openNavPanel();
    }
}

function handleSwipeStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleSwipeEnd(event) {
    const nav = document.getElementById('nav');

    if (!nav.classList.contains('active')) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Игнорируем, если свайп больше по вертикали, чем по горизонтали
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    // Свайп влево и длиннее 50px
    if (deltaX < -50) {
        openNavPanel();
    }
}

function openNavPanel() {
    const nav = document.getElementById('nav');
    const content = document.getElementById('content');
    const navd = document.getElementById('navdown');
    const isOpen = nav.classList.contains('active');

    if (isMobile) {
        if (isOpen) {
            content.classList.remove('modal-open');
            navd.classList.remove('modal-open');
            content.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('touchstart', handleSwipeStart);
            document.removeEventListener('touchend', handleSwipeEnd);
        } else {
            content.classList.add('modal-open');
            navd.classList.add('modal-open');
            setTimeout(() => {
                content.addEventListener('click', handleOutsideClick);
            }, 0);
            document.addEventListener('touchstart', handleSwipeStart);
            document.addEventListener('touchend', handleSwipeEnd);
        }
    }

    nav.classList.toggle('active');
}

function returnToPage() {
    try { changePage(lastestPage) } catch(e) {};
};

window.switchPage = switchPage;
window.createNav = createNav;
window.openNavPanel = openNavPanel;
window.returnToPage = returnToPage

console.log(window.pages);
createNav(window.pages);