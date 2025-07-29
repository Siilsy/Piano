
function Animate(object, animation, duration) {
    object.classList.add(animation);
    setTimeout(() => {
        object.classList.remove(animation);
    }, duration);
}

function ChangeDisplay(objects, state) {
    const mode = state ? 'flex' : 'none';
    for (let i = 0; i < objects.length; i++) {
        objects[i].style.display = mode;
    };
}

function AttachTooltip(el, text, waitTime = 1000) {
    let tooltipEl = null;
    let timeout = null;

    el.addEventListener('mouseenter', () => {
        timeout = setTimeout(() => {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip';
            tooltipEl.textContent = text;
            document.body.appendChild(tooltipEl);

            const rect = el.getBoundingClientRect();
            tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
            tooltipEl.style.transform = 'translateX(-50%)';
            requestAnimationFrame(() => {
                if (!tooltipEl) return;
                tooltipEl.style.top = `${rect.top - tooltipEl.getBoundingClientRect().height - 12}px`;
                tooltipEl.style.opacity = 1;
            });
        }, waitTime);
    });

    el.addEventListener('mouseleave', () => {
        clearTimeout(timeout);
        if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
        }
    });
}

function ApplyProgress(progress) {
    progressBar.style.width = `${progress}%`;
    pictureBlur.style.filter = `grayscale(${100 - progress}%)`;
}

function PlaceElement(parent, child, time = 0) {
    const startTime = performance.now();

    function AnimationPlaceElement() {
        const rect = parent.getBoundingClientRect();

        child.style.left = `${rect.left}px`;
        child.style.top = `${rect.bottom}px`;

        if (performance.now() - startTime < time) {
            requestAnimationFrame(AnimationPlaceElement);
        }
    }

    requestAnimationFrame(AnimationPlaceElement);
}
/* function PlaceElement(parent, child) {
    const rect = parent.getBoundingClientRect();

    child.style.left = `${rect.left}px`;
    child.style.top = `${rect.bottom}px`;
} */ //Previous method that didn't work because it was brutal so now, it follows his parent for as many time as I want, generally 1 second
function PlaceElement2(parent, child, time, Top, Left) {
    let firstResizeTime = 0;

    function AnimatePlacement() {
        child.style.top = `${Top(parent, child)}px`;
        child.style.left = `${Left(parent, child)}px`;

        if (performance.now() - firstResizeTime < time) {
            requestAnimationFrame(AnimatePlacement);
        }
    }
    firstResizeTime = performance.now();

    requestAnimationFrame(AnimatePlacement);
    }

function CreateHTMLElement(type, parent, id, rtrn = true) {
    const element = document.createElement(type);
    element.id = id;

    parent.appendChild(element);

    if (rtrn) return element;
}

function CreateButtonsWithLabels(name, parent, infos = null, type = 'checkbox', changeColor = true) {
    const btn = CreateInput(name, 0, 0, name, type, parent);

    const btnLabel = document.createElement('label');
    btnLabel.setAttribute("for", name);
    btnLabel.id = name + 'Label';
    if (infos != null) btnLabel.textContent = infos;
    parent.appendChild(btnLabel);

    btn.style.display = 'none';

    if (changeColor) btn.addEventListener('click', () => { ChangeColor(btn); });

    return btn;
}

function ChangeColor(btn) {
    const btnLabel = document.querySelector(`#${btn.id}Label`);

    let interval = null;
    let progress = 0;
    const delay = 300;

    interval = setInterval(() => {
        const start = !btn.checked ? colors[0] : colors[1];
        const end = !btn.checked ? colors[1] : colors[0];

        const red = start[0] + progress * (end[0] - start[0]);
        const green = start[1] + progress * (end[1] - start[1]);
        const blue = start[2] + progress * (end[2] - start[2]);

        btnLabel.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, 1)`;

        if (progress > 1) {
            clearInterval(interval);
            interval = null;
        }
        else progress += .01;
    }, delay / 100);
}
