const docTitle = document.title;
window.addEventListener("blur", () =>{
    document.title = "Hey, come back... 🥺";
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



const midiNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const latinNote = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
if (!localStorage.getItem('actualState')) localStorage.setItem('actualState', '1');
let actualState = (parseInt(localStorage.getItem('actualState')) + 2) % 3;
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
            else if (actualState == 1) { element.textContent = midiNote[i] + (index + 1); }
            else element.textContent = '';
        });
    }
    actualState = (actualState + 1) % 3;

    localStorage.setItem('actualState', actualState.toString());
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



const realPianoWidth = 52*42;
let pianoWidth = pianoContainer.offsetWidth;
let maxXDiff = realPianoWidth - pianoWidth;
const octaveX = [0];
for (let i = 0; i < 8; i++) {
    octaveX.push((i * 7 + 2) * 42);
}


const btnScrollRight = document.querySelector('#btnScrollRight');
AttachTooltip(btnScrollRight, '[ ↑ ]', 300);
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
AttachTooltip(btnScrollLeft, '[ ↓ ]', 300);
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
AttachTooltip(btnScrollNextOctave, '[ → ]', 300);
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
AttachTooltip(btnScrollPreviousOctave, '[ ← ]', 300);
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

function scroll(save = true) {
    piano.forEach(octave => {octave.style.transform = `translateX(-${scrollX}px)`;});
    let offsetX = 0;
    if (scrollX == maxXDiff) {offsetX = -0.2;}
    let newLeft = scrollX / 42 * 1.85 / 100 * window.innerWidth - offsetX * (window.innerWidth / 100);
    selection.style.left = `${newLeft}px`;
    const leftMaskWidth = newLeft;
    const rightMaskWidth = pianoVisualization.clientWidth - (newLeft + selection.offsetWidth) + 2;
    pianoVisualization.style.setProperty('--leftMaskWidth', `${Math.ceil(leftMaskWidth)}px`);
    pianoVisualization.style.setProperty('--rightMaskWidth', `${Math.floor(rightMaskWidth)}px`);

    pianoPresets.presets[pianoPresets.selectedPreset][pianoPresets.pianoMode ? 'scrollX2' : 'scrollX1'] = scrollX;
    if (save) localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));
}

const btnToggleSustainMode = document.querySelector('#btnToggleSustainMode');
AttachTooltip(btnToggleSustainMode, '[ F9 ]', 300);
btnToggleSustainMode.addEventListener('click', ToggleSustainMode, save = true);
function ToggleSustainMode() {
    if (!sustainMode) {btnToggleSustainMode.classList = 'active';}
    else {btnToggleSustainMode.classList = 'non-active';}
    sustainMode = !sustainMode;
    if (!sustainMode) {
        StopAllNotes();
    }

    pianoPresets.presets[pianoPresets.selectedPreset][pianoPresets.pianoMode ? 'sustainMode2' : 'sustainMode1'] = sustainMode;
    if (save) localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));

    if (isRecording) recordedSustainMode.push([performance.now() - startRecordingTime, sustainMode]);
}
function StopAllNotes(sf2 = false) {
    const pending = [];

    for (const inst in timeoutIds) {
        if (sf2 && inst == '0:128') continue; //Don't stop the notes played by the user when the sf2 file is closed
        for (const touche in timeoutIds[inst]) {
            pending.push({ inst, touche });
        }
    }

    if (isRecording) {
        const elapsedTime = Math.round(performance.now() - startRecordingTime);

        for (const sound of pending) {
            const touche = sound.touche;
            const [, note, octaveStr] = touche.match(/^([A-G]s?)(\d)$/);
            const octave = Number(octaveStr);
            const correctedOctave = octave < 0 ? octave + 1 : octave;
            const key = (parseInt(correctedOctave) + 2) * 12 + classes.indexOf(note);

            const inst = sound.inst;
            let canal = parseInt(inst.split(':')[1]) % 128;
            if (parseInt(inst.split(':')[0]) == 128) canal = 128;

            for (let i = recordedMusic.length - 1; i >= 0; i--) {
                const note = recordedMusic[i];
                if (note[1] == key && note[3] == canal) {
                    if (note[0] + note[2] > elapsedTime / 1000) {
                        recordedMusic[i][2] = elapsedTime - note[0];
                        break;
                    }
                }
            }
        }
    }

    function step() {
        if (pending.length === 0) return;

        const batchSize = 2;
        for (let i = 0; i < batchSize && pending.length > 0; i++) {
            const { inst, touche } = pending.shift();

            const audio = audioInstances[inst][touche];

            let programNumber = inst.split(':')[1];
            if (programNumber == 128) programNumber = 0;
            if (inst.split(':')[0] == 128) programNumber = 128;
            audio.stop(GetReleaseTime(programNumber));

            clearTimeout(timeoutIds[inst][touche]);
            delete timeoutIds[inst][touche];

            UndisplayNote(touche);
        }

        requestAnimationFrame(step);
    }

    step();
}
function UndisplayNote(touche) {
    const note = touche.match(/[A-Za-z]+/)[0];
    const octave = parseInt(touche.match(/(-?\d)/)[0]);
    const key = document.querySelector(`#octave${octave} .${note}`);

    const pressedKey = document.querySelector(`#octave${octave} .${note}`);
    let childNumber;
    for (let i = 0; i < classes.length; i++) {
        if (note == classes[i]) { childNumber = i + 1; break; }
    }
    if (octave == -2) { childNumber -= 9; }
    let miniOctave = octave + 1;
    if (octave < 0) { miniOctave += 1; }
    const miniPianoKey = document.querySelector(`#octav_${miniOctave} > :nth-child(${childNumber})`);
    const whiteOrSharp = key.classList[0];

    pressedKey.classList.remove(`keyplayed_${whiteOrSharp}`);
    miniPianoKey.classList.remove(`keyplayed_${whiteOrSharp}`);
    pressedKey.classList.remove(`keypressed_${whiteOrSharp}`);
    miniPianoKey.classList.remove(`keypressed_${whiteOrSharp}`);
}

document.addEventListener('keydown', (event) => {
    if (settingsContainer.style.display !== 'none' || effectsContainer.style.display !== 'none' || sf2SettingsContainer.style.display !== 'none' || pianoPresetDropdown.style.display !== 'none' || inputSelectWindow.style.display !== 'none' || midiHistoryWindow.style.display !== 'none') return;

    if (currentOctave != 5) { return; }
    if (selectedKey.length > 0) return;

    const key = event.code;
    if (key == 'ArrowLeft' && !keysPressed['ArrowLeft']) { scrollPreviousOctave(); }
    if (key == 'ArrowDown' && !keysPressed['ArrowDown']) { scrollLeft(); }
    if (key == 'ArrowUp' && !keysPressed['ArrowUp']) { scrollRight(); }
    if (key == 'ArrowRight' && !keysPressed['ArrowRight']) { scrollNextOctave(); }

    if (key == 'End' && !keysPressed['End']) {
        if (fileLength == 0) {
            ImportSf2File();
            setTimeout(() => { keysPressed['End'] = false; }, 10);
        }
        else RemoveSf2File();
    }
    if (key == 'Insert' && !keysPressed['Insert']) {
        if (ntrks == 0) {
            ImportMidiFile();
            setTimeout(() => { keysPressed['Insert'] = false; }, 10);
        }
        else RemoveMidiFile();
    }
    if (key == 'Delete' && !keysPressed['Delete']) {
        if (isRecording) StopPlaying();
        else StartPlaying();
    }
    if (key == 'F9' && !keysPressed['F9']) { ToggleSustainMode(); }
});



