
const maxChunkSize = 50_000_000;

function ValuesFromSamples(offset) {
    const chunkIndex = Math.floor(offset / maxChunkSize);
    const innerOffset = offset % maxChunkSize;

    return samples[chunkIndex][innerOffset];
}



let fileLength = 0;

let infoData = {};

let samples = [];

let presets = [];
let presetBags = [];
let presetModulators = [];
let presetGenerators = [];
let instruments = [];
let instrumentBags = [];
let instrumentModulators = [];
let instrumentGenerators = [];
let sampleID = [];

let checkingBuffer = [];

let notes = new Map();
let cachedNotes = new Map();

let genReverb = new Map();
let genChorus = new Map();
let exclusiveClass = new Map();

let drumKits = [];

const defaultValue = [
    0, 0, 0, 0, 0, 0, 0, 0, 13500, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, -12000, 0, -12000, 0, -12000, -12000, -12000, -12000, 0, 
    -12000, 0, 0, -12000, -12000, -12000, -12000, 0, -12000, 0, 
    0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 
    0, 0, 0, 0, 0, 0, 100, 0, -1, 0, 0
];

const defaultWavFileDuration = 8;
const defaultMaxWavFileDuration = 20;
const defaultCutWavFileLength = true;
const defaultDefaultDrumKit = 0;
const defaultCreateFileForAllNotes = false;

if (!localStorage.getItem('wavFileDuration')) localStorage.setItem('wavFileDuration', defaultWavFileDuration.toString());
if (!localStorage.getItem('maxWavFileDuration')) localStorage.setItem('maxWavFileDuration', defaultMaxWavFileDuration.toString());
if (!localStorage.getItem('cutWavFileLength')) localStorage.setItem('cutWavFileLength', defaultCutWavFileLength.toString());
if (!localStorage.getItem('defaultDrumKit')) localStorage.setItem('defaultDrumKit', defaultDefaultDrumKit.toString());
if (!localStorage.getItem('createFileForAllNotes')) localStorage.setItem('createFileForAllNotes', defaultCreateFileForAllNotes.toString());

let wavFileDuration = parseInt(localStorage.getItem('wavFileDuration'));
let maxWavFileDuration = parseInt(localStorage.getItem('maxWavFileDuration'));
let cutWavFileLength = localStorage.getItem('cutWavFileLength') === 'true';
let defaultDrumKit = parseInt(localStorage.getItem('defaultDrumKit'));
let createFileForAllNotes = localStorage.getItem('createFileForAllNotes') === 'true';

const notesVelocity = 64; //I'll modify it the day I'll make a piano where you can know the velocity of the pressed key, for now, it'll stay a constant. Update: I'll never know the velocity of any pressed key...
const targetSampleRate = 44100; //It's of course something constant that doesn't need to be modify
const epsilon = 0.0001; //Same...


const soundFontFileInput = document.getElementById("sf2Input");
soundFontFileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) {
        console.warn("File deleted.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const sf2File = new DataView(arrayBuffer);

        try {
            ResetSf2Values();
            await ProcessSfFile(sf2File);
            console.log("Analysis of SoundFont file completed successfully!\n" + file.name + " launched!");

            //Save to recentSf2Files
            const name = file.name;
            const blob = new Blob([arrayBuffer], { type: "audio/sf2" }); //I set the type just for formality — since it stays local and I'm the only one using it, the MIME type doesn't matter. So I used something non-standard, but it doesn't really matter anyway...
            const persistent = await IsBlobPersistable(blob.size, MAX_SF2_FILE_SIZE);

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
    }

    reader.readAsArrayBuffer(file);
    soundFontFileInput.value = '';
});

function ResetSf2Values() {
    fileLength = 0;
    
    infoData = {};
    
    samples = [];
    
    presets = [];
    presetBags = [];
    presetModulators = [];
    presetGenerators = [];
    instruments = [];
    instrumentBags = [];
    instrumentModulators = [];
    instrumentGenerators = [];
    sampleID = [];
    
    checkingBuffer = [];
    
    notes = new Map();
    cachedNotes = new Map();

    genReverb = new Map();
    genChorus = new Map();
    exclusiveClass = new Map();

    drumKits = [];
}



function WriteString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
function GetChunkID(file, offset) {
    let chunkID = "";
    for (let i = 0; i < 4; i++) {
        chunkID += String.fromCharCode(file.getUint8(offset + i));
    }

    return chunkID;
}
function ThrowError(message = "File structurally unsound") {
    throw new Error(message); 
}



function ReadSoundFontHeaderChunk(file) {
    const RIFF = GetChunkID(file, 0)
    fileLength = file.getUint32(4, true) + 8;
    const format = GetChunkID(file, 8);

    if (RIFF !== "RIFF" || format !== "sfbk") ThrowError("The header chunk is structurally unsound.");
}
function ReadSoundFontChunks(file) {
    let chunks = [];

    let offset = 12;

    while (offset < fileLength) {
        const chunkID = GetChunkID(file, offset);
        const chunkSize = file.getUint32(offset + 4, true);

        if (chunkSize <= 0 || offset + chunkSize + 8 > fileLength) ThrowError("The size of the chunks are incorrect.");

        chunks.push({
            id: chunkID,
            offset: offset,
            size: chunkSize,
        });

        offset += chunkSize + 8;
    }

    return chunks;
}

async function ProcessSfFile(file) {
    ReadSoundFontHeaderChunk(file);

    const chunkLookup = ReadSoundFontChunks(file);

    ReadInfo(file, chunkLookup[0]);
    ReadSdta(file, chunkLookup[1]);
    ReadPdta(file, chunkLookup[2]);
}

function ReadInfo(file, chunk) {
    let offset = chunk.offset + 8;
    const endOfChunk = offset + chunk.size;

    const infoID = GetChunkID(file, offset);
    if (infoID !== 'INFO') ThrowError("The Info chunk does not start by the id 'INFO'.");

    offset += 4;
    while (offset < endOfChunk) {
        const subChunkID = GetChunkID(file, offset);
        const subChunkSize = file.getUint32(offset + 4, true);
        const textOffset = offset + 8;

        let text = "";
        for (let i = 0; i < subChunkSize; i++) {
            let charCode = file.getUint8(textOffset + i);
            if (charCode === 0) break;
            text += String.fromCharCode(charCode);
        }

        if (['ICMT', 'ICOP', 'IENG', 'INAM', 'ICRD'].includes(subChunkID)) {
            infoData[subChunkID] = text;
        }
        else if (subChunkID == 'ifil') {
            const t1 = file.getUint16(offset + 8, true);
            const t2 = file.getUint16(offset + 10, true);
            if (t1 > 2 || (t1 == 2 && t2 > 1)) {
                console.warn(`Warning: version ${t1}.${t2} not tested, there may be problems.`);
            }
        }

        offset += 8 + subChunkSize;
        if (subChunkSize % 2 !== 0) offset++;
    }
}

