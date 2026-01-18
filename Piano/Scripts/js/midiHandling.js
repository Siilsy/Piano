
const midiInstruments = [
    "Acoustic Grand Piano", "Bright Acoustic Piano", "Electric Grand Piano", "Honky-tonk Piano",
    "Electric Piano 1", "Electric Piano 2", "Harpsichord", "Clavinet",
    "Celesta", "Glockenspiel", "Music Box", "Vibraphone",
    "Marimba", "Xylophone", "Tubular Bells", "Dulcimer",
    "Drawbar Organ", "Percussive Organ", "Rock Organ", "Church Organ",
    "Reed Organ", "Accordion", "Harmonica", "Tango Accordion",
    "Acoustic Guitar (nylon)", "Acoustic Guitar (steel)", "Electric Guitar (jazz)", "Electric Guitar (clean)",
    "Electric Guitar (muted)", "Overdriven Guitar", "Distortion Guitar", "Guitar Harmonics",
    "Acoustic Bass", "Electric Bass (finger)", "Electric Bass (pick)", "Fretless Bass",
    "Slap Bass 1", "Slap Bass 2", "Synth Bass 1", "Synth Bass 2",
    "Violin", "Viola", "Cello", "Contrabass",
    "Tremolo Strings", "Pizzicato Strings", "Orchestral Harp", "Timpani",
    "String Ensemble 1", "String Ensemble 2", "SynthStrings 1", "SynthStrings 2",
    "Choir Aahs", "Voice Oohs", "Synth Choir", "Orchestra Hit",
    "Trumpet", "Trombone", "Tuba", "Muted Trumpet",
    "French Horn", "Brass Section", "SynthBrass 1", "SynthBrass 2",
    "Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax",
    "Oboe", "English Horn", "Bassoon", "Clarinet",
    "Piccolo", "Flute", "Recorder", "Pan Flute",
    "Blown Bottle", "Shakuhachi", "Whistle", "Ocarina",
    "Lead 1 (square)", "Lead 2 (sawtooth)", "Lead 3 (calliope)", "Lead 4 (chiff)",
    "Lead 5 (charang)", "Lead 6 (voice)", "Lead 7 (fifths)", "Lead 8 (bass + lead)",
    "Pad 1 (new age)", "Pad 2 (warm)", "Pad 3 (polysynth)", "Pad 4 (choir)",
    "Pad 5 (bowed)", "Pad 6 (metallic)", "Pad 7 (halo)", "Pad 8 (sweep)",
    "FX 1 (rain)", "FX 2 (soundtrack)", "FX 3 (crystal)", "FX 4 (atmosphere)",
    "FX 5 (brightness)", "FX 6 (goblins)", "FX 7 (echoes)", "FX 8 (sci-fi)",
    "Sitar", "Banjo", "Shamisen", "Koto",
    "Kalimba", "Bagpipe", "Fiddle", "Shanai",
    "Tinkle Bell", "Agogo", "Steel Drums", "Woodblock",
    "Taiko Drum", "Melodic Tom", "Synth Drum", "Reverse Cymbal",
    "Guitar Fret Noise", "Breath Noise", "Seashore", "Bird Tweet",
    "Telephone Ring", "Helicopter", "Applause", "Gunshot"
];



const volumeContainer = document.querySelector('#volumeContainer');
const textVolumeValue = document.createElement('span');
const volumeSlider = CreateInput('volumeSlider', '0', '200', '100');
const volumeIcon = document.createElement('i');
{
    textVolumeValue.id = 'volumeValue';
    textVolumeValue.innerText = volumeSlider.value + '%';
    volumeContainer.appendChild(textVolumeValue);

    volumeSlider.step = '5';
    volumeSlider.value = '100';
    volumeContainer.appendChild(volumeSlider);

    volumeIcon.classList.add('fas');
    volumeIcon.classList.add('fa-volume-up');
    volumeContainer.appendChild(volumeIcon);
}
volumeIcon.style.fontSize = '1.5vw';
volumeIcon.style.cursor = 'crosshair';
volumeIcon.addEventListener('click', TestVolume);

if (!localStorage.getItem('volume')) localStorage.setItem('volume', '100');
volumeSlider.value = parseInt(localStorage.getItem('volume'));
textVolumeValue.innerText = volumeSlider.value + '%';

const btnRecord = document.querySelector('#btnRecord');
AttachTooltip(btnRecord, '[ Delete ]', 300);
const btnForget = document.querySelector('#btnForget');
const btnPause = document.querySelector('#btnPause');
AttachTooltip(btnPause, '[ Delete ]', 300);
const btnUpload = document.querySelector('#btnUpload');

const btnImportMid = document.querySelector('#btnImportMid');
AttachTooltip(btnImportMid, '[ Insert ]', 300);
const midiInput = document.querySelector('#midiInput');
const btnRemoveMid = document.querySelector('#btnRemoveMid');
AttachTooltip(btnRemoveMid, '[ Insert ]', 300);
const btnPlay = document.querySelector('#btnPlay');
const btnLoop = document.querySelector('#btnLoop');
const controls = document.querySelector('#controls');

ChangeDisplay([btnForget, btnPause, btnUpload, midiInput, btnRemoveMid, btnPlay, btnLoop, controls], 0);


function CreateInput(id, min, max, value, type = 'range', parent = null) {
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    if (type == 'range') {
        input.min = min;
        input.max = max;
    }
    input.value = value;
    if (parent != null) parent.appendChild(input);
    return input;
}

const progressSliderContainer = document.createElement('div');
const progressSlider = CreateInput('progressSlider', '0', '100', '0');
const progressText = document.createElement('div');
const progressValue = document.createElement('span');
const finalProgress = document.createElement('span');

const buttonsContainer = document.createElement('div');
const btnLyrics = document.createElement('btn');
const btnCopyright = document.createElement('btn');
const btnText = document.createElement('btn');
const btnMLiveTag = document.createElement('btn');

const speedContainer = document.createElement('div');
const speedSlider = CreateInput('speedSlider', '0.5', '2', '1');
const textSpeedValue = document.createElement('span');