let lastSelectedPreset = null;
let lastSelectedPresets = null;

const progressBar = document.querySelector('#progressBar');
const pictureBlur = document.querySelector('#loadingScreen img');
document.querySelector('#loadingScreen').style.display = 'none';
//Before I had a waiting screen but I improved the system and it doesn't require one anymore

const timeoutIds = {};
const audioInstances = {}

const audioCtx = new window.AudioContext();
document.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
});

keys.forEach(key => playSound(key));

async function playSound(key, pressing = 0, volume = 1, canal = 256) {
    const note = key.classList[1];
    const octave = key.closest('[id*="octave"]').id.match(/octave(-?\d)/)[1];
    const touche = note + octave;

    await VerifyExistence(note, octave, touche, canal);

    const { inst, isSustainable } = GetInstrument(canal);
    if (!audioInstances[inst]) return;
    if (!audioInstances[inst][touche]) return;
    let audio = audioInstances[inst][touche];


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

    if (pressing == 1) { play(); }
    else if (pressing == 2) { stop(); }
    else {
        key.addEventListener('mousedown', () => { play() });
        key.addEventListener('mouseup', () => { stop() });
        key.addEventListener('mouseleave', () => { stop() });
    }


    async function play() {
        if (changingMode) {whereRequestIsFrom = 'pianoKey'; selectionMode([`${note}${miniOctave}`]); return;}

        const { inst, isSustainable } = GetInstrument(canal);

        if (isRecording) {
            const octaveInt = Number(octave);
            const correctedOctave = octaveInt < 0 ? octaveInt + 1 : octaveInt;
            const key = (parseInt(correctedOctave) + 2) * 12 + classes.indexOf(note);

            if (canal == 256 && parseInt(recordingInputs.split(';')[0].split(':')[0]) == 1) {
                //The request is from the user and he wants to record it

                let instrument = 0;
                if (inst != '0:128' && parseInt(recordingInputs.split(';')[0].split(':')[1]) == 1) instrument = inst.split(':')[1];
                //If the user is playing with an instrument from a sf2 file and he wants to record it, we update 'instrument' variable

                if (startRecordingTime == null) startRecordingTime = performance.now();
                const elapsedTime = Math.round(performance.now() - startRecordingTime);

                const uniqueKey = `${instrument}-${key}`;
                recordingBuffer.set(uniqueKey, elapsedTime);
            }
            else if (canal != 256 && parseInt(recordingInputs.split(';')[1].split(':')[0]) == 1) {
                //The request is from a midi file playing and the user wants to record it

                if (canal == 0 || (canal != 0 && parseInt(recordingInputs.split(';')[1].split(':')[1]) == 1)) {
                    //Either the note played is a piano in which case we record it or it's another instrument and we record it if the uset wants it

                    if (startRecordingTime == null) startRecordingTime = performance.now();
                    const elapsedTime = Math.round(performance.now() - startRecordingTime);

                    const uniqueKey = `${canal}-${key}`;
                    recordingBuffer.set(uniqueKey, elapsedTime);
                }
            }
        }

        await VerifyExistence(note, octave, touche, canal);
        if (!audioInstances[inst]) return;
        if (!audioInstances[inst][touche]) return;
        audio = audioInstances[inst][touche];

        audio.setPlaybackRate(speedValue);

        let velocity = volume;
        if (velocity == 1) {
            velocity *= (volumeValue / 100) * 0.5;
            if (volumeValue == 200 || velocity > 1) velocity = 1;
        }
        audio.setVolume(velocity);

        const octaveInt = Number(octave);
        const correctedOctave = octaveInt < 0 ? octaveInt + 1 : octaveInt;
        const key = (parseInt(correctedOctave) + 2) * 12 + classes.indexOf(note);

        //Terminate other notes that have the same Exclusive Class
        if (parseInt(inst.split(':')[1]) != 128 && exclusiveClass.has(inst)) {
            const instClasses = exclusiveClass.get(inst);
            let keyClass = 0;
            for (const [exClass, notes] of instClasses) {
                if (notes.includes(key)) {
                    keyClass = exClass;
                    break;
                }
            }

            if (keyClass != 0) {
                for (const instrument in timeoutIds) {
                    if (instrument != inst) continue;

                    for (const touche in timeoutIds[instrument]) {
                        const match = touche.match(/^([A-G]s?)(\d)$/);
                        if (!match) continue;

                        const [, toucheNote, octaveStr] = match;
                        const toucheOctave = Number(octaveStr);
                        const toucheCorrectedOctave = (toucheOctave < 0 ? toucheOctave + 1 : toucheOctave);
                        const toucheKey = (toucheCorrectedOctave + 2) * 12 + classes.indexOf(toucheNote);

                        if (!instClasses.get(keyClass).includes(toucheKey)) continue;

                        const audio = audioInstances[inst][touche];

                        audio.stop();
    
                        clearTimeout(timeoutIds[inst][touche]);
                        delete timeoutIds[inst][touche];

                        UndisplayNote(touche);
                    }
                }
            }
        }

        //Change the volume of the dry gain of the chorus input as wanted by the generator number 15 in the SF2 files
        let chorusMixValue = 1;
        if (parseInt(inst.split(':')[1]) != 128 && genChorus.has(inst) && genChorus.get(inst).has(key) && isSf2UsedForChorus) {
            chorusMixValue = genChorus.get(inst).get(key);
        }
        chorusSendGain.gain.value = chorusMixValue;

        //Change the volume of the dry gain of the reverb input as wanted by the generator number 16 in the SF2 files
        let reverbMixValue = 1;
        if (parseInt(inst.split(':')[1]) != 128 && genReverb.has(inst) && genReverb.get(inst).has(key) && isSf2UsedForReverb) {
            reverbMixValue = genReverb.get(inst).get(key);
        }
        reverbSendGain.gain.value = reverbMixValue;

        audio.play({ playbackRate: speedValue });

        pressedKey.classList.add(`keyplayed_${whiteOrSharp}`);
        miniPianoKey.classList.add(`keyplayed_${whiteOrSharp}`);
        pressedKey.classList.add(`keypressed_${whiteOrSharp}`);
        miniPianoKey.classList.add(`keypressed_${whiteOrSharp}`);

        if (!timeoutIds[inst]) timeoutIds[inst] = {};
        if (timeoutIds[inst][touche]) { clearTimeout(timeoutIds[inst][touche]); }
        if (sustainMode && isSustainable) {
            timeoutIds[inst][touche] = setTimeout(() => {
                pressedKey.classList.remove(`keyplayed_${whiteOrSharp}`);
                miniPianoKey.classList.remove(`keyplayed_${whiteOrSharp}`);

                delete timeoutIds[inst][touche];
            }, audio.duration * 1000 / speedValue);
        }
        else {
            timeoutIds[inst][touche] = setTimeout(() => {
                //It's just in order to be saved into the timeoutIds to be shut down when wanted but I don't need to do anything
                delete timeoutIds[inst][touche];
            }, 10);
        }
    }

    async function stop() {
        const { inst, isSustainable } = GetInstrument(canal);

        await VerifyExistence(note, octave, touche, canal);
        if (!audioInstances[inst]) return;
        if (!audioInstances[inst][touche]) return;
        audio = audioInstances[inst][touche];

        if (isRecording) {
            const octaveInt = Number(octave);
            const correctedOctave = octaveInt < 0 ? octaveInt + 1 : octaveInt;

            const key = (parseInt(correctedOctave) + 2) * 12 + classes.indexOf(note);
            const sustain = !sustainMode || !isSustainable;

            if (canal == 256 && parseInt(recordingInputs.split(';')[0].split(':')[0]) == 1) {
                let instrument = 0;
                if (inst != '0:128' && parseInt(recordingInputs.split(';')[0].split(':')[1]) == 1) instrument = inst.split(':')[1];

                const uniqueKey = `${instrument}-${key}`;
                if (recordingBuffer.has(uniqueKey)) {
                    const startTime = recordingBuffer.get(uniqueKey);
                    const duration = sustain ? Math.round(performance.now() - startRecordingTime) - startTime : Math.round(audio.duration * 1000 / speedValue);

                    recordedMusic.push([startTime, key, duration, instrument]);

                    recordingBuffer.delete(uniqueKey);
                }
            }
            else if (canal != 256 && parseInt(recordingInputs.split(';')[1].split(':')[0]) == 1) {
                if (canal == 0 || (canal != 0 && parseInt(recordingInputs.split(';')[1].split(':')[1]) == 1)) {
                    const uniqueKey = `${canal}-${key}`;

                    if (recordingBuffer.has(uniqueKey)) {
                        const startTime = recordingBuffer.get(uniqueKey);
                        const duration = sustain ? Math.round(performance.now() - startRecordingTime) - startTime : Math.round(audio.duration * 1000 / speedValue);

                        recordedMusic.push([startTime, key, duration, canal]);

                        recordingBuffer.delete(uniqueKey);
                    }
                }
            }
        }

        if (!sustainMode || !isSustainable) {
            //Conversion from MY nomenclature to the current playing instrument from 0 to 127
            let programNumber = inst.split(':')[1];
            if (programNumber == 128) programNumber = 0;
            if (inst.split(':')[0] == 128) programNumber = 128;
            audio.stop(GetReleaseTime(programNumber));

            pressedKey.classList.remove(`keyplayed_${whiteOrSharp}`);
            miniPianoKey.classList.remove(`keyplayed_${whiteOrSharp}`);
        }

        pressedKey.classList.remove(`keypressed_${whiteOrSharp}`);
        miniPianoKey.classList.remove(`keypressed_${whiteOrSharp}`);
    }
}
function GetReleaseTime(programNumber) {
    if (programNumber == 0) return 1.5;      // Grand Piano
    if (programNumber <= 7) return 1.2;      // Pianos
    if (programNumber <= 15) return 0.6;     // Chromatic Perc
    if (programNumber <= 23) return 1.0;     // Organs
    if (programNumber <= 31) return 0.5;     // Guitars
    if (programNumber <= 39) return 0.4;     // Basses
    if (programNumber <= 47) return 1.2;     // Strings
    if (programNumber <= 55) return 1.0;     // Ensemble
    if (programNumber <= 63) return 0.9;     // Brass
    if (programNumber <= 71) return 1.0;     // Reeds
    if (programNumber <= 79) return 0.8;     // Pipes
    if (programNumber <= 87) return 0.5;     // Synth Leads
    if (programNumber <= 95) return 1.5;     // Synth Pads
    if (programNumber <= 103) return 2.0;    // FX
    if (programNumber <= 111) return 0.6;    // Ethnic
    if (programNumber <= 119) return 0.4;    // Percussive
    if (programNumber <= 127) return 0.2;    // Sound FX
    return 0.2;                              // Drumkit
}
async function VerifyExistence(note, octave, touche, canal) {
    const { inst, isSustainable } = GetInstrument(canal);
    const isSf2 = !!((canal === 256 && lastSelectedPreset) || (canal !== 256 && lastSelectedPresets));

    let source;
    if (isSf2 && notes.has(inst)) {
        const blob = notes.get(inst).get(touche);
        if (!blob) return null;
        else source = blob;
    } else {
        source = noteBuffers[`${note.toLowerCase()}${octave}`];
    }

    if (!audioInstances[inst]) audioInstances[inst] = {};
    if (!audioInstances[inst][touche]) {audioInstances[inst][touche] = await CreateVoice(source, !isSf2);}
}
async function CreateVoice(source, isBase64) {
    const gainNode = audioCtx.createGain();

    let blob;
    if (isBase64) {
        if (source.startsWith("data:")) {
            source = source.split(",")[1];
        }
        const binary = atob(source);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: "audio/mp3" });
    } else if (source instanceof ArrayBuffer) {
        blob = new Blob([source]);
    } else if (source instanceof Blob) {
        blob = source;
    } else if (typeof source === "string" && source.startsWith("blob:")) {
        const res = await fetch(source);
        blob = await res.blob();
    } else {
        throw new Error("Source audio non reconnue.");
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = await audioCtx.decodeAudioData(arrayBuffer);

    const sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = buffer;

    return {
        gainNode,

        volume: 1,
        playbackRate: 1,

        currentSourceNode: null,
        releaseTimeout: null,

        duration: buffer.duration,

        setVolume: function(val) {
            this.gainNode.gain.value = val;
            this.volume = val;
        },
        setPlaybackRate: function (val) {
            this.playbackRate = val;
        },

        play: function () {
            if (this.currentSourceNode) {
                try { this.currentSourceNode.stop(); } catch { }
            }

            clearTimeout(this.releaseTimeout);

            const now = audioCtx.currentTime;
            const gain = this.gainNode.gain;

            gain.cancelScheduledValues(now);

            const vol = this.volume ?? 1;
            if (isAdsrUse) {
                gain.setValueAtTime(0.001, now);
                gain.exponentialRampToValueAtTime(vol, now + adsrAttack);
                gain.setValueAtTime(vol, now + adsrAttack + adsrHold);
                gain.exponentialRampToValueAtTime(vol * adsrSustain, now + adsrAttack + adsrHold + adsrDecay);
            }
            else {
                gain.setValueAtTime(vol, now);
            }

            const sourceNode = audioCtx.createBufferSource();
            sourceNode.buffer = buffer;
            sourceNode.playbackRate.value = this.playbackRate;
            sourceNode.connect(this.gainNode).connect(distortionNode.input);
            sourceNode.start(0);

            this.currentSourceNode = sourceNode;
        },
/*         stop: function () {
            if (this.currentSourceNode) {
                try { this.currentSourceNode.stop(); } catch { }
                this.currentSourceNode = null;
            }
        }, */ //Previous version without dynamic release. Can be useful if I don't want dynamic release anymore
        stop: function (duration = 0) {
            const gain = this.gainNode.gain;
            const now = audioCtx.currentTime;

            gain.cancelScheduledValues(now);
            if (isAdsrUse) {
                gain.exponentialRampToValueAtTime(0.001, now + adsrRelease);
            } else {
                gain.exponentialRampToValueAtTime(0.001, now + duration);
            }

            clearTimeout(this.releaseTimeout);
            this.releaseTimeout = setTimeout(() => {
                try {
                    this.currentSourceNode?.stop();
                } catch (e) { }
                this.currentSourceNode = null;
            }, duration * 1000);
        },
    };
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
    [0, 5, 6, 7, 8, 9, 10, 11, 1, 2, 3, 4],
    [18, 19, 20, 21, 22, 23, 12, 13, 14, 15, 16, 17],
    [32, 33, 34, 35, 24, 25, 26, 27, 28, 29, 30, 31],
    [44, 45, 46, 47, 36, 37, 38, 39, 40, 41, 42, 43]
];