function ReadSdta(file, chunk) {
    let offset = chunk.offset + 8;
    const endOfChunk = offset + chunk.size;

    const sdtaID = GetChunkID(file, offset);
    const smplID = GetChunkID(file, offset + 4);
    const smplSize = file.getUint32(offset + 8, true);

    if (sdtaID !== 'sdta' || smplID !== "smpl" || offset + 12 + smplSize != endOfChunk) ThrowError("The Sample Data chunk is structurally unsound.");

    offset += 12;

    /* for (let i = offset; i < endOfChunk; i += 2) {
        samples.push(file.getInt16(i, true));
    } */    //used for normal .sf2 file but not working for big or high quality soundFonts
    let currentChunk = [];
    for (let i = offset; i < endOfChunk; i += 2) {
        currentChunk.push(file.getInt16(i, true));

        if (currentChunk.length >= maxChunkSize) {
            samples.push(currentChunk);
            currentChunk = [];
            currentChunk.length = 0;
        }
    }

    if (currentChunk.length != 0) samples.push(currentChunk);
}

function ReadPdta(file, chunk) {
    let offset = chunk.offset + 8;
    const endOfChunk =  offset + chunk.size;

    const pdtaID = GetChunkID(file, offset);
    if (pdtaID !== 'pdta') ThrowError("The pdta chunk does not start by the id 'pdta'.");
    offset += 4;

    offset = Phdr(file, offset);
    offset = Pbag(file, offset);
    offset = Pmod(file, offset);
    offset = Pgen(file, offset);
    offset = Inst(file, offset);
    offset = Ibag(file, offset);
    offset = Imod(file, offset);
    offset = Igen(file, offset);
    offset = Shdr(file, offset);

    CheckStructure();

    if (offset != endOfChunk) ThrowError("The chunk pdta is longer than expected.");
}

