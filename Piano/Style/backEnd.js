const docTitle = document.title;
window.addEventListener("blur", () =>{
    document.title = "Eh mais reviens... 🥺";
});
window.addEventListener("focus", () =>{
    document.title = docTitle;
});



const pianoContainer = document.querySelector('#piano');
for (let i = -1; i < 8; i++) {
    let index = i; if (i < 1) {index -= 1;}
    const octave = document.createElement('div');
    octave.id = `octave${index}`;
    pianoContainer.appendChild(octave);
}
const classes = ['C','Cs','D','Ds','E','F','Fs','G','Gs','A','As','B']
const piano = document.querySelectorAll('[id*="octave"]');
piano.forEach((octave, i) => {
    const occurence = i == 0 ? 3 : i == 8 ? 1 : 12;
    for (n = 0; n < occurence; n++) {
        let index = n;
        if (i == 0) {index += 9;}
        const currentKey = document.createElement('div');
        const keyName = classes[index];
        let keyType = 'whiteKey';
        if (keyName.match(/[A-Z]/gi)[1] == 's') {keyType = 'sharpKey';}
        currentKey.className = `${keyType} ${keyName}`;
        octave.appendChild(currentKey);
    }
});
const pianoVisualization = document.querySelector('#pianoVisualization');
for (let i = 0; i < 9; i++) {
    const octave = document.createElement('div');
    octave.id = `octav_${i}`;
    pianoVisualization.appendChild(octave);
}
const miniPiano = document.querySelectorAll('[id*="octav_"]');
miniPiano.forEach((octave, i) => {
    const occurence = i == 0 ? 3 : i == 8 ? 1 : 12;
    for (n = 0; n < occurence; n++) {
        let index = n;
        if (i == 0) {index += 9;}
        const currentKey = document.createElement('div');
        let keyType = 'whit_key';
        if (classes[index].match(/[A-Z]/gi)[1] == 's') {keyType = 'sharp_key';}
        currentKey.className = `${keyType}`;
        octave.appendChild(currentKey);
    }
});
const keys = document.querySelectorAll('[class*=Key]');
keys.forEach((key) => {
    const keyName = document.createElement('div');
    keyName.className = 'keyName';
    key.appendChild(keyName);
});



const midiNote = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const latinNote = ['Do','Do#','Ré','Ré#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si']
let actualState = 1;
let angle = 0;
const btnChangeVisu = document.querySelector('#btnChangeVisu');
btnChangeVisu.addEventListener('click', changeVisu);
function changeVisu() {
    angle += 180;
    btnChangeVisu.style.transform = `rotate(${angle}deg)`;
    for (let i = 0; i < classes.length; i++) {
        const elements = document.querySelectorAll(`.${classes[i]} .keyName`);
        elements.forEach((element, index) => {
            if ([9, 10, 11].includes(i)) {index -= 1;}
            if (actualState == 0) {element.textContent = latinNote[i];}
            if (actualState == 1) {element.textContent = midiNote[i] + (index + 1);}
        });
    }
    actualState = 1 - actualState;
}
document.onload = changeVisu();



const selection = document.querySelector('#selection');
window.onload = selectionWidth();
window.addEventListener('resize', selectionWidth);
function selectionWidth() {
    const pianoWidthPx = 52 * 42;
    const visibleWidthPx = 93 / 100 * window.innerWidth;
    const selectionWidthVw = (visibleWidthPx / pianoWidthPx) * 100;
    const selection = document.querySelector('#selection');
    selection.style.width = `${selectionWidthVw}vw`;
    const newLeft = 0;
    const leftMaskWidth = newLeft;
    const rightMaskWidth = pianoVisualization.clientWidth - (newLeft + selection.clientWidth + 2);
    pianoVisualization.style.setProperty('--leftMaskWidth', `${Math.ceil(leftMaskWidth)}px`);
    pianoVisualization.style.setProperty('--rightMaskWidth', `${Math.floor(rightMaskWidth)}px`);
}
let isDragging = false;
let startX;
let initialLeft;
selection.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    initialLeft = selection.offsetLeft;
    selection.classList.add('grabbing');
});
selection.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - startX;
        let newLeft = initialLeft + deltaX;
        newLeft = Math.max(0, Math.min(newLeft, pianoVisualization.offsetWidth - selection.offsetWidth))
        const scrollPercentage = newLeft / (pianoVisualization.offsetWidth - selection.offsetWidth);
        scrollX = scrollPercentage * (realPianoWidth - pianoVisualization.offsetWidth);
        scroll();
    }
});
selection.addEventListener('mouseup', stopGrabbing);
selection.addEventListener('mouseleave', stopGrabbing);
function stopGrabbing() {
    if (isDragging) {
        isDragging = false;
        selection.classList.remove('grabbing');
    }
}