const defaultSelectedOctaves = [[2, 3, 4, 5], [2, 3, 4, 5]];

const defaultPianoKeys = Array(88).fill('');
const defaultComputerKeys = Array.from({ length: 48 }, () => []);


//Basic system. It's in ascending index order. So it's handy for scripting, but not well thought out and not optimal for playing piano.
//I'm keeping it because it can be useful. I don't know...
/* for (let i = 0; i < defaultSelectedOctaves[0].length; i++) {
    let octave = defaultSelectedOctaves[0][i] + 1;
    if (octave < 2) { octave += 1; }
    let index = 3 + (octave - 1) * 12;
    const occurence = octave == 0 ? 3 : octave == 8 ? 1 : 12;
    let offset = 0;
    if (octave == 0) { index += 9; offset = 9; }
    for (let n = 0; n < occurence; n++) { defaultPianoKeys[index + n] = keyboardKeys4Piano[i][n + offset]; }
}
for (let i = 0; i < defaultSelectedOctaves[1].length; i++) {
    let octave = defaultSelectedOctaves[1][i] + 1;
    if (octave < 2) { octave += 1; }
    const occurence = octave == 0 ? 3 : octave == 8 ? 1 : 12;
    let offset = octave ? 0 : 9;
    for (let n = 0; n < occurence; n++) { defaultComputerKeys[i * 12 + n].push(`${classes[n + offset]}${octave}`); }
} */