function Phdr(file, offset) {
    const phdrID = GetChunkID(file, offset);
    const phdrSize = file.getUint32(offset + 4, true);
    offset += 8;
    const endOfChunk = offset + phdrSize;

    if (phdrID !== 'phdr' || phdrSize % 38 != 0 || phdrSize < 76) ThrowError("The phdr chunk is structurally unsound.");

    let seenPresets = new Set();
    let previousBagIndex = -1;
    while (offset < endOfChunk) {
        let name = "";
        for (let i = 0; i < 20; i++) {
            let char = file.getUint8(offset + i);
            if (char !== 0) name += String.fromCharCode(char);
        }
        name = name.trim();

        let preset = file.getUint16(offset + 20, true);
        let bank = file.getUint16(offset + 22, true);
        let bagIndex = file.getUint16(offset + 24, true);
        let key = `${preset}-${bank}`;
        
        if (seenPresets.has(key) && name !== "EOP") {
            console.warn(`Duplicate preset detected: ID=${preset}, Bank=${bank} (only the first one will be active).`);
        } else {
            seenPresets.add(key);
            presets.push({
                name: name,
                presetID: preset,
                bankID: bank,
                bagIndex: bagIndex,
            });
        }

        if (bagIndex < previousBagIndex) ThrowError("The bag index is not monotonically increasing in the pdta chunk.");
        previousBagIndex = bagIndex;

        if ((preset > 127) || (bank > 128)) {
            console.warn(`Preset ignored: ID=${preset}, Bank=${bank} (invalid values).`);
            offset += 38;
            continue;
        }

        offset += 38;
    }
    let lastPreset = presets[presets.length - 1];
    if (lastPreset.name !== "EOP") ThrowError("The last preset of the pdta chunk is not 'End Of Preset'.");

    checkingBuffer.push([lastPreset.bagIndex, null]);

    return offset;
}
function Pbag(file, offset) {
    const pbagID = GetChunkID(file, offset);
    const pbagSize = file.getUint32(offset + 4, true);
    offset += 8;
    const endOfChunk = offset + pbagSize;

    checkingBuffer[0][1] = pbagSize;

    if (pbagID !== 'pbag' || pbagSize % 4 != 0 || pbagSize < 8) ThrowError("The pbag chunk is structurally unsound.");

    function FindPresetForBag(bagIndex) {
        let foundPreset = null;

        for (const preset of presets) {
            if (preset.bagIndex > bagIndex) break;
            foundPreset = preset;
        }

        return foundPreset;
    }

    let lastGenIndex = -1;
    let lastModIndex = -1;
    let index = 0;
    while (offset < endOfChunk) {
        const genIndex = file.getUint16(offset, true);
        const modIndex = file.getUint16(offset + 2, true);

        if (genIndex < lastGenIndex || modIndex < lastModIndex) ThrowError("The indexes in pbag chunk aren't monotonically increasing.");
        lastGenIndex = genIndex;
        lastModIndex = modIndex;

        let presetIndex = FindPresetForBag(index);
        let idx = presetIndex.bagIndex;
        if (!presetBags[idx]) presetBags[idx] = [];
        presetBags[idx].push([genIndex, modIndex, true, false]); //true for "has to be considered" and false for "not a global zone"

        offset += 4;
        index++;
    }

    let lastPreset = presetBags[presetBags.length - 1];
    checkingBuffer.push([lastPreset[lastPreset.length - 1][1], null]);
    checkingBuffer.push([lastPreset[lastPreset.length - 1][0], null]);

    return offset;
}
function Pmod(file, offset) {
    const pmodID = GetChunkID(file, offset);
    const pmodSize = file.getUint32(offset + 4, true);
    offset += 8;
    const endOfChunk = offset + pmodSize;

    if (pmodID !== 'pmod' || pmodSize % 10 != 0 || pmodSize < 10) ThrowError("The pmod chunk is structurally unsound.");

    checkingBuffer[1][1] = pmodSize;

    function FindBagForMod(modIndex) {
        let foundBag = null;

        for (const bag of presetBags) {
            if (!bag) continue;
            for (const zone of bag) {
                if (zone[1] > modIndex) return foundBag;
                foundBag = zone;
            }
        }

        return foundBag;
    }

    let index = 0;
    while (offset < endOfChunk) {
        const src = file.getInt16(offset, true);
        const dest = file.getInt16(offset + 2, true);
        const amt = file.getInt16(offset + 4, true);
        const srcAmt = file.getInt16(offset + 6, true);
        const destAmt = file.getInt16(offset + 8, true);

        for (const subArray of presetModulators) {
            if (!Array.isArray(subArray)) continue;
            const mod = subArray.find(m => m[0] === src && m[1] === dest && m[3] === amt && m[5]);
            if (mod) {
                mod[5] = false;
                break;
            }
        }
    
        let bagIndex = FindBagForMod(index);
        let idx = bagIndex[1];
        if (!presetModulators[idx]) presetModulators[idx] = [];
        presetModulators[idx].push([src, dest, amt, srcAmt, destAmt, true]); //true is for not ignored (by default)

        offset += 10;
        index++;
    }

    return offset;
}
function Pgen(file, offset) {
    const pgenID = GetChunkID(file, offset);
    const pgenSize = file.getUint32(offset + 4, true);
    offset += 8;
    const endOfChunk = offset + pgenSize;

    if (pgenID !== 'pgen' || pgenSize % 4 != 0 || pgenSize < 8) ThrowError("The pgen chunk is structurally unsound.");

    checkingBuffer[2][1] = pgenSize;

    function FindBagForGen(genIndex) {
        let foundPreset = null;
    
        for (const bag of presetBags) {
            if (!bag) continue;
            for (const zone of bag) {
                if (zone[0] > genIndex) return foundPreset;
                foundPreset = zone;
            }
        }
    
        return foundPreset;
    }

    //0 = range; 1 = unsigned; 2 = signed; 3 = different; 4 = unused;
    let genTypes = [
        1, 2, 2, 2, 1, 2, 2, 2, 1, 1, 
        2, 2, 2, 2, 4, 1, 1, 2, 4, 4, 
        4, 2, 2, 2, 2, 2, 2, 2, 2, 1, 
        2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 
        2, 3, 4, 0, 0, 2, 1, 1, 1, 4, 
        2, 2, 2, 3, 2, 4, 1, 1, 1, 4, 4
    ];

    let highestInstValue = -1;
    let index = 0;
    while (offset < endOfChunk) {
        const gen = file.getUint16(offset, true);
        let amt = 0;
        if (genTypes[gen] == 0) {
            const genAmt = file.getInt16(offset + 2, true);
            amt = { min: genAmt & 0xFF, max: (genAmt >> 8) & 0xFF };
        } else if (genTypes[gen] == 1) {
            amt = file.getUint16(offset + 2, true);
        } else if (genTypes[gen] == 2) {
            amt = file.getInt16(offset + 2, true);
        } else if (gen == 41 || gen == 53) {
            amt = file.getUint16(offset + 2, true);
        }

        let bagIndex = FindBagForGen(index);
        let idx = bagIndex[0];
        if (!presetGenerators[idx]) presetGenerators[idx] = [];

        let isValid = true;
        if ([0, 1, 2, 3, 4, 12, 45, 46, 47, 50, 53, 54, 57, 58].includes(gen)) isValid = false;

        presetGenerators[idx].push([gen, amt, isValid]); //isValid is to know if the preset is ignored or not

        if (gen == 41 && amt > highestInstValue) {
            highestInstValue = amt;
        }

        offset += 4;
        index++;
    }
    checkingBuffer.push([highestInstValue, null]);

    return offset;
}
function Inst(file, offset) {
    const instID = GetChunkID(file, offset);
    const instSize = file.getUint32(offset + 4, true);
    offset += 8;
    const endOfChunk = offset + instSize;

    checkingBuffer[3][1] = instSize;

    if (instID !== 'inst' || instSize % 22 != 0 || instSize < 44) ThrowError("The inst chunk is structurally unsound.");

    let seenInst = new Map();
    let lastIndex = -1;
    while (offset < endOfChunk) {
        let name = "";
        for (let i = 0; i < 20; i++) {
            let char = file.getUint8(offset + i);
            if (char !== 0) name += String.fromCharCode(char);
        }
        name = name.trim();

        const index = file.getUint16(offset + 20, true);

        if (seenInst.has(name) && name !== "EOP") {
            const count = seenInst.get(name) + 1;
            seenInst.set(name, count);
            name += ` #${count}`;
        } else {
            seenInst.set(name, 1);
        }
        instruments.push([name, index]);

        if (index < lastIndex) ThrowError("The index in the inst chunk is not monotonically increasing.");
        lastIndex = index;

        offset += 22;
    }
    let lastInstrument = instruments[instruments.length - 1];
    if (lastInstrument[0] !== "EOI") ThrowError("The last instrument in the inst chunk is not an 'End Of Instrument'.");
    checkingBuffer.push([lastInstrument[1], null]);

    return offset;
}
function Ibag(file, offset) {
    const ibagID = GetChunkID(file, offset);
    const ibagSize = file.getUint32(offset + 4, true);
    offset += 8;
    const endOfChunk = offset + ibagSize;

    checkingBuffer[4][1] = ibagSize;

    if (ibagID !== 'ibag' || ibagSize % 4 != 0 || ibagSize < 8) ThrowError("The ibag chunk is structurally unsound.");

    function FindPresetForBag(bagIndex) {
        let foundPreset = null;

        for (const instrument of instruments) {
            if (instrument[1] > bagIndex) break;
            foundPreset = instrument;
        }

        return foundPreset;
    }

    let lastGenIndex = -1;
    let lastModIndex = -1;
    let index = 0;
    while (offset < endOfChunk) {
        const genIndex = file.getUint16(offset, true);
        const modIndex = file.getUint16(offset + 2, true);

        if (genIndex < lastGenIndex || modIndex < lastModIndex) ThrowError("The indexes in the ibag chunk haven't monotically increased.");
        lastGenIndex = genIndex;
        lastModIndex = modIndex;

        let instrumentIndex = FindPresetForBag(index);
        let idx = instrumentIndex[1];
        if (!instrumentBags[idx]) instrumentBags[idx] = [];
        instrumentBags[idx].push([genIndex, modIndex, true, false]); //true for "has to be considered" and false for "not a global zone"

        offset += 4;
        index++;
    }

    let lastPreset = instrumentBags[instrumentBags.length - 1];
    checkingBuffer.push([lastPreset[lastPreset.length - 1][1], null]);
    checkingBuffer.push([lastPreset[lastPreset.length - 1][0], null]);

    return offset;
}
function Imod(file, offset) {
    const imodID = GetChunkID(file, offset);
    const imodSize = file.getUint32(offset + 4, true);
    offset += 8;
    const endOfChunk = offset + imodSize;

    if (imodID !== 'imod' || imodSize % 10 != 0 || imodSize < 10) ThrowError("The imod chunk is structurally unsound.");

    checkingBuffer[5][1] = imodSize;

    function FindBagForMod(modIndex) {
        let foundBag = null;

        for (const bag of instrumentBags) {
            if (!bag) continue;
            for (const zone of bag) {
                if (zone[1] > modIndex) return foundBag;
                foundBag = zone;
            }
        }

        return foundBag;
    }

    let index = 0;
    while (offset < endOfChunk) {
        const src = file.getInt16(offset, true);
        const dest = file.getInt16(offset + 2, true);
        const amt = file.getInt16(offset + 4, true);
        const srcAmt = file.getInt16(offset + 6, true);
        const destAmt = file.getInt16(offset + 8, true);

        for (const subArray of instrumentModulators) {
            if (!Array.isArray(subArray)) continue;
            const mod = subArray.find(m => m[0] === src && m[1] === dest && m[3] === amt && m[5]);
            if (mod) {
                mod[5] = false;
                break;
            }
        }
    
        let bagIndex = FindBagForMod(index);
        let idx = bagIndex[1];
        if (!instrumentModulators[idx]) instrumentModulators[idx] = [];
        instrumentModulators[idx].push([src, dest, amt, srcAmt, destAmt, true]); //true is for not ignored (by default)

        offset += 10;
        index++;
    }

    return offset;
}
function Igen(file, offset) {
    const igenID = GetChunkID(file, offset);
    const igenSize = file.getUint32(offset + 4, true);
    offset += 8;
    const endOfChunk = offset + igenSize;

    if (igenID !== 'igen' || igenSize % 4 != 0 || igenSize < 8) ThrowError("The igen chunk is structurally unsound.");

    checkingBuffer[6][1] = igenSize;

    function FindBagForGen(genIndex) {
        let foundPreset = null;
    
        for (const bag of instrumentBags) {
            if (!bag) continue;
            for (const zone of bag) {
                if (zone[0] > genIndex) return foundPreset;
                foundPreset = zone;
            }
        }
    
        return foundPreset;
    }

    //0 = range; 1 = unsigned; 2 = signed; 3 = different; 4 = unused; 
    let genTypes = [
        1, 2, 2, 2, 1, 2, 2, 2, 1, 1, 
        2, 2, 2, 2, 4, 1, 1, 2, 4, 4, 
        4, 2, 2, 2, 2, 2, 2, 2, 2, 1, 
        2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 
        2, 3, 4, 0, 0, 2, 1, 1, 1, 4, 
        2, 2, 2, 3, 2, 4, 1, 1, 1, 4, 4
    ];

    let highestSmplValue = -1;
    let index = 0;
    while (offset < endOfChunk) {
        const gen = file.getUint16(offset, true);
        let amt = 0;
        if (genTypes[gen] == 0) {
            const genAmt = file.getInt16(offset + 2, true);
            amt = { min: genAmt & 0xFF, max: (genAmt >> 8) & 0xFF };
        } else if (genTypes[gen] == 1) {
            amt = file.getUint16(offset + 2, true);
        } else if (genTypes[gen] == 2) {
            amt = file.getInt16(offset + 2, true);
        } else if (gen == 41 || gen == 53) {
            amt = file.getUint16(offset + 2, true);
        }

        let bagIndex = FindBagForGen(index);
        let idx = bagIndex[0];
        if (!instrumentGenerators[idx]) instrumentGenerators[idx] = [];
        instrumentGenerators[idx].push([gen, amt, true]); //true is for not ignored (by default)

        if (gen == 41 && amt > highestSmplValue) {
            highestSmplValue = amt;
        }

        offset += 4;
        index++;
    }
    checkingBuffer.push([highestSmplValue, null]);

    return offset;
}
function Shdr(file, offset) {
    const shdrID = GetChunkID(file, offset);
    const shdrSize = file.getUint32(offset + 4, true);
    offset += 8;
    const endOfChunk = offset + shdrSize;

    if (shdrID !== 'shdr' || shdrSize % 46 != 0 || shdrSize < 46) ThrowError("The shdr chunk is structurally unsound.");

    checkingBuffer[7][1] = shdrSize;

    let errorCount1 = 0;
    let errorCount2 = 0;
    let seenSmpl = new Map();
    while (offset < endOfChunk) {
        let name = "";
        for (let i = 0; i < 20; i++) {
            let char = file.getUint8(offset + i);
            if (char !== 0) name += String.fromCharCode(char);
        }
        name = name.trim();

        const start = file.getUint32(offset + 20, true);
        const end = file.getUint32(offset + 24, true);
        const startLoop = file.getUint32(offset + 28, true);
        const endLoop = file.getUint32(offset + 32, true);
        const sampleRate = file.getUint32(offset + 36, true);
        const originalPitch = file.getUint8(offset + 40, true);
        const pitchCorrection = file.getInt8(offset + 41, true);
        const sampleLink = file.getUint16(offset + 42, true);
        const sampleType = file.getUint16(offset + 44, true);

        sampleID.push([name, start, end, startLoop, endLoop, sampleRate, originalPitch, pitchCorrection, sampleLink, sampleType]);

        if (name == "EOS") {
            offset += 46; 
            continue;
        }

        if (start >= end || startLoop > endLoop) ThrowError("The indexes in the phdr chunk have not monotonically increased.");
        if (start >= startLoop - 7 || startLoop >= endLoop - 31 || endLoop >= end -7) {
            errorCount1++;
        }

        if (seenSmpl.has(name)) {
            const count = seenSmpl.get(name) + 1;
            seenSmpl.set(name, count);
            name += ` #${count}`;
        } else {
            seenSmpl.set(name, 1);
        }

        for (let i = 0; i < 8; i++) {
            const a = ValuesFromSamples(startLoop + i);
            const b = ValuesFromSamples(endLoop - 8 + i);
            if (a !== b) {
                errorCount2++;
                break;
            }
        }

        if (sampleRate == 0) ThrowError("The sample rate cannot be 0.");
        if (sampleRate < 400 || sampleRate > 50000) console.warn(`Uncommon sample rate (${sampleRate} Hz), this might cause issues on some platforms.`);

        if (originalPitch < 0 || originalPitch > 127) originalPitch = 60;

        if (![1, 2, 4, 8, 32769, 32770, 32772, 32776].includes(sampleType)) ThrowError("The sample type is unknown.");

        if ((sampleType == 2 || sampleType == 4) && sampleLink >= (shdrSize / 46) - 1) ThrowError("The sample link does not point to a valid address.");

        offset += 46;
    }
    let lastSample = sampleID[sampleID.length - 1];
    if (lastSample[0] !== "EOS") ThrowError("The last sample of shdr is not an 'End Of Sample'.");

    if (errorCount1 != 0 || errorCount2 != 0) {
        const errorCount = errorCount1 > errorCount2 ? errorCount1 : errorCount2;
        console.warn(`${errorCount} samples may produce playback artifacts (out of ${shdrSize / 46 - 1}).`);
    }

    return offset;
}

