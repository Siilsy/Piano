const docTitle = document.title;
window.addEventListener("blur", () =>{
    document.title = "Eh mais reviens... 🥺";
});
window.addEventListener("focus", () =>{
    document.title = docTitle;
});



const selectionScreen = document.querySelector('#selectionScreen');
for (let i = 0; i < 4; i++) {
    const line = document.createElement('div');
    line.id = `line${i + 1}`;
    selectionScreen.appendChild(line);
}
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
        const maxWidth = pianoVisualization.offsetWidth - selection.offsetWidth;
        newLeft = Math.max(0, Math.min(newLeft, maxWidth))
        const scrollPercentage = newLeft / maxWidth;
        scrollX = scrollPercentage * (realPianoWidth - pianoVisualization.offsetWidth) + 2;
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
    piano.forEach(octave => {octave.style.transform = `translateX(-${scrollX}px)`;});
    let offsetX = 0;
    if (scrollX == maxXDiff) {offsetX = -0.2;}
    let newLeft = scrollX / 42 * 1.85 / 100 * window.innerWidth - offsetX * (window.innerWidth / 100);
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
    if (currentOctave != 5) {return;}
    const key = event.code;
    if (key == 'ArrowLeft' && !keysPressed['ArrowLeft']) {scrollPreviousOctave();}
    if (key == 'ArrowDown' && !keysPressed['ArrowDown']) {scrollLeft();}
    if (key == 'End' && !keysPressed['End']) {changeVisu();}
    if (key == 'Insert' && !keysPressed['Insert']) {changePianoMode();}
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
        pressedKey.classList.add(`keyplayed_${whiteOrSharp}`);
        miniPianoKey.classList.add(`keyplayed_${whiteOrSharp}`);
        pressedKey.classList.add(`keypressed_${whiteOrSharp}`);
        miniPianoKey.classList.add(`keypressed_${whiteOrSharp}`);
        if (sustainMode) {
            if (timeoutIds[touche]) {clearTimeout(timeoutIds[touche]);}
            timeoutIds[touche] = setTimeout(() => {
                pressedKey.classList.remove(`keyplayed_${whiteOrSharp}`);
                miniPianoKey.classList.remove(`keyplayed_${whiteOrSharp}`);
                delete timeoutIds[touche];
            }, 8000);
        }
    }
    function stop() {
        if (!sustainMode) {
            audio.pause();
            pressedKey.classList.remove(`keyplayed_${whiteOrSharp}`);
            miniPianoKey.classList.remove(`keyplayed_${whiteOrSharp}`);
        }
        pressedKey.classList.remove(`keypressed_${whiteOrSharp}`);
        miniPianoKey.classList.remove(`keypressed_${whiteOrSharp}`);
    }
};