//Better system. Not perfect but I put the easiest computer keys on the most used piano keys and the furthest on the black keys.
//Maybe there are improvements to do but it's still better than the last version and if you want more, just edit the assignments by yourself...
const DK = [ //Default Keys
    13, 0, 14, 1, 15, 26, 2, 27, 3, 28, 4, 40, 
    6, 16, 7, 17, 8, 9, 29, 10, 30, 11, 31, 12, 
    19, 46, 20, 41, 21, 22, 47, 23, 42, 24, 43, 25, 
    33, 45, 34, 44, 35, 36, 32, 37, 5, 38, 18, 39
];
for (let i = 0; i < 48; i++) defaultPianoKeys[i + 27] = DK[i];
for (let i = 0; i < 48; i++) {
    const i1 = keyboardKeys4Piano[Math.floor(i / 12)][i % 12];
    const i2 = DK.indexOf(i1);
    defaultComputerKeys[i].push(`${classes[i2 % 12]}${Math.floor(i2 / 12) + 3}`);
}


const defaultScrollX = 0;
function ReturnDefaultScrollX() {
    const visuSize = pianoContainer.clientWidth;
    const scrollValue = (realPianoWidth - visuSize) / 2;
    const finalScrollValue = ReturnMaxScrollX(scrollValue);

    return finalScrollValue;
}
function ReturnMaxScrollX(scrollX) {
    pianoWidth = pianoContainer.offsetWidth;
    maxXDiff = realPianoWidth - pianoWidth;
    const finalScrollX = Math.min(scrollX, maxXDiff);

    return finalScrollX;
}
const defaultSustainMode = true;

if (!localStorage.getItem('pianoPresets')) {
    const defaultPianoMode = false;
    const defaultSelectedPreset = 1;

    let pianoPresets = {
        pianoMode: defaultPianoMode,
        selectedPreset: defaultSelectedPreset,
        presets: []
    }
    function CreateDefaultPreset(index) {
        return {
            name1: index ? `Preset ${index}` : 'Default', //Name for Piano Keys assignments
            pianoKeys: defaultPianoKeys,
            scrollX1: ReturnDefaultScrollX(),
            sustainMode1: defaultSustainMode,
            name2: index ? `Preset ${index}` : 'Default', //Name for Computer Keys assignments
            computerKeys: defaultComputerKeys,
            scrollX2: ReturnDefaultScrollX(),
            sustainMode2: defaultSustainMode,
            selectedOctaves: defaultSelectedOctaves
        };
    }
    for (let i = 0; i < 6; i++) {
        pianoPresets.presets.push(CreateDefaultPreset(i));
    }

    localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));
}
const pianoPresets = JSON.parse(localStorage.getItem('pianoPresets'));

pianoPresets.presets[0].name1 = 'Default';
pianoPresets.presets[0].pianoKeys = defaultPianoKeys;
pianoPresets.presets[0].scrollX1 = ReturnDefaultScrollX();
pianoPresets.presets[0].sustainMode1 = defaultSustainMode;
pianoPresets.presets[0].name2 = 'Default';
pianoPresets.presets[0].computerKeys = defaultComputerKeys;
pianoPresets.presets[0].scrollX2 = ReturnDefaultScrollX();
pianoPresets.presets[0].sustainMode2 = defaultSustainMode;
pianoPresets.presets[0].selectedOctaves = defaultSelectedOctaves;




let scrollX = pianoPresets.presets[pianoPresets.selectedPreset][pianoPresets.pianoMode ? 'scrollX2' : 'scrollX1'];
requestAnimationFrame(() => { scroll(); }); //To not send others variables that I don't want

let sustainMode = pianoPresets.presets[pianoPresets.selectedPreset][pianoPresets.pianoMode ? 'sustainMode2' : 'sustainMode1'];;
btnToggleSustainMode.classList = sustainMode ? 'active' : 'non-active';