const btnTogglingSustainMode = CreateInput('btnTogglingSustainMode', '0', '0', 'auto-toggle', 'checkbox');
AttachTooltip(btnTogglingSustainMode, 'It\'s not a default parameter because it doesn\'t work really well unfortunately...', 300);
btnTogglingSustainMode.checked = false;
const labelOfBtn = document.createElement('label');
labelOfBtn.setAttribute("for", 'btnTogglingSustainMode');
labelOfBtn.textContent = 'Sustain mode\'s auto-toggle';
{
    buttonsContainer.id = "buttonsContainer";
    btnLyrics.id = "btnLyrics";
    btnCopyright.id = "btnCopyright";
    btnText.id = "btnText";
    btnMLiveTag.id = "btnMLiveTag";

    const lyricsIcon = document.createElement('i');
    lyricsIcon.classList.add('fas');
    lyricsIcon.classList.add('fa-music');
    btnLyrics.appendChild(lyricsIcon);
    buttonsContainer.appendChild(btnLyrics);

    const copyrightIcon = document.createElement('i');
    copyrightIcon.classList.add('fas');
    copyrightIcon.classList.add('fa-copyright');
    btnCopyright.appendChild(copyrightIcon);
    buttonsContainer.appendChild(btnCopyright);

    const textIcon = document.createElement('i');
    textIcon.classList.add('fas');
    textIcon.classList.add('fa-text');
    btnText.appendChild(textIcon);
    buttonsContainer.appendChild(btnText);

    const tagIcon = document.createElement('i');
    tagIcon.classList.add('fas');
    tagIcon.classList.add('fa-tag');
    btnMLiveTag.appendChild(tagIcon);
    buttonsContainer.appendChild(btnMLiveTag);

    progressSliderContainer.appendChild(buttonsContainer);


    progressSliderContainer.id = 'progressSliderContainer';
    progressSliderContainer.appendChild(progressSlider);
    progressText.id = 'progressText';
    progressText.appendChild(progressValue);
    progressText.appendChild(finalProgress);
    progressSliderContainer.appendChild(progressText);


    speedContainer.id = 'speedContainer';
    speedSlider.step = '0.1';
    speedSlider.value = '1';
    speedContainer.appendChild(speedSlider);

    textSpeedValue.id = 'speedValue';
    textSpeedValue.innerText = speedSlider.value;
    speedContainer.appendChild(textSpeedValue);


    controls.appendChild(progressSliderContainer);
    controls.appendChild(speedContainer);
    controls.appendChild(btnTogglingSustainMode);
    controls.appendChild(labelOfBtn);
}

const settingsContainer = document.querySelector('#settingsContainer');
ChangeDisplay([settingsContainer], 0);
const settingsScreen = document.querySelector('#settingsScreen');
const settingsContent = document.createElement('div');
const btnClose = document.createElement('btn');
const btnSync = document.createElement('btn');
{
    settingsContent.id = 'settingsContent';
    settingsScreen.appendChild(settingsContent);

    btnClose.id = 'btnClose';
    const closeIcon = document.createElement('i');
    closeIcon.classList.add('fas');
    closeIcon.classList.add('fa-window-close');
    btnClose.appendChild(closeIcon);

    btnSync.id = 'btnSync';
    const syncIcon = document.createElement('i');
    syncIcon.classList.add('fas');
    syncIcon.classList.add('fa-sync-icon');
    btnSync.appendChild(syncIcon);
    const syncContent = document.createElement('div');
    syncContent.textContent = 'Sync';
    btnSync.appendChild(syncContent);

    settingsScreen.appendChild(btnClose);
    settingsScreen.appendChild(btnSync);
}
let synchronization = true;
ChangeDisplay([btnSync], 0);





class Storage { //IndexedDB Storage
    constructor() {
        this.db = null;
        this.DBName = null; //Name of the IndexedDB database
        this.fixedKey = null; //Fixed key used to store the Map()
    }

    async Init(DBName, fixedKey) {
        this.DBName = DBName;
        this.fixedKey = fixedKey;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DBName, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.DBName)) {
                    db.createObjectStore(this.DBName); // No need of keyPath here
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;

                this.db.onversionchange = () => {
                    console.warn("Version change detected. Closing database.");
                    this.db.close();
                };

                resolve();
            };

            request.onerror = () => reject("Failed to open IndexedDB");
        });
    }

    async SaveMap(map) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject("Database not initialized");

            const obj = Object.fromEntries(map); // Map → Object

            const tx = this.db.transaction(this.DBName, "readwrite");
            const store = tx.objectStore(this.DBName);

            const request = store.put(obj, this.fixedKey);

            request.onsuccess = () => resolve();
            request.onerror = () => reject("Failed to save Map");
        });
    }

    async LoadMap(NaN = false) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject("Database not initialized");

            const tx = this.db.transaction(this.DBName, "readonly");
            const store = tx.objectStore(this.DBName);

            const request = store.get(this.fixedKey);

            request.onsuccess = () => {
                let result = request.result;
                if (!result) {
                    //No Map save yet, so we create a new empty one
                    this.SaveMap(new Map());
                    result = {};
                }
                if (!NaN) {
                    resolve(new Map(
                        Object.entries(result).map(([key, val]) => [Number(key), val])
                    ));
                } else {
                    resolve(new Map(
                        Object.entries(result).map(([key, val]) => [key, val])
                    ));
                }
            };

            request.onerror = () => reject("Failed to load Map");
        });
    }
}

const midiStorage = new Storage();
let midiFileMap = new Map();

async function MidiMain() {
    try {
        await midiStorage.Init("midiFiles", "midiMap");
        // console.log("Initialized MIDI Base !"); //I don't want that to be written every time I launch my piano
    } catch (err) {
        console.error(err);
    }

    try {
        midiFileMap = await midiStorage.LoadMap();
        // console.log("MIDI files loaded :", midiFileMap); //I don't want that to be written every time I launch my piano
    } catch (err) {
        console.warn("No files loaded from IndexedDB :", err);
    }

    requestAnimationFrame(UpdateMidiHistory);
}
MidiMain();

function ToggleBitAt(str, index) {
    const char = str[index];
    if (char !== '0' && char !== '1') return str;
    const toggled = char === '0' ? '1' : '0';
    return str.slice(0, index) + toggled + str.slice(index + 1);
}

const settings = document.querySelector('#settings');
const recordFlash = CreateHTMLElement('div', document.querySelector('body'), 'recordFlash', true);
recordFlash.style.display = 'none';
function PlaceRecordFlash(time = 0) {
    PlaceElement2(
        settings,
        recordFlash,
        time,
        (parent, child) => parent.offsetTop - child.offsetHeight / 2,
        (parent, child) => parent.offsetLeft + parent.offsetWidth - child.offsetWidth / 2
    )
}
window.addEventListener('resize', () => { PlaceRecordFlash(100); });
requestAnimationFrame(() => { PlaceRecordFlash(); });

const inputSelectBox = document.querySelector('#inputSelectBox');
const midiHistoryBox = document.querySelector('#midiHistoryBox');

const inputSelectIcon = CreateHTMLElement('div', inputSelectBox, 'inputSelectIcon', true);
const midiHistoryIcon = CreateHTMLElement('div', midiHistoryBox, 'midiHistoryIcon', true);
{
    const icon1 = CreateHTMLElement('i', inputSelectIcon, 'icon1', true);
    const icon2 = CreateHTMLElement('i', midiHistoryIcon, 'icon2', true);

    icon1.classList.add('fas');
    icon2.classList.add('fas');

    icon1.classList.add('fa-microphone');
    icon2.classList.add('fa-folder');
}

const inputSelectText = CreateHTMLElement('div', inputSelectBox, 'inputSelectText', true);
const midiHistoryText = CreateHTMLElement('div', midiHistoryBox, 'midiHistoryText', true);

inputSelectText.textContent = 'Input Select';
midiHistoryText.textContent = 'MIDI History';

const inputSelectWindow = document.querySelector('#inputSelectWindow');
const midiHistoryWindow = document.querySelector('#midiHistoryWindow');
ChangeDisplay([inputSelectWindow, midiHistoryWindow], 0);

function PlaceWindow(parent, child, time) {
    PlaceElement2(
        parent,
        child,
        time,
        (parent, child) => parent.getBoundingClientRect().bottom + 5,
        (parent, child) => parent.getBoundingClientRect().left + document.querySelector('body').offsetWidth * 0.13 - child.offsetWidth / 2
    )
}