function CheckStructure() {
    if (checkingBuffer[0][0] != checkingBuffer[0][1] / 4 - 1) ThrowError("The last bag index does not correspond to the size of the pbag chunk.");
    if (checkingBuffer[1][0] * 10 + 10 != checkingBuffer[1][1]) ThrowError("The last preset modulator index does not correspond to the size of the pmod chunk.");
    if (checkingBuffer[2][0] * 4 + 4 != checkingBuffer[2][1]) ThrowError("The last preset generator index does not correspond to the size of the pgen chunk.");
    if (checkingBuffer[3][0] >= checkingBuffer[3][1] / 22) ThrowError("The highest instrument generator index does not correspond to the size of the inst chunk.");
    if (checkingBuffer[4][0] != checkingBuffer[4][1] / 4 - 1) ThrowError("The last instrument index does not correspond to the size of the ibag chunk.");
    if (checkingBuffer[5][0] * 10 + 10 != checkingBuffer[5][1]) ThrowError("The last instrument modulator index does not correspond to the size of the imod chunk.");
    if (checkingBuffer[6][0] * 4 + 4 != checkingBuffer[6][1]) ThrowError("The last instrument generator index does not correspond to the size of the igen chunk.");
    if (checkingBuffer[7][0] >= checkingBuffer[7][1] / 46) ThrowError("The highest sample generator index does not correspond to the size of the shdr chunk.");

    delete checkingBuffer;

    for (let i = 0; i < 2; i++) {
        const bags = i ? instrumentBags : presetBags;
        const globalGenerator = i ? 53 : 41;
        const rightModulators = i ? instrumentModulators : presetModulators;
        const rightGenerators = i ? instrumentGenerators : presetGenerators;
    
        let zoneToDelete = [];
        let index1 = -1;
        for (const bag of bags) {
            index1++;
            if (!bag || bag.length <= 1) continue;
    
            let index = 0;
            for (const zone of bag) {
                let seenGen = []

                let mods = rightModulators[zone[1]];
                let gens = rightGenerators[zone[0]];

                if (index == 0 && gens.length > 0 && gens[gens.length - 1][0] != globalGenerator) {
                    zone[3] = true;
                    if (gens.length == 0 && mods.length == 0) {
                        zoneToDelete.push([index1, index]);
                        continue;
                    }
                }

                if (!zone[3]) {
                    if (gens.length == 0 || gens[gens.length - 1][0] != globalGenerator) {
                        zoneToDelete.push([index1, index]);
                        continue;
                    }

                    let stopped = false;
                    let i = 0;
                    for (const gen of gens) {
                        if (stopped) {
                            gen[2] = false;
                            continue;
                        } else if ((gen[0] == 43 && i != 0) || (gen[0] == 44 && i > 0 && gens[i - 1][0] != 43)) {
                            gen[2] = false;
                            continue;
                        } else if (gen[0] == globalGenerator) stopped = true;

                        if (seenGen.includes(gen[0])) {
                            gen[2] = false;
                            continue;
                        }
                        seenGen.push(gen[0]);

                        i++;
                    }
                }

                index++;
            }
        }

        for (const zone of zoneToDelete) {
            if (i) instrumentBags[zone[0]].splice(zone[1], 1);
            else presetBags[zone[0]].splice(zone[1], 1);
        }
    }

    presets.pop();
    instruments.pop();

    delete presetModulators;
    delete instrumentModulators;

    for (const instrument of instruments) {
        const bag = instrumentBags[instrument[1]];

        let usedSamples = [];
        for (const zone of bag) {
            const generator = instrumentGenerators[zone[0]];

            const sampleGenerator = generator[generator.length - 1];
            if (sampleGenerator[0] != 53) continue;
            if (sampleID[sampleGenerator[1]][9] != 2 && sampleID[sampleGenerator[1]][9] != 4) continue;
            usedSamples.push(sampleGenerator[1]);
        }

        for (let i = 0; i < usedSamples.length; i++) {
            const leftOrRight = sampleID[usedSamples[i]][9] == 2 ? 4 : 2
            const sampleLink = sampleID[usedSamples[i]][8];

            if (!usedSamples.includes(sampleLink)) ThrowError("The stereo pair is not in the same instrument.");
            if (sampleID[sampleLink][9] != leftOrRight) ThrowError("The stereo pair is not the right one.");
        }
    }
}

