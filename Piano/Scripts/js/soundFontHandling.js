
const btnSf2Settings = document.querySelector('#btnSf2Settings');
const btnImportSf2 = document.querySelector('#btnImportSf2');
AttachTooltip(btnImportSf2, '[ End ]', 300);
const sf2Input = document.querySelector('#sf2Input');


const btnRemoveSf2 = document.querySelector('#btnRemoveSf2');
AttachTooltip(btnRemoveSf2, '[ End ]', 300);
const presetSelector = document.querySelector('#presetSelector');
const btnSf2Infos = document.querySelector('#btnSf2Infos');

const instrumentSelector = document.querySelector('#instrumentSelector');

ChangeDisplay([sf2Input, btnRemoveSf2, presetSelector, instrumentSelector, btnSf2Infos], 0);

btnImportSf2.addEventListener('click', ImportSf2File);
btnRemoveSf2.addEventListener('click', RemoveSf2File);
btnSf2Infos.addEventListener('click', ShowSf2Info);

let cacheCleaner = null;

const MAX_SF2_FILE_SIZE = 20_000_000; //The maximum size for a .sf2 to be saved in IndexedDB is 20 Mo

const sf2FilesStorage = new Storage();
let recentSf2Files = new Map();

async function Sf2FilesMain() {
    try {
        await sf2FilesStorage.Init("recentSf2Files", "sf2FilesMap");
        // console.log("Initialized SF2 Base !"); //I don't want that to be written every time I launch my piano
    } catch (err) {
        console.error(err);
    }

    try {
        recentSf2Files = Array.from(await sf2FilesStorage.LoadMap(true))
        // console.log("Sf2 files loaded :", recentSf2Files); //I don't want that to be written every time I launch my piano
    } catch (err) {
        console.warn("No files loaded from IndexedDB :", err);
    }

    requestAnimationFrame(UpdateRecentSf2FilesWindow);
}
Sf2FilesMain();

function ImportSf2File() {
    sf2Input.click();

    cacheCleaner = setInterval(() => {
        const now = Date.now();
        for (const [preset, { time }] of cachedNotes) {
            if (now - time > 5 * 60 * 1000) {
                cachedNotes.delete(preset);
                console.log(`Preset ${preset} removed from cache.`);
            }
        }
    }, 60 * 1000);
}
function Sf2FileLoaded() {
    Animate(btnImportSf2, 'moveDown', 600);

    if (Object.keys(infoData).length != 0) btnRemoveSf2.style.marginLeft = '7vw';
    else btnRemoveSf2.style.marginLeft = '0vw';

    setTimeout(() => {
        ChangeDisplay([btnImportSf2], 0);
        ChangeDisplay([btnRemoveSf2, presetSelector], 1);
        if (Object.keys(infoData).length != 0) ChangeDisplay([btnSf2Infos], 1);
        Animate(btnRemoveSf2, 'rotate-fast', 300);
        Animate(btnSf2Settings, 'rotate-fast', 300);
        Animate(btnSf2Infos, 'moveDown', 300);

        ChangeDisplay([recentSf2FilesWindow], 0);
    }, 600);

    presets.sort((a, b) => {
        if (a.bankID !== b.bankID) return a.bankID - b.bankID;
        return a.presetID - b.presetID;
    });

    CreatePresetTable();

    drumKits = presets.filter(preset => preset.bankID == 128);
    if (!drumKits.some(preset => preset.presetID == defaultDrumKit)) {
        defaultDrumKit = drumKits[0].presetID;
        localStorage.setItem('defaultDrumKit', defaultDrumKit.toString());
    }
}

function RemoveSf2File() {
    Animate(btnRemoveSf2, 'rotate-fast', 300);
    setTimeout(() => {
        ChangeDisplay([btnRemoveSf2, presetSelector, btnSf2Infos], 0);
        ChangeDisplay([btnImportSf2], 1);
        Animate(btnImportSf2, 'rotate-fast', 200);
        Animate(btnSf2Settings, 'rotate-fast', 200);
    }, 300);

    StopAllNotes(true);
    ResetSf2Values();
    RemoveUndefinedNotes();

    instrumentTable = [];
    CreateInstrumentTable();

    lastSelectedPreset = null;
    lastSelectedPresets = null;

    clearInterval(cacheCleaner);
    cacheCleaner = null;
}


const presetDropdown = document.querySelector('#presetDropdown');
window.addEventListener('resize', () => {  PlaceElement(presetSelector, presetDropdown, 1000); });

