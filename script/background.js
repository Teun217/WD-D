const background = document.querySelector('.background');
const backgroundText = document.querySelector('.backgroundText');
const backgroundTextArray = backgroundText.textContent.split('');
const backgroundCharactersHTMLArray = backgroundTextArray.map(letters => letters === ' ' ? ' ' : `<span>${letters}</span>`);

function fillBackground() {
    background.innerHTML = '';

    const navLinks = [...document.querySelectorAll('nav a')];

    // Measure line height and average character width in one pass (no per-char DOM thrashing)
    const probe = document.createElement('p');
    probe.className = 'backgroundText';
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    probe.textContent = backgroundText.textContent.repeat(3);
    background.appendChild(probe);
    const probeRect = probe.getBoundingClientRect();
    const lineHeight = probeRect.height;
    const avgCharWidth = probeRect.width / probe.textContent.length;
    probe.remove();

    const containerWidth = background.clientWidth;
    const containerHeight = background.getBoundingClientRect().height;
    const pCount = Math.ceil(containerHeight / lineHeight);

    // Add a full repeat of text as buffer so overflow:hidden handles the clipping
    const charsPerRow = Math.ceil(containerWidth / avgCharWidth) + backgroundTextArray.length;
    const total = backgroundCharactersHTMLArray.length;

    // Batch all DOM writes — no reads inside the loop
    const rows = [];
    let charIndex = 0;

    for (let i = 0; i < pCount; i++) {
        const row = document.createElement('div');
        row.className = 'row';

        if (navLinks[i]) {
            const link = navLinks[i].cloneNode(true);
            link.className = 'nav-link';
            row.appendChild(link);
        }

        const p = document.createElement('p');
        p.className = 'backgroundText';

        let html = '';
        for (let j = 0; j < charsPerRow; j++) {
            html += backgroundCharactersHTMLArray[charIndex % total];
            charIndex++;
        }
        p.innerHTML = html;
        row.appendChild(p);
        rows.push(row);
    }

    // Single DOM write for all rows
    background.append(...rows);

    // Batch nav-link width reads after DOM is stable
    for (const row of background.querySelectorAll('.row')) {
        const link = row.querySelector('.nav-link');
        if (link) {
            row.style.setProperty('--link-width', link.getBoundingClientRect().width + 'px');
        }
    }
}

fillBackground();

new ResizeObserver(fillBackground).observe(background);