let isGen15 = new Array();
let isGen16 = new Array();
let isGen57 = new Array();

async function AnalyzeData(presetToSave, refreshFrequency) {
    document.querySelector('#loadingScreen').style.display = 'flex';
    ApplyProgress(0);
    await new Promise(requestAnimationFrame);

    let index = 0;
    for (const preset of presets) {
        const presetName = `${preset.bankID}:${preset.presetID}`;
        if (!presetToSave.includes(presetName)) continue;

        if (notes.has(presetName)) continue;
        if (cachedNotes.has(presetName)) {
            notes.set(presetName, cachedNotes.get(presetName).notes);
            cachedNotes.delete(presetName);
            continue;
        }

        notes.set(presetName, new Map());

        const pbag = presetBags[preset.bagIndex];

        for (let note = 21; note < 109; note++) {
            isGen15 = new Array();
            isGen16 = new Array();
            isGen57 = new Array();

            await LoadNote(presetName, pbag, note);

            if (note % refreshFrequency == 0) {
                const totalSteps = Math.floor(88 / refreshFrequency);
                const globalStep = index * totalSteps + Math.floor((note - 21) / refreshFrequency);
                const totalGlobalSteps = presetToSave.length * totalSteps;

                const progress = (globalStep / totalGlobalSteps) * 100;
                ApplyProgress(progress);

                await new Promise(requestAnimationFrame);
            }
        }

        index++;
    }

    document.querySelector('#loadingScreen').style.display = 'none';
}
async function LoadNote(presetName, pbag, note) {
    let playedSamples = [];

    for (const pzone of pbag) {
        const pgens = presetGenerators[pzone[0]];

        for (const pgen of pgens) {
            if (pgen[0] == 41) {
                const inst = instruments[pgen[1]];
                const ibag = instrumentBags[inst[1]];

                for (const izone of ibag) {
                    if (izone[3]) continue;

                    const igens = instrumentGenerators[izone[0]];

                    if ((igens[0][0] == 43 && igens[0][1].min <= note && note <= igens[0][1].max) || igens[0][0] != 43) {

                        for (const igen of igens) {
                            if (igen[0] == 53) {
                                const smpl = sampleID[igen[1]];

                                let pgenValues = [];
                                if (pbag[0][3]) {
                                    for (const gen of presetGenerators[pbag[0][0]]) {
                                        if (gen[2] && ![43, 44].includes(gen[0])) {
                                            pgenValues = pgenValues.filter(g => g[0] != gen[0]);
                                            pgenValues.push([gen[0], gen[1]]);
                                        }
                                    }
                                }
                                for (const gen of pgens) {
                                    if (gen[2] && ![41, 43, 44].includes(gen[0])) {
                                        pgenValues = pgenValues.filter(g => g[0] != gen[0]);
                                        pgenValues.push([gen[0], gen[1]]);
                                    }
                                }

                                let finalGens = [];
                                if (ibag[0][3]) {
                                    for (const gen of instrumentGenerators[ibag[0][0]]) {
                                        if (gen[2] && ![41, 43, 44, 54].includes(gen[0])) {
                                            finalGens = finalGens.filter(g => g[0] != gen[0]);
                                            finalGens.push([gen[0], gen[1]]);
                                        }
                                    }
                                }
                                for (const gen of igens) {
                                    if (gen[2] && ![41, 43, 44, 53].includes(gen[0])) {
                                        finalGens = finalGens.filter(g => g[0] != gen[0]);
                                        finalGens.push([gen[0], gen[1]]);
                                    }
                                }

                                for (let i = 0; i < pgenValues.length; i++) {
                                    const pv = pgenValues[i];
                                    let match = false;

                                    for (let n = 0; n < finalGens.length; n++) {
                                        if (pv[0] == finalGens[n][0]) {
                                            finalGens[n][1] += pv[1];
                                            match = true;
                                            break;
                                        }
                                    }

                                    if (!match) {
                                        finalGens.push([pv[0], defaultValue[pv[0]] + pv[1]]);
                                    }
                                }

                                let velRange = (igens.length > 1 && igens[1][0] == 44) ? igens[1][1] : { min: 0, max: 127 };

                                playedSamples.push([velRange, smpl, finalGens]);
                            }
                        }
                    }
                }
            }
        }
    }

    playedSamples = playedSamples.filter(smpl => ![8, 32769, 32770, 32772, 32776].includes(smpl[1][9]));
    if (playedSamples.length == 0) return;

    const wavBlob = AssembleSamples(playedSamples, note);
    if (!wavBlob) return;
    const url = URL.createObjectURL(wavBlob);


    //Midi name :
    //let usedOctave = Math.floor(note / 12) - 1;
    //Name I used in my piano : 
    let usedOctave = Math.floor(note / 12) - 2;
    if (usedOctave <= 0) usedOctave--;
    const audioName = classes[note % 12] + usedOctave;

    notes.get(presetName).set(audioName, url);


    if (isGen15.length > 0) {
        if (!genChorus.has(presetName)) genChorus.set(presetName, new Map());

        for (let i = 0; i < isGen15.length; i++) {
            genChorus.get(presetName).set(isGen15[i][0], isGen15[i][1]);
        }
    }
    if (isGen16.length > 0) {
        if (!genReverb.has(presetName)) genReverb.set(presetName, new Map());

        for (let i = 0; i < isGen16.length; i++) {
            genReverb.get(presetName).set(isGen16[i][0], isGen16[i][1]);
        }
    }
    if (isGen57.length > 0) {
        if (!exclusiveClass.has(presetName)) exclusiveClass.set(presetName, new Map());
        const preset = exclusiveClass.get(presetName);

        for (const [key, cls] of isGen57) {
            const arr = preset.get(cls) || [];
            arr.push(key);
            preset.set(cls, arr);
        }
    }
}

