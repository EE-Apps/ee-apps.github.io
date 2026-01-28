let nav = document.getElementById("nav");
let navc = document.getElementById('navcontent');
let navd = document.getElementById('navdown');

function createNavDownButton(page) {
    let btn = document.createElement('button');
    btn.classList.add('navbtn');
    btn.innerHTML = `<img src="${page.icon}"><span>${page.title}</span>`;
    btn.onclick = () => {
        if (page.id == 'MORE') {
            document.getElementById('content').classList.toggle('modal-open');
            document.getElementById('moreDiv').classList.toggle('active');
            return;
        } else {
            document.querySelectorAll('.navbtn.active').forEach(element => {
                element.classList.remove('active');
            });
            switchPage(document.getElementById(page.id));
            btn.classList.add('active');
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
        if (page.active) btn.classList.add('active');
        btn.innerHTML = `<img src="${page.icon}"><span>${page.title}</span>`;
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

window.createNav = createNav;



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

    current.classList.remove('active');
    current.classList.add('leave-left');

    newpage.classList.remove('leave-left', 'leave-right');
    newpage.classList.add('active');

    setTimeout(() => {
        current.classList.remove('leave-left', 'leave-right');
    }, 400);
}