const presetList = document.querySelector('#presetList');
const selectedPreset = document.querySelector('#selectedPreset');
function CreatePresetTable() {
    selectedPreset.textContent = 'No instrument';
    presetList.innerHTML = '';
    {
        const firstRow = document.createElement('div');
        firstRow.className = 'presetRow';
    
        const name = document.createElement('div');
        name.className = 'presetName';
        name.textContent = 'None';
        const bankID = document.createElement('div');
        bankID.className = 'bankID';
        bankID.textContent = 'ø';
        const presetID = document.createElement('div');
        presetID.className = 'presetID';
        presetID.textContent = 'ø';
    
        firstRow.appendChild(name);
        firstRow.appendChild(bankID);
        firstRow.appendChild(presetID);

        firstRow.addEventListener('click', DeselectPreset);
        
        presetList.appendChild(firstRow);
    }

    presets.forEach(preset => {
        const row = document.createElement('div');
        row.className = 'presetRow';

        const name = document.createElement('div');
        name.className = 'presetName';
        name.textContent = preset.name;
        const bankID = document.createElement('div');
        bankID.className = 'bankID';
        bankID.textContent = preset.bankID;
        const presetID = document.createElement('div');
        presetID.className = 'presetID';
        presetID.textContent = preset.presetID;

        row.appendChild(name);
        row.appendChild(bankID);
        row.appendChild(presetID);

        row.addEventListener('click', () => {
            GetNotesFromPreset(preset);
        });

        presetList.appendChild(row);
    });
}
selectedPreset.addEventListener('click', () => {
    presetDropdown.style.display = presetDropdown.style.display == 'flex' ? 'none' : 'flex';
    PlaceElement(presetSelector, presetDropdown);
});
document.addEventListener('click', (e) => {
    if (!document.querySelector('#presetSelector').contains(e.target)) {
        presetDropdown.style.display = 'none';
    }
});