function AssembleSamples(playedSamples, note) {
    const rightDominantGenerators = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 51, 52, 56, 58];
    for (const sample of playedSamples) {
        if (sample[1][9] == 2) {
            const loverName = sampleID[sample[1][8]][0];
            sample[2] = sample[2].filter(gen => !rightDominantGenerators.includes(gen[0]));

            let rightGensToAdd = [];
            for (const smpl of playedSamples) {
                if (smpl[1][0] == loverName) {
                    rightGensToAdd = smpl[2].filter(gen => rightDominantGenerators.includes(gen[0]));
                    break;
                }
            }

            for (const gen of rightGensToAdd) {
                sample[2].push(gen);
            }
        }
    }

    let pan = false;
    for (const sample of playedSamples) {
        for (const gen of sample[2]) {
            if (gen[0] == 17) {
                pan = true;
                break;
            }
        }
        if (pan) break;
    }

    //Apply generators
    let allSamples = [];
    for (const sample of playedSamples) {
        if (sample[0].min < notesVelocity && notesVelocity < sample[0].max) {
            const values = ApplyGenerators(sample[1], sample[2], note, pan);
            if (values.length == 0) return false;

            allSamples.push(values);
        }
    }

    //Same length
    const numberOfSamples = allSamples.length;
    let allFinalSamples = [];
    const realWavFileDuration = cutWavFileLength ? wavFileDuration : maxWavFileDuration;
    const maxLength = targetSampleRate * realWavFileDuration;

    for (let i = 0; i < numberOfSamples; i++) {
        const smpl = allSamples[i];
        if (!pan) {
            const ratio = (smpl.length / wavFileDuration) / targetSampleRate;
            if (ratio != 1 && cutWavFileLength) {
                allFinalSamples.push([]);
                for (let n = 0; n < smpl.length; n++) {
                    const index = Math.floor(n * ratio);
                    if (index < smpl.length) {
                        allFinalSamples[i].push(smpl[index]);
                    }
                }
            } else {
                allFinalSamples.push(allSamples[i]);
            }

            if (allFinalSamples[i].length != maxLength) {
                allFinalSamples[i] = allFinalSamples[i].slice(0, maxLength);

                while (allFinalSamples[i].length < maxLength) {
                    allFinalSamples[i].push(0);
                }
            }
        } else {
            const ratio = (smpl[0].length / wavFileDuration) / targetSampleRate;
            if (ratio != 1 && cutWavFileLength) {
                allFinalSamples.push([[], []]);
                for (let n = 0; n < smpl[0].length; n++) {
                    const index = Math.floor(n * ratio);
                    if (index < smpl[0].length) {
                        allFinalSamples[i][0].push(smpl[0][index]);
                        allFinalSamples[i][1].push(smpl[1][index]);
                    }
                }
            } else {
                allFinalSamples.push([allSamples[i][0], allSamples[i][1]]);
            }

            if (allFinalSamples[i][0].length != maxLength) {
                allFinalSamples[i][0] = allFinalSamples[i][0].slice(0, maxLength);
                allFinalSamples[i][1] = allFinalSamples[i][1].slice(0, maxLength);

                while (allFinalSamples[i][0].length < maxLength) {
                    allFinalSamples[i][0].push(0);
                    allFinalSamples[i][1].push(0);
                }
            }
        }
    }

    //Mix samples (if there's more than 1)
    let finalSample = [];
    if (allFinalSamples.length > 1) {
        if (!pan) {
            for (let i = 0; i < maxLength; i++) {
                let sum = 0;
                for (let n = 0; n < numberOfSamples; n++) {
                    sum += allFinalSamples[n][i];
                }
    
                finalSample.push(sum / numberOfSamples);
            }
        } else {
            finalSample = [[], []];
            for (let ch = 0; ch < 2; ch++) {
                for (let i = 0; i < maxLength; i++) {
                    let sum = 0;
                    for (let n = 0; n < numberOfSamples; n++) {
                        sum += allFinalSamples[n][ch][i];
                    }
        
                    finalSample[ch].push(sum / numberOfSamples);
                }
            }
        }
    } else {
        finalSample = allFinalSamples[0];
    }
    delete allSamples, allFinalSamples;

    //Cut the 0 at the end
    if (!pan) {
        for (let i = finalSample.length - 1; i >= 0; i--) {
            if (finalSample[i] != 0 || finalSample[i] != -0) {
                finalSample = finalSample.slice(0, i + 1);
                break;
            }
        }
    } else {
        for (let i = finalSample[0].length - 1; i >= 0; i--) {
            if (![-0, 0].includes(finalSample[0][i]) || ![-0, 0].includes(finalSample[1][i])) {
                finalSample[0] = finalSample[0].slice(0, i + 1);
                finalSample[1] = finalSample[1].slice(0, i + 1);
                break;
            }
        }
    }

    const wavBlob = CreateWavFile(finalSample, pan);

    return wavBlob;
}