let selectedOctaves = pianoPresets.presets[pianoPresets.selectedPreset].selectedOctaves;
let pianoMode = pianoPresets.pianoMode;
let currentOctave = 5;
selectedOctaves[pianoMode ? 1 : 0].forEach((number) => { visualizeSelection(number); });
function visualizeSelection(number, parameter = 1) {
    if (number < 1) {number += 1} number += 1; 
    let usefulOctave = document.querySelectorAll(`#octav_${number} .whit_key`);
    usefulOctave.forEach((usefulKey) => {
        if (parameter) {usefulKey.classList.add('selected-octave');}
        else {usefulKey.classList.remove('selected-octave');}
    });
}
document.addEventListener('keydown', (event) => {
    if (settingsContainer.style.display !== 'none' || effectsContainer.style.display !== 'none' || sf2SettingsContainer.style.display !== 'none' || pianoPresetDropdown.style.display !== 'none' || inputSelectWindow.style.display !== 'none' || midiHistoryWindow.style.display !== 'none') return;

    if (selectedKey.length > 0) return;

    const key = event.code;
    for (let i = 1; i < 10; i++) {
        if (timeOut) { return; }
        if ((key == 'Escape' || key == `Digit${i}`) && !keysPressed[key]) {
            let number = i - 2;
            if (number < 1) {number -= 1;}
            if (key == 'Escape' && currentOctave != 5) {selectionScreenLine4.textContent = 'cancelation';}
            else if (key != `Digit${i}`) {continue;}
            else if (currentOctave == 5) {
                if (selectedOctaves[pianoMode ? 1 : 0].includes(number)) {
                    currentOctave = selectedOctaves[pianoMode ? 1 : 0].indexOf(number);
                    selectionContainer.style.display = 'flex';
                    selectionScreenLine1.textContent = 'Octave reassignment:';
                    selectionScreenLine2.textContent = `${i - 1}`;
                    selectionScreenLine3.textContent = 'Select the new octave (\'Esc\' to cancel) :';
                    selectionScreenLine4.textContent = '<Waiting for key>';
                }
                continue;
            }
            else if (selectedOctaves[pianoMode ? 1 : 0].includes(number)) {continue;}
            else if (selectedOctaves[pianoMode ? 1 : 0].length == 4) {
                const previousOctave = selectedOctaves[pianoMode ? 1 : 0][currentOctave];
                visualizeSelection(previousOctave, 0);
                selectedOctaves[pianoMode ? 1 : 0].splice(currentOctave, 1, number);

                pianoPresets.presets[pianoPresets.selectedPreset].selectedOctaves = selectedOctaves;
                localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));

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

    pianoPresets.presets[pianoPresets.selectedPreset].pianoKeys = pianoKeys;
    pianoPresets.presets[pianoPresets.selectedPreset].computerKeys = computerKeys;
    localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));

    updateKeyShortcut();
}


let pianoKeys, computerKeys;
function UpdatePresets() {
    pianoKeys = pianoPresets.presets[pianoPresets.selectedPreset].pianoKeys;
    computerKeys = pianoPresets.presets[pianoPresets.selectedPreset].computerKeys;
    updateKeyShortcut();
}
requestAnimationFrame(UpdatePresets);


const keysPressed = {};
let timeOut;
let keydown = -1;
let whereRequestIsFrom;
document.addEventListener('keydown', (event) => {
    if (settingsContainer.style.display !== 'none' || effectsContainer.style.display !== 'none' || sf2SettingsContainer.style.display !== 'none' || pianoPresetDropdown.style.display !== 'none' || inputSelectWindow.style.display !== 'none' || midiHistoryWindow.style.display !== 'none') return;

    if (currentOctave != 5) {return;}
    const key = event.code;
    if (selectedKey.length > 0) {
        if (timeOut) {return;}
        if (keyboardKeys.includes(key) || key == 'Escape'){
            for (let i = 0; i < keyboardKeys.length; i++) {
                if (key == keyboardKeys[i] || key == 'Escape') {
                    for (let k = 0; k < selectedKey.length; k++) {
                        const content = key == 'Escape' ? 'empty' : `${key} (${keyboardSymbols[i]})`;
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

                            pianoPresets.presets[pianoPresets.selectedPreset].computerKeys = computerKeys;
                            localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));

                            break;
                        }
                        const usedNote = selectedKey[k].match(/[A-Za-z]+/)[0];
                        let usedOctave = parseInt(selectedKey[k].match(/\d+/)[0]);
                        const value = key == 'Escape' ? '' : pianoMode ? `${usedNote}${usedOctave}` : i;
                        if (!pianoMode) {
                            for (let n = 0; n < classes.length; n++) {
                                if (usedNote == classes[n]) {
                                    pianoKeys[3 + (usedOctave - 1) * 12 + n] = value;

                                    pianoPresets.presets[pianoPresets.selectedPreset].pianoKeys = pianoKeys;
                                    localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));

                                    break;
                                }
                            }
                        }
                        else {
                            let index;
                            for (let i = 0; i < 4; i++) {
                                index = keyboardKeys4Piano[i].indexOf(keyboardKeys.indexOf(key))
                                if (index != -1) { index += i * 12; break; }
                            }
                            if (whereRequestIsFrom == 'pianoKey') {
                                if (computerKeys[index].includes(value)) {
                                    computerKeys[index] = computerKeys[index].filter(nb => nb != value);
                                } else {
                                    computerKeys[index].push(value);
                                }
                            }
                            if (whereRequestIsFrom == 'computerKey') {
                                if (computerKeys[index].includes(value)) {
                                    //It's not because the key is already on the note that I will remove it. So I'm doing nothing here!
                                } else {
                                    computerKeys[index].push(value);
                                }
                            }

                            pianoPresets.presets[pianoPresets.selectedPreset].computerKeys = computerKeys;
                            localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));
                        }
                    }
                    break;
                }
            }
        }
        else { selectionScreenLine4.textContent = 'Unable to assign this key'; }
        timeOut = setTimeout(() => {
            selectedKey = [];
            selectionContainer.style.display = 'none';
            ChangeMode();
            updateKeyShortcut();
            timeOut = 0;
        }, 1000);
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

            whereRequestIsFrom = 'computerKey';

            selectionMode(list);
            return;
        }
        else if (key == 'Escape') {
            if (!pianoMode) {
                pianoKeys = Array(88).fill('');

                pianoPresets.presets[pianoPresets.selectedPreset].pianoKeys = pianoKeys;
                localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));
            }
            else {
                computerKeys = Array.from({ length: 48 }, () => []);

                pianoPresets.presets[pianoPresets.selectedPreset].computerKeys = computerKeys;
                localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));
            }
            ChangeMode();
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



if (!localStorage.getItem("btnAssignment")) localStorage.setItem("btnAssignment", "true");

