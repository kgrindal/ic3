if (!('ontouchstart' in document.documentElement)) {
    const cache = {}, ic3Ghost = Symbol(), ic3GhostTarget = Symbol(), ic3ShowHide = Symbol();
    const h = () => (window.location.hash.match(/(?<=#\?s=)\d+/) ?? []).pop();
    document.getElementById('submit').remove();
    const m = Object.assign(document.createElement('div'), { id: 'modal', hidden: true });
    document.getElementsByTagName('header')[0].prepend(m);
    m.addEventListener('click', () => document.getElementsByName('s')[0].dispatchEvent(new Event('blur')), { passive: true });
    HTMLAnchorElement.prototype[ic3Ghost] = function (dir) {
        const target = this[ic3GhostTarget], href = this.getAttribute('href');
        if (dir && href) {
            this[ic3GhostTarget] = href;
            this.removeAttribute('href');
        }
        else if (!dir && !href && target) {
            this.setAttribute('href', target);
        }
    };
    HTMLSelectElement.prototype[ic3ShowHide] = function (dir) {
        this.classList.remove(dir ? 'hide' : 'show');
        this.classList.add(dir ? 'show' : 'hide');
        if (dir) {
            document.getElementById('modal').hidden = false;
        }
        [...document.getElementsByTagName('a')].forEach(a => a[ic3Ghost](dir));
        this.dispatchEvent(new Event('focus'));
    };
    window.addEventListener('resize', () => {
        const s = document.getElementsByName('s')[0], v = s.classList.contains('hide');
        s.size = 10;
        if (v) {
            s.classList.add('init');
            s.classList.remove('hide');
        }
        s.style.position = 'static';
        const box = s.getBoundingClientRect();
        document.documentElement.style.setProperty('--select-height', `${Math.max(Math.ceil(box.height), 200)}px`);
        Object.assign(s.style, { position: 'fixed', top: 0, left: box.left });
        if (v) {
            s.classList.add('hide');
            s.addEventListener('animationend', e => e.currentTarget.classList.remove('init'), { passive: true, once: true });
        };
    }, { passive: true });
    window.dispatchEvent(new Event('resize'));
    document.getElementsByName('s').forEach(sel => {
        sel.addEventListener('click', e => e.currentTarget.dispatchEvent(new Event('blur')), { passive: true });
        sel.addEventListener('blur', e => {
            e.currentTarget[ic3ShowHide](false);
            const s = [...e.currentTarget.options].find(x => x.selected).value;
            if (s === (h() ?? 1)) {
                document.getElementById('modal').hidden = true;
            } else {
                window.location.hash = `?s=${s}`;
            }
        }, { passive: true });
        sel.addEventListener('keydown', e => { if ('Enter' === e.code || 'NumpadEnter' === e.code || ' ' === e.key) { e.preventDefault(); e.currentTarget.dispatchEvent(new Event('blur')); } });
        Object.assign(sel, { role: 'dialog', ariaLabel: 'Select a state. Press Enter or Space to select an option.', ariaModal: true, className: 'init hide' });
        sel.addEventListener('animationend', e => e.currentTarget.classList.remove('init'), { once: true, passive: true });
    });
    const btn = document.createElement('button'), btntxt = document.createElement('span');
    btn.classList.add('flat');
    btntxt.innerText = [...document.getElementsByName('s')[0].options].find(x => x.selected).text;
    btn.appendChild(btntxt);
    document.getElementById('header').appendChild(btn);
    btn.addEventListener('click', e => { e.preventDefault(); document.getElementsByName('s')[0][ic3ShowHide](true); });
    window.addEventListener('hashchange', async () => {
        const us = h();
        if (undefined === us) {
            return;
        }
        if (!isNaN(us) && document.querySelector(`select option[value="${us}"]`)) {
            const s = document.getElementsByName('s')[0];
            s.value = us;
            const sel = [...s.options].find(x => x.selected), key = `s${us}`, r = function (x) {
                let dy = 0;
                const gd = (a, b) => a[0 === b % 2 ? b / 2 : Math.ceil(a.length / 2) + Math.floor(b / 2)];
                [...document.getElementsByClassName('crimetype')].forEach(y => {
                    [...y.querySelectorAll('td:not([colspan="4"]):not(.spacer):nth-of-type(2n):not(:empty)')].forEach((a, t) => {
                        const d = x[0][dy], dd = x[0][dy + 1], tt = t - d.length;
                        if (t < d.length) {
                            a.innerHTML = gd(d, t);
                        }
                        else if (t >= d.length && tt < dd.length) {
                            a.innerHTML = gd(dd, tt);
                        }
                    });
                    dy += 2;
                });
                document.querySelectorAll('table:not(table[class]) tbody tr').forEach((y, z) => {
                    const a = [...y.querySelectorAll('td')], l = x.length - 1;
                    a[0].innerHTML = x[l][z].c;
                    a[1].innerHTML = x[l][z].l;
                });
                const st = document.querySelector('button.flat span');
                st.innerText = sel.text;
                [...document.getElementsByTagName('img')].forEach(y => {
                    const p = y.parentElement, href = p.getAttribute('href'), gt = p[ic3GhostTarget], v = sel.value;
                    if (href) {
                        p.setAttribute('href', href.replace(/(?<=s=)\d+/, v));
                    }
                    if (gt) {
                        p[ic3GhostTarget] = gt.replace(/(?<=s=)\d+/, v);
                    }
                });
            };
            document.title = document.title.replace(/(?<=\d{4} )(.*)(?= IC3)/, sel.text);
            if (Object.prototype.hasOwnProperty.call(cache, key)) {
                r(cache[key]);
            }
            else {
                try {
                    const resp = await fetch(`stats?s=${us}`);
                    const json = await resp.json();
                    cache[`s${us}`] = json;
                    r(json);
                }
                catch {
                    window.location = `StateReport.aspx?s=${us}`;
                }
            }
            document.getElementById('modal').hidden = true;
        }
    }, { passive: true });
    window.dispatchEvent(new Event('hashchange'));
    [...document.getElementsByTagName('a')].forEach(x => x.addEventListener('click', e => { e.preventDefault(); window.open(e.currentTarget.href); }));
}