let scrollX = 0;
const realPianoWidth = 52*42;
let pianoWidth = pianoContainer.offsetWidth;
let maxXDiff = realPianoWidth - pianoWidth;
const octaveX = [0];
for (let i = 0; i < 8; i++) {
    octaveX.push((i * 7 + 2) * 42);
}

const btnScrollRight = document.querySelector('#btnScrollRight');
btnScrollRight.addEventListener('click', scrollRight);
function scrollRight() {
    btnScrollRight.classList.add('moveRight');
    setTimeout(() => {
        btnScrollRight.classList.remove('moveRight');
    }, 500);
    if (scrollX + 42 < maxXDiff) {scrollX += 42;}
    else {scrollX = maxXDiff;}
    scroll();
}

const btnScrollLeft = document.querySelector('#btnScrollLeft');
btnScrollLeft.addEventListener('click', scrollLeft);
function scrollLeft() {
    btnScrollLeft.classList.add('moveLeft');
    setTimeout(() => {
        btnScrollLeft.classList.remove('moveLeft');
    }, 500);
    if (scrollX - 42 > 0) {scrollX -= 42;}
    else {scrollX = 0;}
    scroll();
}

window.addEventListener('resize', () => {
    pianoWidth = pianoContainer.offsetWidth;
    maxXDiff = realPianoWidth - pianoWidth;
    scrollX = Math.min(scrollX, maxXDiff);
    scroll();
});

const btnScrollNextOctave = document.querySelector('#btnScrollNextOctave');
btnScrollNextOctave.addEventListener('click', scrollNextOctave);
function scrollNextOctave() {
    btnScrollNextOctave.classList.add('moveRight');
    setTimeout(() => {
        btnScrollNextOctave.classList.remove('moveRight');
    }, 500);
    for (let i = 0; i < octaveX.length; i++) {
        if (octaveX[i] > scrollX) {
            scrollX = octaveX[i];
            break;
        }
    }
    scrollX = Math.min(scrollX, maxXDiff);
    scroll();
}

const btnScrollPreviousOctave = document.querySelector('#btnScrollPreviousOctave');
btnScrollPreviousOctave.addEventListener('click', scrollPreviousOctave); 
function scrollPreviousOctave() {
    btnScrollPreviousOctave.classList.add('moveLeft');
    setTimeout(() => {
        btnScrollPreviousOctave.classList.remove('moveLeft');
    }, 500);
    for (let i = octaveX.length; i >= 0; i--) {
        if (octaveX[i] < scrollX) {
            scrollX = octaveX[i];
            break;
        }
    }
    scroll();
}

function scroll() {
    piano.forEach(octave => {
        octave.style.transform = `translateX(-${scrollX}px)`;
    });
    let offsetX = 0;
    if (scrollX == 0) {offsetX = 0;}
    else if (scrollX == maxXDiff) {offsetX = -1;}
    else {offsetX = 2;}
    let newLeft = scrollX / 42 * 1.85 / 100 * window.innerWidth - offsetX;
    selection.style.left = `${newLeft}px`;
    const leftMaskWidth = newLeft;
    const rightMaskWidth = pianoVisualization.clientWidth - (newLeft + selection.offsetWidth) + 2;
    pianoVisualization.style.setProperty('--leftMaskWidth', `${Math.ceil(leftMaskWidth)}px`);
    pianoVisualization.style.setProperty('--rightMaskWidth', `${Math.floor(rightMaskWidth)}px`);
}