function ApplyGenerators(smpl, gens, key, pan) {
    let start = Math.max(smpl[1], 0);
    let end = Math.min(smpl[2], (samples.length - 1) * maxChunkSize + samples[samples.length - 1].length);
    let startLoop = smpl[3];
    let endLoop = smpl[4];
    let sampleRate = smpl[5];
    let rootKey = smpl[6];
    let pitchCorrection = smpl[7];

    let panoramic = 0;
    let initialAttenuation = 0;
    let coarseTune = 0;
    let fineTune = 0;
    let sampleMode = 0;
    let scaleTuning = 100;


    let vibLfoToPitch = 0;
    let delayVibLfo = -12000;
    let freqVibLfo = 0;

    let initialFilterFc = 13500;
    let initialFilterQ = 0;

    let delay = -12000;
    let attack = -12000;
    let hold = -12000;
    let decay = -12000;
    let sustain = 0;
    let release = -12000;
    let keynumToHold = 0;
    let keynumToDecay = 0;

    gens = gens.filter(gen => ![14, 18, 19, 20, 42, 49, 55, 59, 60].includes(gen[0]));
    gens = gens.filter(gen => ![5, 7, 10, 11, 13, 21, 22, 25, 26, 27, 28, 29, 30, 31, 32].includes(gen[0]));
    for (const gen of gens) {
        const m = gen[1];
        switch (gen[0]) {
            case 0: if (m > 0) start += m; break;
            case 1: if (m < 0) end += m; break;
            case 2: startLoop += m; break;
            case 3: endLoop += m; break;

            case 4: if (m > 0) start += m * 32768; break;
            case 12: if (m < 0) end += m * 32768; break;
            case 45: startLoop += m * 32768; break;
            case 50: endLoop += m * 32768; break;

            case 58: if (0 <= m && m <= 127) rootKey = m; break;

            case 17: if (-500 <= m && m <= 500) panoramic = m; break;

            case 46: if (0 <= m && m <= 127) key = m; break;
            //case 47: if (1 <= m && m <= 127) velocity = m; break;

            case 48: if (0 < m && m <= 1440) initialAttenuation = m; break;
            case 51: if (-120 <= m && m <= 120) coarseTune = m; break;
            case 52: if (-99 <= m && m <= 99) fineTune = m; break;
            case 54: sampleMode = m & 0b11; break;
            case 56: if (0 < m && m <= 1200) scaleTuning = m; break;


            case 6: if (-12000 <= m && m <= 12000) vibLfoToPitch = m; break;
            case 23: if (-12000 < m && m <= 5000) delayVibLfo = m; break;
            case 24: if (-16000 <= m && m <= 4500) freqVibLfo = m; break;

            case 8: if (1500 <= m && m < 13500) initialFilterFc = m; break;
            case 9: if (0 < m && m <= 960) initialFilterQ = m; break;

            case 33: if (-12000 < m && m <= 5000) delay = m; break;
            case 34: if (-12000 < m && m <= 8000) attack = m; break;
            case 35: if (-12000 < m && m <= 5000) hold = m; break;
            case 36: if (-12000 < m && m <= 8000) decay = m; break;
            case 37: if (0 < m && m <= 1440) sustain = m; break;
            case 38: if (-12000 < m && m <= 8000) release = m; break;
            case 39: if (-1200 <= m && m <= 1200) keynumToHold = m; break;
            case 40: if (-1200 <= m && m <= 1200) keynumToDecay = m; break;

            case 15: if (0 <= m && m <= 1000 && !isGen15.some(entry => entry[0] === key && entry[1] === m / 1000)) isGen15.push([key, m / 1000]); break;
            case 16: if (0 <= m && m <= 1000 && !isGen16.some(entry => entry[0] === key && entry[1] === m / 1000)) isGen16.push([key, m / 1000]); break;
            case 57: if (1 <= m && m <= 127 && !isGen57.some(entry => entry[0] === key && entry[1] === m)) isGen57.push([key, m]); break;
        }
    }
    if (!createFileForAllNotes) if (Math.abs(key - rootKey) > 12) return [];

    let buffer = [];
    let factor = Math.pow(10, -initialAttenuation / 200);
    for (let i = start; i < end; i++) {
        buffer.push(ValuesFromSamples(i) * factor);
    }

    let pitchRatio = 1;
    pitchRatio *= Math.pow(2, coarseTune / 12);
    pitchRatio *= Math.pow(2, fineTune / 1200);
    pitchRatio *= Math.pow(2, scaleTuning * (key - rootKey) / 1200);
    pitchRatio *= Math.pow(2, pitchCorrection / 1200);

    let resampled = [];
    const delayInSeconds = Math.pow(2, delayVibLfo / 1200);
    const freqInHz = 8.176 * Math.pow(2, freqVibLfo / 1200);

    const loopStart = startLoop - start;
    const loopEnd = endLoop - start;
    const loopLength = loopEnd - loopStart;

    for (let i = 0; i < Math.floor(buffer.length / pitchRatio); i++) {
        let timeInSeconds = i / sampleRate;
    
        let vibratoOffset = 0;
        if (vibLfoToPitch != 0 && timeInSeconds > delayInSeconds) {
            let lfoPhase = 2 * Math.PI * freqInHz * (timeInSeconds - delayInSeconds);
            let lfoValue = Math.sin(lfoPhase);
            let lfoRatio = Math.pow(2, (lfoValue * vibLfoToPitch) / 1200);
            vibratoOffset = i * (lfoRatio - 1) * pitchRatio;
        }

        let pos = i * pitchRatio + vibratoOffset;
        if (pos >= loopEnd) {
            if (loopLength > 0) {
                pos = ((pos - loopStart) % loopLength) + loopStart;
            } else {
                pos = loopEnd - 1;
            }
        }
        const posInt = Math.max(0, Math.min(Math.floor(pos), buffer.length - 1));
        const frac = pos - posInt;

        const y0 = buffer[Math.max(0, posInt - 1)];
        const y1 = buffer[posInt];
        const y2 = buffer[Math.min(posInt + 1, buffer.length - 1)];
        const y3 = buffer[Math.min(posInt + 2, buffer.length - 1)];

        const interpolation = CubicInterpolate(y0, y1, y2, y3, frac);
        resampled.push(interpolation);
    }

    const delayTime = Math.pow(2, delay / 1200);
    const attackTime = Math.pow(2, attack / 1200);
    const dryHoldTime = Math.pow(2, hold / 1200);
    const dryDecayTime = Math.pow(2, decay / 1200);
    const sustainLevel = (sustain >= 1000) ? 0 : Math.pow(10, -sustain / 2000);
    const releaseTime = Math.pow(2, release / 1200);
    const holdTime = dryHoldTime * Math.pow(2, keynumToHold * (key - rootKey) / 1200);
    const decayTime = dryDecayTime * Math.pow(2, keynumToDecay * (key - rootKey) / 1200);

    const totalDuration = Math.floor(targetSampleRate * wavFileDuration) / sampleRate;
    const targetDuration = Math.min((delayTime + attackTime + holdTime + decayTime + releaseTime) * 1.1, maxWavFileDuration);
    const duration = cutWavFileLength ? totalDuration : targetDuration;

    let sample = [];
    if (sampleMode == 1 || sampleMode == 3) {
        const loopStartIndex = Math.floor((startLoop - start) / pitchRatio);
        const loopEndIndex = Math.floor((endLoop - start) / pitchRatio);
        const loopLength = loopEndIndex - loopStartIndex;
        const postLoopLength = resampled.length - loopEndIndex;

        let crossfadeSamples = (endLoop - startLoop) / 10;
        for (let i = 0; i < crossfadeSamples; i++) {
            const firstPoint = loopStartIndex + crossfadeSamples - i;
            const lastPoint = loopEndIndex - crossfadeSamples + i;
            const average = (resampled[firstPoint] + resampled[lastPoint]) / 2;
    
            resampled[firstPoint] = average;
            resampled[lastPoint] = average;
        }

        const maxPoints = duration * targetSampleRate;

        for (let i = 0; i < loopStartIndex; i++) {
            sample.push(resampled[i]);
        }

        let loopIndex = 0;
        while (sample.length < maxPoints - postLoopLength) {
            sample.push(resampled[loopStartIndex + loopIndex]);
            loopIndex = (loopIndex + 1) % loopLength;
        }

        for (let i = 0; i < postLoopLength && sample.length < maxPoints; i++) {
            sample.push(resampled[loopEndIndex + i]);
        }
    } else {
        sample = resampled;
    }


    const cutoffHz = 8.176 * Math.pow(2, initialFilterFc / 1200);
    if (cutoffHz < 19912) {
        const Q = Math.pow(10, initialFilterQ / 200);
        sample = ApplyBiquadLowPass(sample, sampleRate, cutoffHz, Q);
    }

    for (let i = 0; i < sample.length; i++) {
        const time = i / sampleRate;
        if (time < delayTime) {
            sample[i] *= 0;
        } else if (time < delayTime + attackTime) {
            sample[i] *= Math.exp(Math.log(2) / attackTime * time) - 1;
        } else if (time < delayTime + attackTime + holdTime) {
            sample[i] *= 1;
        } else if (time < delayTime + attackTime + holdTime + decayTime) {
            sample[i] *= Math.exp(Math.log(epsilon + sustainLevel) / decayTime * (time - delayTime - attackTime - holdTime));
        } else if (time < duration - releaseTime) {
            sample[i] *= sustainLevel;
        } else {
            sample[i] *= Math.exp(Math.log(1 + epsilon - sustainLevel) / releaseTime * (time - (duration - releaseTime))) - (1 - sustainLevel);
        }
    }

    let panSample = [[], []];
    if (pan) {
        if (panoramic != 0) {
            for (let i = 0; i < sample.length; i++) {
                panSample[0].push(sample[i] * (500 - panoramic) / 1000);
                panSample[1].push(sample[i] * (500 + panoramic) / 1000);
            }
        } else {
            panSample[0] = sample;
            panSample[1] = sample;
        }

        return panSample;
    }

    return sample;
}