const btnChangeKeyAssignment = document.querySelector('#btnChangeKeyAssignment');
const selectionContainer = document.querySelector('#selectionContainer');
const selectionScreenLine1= document.querySelector('#selectionScreen #line1');
const selectionScreenLine2 = document.querySelector('#selectionScreen #line2');
const selectionScreenLine3 = document.querySelector('#selectionScreen #line3');
const selectionScreenLine4 = document.querySelector('#selectionScreen #line4');
let changingMode = false;
let wasPlaying = false;
let selectedKey = [];
btnChangeKeyAssignment.addEventListener('click', ChangeMode);
btnChangeKeyAssignment.style = 'animation-play-state: paused;';
function ChangeMode() {
    changingMode = !changingMode;
    if (changingMode) {btnChangeKeyAssignment.style = 'animation-play-state: running;';}
    else { btnChangeKeyAssignment.style = 'animation-play-state: paused;'; }

    if (changingMode && localStorage.getItem("btnAssignment") == "true") DisplayAssignmentExplanations();

    if (changingMode && isPlaying) {
        PlayMidiFile();
        wasPlaying = true;
    }
    if (!changingMode && wasPlaying) {
        PlayMidiFile();
        wasPlaying = false;
    }
}
function selectionMode(key) {
    selectedKey = key;
    selectionContainer.style.display = 'flex';
    selectionScreenLine1.textContent = 'Key reassignment :';
    selectionScreenLine2.textContent = `${selectedKey}`;
    selectionScreenLine3.textContent = 'Select the new key (\'Esc\' to remove it) :';
    selectionScreenLine4.textContent = '<Waiting for key>';
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

            const keyShortcutBox = document.createElement('div');
            keyShortcutBox.className = 'keyShortcutBox';

            for (let n = 0; n < computerKeys.length; n++) {
                if (computerKeys[n].includes(touche)) {
                    let index = n;
                    const name = keyboardSymbols[keyboardKeys4Piano[Math.floor(index / 12)][index % 12]];
                    const keyDiv = document.createElement('div');
                    keyDiv.className = 'key';
                    keyDiv.textContent = `${name}`;
                    keyShortcutBox.appendChild(keyDiv);
                }
            }

            keyShortcut.appendChild(keyShortcutBox);
        }
    });

    UpdateKeyShortcutScroll();
}

function UpdateKeyShortcutScroll() {
    const keyShortcuts = document.querySelectorAll('.keyShortcut');
    keyShortcuts.forEach(keyShortcut => {
        const keyShortcutBox = keyShortcut.firstElementChild;
        if (!keyShortcutBox) return;
        keyShortcutBox.style.animation = '';

        const overflow = keyShortcut.scrollHeight - keyShortcut.clientHeight;
        if (overflow > 0) {
            //Strange value found by testing to be sure the speed is riiiiight !
            const duration = Math.max(overflow / 12, 2);

            keyShortcutBox.style.setProperty('--scroll-distance', `-${overflow}px`);
            keyShortcutBox.style.animation = `scroll-vertical ${duration}s cubic-bezier(.55, 0, .45, 1) infinite alternate`;
        }
    });
}

const btnChangePianoMode = document.querySelector('#btnChangePianoMode');
const btnChangePianoModeI = btnChangePianoMode.querySelector('i');
btnChangePianoMode.addEventListener('click', changePianoMode);

if (pianoMode == true) {
    btnChangePianoModeI.classList.remove('fa-dice-one');
    btnChangePianoModeI.classList.add('fa-dice-six');
}

function changePianoMode(updatePianoPresets = true) {
    if (updatePianoPresets) {
        pianoMode = !pianoMode;
        pianoPresets.pianoMode = pianoMode;
        localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));
    }

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

    selectedOctaves[pianoMode ? 0 : 1].forEach((number) => { visualizeSelection(number, 0); });
    selectedOctaves[pianoMode ? 1 : 0].forEach((number) => { visualizeSelection(number); });

    if (updatePianoPresets) {
        document.querySelector(`#pianoPreset${pianoMode ? 1 : 2} > :nth-child(${pianoPresets.selectedPreset + 1})`).classList.remove('selectedPianoPreset');
        document.querySelector(`#pianoPreset${pianoMode ? 2 : 1} > :nth-child(${pianoPresets.selectedPreset + 1})`).classList.add('selectedPianoPreset');

        scrollX = ReturnMaxScrollX(pianoPresets.presets[pianoPresets.selectedPreset][pianoPresets.pianoMode ? 'scrollX2' : 'scrollX1']);
        scroll(false);

        sustainMode = pianoPresets.presets[pianoPresets.selectedPreset][pianoPresets.pianoMode ? 'sustainMode2' : 'sustainMode1'];
        btnToggleSustainMode.classList = sustainMode ? 'active' : 'non-active';
    }    

    updateKeyShortcut();
}


if (!localStorage.getItem('scrollSettings')) localStorage.setItem('scrollSettings', '0');
let scrollSettings = parseInt(localStorage.getItem('scrollSettings'));
const btnScrollUp = document.querySelector('#btnScrollUp');
const btnScrollDown = document.querySelector('#btnScrollDown');
btnScrollUp.style.display = 'none';
btnScrollUp.addEventListener('click', () => { scrollSettings--; UpdateTransform(); });
btnScrollDown.addEventListener('click', () => { scrollSettings++; UpdateTransform(); });
window.addEventListener('resize', () => { UpdateTransform('auto'); });

const numberOfStages = settings.childElementCount;
function UpdateTransform(animation = 'smooth') {
    settings.scrollTo({ top: scrollSettings * 0.063 * window.innerWidth, behavior: animation });
    
    btnScrollDown.style.display = scrollSettings == numberOfStages - 1 ? 'none' : 'flex';
    btnScrollUp.style.display = scrollSettings == 0 ? 'none' : 'flex';

    localStorage.setItem('scrollSettings', scrollSettings.toString());
}
UpdateTransform('auto');


const dontShowAgainBox = CreateHTMLElement('div', settingsScreen, 'dontShowAgainBox', true);
const btnDontShowAgain = CreateButtonsWithLabels('btnDontShowAgain', dontShowAgainBox, "Don't Show Again", 'checkbox', false);
const btnDontShowAgainLabel = document.querySelector('#btnDontShowAgainLabel');
ChangeDisplay([btnDontShowAgain], 1);
ChangeDisplay([dontShowAgainBox], 0);
btnDontShowAgain.checked = localStorage.getItem("btnAssignment") == "false" ? true : false;
function DisplayAssignmentExplanations() {
    ChangeDisplay([settingsContainer, dontShowAgainBox], 1);

    settingsContent.innerHTML = '';
    settingsContent.scrollTop = 0;
    settingsContent.style.textAlign = 'justify';
    settingsScreen.style.width = 'fit-content';

    DET(1, '#f00', 'First, what is an assignment ?');
        DET(2, 'black', 'An assignment refers to when one of your keyboard keys is mapped to a piano key.\nFor example, by default, when you press the \'G\' key, the piano key \'F4\' is played — meaning that the keyboard key \'G\' is assigned to the piano key \'F4\'.');

    DET(1, '#f00', '\nWhat are Piano Mode and Keyboard Mode?');
        DET(2, 'black', 'You can switch between them using the dice button.');
        DET(2, '#22c', '- Keyboard Mode (🎲 showing one dot):');
            DET(3, 'black', 'In Keyboard Mode, you can assign a single computer key to each piano key.');
        DET(2, '#2c2', '- Piano Mode (🎲 showing six dots):');
            DET(3, 'black', 'In Piano Mode, you can assign multiple computer keys to the same piano key.');
        DET(2, 'black', 'Each mode remembers its own assignments. So you can modify assignments in Keyboard Mode without affecting those in Piano Mode.');


    DET(1, '#f00', '\n\nWhat about Octave Assignment?');
        DET(2, 'black', 'You can customize which octaves are currently selected. By default, octaves 3, 4, 5, and 6 are assigned.');
        DET(2, 'black', 'A great thing about this is: let\'s say you\'ve created a melody using octaves 4 and 5, but you realize it would sound better one octave lower. Normally, you\'d have to reassign all the keys manually. But here, you can simply change the octave — without even activating the key assignment mode!');
        DET(2, 'black', 'Just press the number of the octave you want to move (octave 0 corresponds to key 1, octave 1 to key 2, etc.), then press another number (1-9) where no octave is already assigned. That\'s it!');


    DET(1, '#f00', '\n\nFinally, how do you change key assignments?');
    DET(1, 'black', 'To modify your key assignments, you have three options:');
    DET(1, 'black', '- Press \'Escape\':');
        DET(2, 'black', 'This will remove all current assignments for every piano key.');
    DET(1, 'black', '- Press a piano key:');
        DET(2, 'black', 'If you press \'Escape\' while a piano key is selected, it will delete all assignments for that specific key, regardless of the current mode.');
        DET(2, 'black', 'Otherwise, press a key on your computer keyboard to assign it. The behavior depends on the current mode:');
        DET(2, '#22c', '- On Keyboard mode:');
            DET(3, '#22c', 'The newly pressed key will replace the previous one assigned to this piano key.');
        DET(2, '#2c2', '- On Piano mode:');
            DET(3, '#2c2', 'The newly pressed key will be added to the existing ones for that piano key.');
    DET(1, 'black', '- Press a key on your computer keyboard:');
        DET(2, 'black', 'If you press \'Escape\' while a keyboard key is selected, it will remove all assignments associated with that specific key, regardless of the current mode.');
        DET(2, 'black', 'Otherwise, press a new computer key to (re)assign it to the selected computer key. The behavior depends on the current mode:');
        DET(2, '#22c', '- On Keyboard mode:');
            DET(3, '#22c', 'The newly pressed key will replace any previous assignments across all the piano keys it was previously mapped to.');
        DET(2, '#2c2', '- On Piano mode:');
            DET(3, '#2c2', 'The newly pressed key will be added to all the piano keys that were already assigned to the first selected key.');

    settingsContent.firstChild.style.marginTop = '0';
}