requestAnimationFrame(() => {
    PlaceWindow(inputSelectBox, inputSelectWindow, 10);
    PlaceWindow(midiHistoryBox, midiHistoryWindow, 10);
});

window.addEventListener('resize', () => {
    PlaceWindow(inputSelectBox, inputSelectWindow, 1000);
    PlaceWindow(midiHistoryBox, midiHistoryWindow, 1000);
});

inputSelectBox.addEventListener('click', () => {
    ChangeDisplay([inputSelectWindow], inputSelectWindow.style.display == 'none');
    PlaceWindow(inputSelectBox, inputSelectWindow, 10);
});
midiHistoryBox.addEventListener('click', () => {
    ChangeDisplay([midiHistoryWindow], midiHistoryWindow.style.display == 'none');
    PlaceWindow(midiHistoryBox, midiHistoryWindow, 10);
});

document.addEventListener('click', (e) => {
    if (!inputSelectWindow.contains(e.target) && !inputSelectBox.contains(e.target)) {
        ChangeDisplay([inputSelectWindow], 0);
    }
    if (!midiHistoryWindow.contains(e.target) && !midiHistoryBox.contains(e.target) && !isExporting) {
        ChangeDisplay([midiHistoryWindow], 0);
    }
});

const defaultRecordingInputs = '1:0;1:1'; //It's : first number for piano, third for midi and second and fourth for is previous setting recorded with or without sf2 sounds
if (!localStorage.getItem('recordingInputs')) localStorage.setItem('recordingInputs', defaultRecordingInputs);
let recordingInputs = localStorage.getItem('recordingInputs');

const inputsBox = CreateHTMLElement('div', inputSelectWindow, 'inputsBox', true);
const inputPianoBox = CreateHTMLElement('div', inputsBox, 'inputPianoBox', true);
const inputMidiBox = CreateHTMLElement('div', inputsBox, 'inputMidiBox', true);

const inputPiano = CreateHTMLElement('div', inputPianoBox, 'inputPiano', true);
const inputMidi = CreateHTMLElement('div', inputMidiBox, 'inputMidi', true);

const inputPianoIcon = CreateHTMLElement('div', inputPiano, 'inputPianoIcon', true);
const inputMidiIcon = CreateHTMLElement('div', inputMidi, 'inputMidiIcon', true);
{
    const color01 = parseInt(recordingInputs.split(';')[0].split(':')[0]) == 1 ? '#5c5' : '#c55';
    const color02 = parseInt(recordingInputs.split(';')[1].split(':')[0]) == 1 ? '#5c5' : '#c55';
    inputPianoIcon.style.backgroundColor = color01;
    inputPianoIcon.style.boxShadow = `0 0 10px 5px ${color01}`;
    inputMidiIcon.style.backgroundColor = color02;
    inputMidiIcon.style.boxShadow = `0 0 10px 5px ${color02}`;
}