const selectedOctave = [[2, 3, 4, 5], [2, 3, 4, 5]];
let pianoMode = false;
let currentOctave = 5;
selectedOctave[pianoMode ? 1 : 0].forEach((number) => {visualizeSelection(number);})
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
        if (timeOut) {return;}
        if ('Escape' + `Digit${i}`.includes(key) && !keysPressed[key]) {
            let number = i - 2;
            if (number < 1) {number -= 1;}
            if (key == 'Escape' && currentOctave != 5) {selectionScreenLine4.textContent = 'annulation';}
            else if (key != `Digit${i}`) {continue;}
            else if (currentOctave == 5) {
                if (selectedOctave[pianoMode ? 1 : 0].includes(number)) {
                    currentOctave = selectedOctave[pianoMode ? 1 : 0].indexOf(number);
                    selectionContainer.style.display = 'flex';
                    selectionScreenLine1.textContent = 'Ré-assignation de l\'octave :';
                    selectionScreenLine2.textContent = `${i - 1}`;
                    selectionScreenLine3.textContent = 'Sélectionnez la nouvelle octave (\'Echap\' pour annuler) :';
                    selectionScreenLine4.textContent = '<En attente de la touche>';
                }
                continue;
            }
            else if (selectedOctave[pianoMode ? 1 : 0].includes(number)) {continue;}
            else if (selectedOctave[pianoMode ? 1 : 0].length == 4) {
                const previousOctave = selectedOctave[pianoMode ? 1 : 0][currentOctave];
                visualizeSelection(previousOctave, 0);
                selectedOctave[pianoMode ? 1 : 0].splice(currentOctave, 1, number);
                selectionScreenLine4.textContent = i - 1;
                visualizeSelection(number);
                let value = previousOctave;
                if (value < 1) {value += 1;} value += 1;
                updatePianoKeys(value, i - 1);
            }
            timeOut = setTimeout(() => {
                selectionContainer.style.display = 'none';
                timeOut = 0;
                currentOctave = 5;
            }, 1000);
        }
    }
});
function updatePianoKeys(previousOctave, currentOctave) {
    let index1 = 3 + (previousOctave - 1) * 12;
    const occurence1 = previousOctave == 0 ? 3 : previousOctave == 8 ? 1 : 12;
    if (previousOctave == 0) {index1 += 9;}
    let index2 = 3 + (currentOctave - 1) * 12;
    const occurence2 = currentOctave == 0 ? 3 : currentOctave == 8 ? 1 : 12;
    let offset = 0;
    if (currentOctave == 0) {index2 += 9; offset = 9;}
    if (pianoMode) {
        for (let i = 0; i < occurence2; i++) {
            const previousNote = `${classes[i + offset]}${previousOctave}`;
            const currentNote = `${classes[i + offset]}${currentOctave}`;
            for (let n = 0; n < computerKeys.length; n++) {
                if (computerKeys[n].includes(currentNote)) {
                    computerKeys[n].splice(computerKeys[n].indexOf(currentNote), 1);
                }
                if (computerKeys[n].includes(previousNote)) {
                    computerKeys[n].splice(computerKeys[n].indexOf(previousNote), 1, currentNote);
                }
            }
        }
    }
    else {
        for (let i = 0; i < occurence2; i++) {pianoKeys[index2 + i] = pianoKeys[index1 + i + offset]}
        for (let n = 0; n < occurence1; n++) {pianoKeys[index1 + n] = "";}
    }
    updateKeyShortcut();
}

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
let computerKeys = Array.from({length: 48}, () => []);
for (let i = 0; i < selectedOctave[0].length; i++) {
    let octave = selectedOctave[0][i] + 1;
    if (octave < 2) {octave += 1;}
    let index = 3 + (octave - 1) * 12;
    const occurence = octave == 0 ? 3 : octave == 8 ? 1 : 12;
    let offset = 0;
    if (octave == 0) {index += 9; offset = 9;}
    for (let n = 0; n < occurence; n++) {pianoKeys[index + n] = keyboardKeys4Piano[i][n + offset];}
}
for (let i = 0; i < selectedOctave[1].length; i++) {
    let octave = selectedOctave[1][i] + 1;
    if (octave < 2) {octave += 1;}
    const occurence = octave == 0 ? 3 : octave == 8 ? 1 : 12;
    let offset = octave ? 0 : 9;
    for (let n = 0; n < occurence; n++) {computerKeys[i * 12 + n].push(`${classes[n + offset]}${octave}`);}
}
updateKeyShortcut();