const btnToggleSustainMode = document.querySelector('#btnToggleSustainMode');
let sustainMode = false;
btnToggleSustainMode.classList = 'non-active';
btnToggleSustainMode.addEventListener('click', toggleSustainMode);
function toggleSustainMode() {
    if (!sustainMode) {btnToggleSustainMode.classList = 'active';}
    else {btnToggleSustainMode.classList = 'non-active';}
    sustainMode = !sustainMode;
}

document.addEventListener('keydown', (event) => {
    const key = event.code;
    if (key == 'ArrowLeft' && !keysPressed['ArrowLeft']) {scrollPreviousOctave();}
    if (key == 'ArrowDown' && !keysPressed['ArrowDown']) {scrollLeft();}
    if (key == 'Insert' && !keysPressed['Insert']) {changeVisu();}
    if (key == 'AltRight' && !keysPressed['AltRight']) {toggleSustainMode();}
    if (key == 'Delete' && !keysPressed['Delete']) {changeMode();}
    if (key == 'ArrowUp' && !keysPressed['ArrowUp']) {scrollRight();}
    if (key == 'ArrowRight' && !keysPressed['ArrowRight']) {scrollNextOctave();}
});



let loadedFiles = 0;
const progressBar = document.querySelector('#progressBar');
const pictureBlur = document.querySelector('#loadingScreen img');
const timeoutIds = {};
const audioInstances = {}
keys.forEach(key => playSound(key));
function playSound(key, pressing = 0) {
    const note = key.classList[1];
    const octave = key.closest('[id*="octave"]').id.match(/octave(-?\d)/)[1];
    const touche = note + octave;
    if (!audioInstances[touche]) {audioInstances[touche] = new Audio(`Sounds/${note.toLowerCase()}${octave}.mp3`);}
    const audio = audioInstances[touche];
    if (loadedFiles < 88) {
        audio.addEventListener('canplaythrough', () => {
            loadedFiles++;
            const progress = loadedFiles / 88 * 100;
            progressBar.style.width = `${progress}%`;
            pictureBlur.style.filter = `grayscale(${100 - progress}%)`
            if (loadedFiles == 88) {document.querySelector('#loadingScreen').style.display = 'none';}
        });
    }
    const pressedKey = document.querySelector(`#octave${octave} .${note}`);
    let childNumber;
    for (let i = 0; i < classes.length; i++) {
        if (note == classes[i]) {childNumber = i + 1; break;}
    }
    if (octave == -2) {childNumber -= 9;}
    let miniOctave = parseInt(octave) + 1;
    if (octave < 0) {miniOctave += 1;}
    const miniPianoKey = document.querySelector(`#octav_${miniOctave} > :nth-child(${childNumber})`);
    const whiteOrSharp = key.classList[0];
    if (pressing == 1) {play();}
    else if (pressing == 2) {stop();}
    else {
        key.addEventListener('mousedown', play);
        key.addEventListener('mouseup', stop);
        key.addEventListener('mouseleave', stop);
    }
    function play() {
        if (changingMode) {selectionMode([`${note}${miniOctave}`]); return;}
        audio.currentTime = 0;
        audio.play()
        pressedKey.classList.add(`keypressed_${whiteOrSharp}`);
        miniPianoKey.classList.add(`keypressed_${whiteOrSharp}`);
        if (sustainMode) {
            if (timeoutIds[touche]) {clearTimeout(timeoutIds[touche]);}
            timeoutIds[touche] = setTimeout(() => {
                pressedKey.classList.remove(`keypressed_${whiteOrSharp}`);
                miniPianoKey.classList.remove(`keypressed_${whiteOrSharp}`);
                delete timeoutIds[touche];
            }, 8000);
        }
    }
    function stop() {
        if (!sustainMode) {
            audio.pause();
            pressedKey.classList.remove(`keypressed_${whiteOrSharp}`);
            miniPianoKey.classList.remove(`keypressed_${whiteOrSharp}`);
        }
    }
};