async function GetNotesFromPreset(preset) {
    selectedPreset.textContent = `${preset.name} (Bank: ${preset.bankID}, Preset: ${preset.presetID})`;
    presetDropdown.style.display = 'none';
    const presetName = `${preset.bankID}:${preset.presetID}`;

    if (lastSelectedPreset != null) {
        for (let key of notes.keys()) {
            if (key == lastSelectedPreset) {
                if (lastSelectedPresets != null) {
                    if (lastSelectedPresets.includes(key)) {
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

    await AnalyzeData([presetName], 5);

    lastSelectedPreset = presetName;

    VisualizeDefinedNotes(presetName);
}
function VisualizeDefinedNotes(presetName) {
    const currentNotes = notes.get(presetName);

    RemoveUndefinedNotes();
    for (let key = 21; key < 109; key++) {
        let octave = Math.floor(key / 12) - 2;
        if (octave <= 0) octave--;
        let note = classes[key % 12];
        const currentKey = document.querySelector(`#octave${octave} .${note}`);

        let childNumber;
        for (let i = 0; i < classes.length; i++) {
            if (note == classes[i]) {childNumber = i + 1; break;}
        }
        if (octave == -2) {childNumber -= 9;}
        let miniOctave = parseInt(octave) + 1;
        if (octave < 0) {miniOctave += 1;}
        const miniPianoKey = document.querySelector(`#octav_${miniOctave} > :nth-child(${childNumber})`);

        if (!currentNotes.has(note + octave)) {
            currentKey.classList.add(`undefinedKey`);
            miniPianoKey.classList.add(`undefinedKey`);
        }
    }
}

function RemoveUndefinedNotes() {
    for (let key = 21; key < 109; key++) {
        let octave = Math.floor(key / 12) - 2;
        if (octave <= 0) octave--;
        let note = classes[key % 12];
        const currentKey = document.querySelector(`#octave${octave} .${note}`);

        let childNumber;
        for (let i = 0; i < classes.length; i++) {
            if (note == classes[i]) {childNumber = i + 1; break;}
        }
        if (octave == -2) {childNumber -= 9;}
        let miniOctave = parseInt(octave) + 1;
        if (octave < 0) {miniOctave += 1;}
        const miniPianoKey = document.querySelector(`#octav_${miniOctave} > :nth-child(${childNumber})`);

        currentKey.classList.remove(`undefinedKey`);
        miniPianoKey.classList.remove(`undefinedKey`);
    }
}

function DeselectPreset() {
    selectedPreset.textContent = 'No instrument';
    RemoveUndefinedNotes();

    presetDropdown.style.display = 'none';
    if (lastSelectedPreset != null) {
        for (let key of notes.keys()) {
            if (key == lastSelectedPreset) {
                if (lastSelectedPresets != null) {
                    if (lastSelectedPresets.includes(key)) {
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

    lastSelectedPreset = null;
}

async function LoadNotesFromSf2() {
    if (presets.length == 0) return;

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

    let instrumentsToLoad = ExtractInstruments();

    await AnalyzeData(instrumentsToLoad, 40);

    lastSelectedPresets = instrumentsToLoad;
}
function ExtractInstruments() {
    let instList = [];

    for (let i = 0; i < music.length - 1; i++) {
        const currentInst = music[i][4];
        let bank = 0;
        let preset = currentInst;
        if (currentInst == 128) {
            bank = 128;
            preset = defaultDrumKit;
        }
        const instName = `${bank}:${preset}`;
        if (!instList.includes(instName)) instList.push(instName);
    }

    return instList
}


const instrumentDropdown = document.querySelector('#instrumentDropdown');
window.addEventListener('resize', () => { PlaceElement(instrumentSelector, instrumentDropdown, 1000); });

const instrumentList = document.querySelector('#instrumentList');
function CreateInstrumentTable() {
    instrumentList.innerHTML = '';

    let insts = ExtractInstruments();
    insts.forEach((inst) => {
        const match = inst.match(/^(\d+):(\d+)$/)
        const bank = parseInt(match[1]);
        let preset = parseInt(match[2]);
        if (bank == 128) preset = 128;

        let state = true;
        if (presets.length == 0) {
            if (preset > 24 || bank == 128) state = false;
        }

        instrumentTable.push([preset, 100, state]);
    });
    instrumentTable = instrumentTable.sort((a, b) => a[0] - b[0]);

    for (let inst of instrumentTable) {
        const row = document.createElement('div');
        row.className = 'instrumentRow';

        const name = document.createElement('div');
        name.className = 'instrumentName';
        name.textContent = inst[0] == 128 ? "Percussions" : midiInstruments[inst[0]];
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.className = 'instrumentVolumeSlider';
        volumeSlider.min = 0;
        volumeSlider.max = 100;
        volumeSlider.step = 1;
        volumeSlider.value = inst[1];
        const volumeValue = document.createElement('div');
        volumeValue.className = 'instrumentVolumeValue';
        volumeValue.textContent = `${inst[1]}`;

        const volumeContainer = document.createElement('div');
        volumeContainer.className = 'instrumentVolumeContainer';
        volumeContainer.appendChild(volumeSlider);
        volumeContainer.appendChild(volumeValue);

        const nameAndVolume = document.createElement('div');
        nameAndVolume.className = 'nameAndVolume';
        nameAndVolume.appendChild(name);
        nameAndVolume.appendChild(volumeContainer);

        const state = document.createElement('div');
        state.className = 'instrumentState';
        const btnState = document.createElement('div');
        btnState.className = 'instrumentBtnState';
        btnState.style.backgroundColor = inst[2] ? '#0d0' : '#d00';
        const logo = document.createElement('i');
        ApplyLogoVolume(inst, logo);
        btnState.appendChild(logo);
        state.appendChild(btnState);

        row.appendChild(nameAndVolume);
        row.appendChild(state);

        volumeSlider.addEventListener('input', () => {
            volumeValue.textContent = `${volumeSlider.value}`;

            const index = instrumentTable.findIndex(sub => sub[0] == inst[0]);
            instrumentTable[index][1] = volumeSlider.value;

            ApplyLogoVolume(inst, logo);

            ApplyVolumeOnCurrentSongs(inst);
        });
        state.addEventListener('click', () => {
            const index = instrumentTable.findIndex(sub => sub[0] == inst[0]);
            instrumentTable[index][2] = !instrumentTable[index][2];

            btnState.style.backgroundColor = instrumentTable[index][2] ? '#0d0' : '#d00';

            ApplyLogoVolume(inst, logo);

            ApplyVolumeOnCurrentSongs(inst);
        });

        instrumentList.appendChild(row);
    }
}
document.querySelector('#instrumentSelectorTitle').addEventListener('click', () => {
    instrumentDropdown.style.display = instrumentDropdown.style.display == 'flex' ? 'none' : 'flex';
    PlaceElement(instrumentSelector, instrumentDropdown);
});
document.addEventListener('click', (e) => {
    if (!document.querySelector('#instrumentSelector').contains(e.target) && !instrumentDropdown.contains(e.target)) {
        instrumentDropdown.style.display = 'none';
    }
});

function ApplyLogoVolume(inst, logo) {
    let logoState = "mute";
    if (inst[2]) {
        if (inst[1] == 0) logoState = "off";
        else if (inst[1] <= 50) logoState = "down";
        else logoState = "up";
    }

    logo.className = 'fas';
    logo.classList.add(`fa-volume-${logoState}`);
}

function GetInstrument(canal) {
    let inst = '0:128';
    let isSustainable = true;

    //Either it selected the basic piano (0:128), either the instrument that you're playing with the current .sf2
    const isSf2 = !!((canal === 256 && lastSelectedPreset) || (canal !== 256 && lastSelectedPresets));
    if (!isSf2) return { inst, isSustainable };

    if (canal != 256) {
        if (canal > 15) isSustainable = false;

        if (canal != 128) inst = `0:${canal}`;
        else inst = `128:${defaultDrumKit}`;
    }
    if (canal == 256) {
        inst = lastSelectedPreset;

        if (lastSelectedPreset.split(":")[1] > 15) isSustainable = false;
    }

    return { inst, isSustainable };
}

function ApplyVolumeOnCurrentSongs(inst) {
    for (const inst in timeoutIds) {
        if (inst != instrumentTable[inst[0]]) continue;
        for (const touche in timeoutIds[inst]) {
            const audio = audioInstances[inst][touche];
            audio.setVolume(inst[2] ? inst[1] : 0);
        }
    }
}

function ShowSf2Info() {
    ChangeDisplay([settingsContainer], true);

    const infoTable = {
        'ICMT' : 'Comments', 
        'ICOP' : 'Copyright', 
        'IENG' : 'Sound Designers and Engineers for the Bank', 
        'INAM' : 'Sound Font Bank Name', 
        'ICRD' : 'Date of creation of the bank',
    }

    settingsContent.innerHTML = '';
    settingsContent.scrollTop = 0;
    let i = 0;
    for (const key in infoData) {
        const newLineTitle = document.createElement('div');
        newLineTitle.id = `Line${i + 1}`;
        newLineTitle.textContent = `${infoTable[key]}:`;
        newLineTitle.classList.add('highlight');
        settingsContent.appendChild(newLineTitle);

        const newLineContent = document.createElement('div');
        newLineContent.id = `Line${i + 1}`;
        newLineContent.textContent = `${infoData[key]}`;
        settingsContent.appendChild(newLineContent);

        i += 2;
    }
}



btnSf2Settings.addEventListener('click', () => {
    ChangeDisplay([sf2SettingsContainer], 1);

    //fileLength > 0 allows me to know if a .sf2 is opened or not
    if (fileLength > 0) {
        sf2DrumKitNotes.textContent = 'Select the default drum kit used when playing .mid files.';
        sf2DrumKitNotes.style.fontSize = 'medium';
        sf2DrumKitNotes.style.paddingBottom = '1.75vw';
        ChangeDisplay([sf2DrumKitDropdown], 1);
    }
    else {
        sf2DrumKitNotes.textContent = 'Import a file .sf2 to select the default DrumKit.';
        sf2DrumKitNotes.style.fontSize = '3.5vw';
        sf2DrumKitNotes.style.paddingBottom = '0%';
        ChangeDisplay([sf2DrumKitDropdown], 0);
    }

    if (fileLength > 0) {
        sf2DrumKitDropdown.innerHTML = '';

        const sf2DrumKitDropdownHeader = CreateHTMLElement('div', sf2DrumKitDropdown, 'sf2DrumKitDropdownHeader', true);
        sf2DrumKitDropdownHeader.id = 'sf2PresetHeader';
        const sf2HeaderPresetName = CreateHTMLElement('div', sf2DrumKitDropdownHeader, 'sf2HeaderPresetName', true);
        sf2HeaderPresetName.classList.add('sf2PresetName');
        sf2HeaderPresetName.textContent = 'Name';
        const sf2HeaderPresetID = CreateHTMLElement('div', sf2DrumKitDropdownHeader, 'sf2HeaderPresetID', true);
        sf2HeaderPresetID.classList.add('sf2PresetID');
        sf2HeaderPresetID.textContent = 'Preset';

        const sf2DropdownPresetList = CreateHTMLElement('div', sf2DrumKitDropdown, 'sf2DropdownPresetList', true);
        drumKits.forEach(drumKit => {
            const row = document.createElement('div');
            row.className = 'sf2PresetRow';

            const name = document.createElement('div');
            name.className = 'sf2PresetName';
            name.textContent = drumKit.name;
            const presetID = document.createElement('div');
            presetID.className = 'sf2PresetID';
            presetID.textContent = drumKit.presetID;

            row.appendChild(name);
            row.appendChild(presetID);

            row.addEventListener('click', () => { BecomingSelectedDrumKit(row, drumKit.presetID); });

            if (drumKit.presetID == defaultDrumKit) row.classList.add('selectedDrumKit');

            sf2DropdownPresetList.appendChild(row);
        });
    }
});

function BecomingSelectedDrumKit(selectedRow, selectedPresetID) {
    document.querySelectorAll('#sf2DropdownPresetList .sf2PresetRow').forEach(row => {
        if (row.classList.length > 1 && row.classList[1] == 'selectedDrumKit') {
            row.classList.remove('selectedDrumKit');
        }
    });

    selectedRow.classList.add('selectedDrumKit');

    defaultDrumKit = selectedPresetID;
}

const sf2SettingsContainer = document.querySelector('#sf2SettingsContainer');
const sf2SettingsScreen = document.querySelector('#sf2SettingsScreen');
const sf2SettingsTitle = CreateHTMLElement('div', sf2SettingsContainer, 'sf2SettingsTitle', true);
sf2SettingsTitle.innerText = 'SoundFont Settings';

const sf2SettingsWindowContainer = CreateHTMLElement('div', sf2SettingsContainer, 'sf2SettingsWindowContainer', true);
const sf2SettingsWindow = CreateHTMLElement('div', sf2SettingsWindowContainer, 'sf2SettingsWindow', true);

const sf2WindowText = CreateHTMLElement('div', sf2SettingsWindow, 'sf2WindowText', true);
const sf2WindowBtns = CreateHTMLElement('div', sf2SettingsWindow, 'sf2WindowBtns', true);

const sf2CancelBtn = CreateHTMLElement('btn', sf2WindowBtns, 'sf2CancelBtn', true);
sf2CancelBtn.textContent = 'Cancel';
const sf2ConfirmBtn = CreateHTMLElement('btn', sf2WindowBtns, 'sf2ConfirmBtn', true);
sf2ConfirmBtn.textContent = 'Confirm';


ChangeDisplay([sf2SettingsContainer, sf2SettingsWindowContainer], 0);


const sf2Settings = CreateHTMLElement('div', sf2SettingsScreen, 'sf2Settings', true);
const sf2Controls = CreateHTMLElement('div', sf2SettingsScreen, 'sf2Controls', true);

const leftSide = CreateHTMLElement('div', sf2Settings, 'leftSide', true);
const rightSide = CreateHTMLElement('div', sf2Settings, 'rightSide', true);

const trimFileBox = CreateHTMLElement('div', leftSide, 'trimFileBox', true);
const allNotesBox = CreateHTMLElement('div', leftSide, 'allNotesBox', true);

const trimFileBtn = CreateButtonsWithLabels('trimFileBtn', trimFileBox, 'Trim long WAV files');
AttachTooltip(document.querySelector('#trimFileBtnLabel'), ` • If enabled, all notes will have the exact same duration, defined by 'Default WAV duration'\n • If disabled, each note will use its natural duration, up to the 'Max WAV duration' limit`, 300);

const sf2MaxDurationBox = CreateHTMLElement('div', trimFileBox, 'sf2MaxDurationBox', true);
const sf2MaxDurationText = CreateHTMLElement('div', sf2MaxDurationBox, 'sf2MaxDurationTxt', true);
sf2MaxDurationText.innerText = `Max WAV file duration : ${maxWavFileDuration} s`;
const sf2MaxDurationSlider = CreateInput('sf2MaxDurationSlider', 5, 20, 1, 'range', sf2MaxDurationBox);
sf2MaxDurationSlider.step = '1';
sf2MaxDurationSlider.value = maxWavFileDuration;
AttachTooltip(sf2MaxDurationBox, 'Maximum allowed length for a generated WAV file', 300);

const sf2DefaultDurationBox = CreateHTMLElement('div', trimFileBox, 'sf2DefaultDurationBox', true);
const sf2DefaultDurationText = CreateHTMLElement('div', sf2DefaultDurationBox, 'sf2DefaultDurationTxt', true);
sf2DefaultDurationText.innerText = `Default WAV duration : ${wavFileDuration} s`;
const sf2DefaultDurationSlider = CreateInput('sf2DefaultDurationSlider', 3, 15, 1, 'range', sf2DefaultDurationBox);
sf2DefaultDurationSlider.step = '1';
sf2DefaultDurationSlider.value = wavFileDuration;
AttachTooltip(sf2DefaultDurationBox, 'Fixed duration applied to all notes', 300);

if (cutWavFileLength) {
    trimFileBtn.checked = true;
    ChangeColor(trimFileBtn);

    ChangeDisplay([sf2MaxDurationBox], 0);
} else {
    ChangeDisplay([sf2DefaultDurationBox], 0);
}


trimFileBtn.addEventListener('click', () => {
    if (trimFileBtn.checked) {
        ChangeDisplay([sf2MaxDurationBox], 0);
        ChangeDisplay([sf2DefaultDurationBox], 1);
    } else {
        ChangeDisplay([sf2MaxDurationBox], 1);
        ChangeDisplay([sf2DefaultDurationBox], 0);
    }
});

sf2MaxDurationSlider.addEventListener('input', () => {
    sf2MaxDurationText.innerText = `Max WAV file duration : ${sf2MaxDurationSlider.value} s`;
});
sf2DefaultDurationSlider.addEventListener('input', () => {
    sf2DefaultDurationText.innerText = `Default WAV duration : ${sf2DefaultDurationSlider.value} s`;
});


const allNotesBtn = CreateButtonsWithLabels('allNotesBtn', allNotesBox, 'Generate notes for all 88 keys');
if (createFileForAllNotes) {
    allNotesBtn.checked = true;
    ChangeColor(allNotesBtn);
}
AttachTooltip(document.querySelector('#allNotesBtnLabel'), '• By default, only notes defined in the SoundFont file will be generated\n • Enable this option to generate files for all 88 piano keys(A0 to C8), even if not defined\n • Note: quality may vary for missing notes', 300);



const sf2DrumKitTitle = CreateHTMLElement('div', rightSide, 'sf2DrumKitTitle', true);
sf2DrumKitTitle.textContent = 'Default DrumKit';
const sf2DrumKitOther = CreateHTMLElement('div', rightSide, 'sf2DrumKitOther', true);
const sf2DrumKitNotes = CreateHTMLElement('div', sf2DrumKitOther, 'sf2DrumKitNotes', true);
sf2DrumKitNotes.textContent = 'Import a file .sf2 to select the default DrumKit.';
const sf2DrumKitDropdown = CreateHTMLElement('div', sf2DrumKitOther, 'sf2DrumKitDropdown', true);



const sf2ResetBtn = CreateHTMLElement('btn', sf2Controls, 'sf2ResetBtn', true);
const sf2ResetText = CreateHTMLElement('div', sf2ResetBtn, 'sf2ResetText', true);
const sf2ApplyBtn = CreateHTMLElement('btn', sf2Controls, 'sf2ApplyBtn', true);
const sf2AnnulBtn = CreateHTMLElement('btn', sf2Controls, 'sf2AnnulBtn', true);
sf2ResetText.textContent = 'Reset to Default';
sf2ApplyBtn.textContent = 'Apply';
sf2AnnulBtn.textContent = 'Cancel';
AttachTooltip(sf2ResetBtn, 'Reset all settings to their default values', 300);
AttachTooltip(sf2ApplyBtn, 'Apply settings for future imports', 300);
AttachTooltip(sf2AnnulBtn, 'Cancel and restore previous settings', 300);

sf2ResetBtn.addEventListener('mouseover', () => {
    sf2ResetText.style.backgroundColor = '#222';
    sf2ResetText.style.color = '#ddd';
});
sf2ResetBtn.addEventListener('mouseout', () => {
    sf2ResetText.style.backgroundColor = '#ddd';
    sf2ResetText.style.color = '#000';
});


sf2ResetBtn.addEventListener('click', () => {
    Animate(sf2ResetText, 'sf2-move-right', 600);
    setTimeout(() => {
        ResetSf2Settings();
    }, 600);
});
//There's some code in comments because when I reset the settings, I don't want to overwrite the settings immediatly. If you want to, just apply the settings by yourself
function ResetSf2Settings() {
    if (trimFileBtn.checked != defaultCutWavFileLength) {
        cutWavFileLength = defaultCutWavFileLength;
        ChangeColor(trimFileBtn);
        trimFileBtn.checked = cutWavFileLength;
        // localStorage.setItem('cutWavFileLength', cutWavFileLength.toString());

        ChangeDisplay([sf2MaxDurationBox], 0);
        ChangeDisplay([sf2DefaultDurationBox], 1);
    }
    if (sf2MaxDurationSlider.value != defaultMaxWavFileDuration) {
        maxWavFileDuration = defaultMaxWavFileDuration;
        sf2MaxDurationText.innerText = `Max WAV file duration : ${maxWavFileDuration} s`;
        sf2MaxDurationSlider.value = maxWavFileDuration;
        // localStorage.setItem('maxWavFileDuration', maxWavFileDuration.toString());
    }
    if (sf2DefaultDurationSlider.value != defaultWavFileDuration) {
        wavFileDuration = defaultWavFileDuration;
        sf2DefaultDurationText.innerText = `Default WAV duration : ${wavFileDuration} s`;
        sf2DefaultDurationSlider.value = wavFileDuration;
        // localStorage.setItem('wavFileDuration', wavFileDuration.toString());
    }
    if (allNotesBtn.checked != defaultCreateFileForAllNotes) {
        createFileForAllNotes = defaultCreateFileForAllNotes;
        ChangeColor(allNotesBtn);
        allNotesBtn.checked = createFileForAllNotes;
        // localStorage.setItem('createFileForAllNotes', createFileForAllNotes.toString());
    }

    if (defaultDrumKit != drumKits[0].presetID) {
        defaultDrumKit = drumKits[0].presetID;
        document.querySelectorAll('#sf2DropdownPresetList .sf2PresetRow').forEach(row => {
            if (row.classList.length > 1 && row.classList[1] == 'selectedDrumKit') {
                row.classList.remove('selectedDrumKit');
            }
        });
        document.querySelector('#sf2DropdownPresetList > :first-child').classList.add('selectedDrumKit');
    }
}


sf2ApplyBtn.addEventListener('click', () => {
    ChangeDisplay([sf2SettingsWindowContainer], 1);

    sf2WindowText.innerHTML = '';

    let preImportChange = false;
    if (trimFileBtn.checked != (localStorage.getItem('cutWavFileLength') == 'true')) {
        cutWavFileLength = trimFileBtn.checked;
        localStorage.setItem('cutWavFileLength', cutWavFileLength.toString());

        preImportChange = true;
    }
    if (sf2MaxDurationSlider.value != parseInt(localStorage.getItem('maxWavFileDuration'))) {
        maxWavFileDuration = sf2MaxDurationSlider.value;
        localStorage.setItem('maxWavFileDuration', maxWavFileDuration.toString());

        preImportChange = true;
    }
    if (sf2DefaultDurationSlider.value != parseInt(localStorage.getItem('wavFileDuration'))) {
        wavFileDuration = sf2DefaultDurationSlider.value;
        localStorage.setItem('wavFileDuration', wavFileDuration.toString());

        preImportChange = true;
    }
    if (allNotesBtn.checked != (localStorage.getItem('createFileForAllNotes') == 'true')) {
        createFileForAllNotes = allNotesBtn.checked;
        localStorage.setItem('createFileForAllNotes', createFileForAllNotes.toString());

        preImportChange = true;
    }

    let postImportChange = false;
    if (defaultDrumKit != parseInt(localStorage.getItem('defaultDrumKit'))) {
        localStorage.setItem('defaultDrumKit', defaultDrumKit.toString());

        postImportChange = true;
    }

    if (!preImportChange && !postImportChange) CloseSf2SettingsWindow();

    const numberOfLines = fileLength > 0 ? 6 : 2;
    for (let i = 0; i < numberOfLines; i++) {
        const newLine = CreateHTMLElement('div', sf2WindowText, `row_${i}`, true);

        if (i == 0) newLine.textContent = 'These settings affect how the SF2 sound is processed and exported.';
        if (i == 1) newLine.textContent = '\nHigh quality options may slow down import times.';
        if (i == 2 && preImportChange) newLine.textContent = '\nChanges only affect future imports.';
        if (i == 3 && preImportChange) newLine.textContent = 'Re-import a SoundFont to apply them.';
        if (i == 4 && postImportChange) newLine.textContent = '\nThe selected default DrumKit only affects future MIDI playback.';
        if (i == 5 && postImportChange) newLine.textContent = 'To hear the changes, replay your MIDI file.';
    }
});

sf2AnnulBtn.addEventListener('click', PutBackPreviousValues);
function PutBackPreviousValues() {
    if (trimFileBtn.checked != (localStorage.getItem('cutWavFileLength') == 'true')) {
        cutWavFileLength = (localStorage.getItem('cutWavFileLength') == 'true');
        trimFileBtn.checked = cutWavFileLength;
        ChangeColor(trimFileBtn);
        ChangeDisplay([sf2MaxDurationBox], cutWavFileLength ? 0 : 1);
        ChangeDisplay([sf2DefaultDurationBox], cutWavFileLength ? 1 : 0);
    }
    if (sf2MaxDurationSlider.value != parseInt(localStorage.getItem('maxWavFileDuration'))) {
        maxWavFileDuration = parseInt(localStorage.getItem('maxWavFileDuration'));
        sf2MaxDurationSlider.value = maxWavFileDuration;
        sf2MaxDurationText.innerText = `Max WAV file duration : ${maxWavFileDuration} s`;
    }
    if (sf2DefaultDurationSlider.value != parseInt(localStorage.getItem('wavFileDuration'))) {
        wavFileDuration = parseInt(localStorage.getItem('wavFileDuration'));
        sf2DefaultDurationSlider.value = wavFileDuration;
        sf2DefaultDurationText.innerText = `Default WAV duration : ${wavFileDuration} s`;
    }
    if (allNotesBtn.checked != (localStorage.getItem('createFileForAllNotes') == 'true')) {
        createFileForAllNotes = (localStorage.getItem('createFileForAllNotes') == 'true');
        allNotesBtn.checked = createFileForAllNotes;
        ChangeColor(allNotesBtn);
    }

    if (fileLength > 0 && defaultDrumKit != parseInt(localStorage.getItem('defaultDrumKit'))) {
        defaultDrumKit = parseInt(localStorage.getItem('defaultDrumKit'));
        document.querySelectorAll('#sf2DropdownPresetList .sf2PresetRow').forEach(row => {
            if (row.classList.length > 1 && row.classList[1] == 'selectedDrumKit') {
                row.classList.remove('selectedDrumKit');
            }
        });
        [...document.querySelectorAll('#sf2DropdownPresetList .sf2PresetRow')].find(preset => parseInt(preset.lastChild.textContent) == defaultDrumKit).classList.add('selectedDrumKit');
    }

    // CloseSf2SettingsWindow(); //Because I don't want to close the window but maybe it's better. I don't know...
}


sf2ConfirmBtn.addEventListener('click', CloseSf2SettingsWindow);
window.addEventListener('keydown', (event) => {
    if (sf2SettingsContainer.style.display == 'flex' && event.code == 'Escape') {
        PutBackPreviousValues();
        ChangeDisplay([sf2SettingsWindowContainer, sf2SettingsContainer], 0);
    }
});
function CloseSf2SettingsWindow() {
    ChangeDisplay([sf2SettingsWindowContainer, sf2SettingsContainer], 0);
}
sf2CancelBtn.addEventListener('click', () => {
    ChangeDisplay([sf2SettingsWindowContainer], 0);
});



const recentSf2FilesWindow = document.querySelector('#recentSf2FilesWindow');
ChangeDisplay([recentSf2FilesWindow], 0);
const WTTDRSFW = 100; //Waiting Time To Display Recent Sf2 Files Window
const WTTRRSFW = 200; //Waiting Time To Remove Recent Sf2 Files Window
let sf2CloseTimer = null;

btnImportSf2.addEventListener('mouseenter', () => {
    if (sf2CloseTimer) clearTimeout(sf2CloseTimer);

    if (recentSf2FilesWindow.style.display === 'none' && recentSf2Files.length > 0) {
        setTimeout(() => {
            PlaceElement2(
                btnImportSf2,
                recentSf2FilesWindow,
                10,
                (parent, child) => parent.getBoundingClientRect().bottom + 5,
                (parent, child) => parent.getBoundingClientRect().left + parent.offsetWidth / 2 - child.offsetWidth / 2
            );

            ChangeDisplay([recentSf2FilesWindow], 1);
        }, WTTDRSFW);
    }
});
recentSf2FilesWindow.addEventListener('mouseenter', () => {
    if (sf2CloseTimer) clearTimeout(sf2CloseTimer);
});

btnImportSf2.addEventListener('mouseleave', StartCloseTimer);
recentSf2FilesWindow.addEventListener('mouseleave', StartCloseTimer);
function StartCloseTimer() {
    sf2CloseTimer = setTimeout(() => {
        ChangeDisplay([recentSf2FilesWindow], 0);
    }, WTTRRSFW);
}


function UpdateRecentSf2FilesWindow() {
    if (recentSf2Files.length == 0) return;

    recentSf2FilesWindow.innerHTML = '';

    for (let [name, [blob, persistent]] of recentSf2Files) {
        const row = document.createElement('div');
        row.classList.add('recentFilesRow');
        recentSf2FilesWindow.appendChild(row);

        const textBox = document.createElement('div');
        textBox.classList.add('recentSf2FilesNameBox');
        row.appendChild(textBox);

        const text = document.createElement('div');
        text.classList.add('recentSf2FilesName');
        text.textContent = name;
        textBox.appendChild(text);

        let pin = null;
        if (blob.size >= MAX_SF2_FILE_SIZE) {
        // if (blob.size >= 0) {
            row.classList.add('tooHeavySf2');

            pin = document.createElement('div');
            pin.classList.add('recentSf2FilesPin');
            {
                const icon = document.createElement('i');
                icon.classList.add('fas');
                icon.classList.add('fa-thumbtack');
                pin.appendChild(icon);
            }
            pin.style.color = persistent ? '#9f9' : '#000';
            row.appendChild(pin);

            pin.addEventListener('click', async () => {
                Animate(pin, 'rotate-sf2-pin', 400);

                persistent = !persistent && await IsBlobPersistable(blob.size);
                for (let i = 0; i < recentSf2Files.length; i++) {
                    if (recentSf2Files[i][0] == name) recentSf2Files[i][1][1] = persistent; 
                }

                if (persistent) pin.style.color = '#9f9';
                else pin.style.color = '#000';

                await sf2FilesStorage.SaveMap(new Map(recentSf2Files.filter(([name, [blob, persistent]]) => persistent)));
            });
        }

        let fileSize = Math.ceil(blob.size / 1024);
        let sizeName = 'Kb';
        if (fileSize > 1000) {
            fileSize = Math.ceil(fileSize / 1000);
            sizeName = 'Mb';
        }
        if (fileSize > 1000) {
            fileSize = Math.ceil(fileSize / 1000);
            sizeName = 'Gb';
        }
        const size = document.createElement('div');
        size.classList.add('recentSf2FilesSize');
        size.textContent = fileSize + ' ' + sizeName;
        row.appendChild(size);

        row.addEventListener('click', async (e) => {
            if (size.contains(e.target) || (pin != null && pin.contains(e.target))) return;
            cacheCleaner = setInterval(() => {
                const now = Date.now();
                for (const [preset, { time }] of cachedNotes) {
                    if (now - time > 5 * 60 * 1000) {
                        cachedNotes.delete(preset);
                        console.log(`Preset ${preset} removed from cache.`);
                    }
                }
            }, 60 * 1000);

            try {
                const arrayBuffer = await blob.arrayBuffer();
                const file = new DataView(arrayBuffer);

                ResetSf2Values();
                await ProcessSfFile(file);
                console.log("Analysis of SoundFont file completed successfully!\n" + name + " launched!");

                //Save to recentSf2Files
                recentSf2Files = recentSf2Files.filter(file => file[0] !== name);
                recentSf2Files.unshift([name, [blob, persistent]]);
                if (recentSf2Files.length > 5) {
                    recentSf2Files.pop();
                }
                UpdateRecentSf2FilesWindow();

                ChangeDisplay([recentSf2FilesWindow], 0);

                await sf2FilesStorage.SaveMap(new Map(recentSf2Files.filter(([name, [blob, persistent]]) => persistent)));
            } catch (error) {
                console.error("Non-compliant sf2 file!");
                console.error("Critical error, execution has stopped.");
                console.error(error.message);
            }
            Sf2FileLoaded();

            clearTimeout(sf2CloseTimer);
            ChangeDisplay([recentSf2FilesWindow], 0);
        })
    }

    PlaceElement2(
        btnImportSf2,
        recentSf2FilesWindow,
        10,
        (parent, child) => parent.getBoundingClientRect().bottom + 5,
        (parent, child) => parent.getBoundingClientRect().left + parent.offsetWidth / 2 - child.offsetWidth / 2
    );

    document.querySelector(`#recentSf2FilesWindow > :last-child`).style.borderBottom = 'none';
}

async function IsBlobPersistable(blobSize, maxSize = 0) {
    if (maxSize != 0 && blobSize >= maxSize) return false;

    const { quota, usage } = await navigator.storage.estimate();
    const remaining = quota - usage;

    return blobSize < remaining;
}