function DET(level, color, text) { //DET is short for Display Explanations Text
    const div = CreateHTMLElement('div', settingsContent, '', true);
    div.classList.add(`level${level}`);

    if (color != 'black') div.style.color = color;
    div.textContent = text;
}



const btnDisplayExplanations = CreateHTMLElement('btn', document.querySelector('#stage1'), 'btnDisplayExplanations', true);
const explanationsIcon = CreateHTMLElement('i', btnDisplayExplanations, null, true);
explanationsIcon.classList.add('fas');
explanationsIcon.classList.add('fa-info');

function PlaceBtnDisplayExplanations() {
    PlaceElement2(
        btnChangeKeyAssignment,
        btnDisplayExplanations,
        1000,
        (parent, child) => parent.offsetTop,
        (parent, child) => parent.offsetLeft + parent.offsetWidth - child.offsetWidth / 2,
    );
}
window.addEventListener('resize', PlaceBtnDisplayExplanations);
requestAnimationFrame(PlaceBtnDisplayExplanations);

btnDisplayExplanations.addEventListener('click', DisplayAssignmentExplanations);



const btnOpenPresetAssignment = CreateHTMLElement('btn', document.querySelector('#stage1'), 'btnOpenPresetAssignment', true);
const presetAssignmentIcon = CreateHTMLElement('i', btnOpenPresetAssignment, null, true);
presetAssignmentIcon.classList.add('fas');
presetAssignmentIcon.classList.add('fa-folder');

function PlaceBtnOpenAssignmentPreset() {
    PlaceElement2(
        btnChangeKeyAssignment,
        btnOpenPresetAssignment,
        1000,
        (parent, child) => parent.offsetTop + parent.offsetHeight - child.offsetHeight,
        (parent, child) => parent.offsetLeft + parent.offsetWidth - child.offsetWidth / 2,
    );
}
window.addEventListener('resize', PlaceBtnOpenAssignmentPreset);
requestAnimationFrame(PlaceBtnOpenAssignmentPreset);

btnOpenPresetAssignment.addEventListener('click', () => {
    ChangeDisplay([pianoPresetDropdown], pianoPresetDropdown.style.display == 'none');
    PlaceElement2(
        btnOpenPresetAssignment,
        pianoPresetDropdown,
        10,
        (parent, child) => parent.getBoundingClientRect().bottom, 
        (parent, child) => parent.getBoundingClientRect().left + parent.offsetWidth / 2 - child.offsetWidth / 2
    );
});

window.addEventListener('resize', () => {
    PlaceElement2(
        btnOpenPresetAssignment,
        pianoPresetDropdown,
        1000,
        (parent, child) => parent.getBoundingClientRect().bottom,
        (parent, child) => parent.getBoundingClientRect().left + parent.offsetWidth / 2 - child.offsetWidth / 2
    );
});


const pianoPresetDropdown = document.querySelector('#pianoPresetDropdown');
pianoPresetDropdown.style.display = 'none';

document.addEventListener('click', (e) => {
    if (!btnOpenPresetAssignment.contains(e.target) && !pianoPresetDropdown.contains(e.target)) {
        ChangeDisplay([pianoPresetDropdown], 0);
    }
});

const pianoPresetHeader = CreateHTMLElement('div', pianoPresetDropdown, 'pianoPresetHeader', true);
pianoPresetHeader.textContent = 'Load a Preset';

const pianoModes = CreateHTMLElement('div', pianoPresetDropdown, 'pianoModes', true);

const pianoMode1 = CreateHTMLElement('div', pianoModes, 'pianoMode1', true);
const pianoMode2 = CreateHTMLElement('div', pianoModes, 'pianoMode2', true);

const pianoMode1Title = CreateHTMLElement('div', pianoMode1, 'pianoMode1Title', true);
const pianoMode2Title = CreateHTMLElement('div', pianoMode2, 'pianoMode2Title', true);

const diceOne = CreateHTMLElement('i', pianoMode1Title, 'diceOne', true);
diceOne.classList.add('fas');
diceOne.classList.add('fa-dice-one');
const diceSix = CreateHTMLElement('i', pianoMode2Title, 'diceSix', true);
diceSix.classList.add('fas');
diceSix.classList.add('fa-dice-six');

const pianoPreset1 = CreateHTMLElement('div', pianoMode1, 'pianoPreset1', true);
const pianoPreset2 = CreateHTMLElement('div', pianoMode2, 'pianoPreset2', true);