function CubicInterpolate(y0, y1, y2, y3, frac) {
    const a = y3 - y2 - y0 + y1;
    const b = y0 - y1 - a;
    return a * frac * frac * frac + b * frac * frac + (y2 - y0) * frac + y1;
}

function ApplyBiquadLowPass(sample, sampleRate, cutoffHz, Q) {
    let omega = 2 * Math.PI * cutoffHz / sampleRate;
    let alpha = Math.sin(omega) / (2 * Q);
    let cosw = Math.cos(omega);

    let b0 = (1 - cosw) / 2;
    let b1 = 1 - cosw;
    let b2 = (1 - cosw) / 2;
    let a0 = 1 + alpha;
    let a1 = -2 * cosw;
    let a2 = 1 - alpha;

    b0 /= a0; b1 /= a0; b2 /= a0;
    a1 /= a0; a2 /= a0;

    let out = [];
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

    for (let i = 0; i < sample.length; i++) {
        let x0 = sample[i];
        let y0 = b0*x0 + b1*x1 + b2*x2 - a1*y1 - a2*y2;
        out.push(y0);

        x2 = x1; x1 = x0;
        y2 = y1; y1 = y0;
    }

    return out;
}

function CreateWavFile(sample, pan) {
    const numChannels = pan ? 2 : 1;
    const bitsPerSample = 16;
    const blockAlign = numChannels * (bitsPerSample / 8);
    const byteRate = targetSampleRate * blockAlign;
    let dataSize =  0;
    if (pan) dataSize = sample[0].length * (bitsPerSample / 8) * numChannels;
    else dataSize = sample.length * (bitsPerSample / 8);
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    
    WriteString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    WriteString(view, 8, "WAVE");

    WriteString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    WriteString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;
    if (numChannels == 1) {
        for (let i = 0; i < sample.length; i++) {
            view.setInt16(offset, sample[i], true);
            offset += 2;
        }
    } else if (numChannels == 2) {
        for (let i = 0; i < sample[0].length; i++) {
            view.setInt16(offset, sample[0][i], true);
            view.setInt16(offset + 2, sample[1][i], true);
            offset += 4;
        }
    }

    return new Blob([view], { type: "audio/wav" });
}