const keysPressed = {};
let timeOut;
let keydown = -1;
document.addEventListener('keydown', (event) => {
    if (currentOctave != 5) {return;}
    const key = event.code;
    if (selectedKey.length > 0) {
        if (timeOut) {return;}
        if (keyboardKeys + 'Escape'.includes(key)){
            for (let i = 0; i < keyboardKeys.length; i++) {
                if (key == keyboardKeys[i] || key == 'Escape') {
                    for (let k = 0; k < selectedKey.length; k++) {
                        const content = key == 'Escape' ? 'vide' : `${key} (${keyboardSymbols[i]})`;
                        selectionScreenLine4.textContent = content;
                        if (pianoMode && key == 'Escape') {
                            if (keydown !== -1) {
                                let index;
                                for (let i = 0; i < 4; i++) {
                                    index = keyboardKeys4Piano[i].indexOf(keyboardKeys.indexOf(keydown))
                                    if (index != -1) {index += i * 12; break;}
                                }
                                computerKeys[index] = [];
                                keydown = -1;
                            } else { 
                                for (let n = 0; n < computerKeys.length; n++) {
                                    if (computerKeys[n].includes(selectedKey[k])) {
                                        computerKeys[n] = computerKeys[n].filter(value => value != selectedKey[k]);
                                    }
                                }
                            }
                            break;
                        }
                        const usedNote = selectedKey[k].match(/[A-Za-z]+/)[0];
                        let usedOctave = parseInt(selectedKey[k].match(/\d+/)[0]);
                        const value = key == 'Escape' ? '' : pianoMode ? `${usedNote}${usedOctave}` : i;
                        if (!pianoMode) {
                            for (let n = 0; n < classes.length; n++) {
                                if (usedNote == classes[n]) {pianoKeys[3 + (usedOctave - 1) * 12 + n] = value; break;}
                            }
                        }
                        else {
                            let index;
                            for (let i = 0; i < 4; i++) {
                                index = keyboardKeys4Piano[i].indexOf(keyboardKeys.indexOf(key))
                                if (index != -1) {index += i * 12; break;}
                            }
                            if (computerKeys[index].includes(value)) {
                                computerKeys[index] = computerKeys[index].filter(nb => nb != value);
                            }
                            else {computerKeys[index].push(value);}
                        }
                    }
                    break;
                }
            }
            timeOut = setTimeout(() => {
                selectedKey = [];
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
            if (!pianoMode) {
                for (let index = 0; index < pianoKeys.length; index++) {
                    if (key == keyboardKeys[pianoKeys[index]]) {
                        let octave = Math.floor((index - 3) / 12) + 1;
                        let note = index < 3 ? index + 9 : (index - 3) % 12;
                        note = classes[note];
                        list.push(`${note}${octave}`);
                    }
                }
            }
            else {
                keydown = key;
                let index;
                for (let i = 0; i < 4; i++) {
                    index = keyboardKeys4Piano[i].indexOf(keyboardKeys.indexOf(key))
                    if (index != -1) {index += i * 12; break;}
                }
                for (let i = 0; i < computerKeys[index].length; i++) {
                    const currentKey = computerKeys[index][i];
                    const usedNote = currentKey.match(/[A-Za-z]+/)[0];
                    let usedOctave = parseInt(currentKey.match(/\d+/)[0]);
                    list.push(`${usedNote}${usedOctave}`);
                }
            }
            selectionMode(list);
            return;
        }
        else if (key == 'Escape') {
            if (!pianoMode) {pianoKeys = Array(88).fill('');}
            else {computerKeys = Array.from({length: 48}, () => []);}
            changeMode();
            updateKeyShortcut();
        }
    }
    if (!pianoMode) {
        for (let i = 0; i < pianoKeys.length; i++) {
            if (key == keyboardKeys[pianoKeys[i]] && !keysPressed[key]) {
                keys.forEach((currentKey, n) => {
                    if (n == i) {playSound(currentKey, 1);}
                });
            }
        }
    }
    else if (!keysPressed[key] && keyboardKeys.includes(key)) {
        let index;
        for (let i = 0; i < 4; i++) {
            index = keyboardKeys4Piano[i].indexOf(keyboardKeys.indexOf(key))
            if (index != -1) {index += i * 12; break;}
        }
        for (let i = 0; i < computerKeys[index].length; i++) {
            const currentKey = computerKeys[index][i];
            const usedNote = currentKey.match(/[A-Za-z]+/)[0];
            let usedOctave = parseInt(currentKey.match(/\d+/)[0]);
            if (usedOctave < 2){usedOctave -= 1;} usedOctave -= 1;
            const keyToPlay = document.querySelector(`#octave${usedOctave} .${usedNote}`);
            playSound(keyToPlay, 1);
        }
    }
    keysPressed[key] = true;
});

document.addEventListener('keyup', (event) => {
    const key = event.code;
    if (!pianoMode) {
        for (let i = 0; i < pianoKeys.length; i++) {
            if (key == keyboardKeys[pianoKeys[i]] && keysPressed[key]) {
                keys.forEach((currentKey, n) => {
                    if (n == i) {playSound(currentKey, 2);}
                });
            }
        }
    }
    else if (keysPressed[key] && keyboardKeys.includes(key)) {
        let index;
        for (let i = 0; i < 4; i++) {
            index = keyboardKeys4Piano[i].indexOf(keyboardKeys.indexOf(key))
            if (index != -1) {index += i * 12; break;}
        }
        for (let i = 0; i < computerKeys[index].length; i++) {
            const currentKey = computerKeys[index][i];
            const usedNote = currentKey.match(/[A-Za-z]+/)[0];
            let usedOctave = parseInt(currentKey.match(/\d+/)[0]);
            if (usedOctave < 2){usedOctave -= 1;} usedOctave -= 1;
            const keyToPlay = document.querySelector(`#octave${usedOctave} .${usedNote}`);
            playSound(keyToPlay, 2);
        }
    }
    keysPressed[key] = false;
});



const btnChangeKeyAssignment = document.querySelector('#btnChangeKeyAssignment');
const selectionContainer = document.querySelector('#selectionContainer');
const selectionScreenLine1= document.querySelector('#selectionScreen #line1');
const selectionScreenLine2 = document.querySelector('#selectionScreen #line2');
const selectionScreenLine3 = document.querySelector('#selectionScreen #line3');
const selectionScreenLine4 = document.querySelector('#selectionScreen #line4');
let changingMode = false;
let selectedKey = [];
btnChangeKeyAssignment.addEventListener('click', changeMode);
btnChangeKeyAssignment.style = 'animation-play-state: paused;';
function changeMode() {
    changingMode = !changingMode;
    if (changingMode) {btnChangeKeyAssignment.style = 'animation-play-state: running;';}
    else {btnChangeKeyAssignment.style = 'animation-play-state: paused;';}
}
function selectionMode(key) {
    selectedKey = key;
    selectionContainer.style.display = 'flex';
    selectionScreenLine1.textContent = 'Ré-assignation de la touche :';
    selectionScreenLine2.textContent = `${selectedKey}`;
    selectionScreenLine3.textContent = 'Sélectionnez la nouvelle touche (\'Echap\' pour l\'enlever) :';
    selectionScreenLine4.textContent = '<En attente de la touche>';
}
function updateKeyShortcut() {
    keys.forEach((key, i) => {
        if (key.lastChild.className == 'keyShortcut') {key.removeChild(key.lastChild);}
        const keyShortcuts = document.createElement('div');
        keyShortcuts.className = 'keyShortcut';
        if (!pianoMode) {
            const name = keyboardSymbols[pianoKeys[i]];
            if (name) {keyShortcuts.textContent = `${name}`;}
            else {keyShortcuts.textContent = '';}
        }
        key.appendChild(keyShortcuts);
        if (pianoMode) {
            const note = key.classList[1];
            const octave = key.closest('[id*="octave"]').id.match(/octave(-?\d)/)[1];
            const keyShortcut = document.querySelector(`#octave${octave} .${note} .keyShortcut`);
            let usedOctave = parseInt(octave);
            if (usedOctave < 1) {usedOctave += 1;} usedOctave += 1;
            const touche = note + usedOctave;
            for (let n = 0; n < computerKeys.length; n++) {
                if (computerKeys[n].includes(touche)) {
                    let index = n;
                    const name = keyboardSymbols[keyboardKeys4Piano[Math.floor(index / 12)][index % 12]];
                    const keyDiv = document.createElement('div');
                    keyDiv.className = 'key';
                    keyDiv.textContent = `${name}`;
                    keyShortcut.appendChild(keyDiv);
                }
            }
        }
    });
}
const keyShortcuts = document.querySelectorAll('.keyShortcut');
keyShortcuts.forEach(keyShortcut => {
    let scrollDirection = 1;
    setInterval(() => {
        keyShortcut.scrollTop -= scrollDirection;
        const maxHeight = (keyShortcut.scrollHeight - keyShortcut.clientHeight);
        if (keyShortcut.scrollTop == maxHeight || keyShortcut.scrollTop == 0) {scrollDirection *= -1;}
    }, 50);
});

const btnChangePianoMode = document.querySelector('#btnChangePianoMode');
const btnChangePianoModeI = btnChangePianoMode.querySelector('i');
btnChangePianoMode.addEventListener('click', changePianoMode);
function changePianoMode() {
    pianoMode = !pianoMode;
    if (pianoMode) {
        btnChangePianoMode.classList.add('rotate-fast');
        setTimeout(() => {btnChangePianoMode.classList.remove('rotate-fast');}, 500);
        btnChangePianoModeI.classList.remove('fa-dice-one');
        btnChangePianoModeI.classList.add('fa-dice-six')
    }
    else {
        btnChangePianoMode.classList.add('rotate-fast');
        setTimeout(() => {btnChangePianoMode.classList.remove('rotate-fast');}, 500);
        btnChangePianoModeI.classList.remove('fa-dice-six');
        btnChangePianoModeI.classList.add('fa-dice-one')
    }
    selectedOctave[pianoMode ? 0 : 1].forEach((number) => {visualizeSelection(number, 0);})
    selectedOctave[pianoMode ? 1 : 0].forEach((number) => {visualizeSelection(number);})
    updateKeyShortcut();
}