inputPianoIcon.addEventListener('click', () => {
    recordingInputs = ToggleBitAt(recordingInputs, 0);

    const color = parseInt(recordingInputs.split(';')[0].split(':')[0]) == 1 ? '#5c5' : '#c55';
    inputPianoIcon.style.backgroundColor = color;
    inputPianoIcon.style.boxShadow = `0 0 10px 5px ${color}`;

    inputPianoIconI.classList.remove(parseInt(recordingInputs.split(';')[0].split(':')[0]) == 0 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');
    inputPianoIconI.classList.add(parseInt(recordingInputs.split(';')[0].split(':')[0]) == 1 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');

    ChangeDisplay([inputPianoSf2Mask], 1 - parseInt(recordingInputs.split(';')[0].split(':')[0]));

    localStorage.setItem('recordingInputs', recordingInputs);
});
inputMidiIcon.addEventListener('click', () => {
    recordingInputs = ToggleBitAt(recordingInputs, 4);

    const color = parseInt(recordingInputs.split(';')[1].split(':')[0]) == 1 ? '#5c5' : '#c55';
    inputMidiIcon.style.backgroundColor = color;
    inputMidiIcon.style.boxShadow = `0 0 10px 5px ${color}`;

    inputMidiIconI.classList.remove(parseInt(recordingInputs.split(';')[1].split(':')[0]) == 0 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');
    inputMidiIconI.classList.add(parseInt(recordingInputs.split(';')[1].split(':')[0]) == 1 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');

    ChangeDisplay([inputMidiSf2Mask], 1 - parseInt(recordingInputs.split(';')[1].split(':')[0]));

    localStorage.setItem('recordingInputs', recordingInputs);
});

const inputPianoText = CreateHTMLElement('div', inputPiano, 'inputPianoText', true);
const inputMidiText = CreateHTMLElement('div', inputMidi, 'inputMidiText', true);

inputPianoText.textContent = 'Piano Input';
inputMidiText.textContent = 'MIDI Input';

const inputPianoIconI = CreateHTMLElement('i', inputPianoIcon, 'inputPianoIconI', true);
const inputMidiIconI = CreateHTMLElement('i', inputMidiIcon, 'inputMidiIconI', true);
{
    inputPianoIconI.classList.add('fas');
    inputMidiIconI.classList.add('fas');
    inputPianoIconI.classList.add(parseInt(recordingInputs.split(';')[0].split(':')[0]) == 1 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');
    inputMidiIconI.classList.add(parseInt(recordingInputs.split(';')[1].split(':')[0]) == 1 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');
}

const inputPianoSf2 = CreateHTMLElement('div', inputPianoBox, 'inputPianoSf2', true);
const inputMidiSf2 = CreateHTMLElement('div', inputMidiBox, 'inputMidiSf2', true);

const inputPianoSf2Icon = CreateHTMLElement('div', inputPianoSf2, 'inputPianoSf2Icon', true);
const inputMidiSf2Icon = CreateHTMLElement('div', inputMidiSf2, 'inputMidiSf2Icon', true);
{
    const color11 = parseInt(recordingInputs.split(';')[0].split(':')[1]) == 1 ? '#5c5' : '#c55';
    const color12 = parseInt(recordingInputs.split(';')[1].split(':')[1]) == 1 ? '#5c5' : '#c55';
    inputPianoSf2Icon.style.backgroundColor = color11;
    inputPianoSf2Icon.style.boxShadow = `0 0 5px 2px ${color11}`;
    inputMidiSf2Icon.style.backgroundColor = color12;
    inputMidiSf2Icon.style.boxShadow = `0 0 5px 2px ${color12}`;
}

inputPianoSf2Icon.addEventListener('click', () => {
    recordingInputs = ToggleBitAt(recordingInputs, 2);

    const color = parseInt(recordingInputs.split(';')[0].split(':')[1]) == 1 ? '#5c5' : '#c55';
    inputPianoSf2Icon.style.backgroundColor = color;
    inputPianoSf2Icon.style.boxShadow = `0 0 10px 5px ${color}`;

    inputPianoSf2IconI.classList.remove(parseInt(recordingInputs.split(';')[0].split(':')[1]) == 0 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');
    inputPianoSf2IconI.classList.add(parseInt(recordingInputs.split(';')[0].split(':')[1]) == 1 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');

    localStorage.setItem('recordingInputs', recordingInputs);
});
inputMidiSf2Icon.addEventListener('click', () => {
    recordingInputs = ToggleBitAt(recordingInputs, 6);

    const color = parseInt(recordingInputs.split(';')[1].split(':')[1]) == 1 ? '#5c5' : '#c55';
    inputMidiSf2Icon.style.backgroundColor = color;
    inputMidiSf2Icon.style.boxShadow = `0 0 10px 5px ${color}`;

    inputMidiSf2IconI.classList.remove(parseInt(recordingInputs.split(';')[1].split(':')[1]) == 0 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');
    inputMidiSf2IconI.classList.add(parseInt(recordingInputs.split(';')[1].split(':')[1]) == 1 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');

    localStorage.setItem('recordingInputs', recordingInputs);
});

const inputPianoSf2Text = CreateHTMLElement('div', inputPianoSf2, 'inputPianoSf2Text', true);
const inputMidiSf2Text = CreateHTMLElement('div', inputMidiSf2, 'inputMidiSf2Text', true);

inputPianoSf2Text.textContent = 'SF2 Input';
inputMidiSf2Text.textContent = 'SF2 Input';

const inputPianoSf2IconI = CreateHTMLElement('i', inputPianoSf2Icon, 'inputPianoSf2IconI', true);
const inputMidiSf2IconI = CreateHTMLElement('i', inputMidiSf2Icon, 'inputMidiSf2IconI', true);
{
    inputPianoSf2IconI.classList.add('fas');
    inputMidiSf2IconI.classList.add('fas');
    inputPianoSf2IconI.classList.add(parseInt(recordingInputs.split(';')[0].split(':')[1]) == 1 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');
    inputMidiSf2IconI.classList.add(parseInt(recordingInputs.split(';')[1].split(':')[1]) == 1 ? 'fa-microphone-alt' : 'fa-microphone-alt-slash');
}

const inputPianoSf2Mask = CreateHTMLElement('div', inputPianoSf2, 'inputPianoSf2Mask', true);
const inputMidiSf2Mask = CreateHTMLElement('div', inputMidiSf2, 'inputMidiSf2Mask', true);
ChangeDisplay([inputPianoSf2Mask], 1 - parseInt(recordingInputs.split(';')[0].split(':')[0]));
ChangeDisplay([inputMidiSf2Mask], 1 - parseInt(recordingInputs.split(';')[1].split(':')[0]));



let isRecording = false;
let startRecordingTime = null;
let waitingTime = null;
let recordedMusic = new Array();
let recordingBuffer = new Map();
let recordedSustainMode = new Array();

let isExporting = false;

function ResetRecordingVariables() {
    isRecording = false;

    startRecordingTime = null;
    waitingTime = null;

    recordedMusic = new Array();
    recordingBuffer = new Map();
    recordedSustainMode = new Array();
}

btnRecord.addEventListener('click', StartPlaying);
btnPause.addEventListener('click', StopPlaying);
btnUpload.addEventListener('click', UploadFile);
btnForget.addEventListener('click', ForgetFile);

function StartPlaying() {
    isRecording = true;
    if (startRecordingTime == null) {
        recordedSustainMode.push([0, sustainMode]);
    }

    ChangeDisplay([btnRecord], 0);
    ChangeDisplay([btnForget, btnPause, recordFlash], 1);
    PlaceRecordFlash();
    recordFlash.style.animation = 'flash 1s ease-in-out infinite';
    Animate(btnPause, 'rotate-fast', 300);

    if (btnUpload.style.display == 'none') {
        ChangeDisplay([btnUpload], 1);
        Animate(btnUpload, 'rotate-fast', 300);
    }

    if (startRecordingTime != null && waitingTime != null) {
        startRecordingTime += performance.now() - waitingTime;

        const lastSustainMode = recordedSustainMode[recordedSustainMode.length - 1][1];
        if (lastSustainMode != sustainMode) recordedSustainMode.push([performance.now() - startRecordingTime, sustainMode]);
    }
}
function StopPlaying() {
    StopRecordingNotes(); //When the recording is stopped, all notes are stopped and not sustained. The user may not want it but I think it's for the best. Like if you want to record three notes to be repeated forever, you can and it will stop the notes when you stop the recording. If you want the notes to be sustained, just stop the recording until the end of the notes!

    isRecording = false;
    ChangeDisplay([btnPause, recordFlash], 0);
    ChangeDisplay([btnRecord], 1);
    btnRecord.style.marginRight = '1vw';
    Animate(btnRecord, 'rotate-fast', 300);

    waitingTime = performance.now();
}

async function UploadFile() {
    Animate(btnUpload, 'moveUp', 600);
    setTimeout(() => {
        ChangeDisplay([btnForget, btnPause, btnUpload, recordFlash], 0);
        ChangeDisplay([btnRecord], 1);
        btnRecord.style.marginRight = '0vw';
        Animate(btnRecord, 'rotate-fast', 200);
    }, 600);

    if (isRecording) StopRecordingNotes();

    if (recordedMusic.length > 0) {
        const name = `recording_${GetLocalDateString().replaceAll(':', '-').replace(' ', '_')}`;
    
        const midiBlob = CreateMidiBlob(recordedMusic, recordedSustainMode);

        await AddMidiFile(name, midiBlob);

        UpdateMidiHistory();
    }

    ResetRecordingVariables();
}
function ForgetFile() {
    Animate(btnForget, 'rotate-fast', 300);
    setTimeout(() => {
        ChangeDisplay([btnForget, btnPause, btnUpload, recordFlash], 0);
        ChangeDisplay([btnRecord], 1);
        btnRecord.style.marginRight = '0vw';
        Animate(btnRecord, 'rotate-fast', 200);
    }, 300);

    ResetRecordingVariables();
}

function GetLocalDateString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
}

function UpdateMidiHistory() {
    midiHistoryWindow.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const row = document.createElement('div');
        row.classList.add('midiRow');
        midiHistoryWindow.appendChild(row);

        if (!midiFileMap.has(i)) {
            row.classList.add('unusedRow');
            continue;
        } else {
            row.classList.add('usedRow');
        }

        const nameBox = document.createElement('div');
        nameBox.classList.add('midiNameBox');
        const name = document.createElement('div');
        name.classList.add('midiName');
        name.textContent = midiFileMap.get(i).name;
        nameBox.appendChild(name);
        const rename = document.createElement('input');
        rename.id = `midiRename(${i})`;
        rename.classList.add('midiInputRename');
        rename.type = 'text';
        nameBox.appendChild(rename);
        row.appendChild(nameBox);

        const renameBox = document.createElement('div');
        renameBox.classList.add('midiRenameBox');
        const renameBtn = document.createElement('div');
        renameBtn.classList.add('midiRename');
        {
            const icon = document.createElement('i');
            icon.classList.add('fas');
            icon.classList.add('fa-pencil');
            renameBtn.appendChild(icon);
        }
        renameBox.appendChild(renameBtn);
        row.appendChild(renameBox);

        const removeBox = document.createElement('div');
        removeBox.classList.add('midiRemoveBox');
        const removeBtn = document.createElement('div');
        removeBtn.classList.add('midiRemove');
        {
            const icon = document.createElement('i');
            icon.classList.add('fas');
            icon.classList.add('fa-trash');
            removeBtn.appendChild(icon);
        }
        removeBox.appendChild(removeBtn);
        row.appendChild(removeBox);

        const exportBox = document.createElement('div');
        exportBox.classList.add('midiExportBox');
        const exportBtn = document.createElement('div');
        exportBtn.classList.add('midiExport');
        {
            const icon = document.createElement('i');
            icon.classList.add('fas');
            icon.classList.add('fa-file-export');
            exportBtn.appendChild(icon);
        }
        exportBox.appendChild(exportBtn);
        row.appendChild(exportBox);

        row.addEventListener('click', (e) => {
            const m = e.target; //m for mouse to shorten the expression below
            if (rename.contains(m) || renameBtn.contains(m) || removeBtn.contains(m) || exportBtn.contains(m)) return;

            PlayRecordedMidiFile(i);

            ChangeDisplay([midiHistoryWindow], 0);
            scrollSettings = 3;
            UpdateTransform();
        });
        renameBtn.addEventListener('click', () => {
            Animate(renameBtn, 'move-bottom-left', 500);

            RenameMidi(i, name, rename)
        });
        removeBtn.addEventListener('click', () => {
            Animate(removeBtn, 'shake', 500);

            setTimeout(() => {
                DeleteMidiFile(i);
                UpdateMidiHistory();

                requestAnimationFrame(() => { ChangeDisplay([midiHistoryWindow], 1); });
            }, 600);
        });
        exportBtn.addEventListener('click', () => {
            isExporting = true;
            Animate(exportBtn, 'midi-move-right', 500);

            setTimeout(() => {
                ExportMidiFile(i);
                isExporting = false;
            }, 500);
        });
    }

    document.querySelector('#midiHistoryWindow > :last-child').style.borderBottom = 'none';
}
async function AddMidiFile(name, blob) {
    if (midiFileMap.size == 10) {
        const oldestId = Math.max(...midiFileMap.keys());
        midiFileMap.delete(oldestId);
    }

    const newMap = new Map();
    for (const [key, val] of midiFileMap) {
        newMap.set(key + 1, val);
    }

    newMap.set(1, { name, blob });
    midiFileMap = newMap;

    const filteredEntries = await Promise.all(
        [...midiFileMap].map(async ([key, value]) => {
            const keep = await IsBlobPersistable(value.blob.size, MAX_MID_FILE_SIZE);
            return keep ? [key, value] : null;
        })
    );

    const validEntries = filteredEntries.filter(entry => entry !== null);
    await midiStorage.SaveMap(new Map(validEntries));
}
async function PlayRecordedMidiFile(idToPlay) {
    totalTime = 0;

    speedSlider.value = speedValue;
    textSpeedValue.innerText = speedValue;

    const name = midiFileMap.get(idToPlay).name;
    const blob = midiFileMap.get(idToPlay).blob;

    try {
        const arrayBuffer = await blob.arrayBuffer();
        const midiFile = new DataView(arrayBuffer);

        ResetMidiValues();
        await ProcessMidiFile(midiFile);

        console.log(`Analysis of MIDI file completed successfully!\n${name} launched!`);
        MidiFileLoaded();
    } catch (error) {
        console.error("Non-compliant MIDI file!");
        console.error("Critical error, execution has stopped.");
        console.error(error.message);
    }
}
const MAX_MIDI_NAME_LENGTH = 35;
function RenameMidi(idToEdit, nameDiv, renameInput) {
    renameInput.value = nameDiv.textContent;

    ChangeDisplay([nameDiv], 0);
    ChangeDisplay([renameInput], 1);

    renameInput.focus();
    renameInput.select();

    renameInput.onblur = () => CloseMidiRename(idToEdit, nameDiv, renameInput);
    renameInput.onkeydown = e => {
        if (e.key === "Enter") renameInput.blur();
    };

    renameInput.oninput = () => {
        if (renameInput.value.length > MAX_MIDI_NAME_LENGTH) {
            renameInput.value = renameInput.value.slice(0, MAX_MIDI_NAME_LENGTH);
        }
    };
}
async function CloseMidiRename(idToEdit, nameDiv, renameInput) {
    const rawName = renameInput.value.trim();
    if (rawName == "") {
        ChangeDisplay([renameInput], 0);
        ChangeDisplay([nameDiv], 1);

        return renameInput.blur();
    }

    const allNames = [...document.querySelector(`#midiHistoryWindow`).querySelectorAll(`.midiName`)].map(el => el.textContent.trim()).filter(name => name !== nameDiv.textContent.trim());
    const finalName = GeneratePresetName(rawName, allNames, MAX_MIDI_NAME_LENGTH);
    nameDiv.textContent = finalName;

    midiFileMap.get(idToEdit).name = finalName;
    const filteredEntries = await Promise.all(
        [...midiFileMap].map(async ([key, value]) => {
            const keep = await IsBlobPersistable(value.blob.size, MAX_MID_FILE_SIZE);
            return keep ? [key, value] : null;
        })
    );

    const validEntries = filteredEntries.filter(entry => entry !== null);
    await midiStorage.SaveMap(new Map(validEntries));

    ChangeDisplay([renameInput], 0);
    ChangeDisplay([nameDiv], 1);
}
async function DeleteMidiFile(idToDelete) {
    if (!midiFileMap.has(idToDelete)) return;

    midiFileMap.delete(idToDelete);

    const newMap = new Map();

    for (const [key, val] of midiFileMap) {
        const newKey = key > idToDelete ? key - 1 : key;

        newMap.set(newKey, val);
    }
    midiFileMap = newMap;

    const filteredEntries = await Promise.all(
        [...midiFileMap].map(async ([key, value]) => {
            const keep = await IsBlobPersistable(value.blob.size, MAX_MID_FILE_SIZE);
            return keep ? [key, value] : null;
        })
    );

    const validEntries = filteredEntries.filter(entry => entry !== null);
    await midiStorage.SaveMap(new Map(validEntries));
}
function ExportMidiFile(idToExport) {
    if (!midiFileMap.has(idToExport)) {
        console.warn("The request MIDI file doesn't exist : ", idToExport);
        return;
    }

    const midiFile = midiFileMap.get(idToExport);

    const url = URL.createObjectURL(midiFile.blob);
 
    const a = document.createElement('a');
    a.href = url;
    a.download = midiFile.name.endsWith(".mid") ? midiFile.name : midiFile.name + ".mid";
 
    document.body.appendChild(a);
    a.click();
 
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function StopRecordingNotes() {
    const elapsedTime = Math.round(performance.now() - startRecordingTime);

    for (let i = 0; i < recordedMusic.length; i++) {
        const note = recordedMusic[i];
        if (note[0] + note[2] > elapsedTime) {
            recordedMusic[i][2] = elapsedTime - note[0];
        }
    }
}





let isPlaying = false;
let lyricsPlaying = false;
let startTime = 0;
if (!localStorage.getItem('isLooped')) localStorage.setItem('isLooped', 'false');
let isLooped = localStorage.getItem('isLooped') == 'true';
{ btnLoop.classList.add(isLooped ? 'active' : 'non-active'); }

let totalTime = 0;

let noteQueue = [];
let sustainQueue = [];
let lyricQueue = [];
let speedValue = speedSlider.value;
let volumeValue = volumeSlider.value;

const MAX_MID_FILE_SIZE = 500_000; //The maximum size for a .mid to be saved in IndexedDB is 500 Ko

const midiFilesStorage = new Storage();
let recentMidiFiles = new Map();

async function MidiFilesMain() {
    try {
        await midiFilesStorage.Init("recentMidiFiles", "midiFilesMap");
        // console.log("Initialized MIDI Base !"); //I don't want that to be written every time I launch my piano
    } catch (err) {
        console.error(err);
    }

    try {
        recentMidiFiles = Array.from(await midiFilesStorage.LoadMap(true));
        // console.log("Midi files loaded :", recentMidiFiles); //I don't want that to be written every time I launch my piano
    } catch (err) {
        console.warn("No files loaded from IndexedDB :", err);
    }

    requestAnimationFrame(UpdateRecentMidiFilesWindow);
}
MidiFilesMain();

volumeSlider.addEventListener('input', () => {
    volumeValue = volumeSlider.value;
    UpdateVolumeValue();
});
volumeSlider.addEventListener('mouseup', TestVolume);

function UpdateVolumeValue() {
    textVolumeValue.innerText = volumeValue + '%';
    if (volumeValue == 0) { volumeIcon.classList.remove(volumeIcon.classList[1]); volumeIcon.classList.add('fa-volume-off'); }
    else if (volumeValue < 100) { volumeIcon.classList.remove(volumeIcon.classList[1]); volumeIcon.classList.add('fa-volume-down'); }
    else { volumeIcon.classList.remove(volumeIcon.classList[1]); volumeIcon.classList.add('fa-volume-up'); }

    for (const inst in timeoutIds) {
        for (const touche in timeoutIds[inst]) {
            const audio = audioInstances[inst][touche];

            let velocity = (volumeValue / 100) * 0.5;
            if (volumeValue == 200 || velocity > 1) velocity = 1;

            const idx = inst.split(":")[1];
            const index = instrumentTable.findIndex(sub => sub[0] == idx);
            if (isPlaying) {
                if (instrumentTable.length > 0 && instrumentTable[index]) {
                    velocity *= instrumentTable[index][1] / 100;
                }
            }

            audio.setVolume(velocity);
        }
    }

    localStorage.setItem('volume', volumeValue.toString());
}
function TestVolume() {
    const isAnyNotePlaying = Object.values(timeoutIds).some(obj => Object.keys(obj).length > 0);

    if (!isAnyNotePlaying) {
        const audio = audioInstances['0:128']['C3'];
        audio.setVolume(Math.min(volumeValue / 100, 1));
        audio.play();
    }
}

btnImportMid.addEventListener('click', ImportMidiFile);
btnRemoveMid.addEventListener('click', RemoveMidiFile);
btnPlay.addEventListener('click', PlayMidiFile);
btnLoop.addEventListener('click', () => {
    isLooped = !isLooped;

    Animate(btnLoop, 'rotate-fast', 300);
    btnLoop.classList.remove(isLooped ? 'non-active' : 'active');
    btnLoop.classList.add(isLooped ? 'active' : 'non-active');

    btnLoop.style.backgroundColor = '#1a0410';
    btnLoop.style.boxShadow = '0 0 5px 2px #1a0410';
    btnLoop.style.color = isLooped ? '#0f0' : '#f00';
    btnLoop.style.transform = 'scale(1.1)';

    localStorage.setItem('isLooped', isLooped.toString());
});
btnLoop.addEventListener('mouseover', () => {
    btnLoop.style.backgroundColor = '#1a0410';
    btnLoop.style.boxShadow = '0 0 5px 2px #1a0410';
    btnLoop.style.color = isLooped ? '#0f0' : '#f00';
    btnLoop.style.transform = 'scale(1.1)';
});
btnLoop.addEventListener('mouseout', () => {
    btnLoop.style.backgroundColor = isLooped ? '#0f0' : '#f00';
    btnLoop.style.boxShadow = isLooped ? '0 0 5px 2px #0f0' : '0 0 5px 2px #f00';
    btnLoop.style.color = '#1a0410';
    btnLoop.style.transform = 'scale(1)';
});
progressSlider.addEventListener('input', () => {
    StopAllNotes();

    const currentTime = Math.floor(parseFloat(progressSlider.value) / 100 * totalTime);
    noteQueue = music.filter(note => note[0] >= currentTime);
    sustainQueue = sustain.filter(mode => mode[0] >= currentTime);

    const current = performance.now();
    startTime = current - currentTime / speedValue * 1000;
    if (!isPlaying) startTime -= current - startPauseTime;
    DisplayTime(currentTime, progressValue);
});
speedSlider.addEventListener('input', () => {
    const now = performance.now();
    const elapsed = (now - startTime) * speedValue;

    speedValue = speedSlider.value;
    startTime = now - (elapsed / speedValue);

    textSpeedValue.innerText = speedValue;
});
btnLyrics.addEventListener('click', DisplayLyrics);
btnCopyright.addEventListener('click', DisplayCopyright);
btnText.addEventListener('click', DisplayText);
btnMLiveTag.addEventListener('click', DisplayMLiveTag);
btnClose.addEventListener('click', CloseWindow);
window.addEventListener('keydown', (event) => {
    if (settingsContainer.style.display == 'flex' && event.code == 'Escape') CloseWindow();
});


function ImportMidiFile() {
    midiInput.click();

    totalTime = 0;

    speedSlider.value = speedValue;
    textSpeedValue.innerText = speedValue;
}
async function MidiFileLoaded() {
    Animate(btnImportMid, 'moveDown', 600);
    setTimeout(() => {
        ChangeDisplay([btnImportMid], 0);
        ChangeDisplay([btnRemoveMid, btnPlay, btnLoop, controls, instrumentSelector], 1);
        Animate(btnRemoveMid, 'rotate-fast', 300);
        Animate(btnPlay, 'rotate-fast', 300);

        ChangeDisplay([recentMidiFilesWindow], 0);
    }, 600);

    music.sort((a, b) => a[0] - b[0]);
    sustain.sort((a, b) => a[0] - b[0]);

    //Sf2 relative
    await LoadNotesFromSf2();

    for (let i = 0; i < music.length; i++) {
        const newTotalTime = music[i][0] + music[i][2];
        if (newTotalTime > totalTime) totalTime = newTotalTime;
    }

    DisplayTime(totalTime, finalProgress);
    CreateInstrumentTable();

    DisplayButtons();
    StartMusic();
    updateTime();

    if (!sustainMode) ToggleSustainMode();
}
function StartMusic() {
    isPlaying = true;
    noteQueue = [...music];
    sustainQueue = [...sustain];
    lyricQueue = [...lyrics];
    startTime = performance.now();
}

function RemoveMidiFile() {
    Animate(btnRemoveMid, 'rotate-fast', 300);
    setTimeout(() => {
        ChangeDisplay([btnRemoveMid, btnPlay, btnLoop, controls, instrumentSelector], 0);
        ChangeDisplay([btnImportMid], 1);
        Animate(btnRecord, 'rotate-fast', 200);
        Animate(btnImportMid, 'rotate-fast', 200);
    }, 300);

    StopAllNotes();
    ResetMidiValues();

    isPlaying = false;
    speedValue = 1;

    //SoundFont settings
    if (lastSelectedPresets != null) {
        for (let key of notes.keys()) {
            if (lastSelectedPresets.includes(key)) {
                if (lastSelectedPreset != null) {
                    if (key == lastSelectedPreset) {
                        continue;
                    }
                }
                cachedNotes.set(key, {
                    notes: notes.get(key),
                    time: Date.now()
                });
                notes.delete(key);
            }
        }
    }

    lastSelectedPresets = null;
}

let startPauseTime = 0;
function PlayMidiFile() {
    isPlaying = !isPlaying;

    Animate(btnPlay, 'moveRight', 500);

    const current = performance.now()
    if (isPlaying) {
        if (progressSlider.value == 100) {
            StartMusic();
        } else {
            startTime += current - startPauseTime;
        }
        updateTime();
    } else {
        StopAllNotes();

        startPauseTime = current;
    }
}

function updateTime() {
    if (!isPlaying) return;

    const now = performance.now();
    const elapsed = (now - startTime) * speedValue / 1000;

    if (btnTogglingSustainMode.checked) {
        while (sustainQueue.length > 0 && sustainQueue[0][0] <= elapsed) {
            const mode = sustainQueue.shift();
            if (sustainMode != mode[1]) ToggleSustainMode();
        }
    }
    while (noteQueue.length > 0 && noteQueue[0][0] <= elapsed) {
        const note = noteQueue.shift();
        PlayNote(note, elapsed);
    }
    if (lyricsPlaying) {
        while (lyricQueue.length > 0 && lyricQueue[0][0] <= elapsed) {
            const lyric = lyricQueue.shift();
            ScrollLyrics(lyric);
        }
    }

    DisplayTime(elapsed, progressValue);

    const currentTime = elapsed / totalTime * 100;
    progressSlider.value = currentTime;
    if (currentTime >= 100) {
        isPlaying = false;

        if (isLooped) {
            StartMusic();
        }
    }

    requestAnimationFrame(updateTime);
}

let instrumentSelectionTimer = [];
function PlayNote(note, elapsed, recording = 0) {
    const key = note[1];
    if (key < 21 || key > 108) return;
    let duration = note[2];
    let velocity = note[3];
    let inst = note[4];

    const index = instrumentTable.findIndex(sub => sub[0] == inst);
    const instrumentSelected = document.querySelector(`#instrumentList > :nth-child(${index + 1})`);
    instrumentSelected.classList.add('keyplayed_whiteKey');
    if (instrumentSelectionTimer[index] != null) clearTimeout(instrumentSelectionTimer[index]);
    instrumentSelectionTimer[index] = setTimeout(() => {
        instrumentSelected.classList.remove('keyplayed_whiteKey');
    }, 500 / speedValue);
    if (!instrumentTable[index][2]) return;

    let usedOctave = Math.floor(key / 12) - 2;
    if (usedOctave <= 0) usedOctave--;
    let usedNote = classes[key % 12];
    const keyToPlay = document.querySelector(`#octave${usedOctave} .${usedNote}`);

    const delay = (note[0] - elapsed);

    velocity = (velocity / 127) * (volumeValue / 100);
    if (volumeValue == 200 || velocity > 1) velocity = 1;
    velocity *= instrumentTable[index][1] / 100;

    const timeoutId = setTimeout(() => {
        playSound(keyToPlay, 1, velocity, inst);
        setTimeout(() => {
            playSound(keyToPlay, 2, velocity, inst);
        }, duration * 1000);
    }, delay * 1000 / speedValue);

    if (recording) timeouts.push(timeoutId);
}

function DisplayTime(actualTime, content) {
    let seconds = Math.floor(actualTime % 60);
    if (seconds < 10) seconds = '0' + seconds.toString();
    const time = Math.floor(actualTime / 60) + ':' + seconds;
    if (content == finalProgress) content.innerText = ' / ' + time;
    else if (content.innerText != time) content.innerText = time;
}



const timeouts = [];
window.addEventListener('blur', () => {
    if(!isPlaying) return;
    PlayInBackground();
});
window.addEventListener('focus', () => {
    if (!isPlaying) return;
    StopBackgroundPlayback();
    ShowLastLyric();
});

function PlayInBackground() {
    const now = performance.now();
    const elapsed = (now - startTime) * speedValue / 1000;

    if (btnTogglingSustainMode.checked) {
        for (let i = 0; i < sustainQueue.length; i++) {
            const mode = sustainQueue[i];
            if (sustainMode != mode[1]) {
                timeouts.push(setTimeout(() => {
                    ToggleSustainMode();
                }, (mode[0] - elapsed) * 1000 / speedValue));
            }
        }
    }

    for (let i = 0; i < noteQueue.length; i++) {
        note = noteQueue[i];
        PlayNote(note, elapsed, 1);
    }

    if (noteQueue.length == 0) isPlaying = false;
    else {
        const len = noteQueue.length - 1;
        timeouts.push(setTimeout(() => {
            isPlaying = false;
        }, (noteQueue[len][0] + noteQueue[len][2]) * 1000 / speedValue));
    }

    noteQueue = [];
}
function StopBackgroundPlayback() {
    for (const timeout of timeouts) {
        clearTimeout(timeout);
    }
    timeouts.length = 0;

    const now = performance.now();
    const elapsed = (now - startTime) * speedValue / 1000;
    noteQueue = music.filter(note => note[0] >= elapsed);
    sustainQueue = sustain.filter(mode => mode[0] >= elapsed);
}


function CloseWindow() {
    ChangeDisplay([settingsContainer], false);

    if (lyricsPlaying) lyricsPlaying = false;

    ChangeDisplay([btnSync, dontShowAgainBox], 0);

    localStorage.setItem("btnAssignment", btnDontShowAgain.checked ? "false" : "true");
    settingsContent.style.textAlign = 'center';
    settingsScreen.style.width = '40vw';
}

function DisplayButtons() {
    let txt = false;    //Texts
    let cop = false;    //Copyright
    let lyr = false;    //Lyrics
    let mlt = false;    //M-Live Tag

    if (textEvent.length > 0) txt = true;
    if (copyright.length > 0) cop = true;
    if (lyrics.size > 0) lyr = true;
    if (mLiveTag.size > 0) mlt = true;

    ChangeDisplay([buttonsContainer], lyr || cop || mlt || txt);
    ChangeDisplay([btnText], txt);
    ChangeDisplay([btnCopyright], cop);
    ChangeDisplay([btnLyrics], lyr);
    ChangeDisplay([btnMLiveTag], mlt);
}

function DisplayText() {
    ChangeDisplay([settingsContainer], true);

    settingsContent.innerHTML = '';
    settingsContent.scrollTop = 0;
    let i = 0;
    for (const line of textEvent) {
        const newLine = document.createElement('div');
        newLine.id = `Line${i + 1}`;
        newLine.textContent = line;
        settingsContent.appendChild(newLine);

        i++;
    }
}
function DisplayCopyright() {
    ChangeDisplay([settingsContainer], true);

    settingsContent.innerHTML = '';
    settingsContent.scrollTop = 0;
    const newLine = document.createElement('div');
    newLine.id = 'Line1';
    newLine.textContent = copyright;
    settingsContent.appendChild(newLine);
}
function DisplayLyrics() {
    ChangeDisplay([settingsContainer], true);

    lyricsPlaying = true;
    synchronization = true;
    ChangeDisplay([btnSync], 0);

    settingsContent.innerHTML = '';
    settingsContent.scrollTop = 0;
    let i = 0;
    for (const lyric of lyrics) {
        const newLine = document.createElement('div');
        newLine.id = `Line${i + 1}`;
        newLine.textContent = lyric[1];
        settingsContent.appendChild(newLine);

        i++;
    }

    if (isPlaying) {
        const now = performance.now();
        const elapsed = (now - startTime) * speedValue / 1000;
        lyricQueue = [...lyrics].filter(([key, value]) => key >= elapsed);
    }

    ShowLastLyric();
}
function DisplayMLiveTag() {
    ChangeDisplay([settingsContainer], true);

    settingsContent.innerHTML = '';
    settingsContent.scrollTop = 0;
    let i = 0;
    for (const line of mLiveTag) {
        const newLine = document.createElement('div');
        newLine.id = `Line${i + 1}`;
        newLine.textContent = `${line[0]}: ${line[1]}`;
        settingsContent.appendChild(newLine);

        i++;
    }
}

function ShowLastLyric() {
    if (!lyricsPlaying) return;

    const now = performance.now();
    const elapsed = (now - startTime) * speedValue / 1000;

    let firstElement;
    for (const i of lyrics) {
        firstElement = i[0];
        break;
    }
    if (elapsed > firstElement) {
        ScrollLyrics(lyricQueue[0]);
    }
}
function ScrollLyrics(lyric) {
    if (!lyricsPlaying) return;

    const lines = document.querySelectorAll('#settingsContent [id*="Line"]');
    if (lines.length == 0) return;
    const timing = lyric[0];
    const char = lyric[1];

    let index = 0;
    for (const event of lyrics) {
        if (event[0] == timing && event[1] == char) break;

        index++;
    }

    const containerHeight = settingsContent.clientHeight;
    const lineHeight = lines[0].clientHeight;
    const totalLines = lines.length;

    const targetLine = lines[index];

    if (targetLine) {
        if (synchronization) {
            const targetPosition = targetLine.offsetTop;
            const middlePosition = containerHeight / 2 - lineHeight / 2;

            if (targetPosition > middlePosition && index < totalLines - 1) {
                settingsContent.scrollTop = targetPosition - middlePosition;
            } else if (targetPosition < middlePosition) {
                settingsContent.scrollTop = 0;
            }
        }

        HighlightLine(index);
    }
}
let previousLine = null;
let lastTimeOut = null;
function HighlightLine(index) {
    const lines = settingsContent.querySelectorAll('#settingsContent [id*="Line"]');
    const newLine = lines[index];

    if (previousLine) {ClearLine(previousLine)}

    if (newLine) {
        newLine.classList.add('highlight');
        previousLine = newLine;
        lastTimeOut = setTimeout(() => {ClearLine(newLine)}, 1000);
    }
}
function ClearLine(line) {
    line.classList.remove('highlight');
    previousLine = null;
    clearTimeout(lastTimeOut);
    lastTimeOut = null;
}


settingsContainer.addEventListener('wheel', () => { if (synchronization) UpdateSync(); });
btnSync.addEventListener('click', UpdateSync);
function UpdateSync() {
    if (!lyricsPlaying) return;
    synchronization = !synchronization;
    ChangeDisplay([btnSync], !synchronization);
    if (synchronization) ScrollLyrics(lyricQueue[0]);
}



const recentMidiFilesWindow = document.querySelector('#recentMidiFilesWindow');
ChangeDisplay([recentMidiFilesWindow], 0);
const WTTDRMFW = 100; //Waiting Time To Display Recent Midi Files Window
const WTTRRMFW = 200; //Waiting Time To Remove Recent Midi Files Window
let midiCloseTimer = null;

btnImportMid.addEventListener('mouseenter', () => {
    if (midiCloseTimer) clearTimeout(midiCloseTimer);

    if (recentMidiFilesWindow.style.display === 'none' && recentMidiFiles.length > 0) {
        setTimeout(() => {
            PlaceElement2(
                btnImportMid,
                recentMidiFilesWindow,
                10,
                (parent, child) => parent.getBoundingClientRect().bottom + 5,
                (parent, child) => parent.getBoundingClientRect().left + parent.offsetWidth / 2 - child.offsetWidth / 2
            );

            ChangeDisplay([recentMidiFilesWindow], 1);
        }, WTTDRMFW);
    }
});
recentMidiFilesWindow.addEventListener('mouseenter', () => {
    if (midiCloseTimer) clearTimeout(midiCloseTimer);
});

btnImportMid.addEventListener('mouseleave', StartCloseTimer);
recentMidiFilesWindow.addEventListener('mouseleave', StartCloseTimer);
function StartCloseTimer() {
    midiCloseTimer = setTimeout(() => {
        ChangeDisplay([recentMidiFilesWindow], 0);
    }, WTTRRMFW);
}


function UpdateRecentMidiFilesWindow() {
    if (recentMidiFiles.length == 0) return;

    recentMidiFilesWindow.innerHTML = '';

    for (const [name, blob] of recentMidiFiles) {
        const row = document.createElement('div');
        row.classList.add('recentFilesRow');
        recentMidiFilesWindow.appendChild(row);

        const text = document.createElement('div');
        text.classList.add('recentMidiFilesName');
        text.textContent = name;
        row.appendChild(text);

        row.addEventListener('click', async () => {
            totalTime = 0;

            speedSlider.value = speedValue;
            textSpeedValue.innerText = speedValue;

            try {
                const arrayBuffer = await blob.arrayBuffer();
                const file = new DataView(arrayBuffer);

                ResetMidiValues();
                await ProcessMidiFile(file);
                console.log("Analysis of Midi file completed successfully!\n" + name + " launched!");

                //Save to recentMidiFiles
                recentMidiFiles = recentMidiFiles.filter(file => file[0] !== name);
                recentMidiFiles.unshift([name, blob]);
                if (recentMidiFiles.length > 5) {
                    recentMidiFiles.pop();
                }
                UpdateRecentMidiFilesWindow();

                ChangeDisplay([recentMidiFilesWindow], 0);

                const filteredEntries = await Promise.all(
                    [...recentMidiFiles].map(async ([name, blob]) => {
                        const keep = await IsBlobPersistable(blob.size, MAX_MID_FILE_SIZE);
                        return keep ? [name, blob] : null;
                    })
                );

                const validEntries = filteredEntries.filter(entry => entry !== null);
                await midiFilesStorage.SaveMap(new Map(validEntries));
            } catch (error) {
                console.error("Non-compliant MIDI file!");
                console.error("Critical error, execution has stopped.");
                console.error(error.message);
            }
            MidiFileLoaded();

            clearTimeout(midiCloseTimer);
            ChangeDisplay([recentMidiFilesWindow], 0);
        })
    }

    PlaceElement2(
        btnImportMid,
        recentMidiFilesWindow,
        10,
        (parent, child) => parent.getBoundingClientRect().bottom + 5,
        (parent, child) => parent.getBoundingClientRect().left + parent.offsetWidth / 2 - child.offsetWidth / 2
    );

    document.querySelector(`#recentMidiFilesWindow > :last-child`).style.borderBottom = 'none';
}


//It's in order to prevent the sliders from being focused when the user clicks on them. So they can use the arrows to move to another octave, note or anything without changing the value of the slider.
document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('mouseup', () => {
        slider.blur();
    });
    slider.addEventListener('touchend', () => {
        slider.blur();
    });
});