const selectionnedOctave = [2, 3, 4, 5];
let currentOctave = 0;
selectionnedOctave.forEach((number) => {visualizeSelection(number);})
function visualizeSelection(number, parameter = 1) {
    if (number < 1) {number += 1} number += 1; 
    let usefulOctave = document.querySelectorAll(`#octav_${number} .whit_key`);
    usefulOctave.forEach((usefulKey) => {
        if (parameter) {usefulKey.classList.add('selected-octave');}
        else {usefulKey.classList.remove('selected-octave');}
    });
}
document.addEventListener('keydown', (event) => {
    const key = event.code;
    for (let i = 1; i < 10; i++) {
        if (key == `Digit${i}` && !keysPressed[`Digit${i}`]) {
            let number = i - 2;
            if (number < 1) {number -= 1;}
            if (selectionnedOctave.includes(number)) {continue;}
            if (selectionnedOctave.length == 4) {
                const previousOctave = selectionnedOctave[currentOctave];
                visualizeSelection(previousOctave, 0);
                selectionnedOctave.splice(currentOctave, 1);
                let octave = previousOctave + 1; if (octave < 1) {octave += 1;}
                let index = 3 + (octave - 1) * 12;
                const occurence = octave == 0 ? 3 : octave == 8 ? 1 : 12;
                if (octave == 0) {index += 9;}
                for (let n = 0; n < occurence; n++) {pianoKeys[index + n] = "";}
            }
            selectionnedOctave.splice(currentOctave, 0, number);
            visualizeSelection(number);
            currentOctave += 1;
            if (currentOctave == 4) {currentOctave = 0;}
            updatePianoKeys();
        }
    }
});

const keyboardKeys = ['Backquote', 'Digit0', 'Minus', 'Equal', 'Backspace', 
'Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 
'CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Backslash', 'Enter', 
'ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight', 
'ControlLeft', 'AltLeft', 'Space', 'ControlRight']
const keyboardSymbols = ['`', '0', '-', '=', '←', 
'⭾', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '(', ')', 
'⇪', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '"', '\\', '⏎', 
'↑ Left', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', '↑ Right', 
'Ctrl Left', 'Alt Left', '␣', 'Ctrl Right']
const keyboardKeys4Piano = [
[0, 5, 6, 7, 8, 9, 10, 11, 1, 2, 3 ,4], 
[18, 19, 20, 21, 22, 23, 12, 13, 14, 15, 16, 17], 
[32, 33, 34, 35, 24, 25, 26, 27, 28, 29, 30, 31], 
[44, 45, 46, 47, 36, 37, 38, 39, 40, 41, 42, 43]]
let pianoKeys = Array(88).fill('');
updatePianoKeys();