for (let mode = 0; mode < 2; mode++) {
    for (let preset = 0; preset < 6; preset++) {
        const row = document.createElement('div');
        row.classList.add('pianoPresetRow');
        if (preset == 5) row.style.borderBottom = 'none';
        if (mode == pianoMode && pianoPresets.selectedPreset == preset) row.classList.add('selectedPianoPreset');

        const presetNameBox = document.createElement('div');
        presetNameBox.classList.add('pianoPresetNameBox');
        const presetName = document.createElement('div');
        presetName.classList.add('pianoPresetName');
        presetName.textContent = mode ? pianoPresets.presets[preset].name2 : pianoPresets.presets[preset].name1;
        presetNameBox.appendChild(presetName);
        const presetRename = document.createElement('input');
        presetRename.id = `pianoPresetRename(${mode},${preset})`;
        presetRename.classList.add('pianoPresetRename');
        presetRename.type = 'text';
        presetNameBox.appendChild(presetRename);

        const renameBox = document.createElement('div');
        renameBox.classList.add('pianoPresetRenameBox');
        const renameBtn = document.createElement('btn');
        renameBtn.classList.add('pianoPresetRenameBtn');
        {
            const renameIcon = document.createElement('i');
            renameIcon.classList.add('fas');
            renameIcon.classList.add('fa-rename');

            renameBtn.appendChild(renameIcon);
        }
        renameBox.appendChild(renameBtn);

        const resetBox = document.createElement('div');
        resetBox.classList.add('pianoPresetResetBox');
        const resetBtn = document.createElement('btn');
        resetBtn.classList.add('pianoPresetResetBtn');
        {
            const resetIcon = document.createElement('i');
            resetIcon.classList.add('fas');
            resetIcon.classList.add('fa-reset');

            resetBtn.appendChild(resetIcon);
        }
        resetBox.appendChild(resetBtn);

        row.appendChild(presetNameBox);
        row.appendChild(renameBox);
        row.appendChild(resetBox);

        document.querySelector(`#pianoPreset${mode + 1}`).appendChild(row);

        row.addEventListener('click', (e) => {
            if (presetRename.contains(e.target) || renameBtn.contains(e.target) || resetBtn.contains(e.target)) return;
            if (row.classList.length > 1 && row.classList[1] == 'selectedPianoPreset') return;

            SelectPianoPreset(mode, preset);

            row.classList.add('selectedPianoPreset');
        });
        renameBtn.addEventListener('click', () => {
            Animate(renameBtn, 'move-bottom-left-and-spin', 1500);

            RenamePianoPreset(mode, preset, presetName, presetRename);
        });
        resetBtn.addEventListener('click', () => {
            Animate(resetBtn, 'move-left', 500);

            ResetPianoPreset(mode, preset, presetName);
        });
    }
}


function SelectPianoPreset(mode, presetIndex) {
    pianoMode = mode ? true : false;

    selectedOctaves[pianoPresets.pianoMode ? 1 : 0].forEach((number) => { visualizeSelection(number, 0); });
    selectedOctaves = pianoPresets.presets[presetIndex].selectedOctaves;
    changePianoMode(false);

    pianoPresets.pianoMode = pianoMode;
    pianoPresets.selectedPreset = presetIndex;

    localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));

    scrollX = ReturnMaxScrollX(pianoPresets.presets[pianoPresets.selectedPreset][pianoPresets.pianoMode ? 'scrollX2' : 'scrollX1']);
    scroll(false);

    sustainMode = pianoPresets.presets[pianoPresets.selectedPreset][pianoPresets.pianoMode ? 'sustainMode2' : 'sustainMode1'];
    btnToggleSustainMode.classList = sustainMode ? 'active' : 'non-active';

    UpdatePresets();

    document.querySelectorAll('.pianoPresetRow').forEach(row => {
        if (row.classList.length > 1 && row.classList[1] == 'selectedPianoPreset') {
            row.classList.remove('selectedPianoPreset');
        }
    });

    ChangeDisplay([pianoPresetDropdown], 0);
}

const MAX_NAME_LENGTH = 30;
function RenamePianoPreset(mode, presetIndex, presetName, presetRename) {
    presetRename.value = presetName.textContent;

    ChangeDisplay([presetName], 0);
    ChangeDisplay([presetRename], 1);

    presetRename.focus();
    presetRename.select();

    presetRename.onblur = () => CloseRename(mode, presetIndex, presetName, presetRename);
    presetRename.onkeydown = e => {
        if (e.key === "Enter") presetRename.blur();
    };

    presetRename.oninput = () => {
        if (presetRename.value.length > MAX_NAME_LENGTH) {
            presetRename.value = presetRename.value.slice(0, MAX_NAME_LENGTH);
        }
    };
}
function CloseRename(mode, presetIndex, presetName, presetRename) {
    const rawName = presetRename.value.trim();
    if (rawName == "") {
        ChangeDisplay([presetRename], 0);
        ChangeDisplay([presetName], 1);

        return presetRename.blur();
    }

    const allNames = [...document.querySelector(`#pianoMode${mode + 1}`).querySelectorAll(`.pianoPresetName`)].map(el => el.textContent.trim()).filter(name => name !== presetName.textContent.trim());
    const finalName = GeneratePresetName(rawName, allNames, MAX_NAME_LENGTH);
    presetName.textContent = finalName;

    pianoPresets.presets[presetIndex][mode ? 'name2' : 'name1'] = finalName;
    localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));

    ChangeDisplay([presetRename], 0);
    ChangeDisplay([presetName], 1);
}
function GeneratePresetName(baseName, existingNames, maxLength) {
    let suffix = 1;
    let newName = baseName.trim();

    if (!existingNames.includes(newName)) {
        return newName.length > maxLength ? newName.slice(0, maxLength) : newName;
    }

    while (true) {
        suffix++;
        const suffixText = ` (${suffix})`;
        const allowedLength = maxLength - suffixText.length;
        const truncatedBase = baseName.slice(0, allowedLength).trim();
        newName = truncatedBase + suffixText;

        if (!existingNames.includes(newName)) {
            return newName;
        }
    }
}

function ResetPianoPreset(mode, presetIndex, presetName) {
    if (mode) {
        pianoPresets.presets[presetIndex].name2 = presetIndex ? `Preset ${presetIndex}` : 'Default';
        pianoPresets.presets[presetIndex].computerKeys = defaultComputerKeys;
        pianoPresets.presets[presetIndex].scrollX2 = ReturnDefaultScrollX();
        pianoPresets.presets[presetIndex].sustainMode2 = defaultSustainMode;
        selectedOctaves[1] = defaultSelectedOctaves[1];
    } else {
        pianoPresets.presets[presetIndex].name1 = presetIndex ? `Preset ${presetIndex}` : 'Default';
        pianoPresets.presets[presetIndex].pianoKeys = defaultPianoKeys;
        pianoPresets.presets[presetIndex].scrollX1 = ReturnDefaultScrollX();
        pianoPresets.presets[presetIndex].sustainMode1 = defaultSustainMode;
        selectedOctaves[0] = defaultSelectedOctaves[0];
    }
    pianoPresets.presets[presetIndex].selectedOctaves = selectedOctaves;

    presetName.textContent = presetIndex ? `Preset ${presetIndex}` : 'Default';

    localStorage.setItem('pianoPresets', JSON.stringify(pianoPresets));

    const currentMode = mode ? true : false;
    if (pianoPresets.pianoMode == currentMode && pianoPresets.selectedPreset == presetIndex) {
        UpdatePresets();

        [-2, -1, 1, 2, 3, 4, 5, 6, 7].forEach((number) => { visualizeSelection(number, 0); });
        selectedOctaves[mode ? 1 : 0].forEach((number) => { visualizeSelection(number); });

        scrollX = ReturnDefaultScrollX();
        scroll(false);

        sustainMode = defaultSustainMode;
        btnToggleSustainMode.classList = sustainMode ? 'active' : 'non-active';
    }
}

