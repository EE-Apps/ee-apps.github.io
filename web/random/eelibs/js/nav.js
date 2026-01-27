let nav = document.getElementById("nav");
let navc = document.getElementById('navcontent');

function createNav(pages) {
    for (let page of pages) {
        let btn = document.createElement('button');
        btn.classList.add('navbtn');
        if (page.active) btn.classList.add('active');
        btn.innerHTML = `<img src="${page.icon}"><span>${page.title}</span>`;
        btn.onclick = () => {
            document.querySelectorAll('.navbtn.active').forEach(element => {
                element.classList.remove('active');
            });
            let current = document.querySelector('.page.active');
            if (current) {
                current.classList.remove('active');
            }
            let newpage = document.getElementById(page.id);
            if (newpage) {
                newpage.classList.add('active');
            }
            btn.classList.add('active');
        };
        page.id == 'settings' ? nav.appendChild(btn) : navc.appendChild(btn);
    }
}

window.createNav = createNav;