const keysPressed = {};
let timeOut;
document.addEventListener('keydown', (event) => {
    const key = event.code;
    if (selectionnedKey.length > 0) {
        if (timeOut) {return;}
        if (keyboardKeys + 'Escape'.includes(key)){
            for (let i = 0; i < keyboardKeys.length; i++) {
                if (key == keyboardKeys[i] || key == 'Escape') {
                    for (let k = 0; k < selectionnedKey.length; k++) {
                        const content = key == 'Escape' ? 'Vide' : `${key} (${keyboardSymbols[i]})`;
                        selectionScreenLine4.textContent = content;
                        const usedNote = selectionnedKey[k].match(/[A-Za-z]+/)[0];
                        let usedOctave = parseInt(selectionnedKey[k].match(/\d+/)[0]);
                        const value = key == 'Escape' ? '' : i;
                        for (let n = 0; n < classes.length; n++) {
                            if (usedNote == classes[n]) {pianoKeys[3 + (usedOctave - 1) * 12 + n] = value; break;}
                        }
                    }
                    break;
                }
            }
            timeOut = setTimeout(() => {
                selectionnedKey = [];
                selectionContainer.style.display = 'none';
                changeMode();
                updateKeyShortcut();
                timeOut = 0;
            }, 1000);
        }
        else {selectionScreenLine4.textContent = `Impossible d'assigner cette touche`;}
        return;
    }
    if (changingMode) {
        if (keyboardKeys.includes(key)) {
            const list = [];
            for (let index = 0; index < pianoKeys.length; index++) {
                if (key == keyboardKeys[pianoKeys[index]]) {
                    let octave = Math.floor((index - 3) / 12) + 1;
                    let note = index < 3 ? index + 9 : (index - 3) % 12;
                    console.log(index, note, octave);
                    note = classes[note];
                    list.push(`${note}${octave}`);
                }
            }
            selectionMode(list);
            return;
        }
        else if (key == 'Escape') {
            pianoKeys = Array(88).fill('');
            changeMode();
            updateKeyShortcut();
        }
    }
    for (let i = 0; i < pianoKeys.length; i++) {
        if (key == keyboardKeys[pianoKeys[i]] && !keysPressed[key]) {
            keys.forEach((currentKey, n) => {
                if (n == i) {playSound(currentKey, 1);}
            });
        }
    }
    keysPressed[key] = true;
});

document.addEventListener('keyup', (event) => {
    const key = event.code;
    for (let i = 0; i < pianoKeys.length; i++) {
        if (key == keyboardKeys[pianoKeys[i]] && keysPressed[key]) {
            keys.forEach((key, n) => {
                if (n == i) {playSound(key, 2);}
            });
        }
    }
    keysPressed[key] = false;
});



const btnChangeKeyAssignment = document.querySelector('#btnChangeKeyAssignment');
const selectionContainer = document.querySelector('#selectionContainer');
const selectionScreenLine2 = document.querySelector('#selectionScreen #line2');
const selectionScreenLine4 = document.querySelector('#selectionScreen #line4');
let changingMode = false;
let selectionnedKey = [];
btnChangeKeyAssignment.addEventListener('click', changeMode);
btnChangeKeyAssignment.style = 'animation-play-state: paused;';
function changeMode() {
    changingMode = !changingMode;
    if (changingMode) {btnChangeKeyAssignment.style = 'animation-play-state: running;';}
    else {btnChangeKeyAssignment.style = 'animation-play-state: paused;';}
}
function selectionMode(key) {
    selectionnedKey = key;
    selectionContainer.style.display = 'flex';
    selectionScreenLine2.textContent = `${selectionnedKey}`;
    selectionScreenLine4.textContent = '<En attente de la touche>';
}
keys.forEach((key) => {
    const keyShortcut = document.createElement('div');
    keyShortcut.className = 'keyShortcut';
    key.appendChild(keyShortcut);
});
updateKeyShortcut();
function updatePianoKeys() {
    for (let i = 0; i < selectionnedOctave.length; i++) {
        let octave = selectionnedOctave[i];
        if (octave < 1) {octave += 1;} octave += 1;
        let index = 3 + (octave - 1) * 12;
        const occurence = octave == 0 ? 3 : octave == 8 ? 1 : 12;
        let offset = 0;
        if (octave == 0) {index += 9; offset = 9;}
        for (let n = 0; n < occurence; n++) {pianoKeys[index + n] = keyboardKeys4Piano[i][n + offset];}
    }
    updateKeyShortcut();
}
function updateKeyShortcut() {
    const keyShortcuts = document.querySelectorAll('.keyShortcut');
    keyShortcuts.forEach((key, i) => {
        const name = keyboardSymbols[pianoKeys[i]];
        if (name) {key.textContent = `${name}`;}
        else {key.textContent = '';}
    });
}
