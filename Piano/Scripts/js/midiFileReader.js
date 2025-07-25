
let format = 0;     //Format of the file
let ntrks = 0;    //Number of Tracks
let division = 0;     //Division of time in the file

let chunkLookup = new Array();

let currentTime = 0;
let initialTempo = 500_000;
let msPerTick = 0;
let tempoChanges = [[0, initialTempo]];

let currentPort = 0;
let instrumentsCanal = Array.from({ length: 16 }, () => Array.from({ length : 16 }, (_, channel) => (channel == 9 ? 128 : 0)));
let instrumentTable = [];

let lyrics = new Map();
let copyright = "";
let textEvent = new Array();
let mLiveTag = new Map();

let music = new Array();
let notesBuffer = new Map();
let sustain = new Array();

let midiFileInput = document.getElementById("midiInput");
midiFileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) {
        console.warn("File deleted.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const midiFile = new DataView(arrayBuffer);

        try {
            ResetMidiValues();
            await ProcessMidiFile(midiFile);
            console.log("Analysis of Midi file completed successfully!\n" + file.name + " launched!");

            //Save to recentMidiFiles
            const name = file.name;
            const blob = new Blob([arrayBuffer], { type: "audio/midi" }); //I just set a random type for the sake of it — it's local, I'm the only one reading it, so who cares.
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
    }

    reader.readAsArrayBuffer(file);
    midiFileInput.value = '';
});

function ResetMidiValues() {
    format = 0;
    ntrks = 0;
    division = 0;
    
    chunkLookup = new Array();

    currentTime = 0;
    initialTempo = 500_000;
    msPerTick = 0;
    tempoChanges = [[0, initialTempo]];

    currentPort = 0;
    instrumentsCanal = Array.from({ length: 16 }, () => Array.from({ length : 16 }, (_, channel) => (channel == 9 ? 128 : 0)));
    instrumentTable = [];

    lyrics = new Map();
    copyright = "";
    textEvent = new Array();
    mLiveTag = new Map();

    music = new Array();
    notesBuffer = new Map();
    sustain = new Array();
}



/* function GetChunkID(file, offset) {
    const chunkID = String.fromCharCode(
        file.getUint8(offset),
        file.getUint8(offset + 1),
        file.getUint8(offset + 2),
        file.getUint8(offset + 3)
    )

    return chunkID;
} */ //This was the previous version but I mixed and improved it with the sounfFontFileReader

function ReadVLQ(file, offset) {
    let value = 0;
    let byte;

    do {
        byte = file.getUint8(offset++);
        value = (value << 7) | (byte & 0x7F);
    } while (byte & 0x80);

    return { value, newOffset : offset };
}

function ReadMidiHeaderChunk(file) {
    const signature = GetChunkID(file, 0)
    if (signature !== "MThd") {
        throw new Error("Invalid MIDI file!");
    }

    const MThdLen = file.getUint32(4);     //Length of the Header Chunk
    if (MThdLen !== 6) {
        throw new Error("Header Chunk non compliant!");
    }

    format = file.getUint16(8);
    ntrks = file.getUint16(10);
    division = file.getUint16(12);
}

async function ProcessMidiFile(file) {
    ReadMidiHeaderChunk(file);
    
    chunkLookup = ReadMidiChunks(file);
    for (let i = 0; i < chunkLookup.length; i++) {
        ReadTrackChunk(file, chunkLookup[i]);
    }

    // if (copyright == "") copyright = "No Copyright"; //Can be useful but also annoying to have a button for nothing
}

function ReadMidiChunks(file) {
    let list = new Array();

    const fileLength = file.byteLength;
    let offset = 14;
    while (offset < fileLength) {
        let chunkID = GetChunkID(file, offset);
        if (chunkID !== "MTrk") {
            throw new Error("Unexpected byte found, structurally unsound file.");
        }
        list.push(offset);

        const chunkSize = file.getUint32(offset + 4);
        offset += chunkSize + 8;
    }

    if (list.length != ntrks) {
        throw new Error("Number of tracks not respected compared to what was declared in the Header Chunk.");
    }

    return list;
}

function ReadTrackChunk(file, offset) {

    const chunkSize = file.getUint32(offset + 4);
    offset += 8;
    const endOfChunk = offset + chunkSize;

    let state = { isFinished: false, previousStatus: 0x00 };
    if (format != 2) currentTime = 0;

    while (!state.isFinished) {
        let { value: deltaTime, newOffset: newOffset } = ReadVLQ(file, offset);
        offset = newOffset;
        msPerTick = GetMsPerTickAtTime(currentTime);
        deltaTime = deltaTime * msPerTick / 1000;
        currentTime += deltaTime;

        const eventType = file.getUint8(offset);
        if (eventType == 0xF0 || eventType == 0xF7)    offset = ReadSysExEvent(file, offset);
        else if (eventType == 0xFF)                    offset = ReadMetaEvent(file, offset, state);
        else                                           offset = ReadMidiEvent(file, offset, state);
    }

    if (offset != endOfChunk) {
        throw new Error("The chunk is longer than expected.");
    }
}

function ReadMidiEvent(file, offset, state) {
    const status = file.getUint8(offset);
    offset = AnalyzeMidiEvent(file, status, offset + 1, state);
    return offset;
}
function AnalyzeMidiEvent(file, status, offset, state, newEvent = true) {
    const eventType = status & 0xF0;
    const midiCanal = status & 0x0F;
  
    if (eventType == 0x80) {
        const note = file.getUint8(offset);
        NoteOffEvent(note, instrumentsCanal[currentPort][midiCanal]);
        offset += 2;
    } else if (eventType == 0x90) {
        const note = file.getUint8(offset);
        const velocity = file.getUint8(offset + 1);
        const instrument = instrumentsCanal[currentPort][midiCanal];
        const key = `${instrument}-${note}`;
        if (velocity != 0) {
            if (!notesBuffer.has(key)) notesBuffer.set(key, []);
            notesBuffer.get(key).push([currentTime, velocity]);
        } else {
            NoteOffEvent(note, instrument);
        }
        offset += 2;
    } else if (eventType == 0xA0) {
        //Skip Polyphonic Key Pressure (Aftertouch)
        offset += 2;
    } else if (eventType == 0xB0) {
        const controllerNumber = file.getUint8(offset);
        if (controllerNumber == 64) {
            const newValue = file.getUint8(offset + 1);
            if (newValue < 63) sustain.push([currentTime, false]); 
            if (newValue > 64) sustain.push([currentTime, true]);
        }
        //I don't care about the others controllers
        offset += 2;
    } else if (eventType == 0xC0) {
        const patch = file.getUint8(offset);
        if (midiCanal == 9) console.warn('Program Change detected on channel 10 — ignored due to GM percussion rules.');
        else instrumentsCanal[currentPort][midiCanal] = patch;
        offset += 1;
    } else if (eventType == 0xD0) {
        //Skip Channel Pressure (After-touch)
        offset += 1;
    } else if (eventType == 0xE0) {
        //Skip Pitch Wheel Change
        offset += 2;
    } else {
        const status = state.previousStatus;
        offset = AnalyzeMidiEvent(file, status, offset - 1, state, false);
        newEvent = false;
    }
    if (newEvent) state.previousStatus = status;
    return offset;
}
function NoteOffEvent(note, instrument) {
    const key = `${instrument}-${note}`;
    if (notesBuffer.has(key) && notesBuffer.get(key).length > 0) {
        const playedNote = notesBuffer.get(key).shift();
        const startTime = playedNote[0];
        const velocity = playedNote[1];
        const duration = currentTime - startTime;
        music.push([startTime, note, duration, velocity, instrument]);
        if (notesBuffer.get(key).length === 0) notesBuffer.delete(key);
    }
}

function ReadSysExEvent(file, offset) {
    const firstByte = file.getUint8(offset);
    let isFinished = false;
    while (!isFinished) {
        let { value: packetLength, newOffset: newOffset } = ReadVLQ(file, offset + 1);
        offset = newOffset + packetLength;
        let lastByte = file.getUint8(offset - 1);
        if (lastByte == 0xF7 || firstByte == 0xF7) {
            isFinished = true;
        } else {
            let { value: deltaTime, newOffset: newOffset1 } = ReadVLQ(file, offset);
            offset = newOffset1;
            const eventByte = file.getUint8(offset);
            if (eventByte != 0xF7) {
                throw new Error("Unexpected byte found, early SysEx termination.");
            }
        }
    }

    return offset;
}

function ReadMetaEvent(file, offset, state) {
    const event = file.getUint8(offset + 1);
    let { value: eventLength, newOffset: newOffset } = ReadVLQ(file, offset + 2);
    offset = newOffset;
    const finalOffset = offset + eventLength;
    
    if (event == 0x01) {
        let text = "";
        for (let i = 0; i < eventLength; i++) {
            text += String.fromCharCode(file.getUint8(offset + i));
        }
        textEvent.push(text);
    } else if (event == 0x02) {
        for (let i = 0; i < eventLength; i++) {
            copyright += String.fromCharCode(file.getUint8(offset + i));
        }
    } else if (event == 0x05) {
        let currentLyric = "";
        for (let i = 0; i < eventLength; i++) {
            currentLyric += String.fromCharCode(file.getUint8(offset + i));
        }
        const timing = Math.fround(currentTime);
        if (!lyrics.has(timing)) lyrics.set(timing, []);
        if (!lyrics.get(timing).includes(currentLyric)) {
            lyrics.get(timing).push(currentLyric);
        }
    } else if (event == 0x21) {
        if (eventLength != 1) {
            console.warn("The length of the 'MIDI port' event is not correct. This could have caused errors!");
        }
        currentPort = file.getUint8(offset);
    } else if (event == 0x2F) {
        if (eventLength != 0) {
            console.warn("The length of the 'End Of Track' event is not correct. This may have caused errors!");
        }
        state.isFinished = true;
    } else if (event == 0x4B) {
        const tt = file.getUint8(offset);
        let tag = "";
        switch (tt) {
            case 1: tag = "Musical genre"; break;
            case 2: tag = "Artist"; break;
            case 3: tag = "Composer"; break;
            case 4: tag = "Duration"; break;
            case 5: tag = "Tempo"; break;
            default: console.warn("Unknown :", tt); tag = "Unknown";
        }
        let tagValue = "";
        for (let i = 0; i < eventLength - 1; i++) {
            tagValue += String.fromCharCode(file.getUint8(offset + 1 + i));
        }
        if (!mLiveTag.has(tag)) mLiveTag.set(tag);
        mLiveTag.get(tag).push(tagValue);
    } else if (event == 0x51) {
        if (eventLength != 3) {
            console.warn("The length of the 'Set Tempo' event is not correct. This could have caused errors!");
        }
        tempo = (file.getUint8(offset) << 16 | file.getUint8(offset + 1) << 8 | file.getUint8(offset + 2));
        tempoChanges.push([currentTime, tempo]);
    }

    return finalOffset;
}

function GetMsPerTickAtTime(time) {
    let currentTempo = tempoChanges[0][1];
    
    for (const change of tempoChanges) {
        if (change[0] > time) break;
        currentTempo = change[1];
    }

    const msPerTick = (currentTempo / 1000) /division;
    return msPerTick;
}





const defaultInitialVelocity = 128;

function CreateMidiBlob(music, sustain) {
    const midiData = CreateMidiFile(music, sustain);

    const midiArray = new Uint8Array(midiData);

    return new Blob([midiArray], { type: "audio/midi" });
}

function CreateMidiFile(music, sustains) {
    const bytes = [];

    const instrumentGroups = new Map();
    for (const note of music) {
        const instrument = note[3];

        if (!instrumentGroups.has(instrument)) instrumentGroups.set(instrument, []);
        instrumentGroups.get(instrument).push(note);
    }
    let size = instrumentGroups.size;
    if (instrumentGroups.has(128)) size--; //If we have a percussion it's like we don't have a new instrument because it doesn't block us. We're blocked because there's only 15 MIDI canal apart from percussion so the percussion doesn't prevent us in the size

    WriteStr(bytes, "MThd");
    WriteUint32(bytes, 6);
    WriteUint16(bytes, 1);
    WriteUint16(bytes, 1 + Math.ceil(size / 15));
    WriteUint16(bytes, 480);


    WriteStr(bytes, 'MTrk');
    {
        const firstChunk = [];
        WriteByte(firstChunk, 0);
        WriteByte(firstChunk, 255); WriteByte(firstChunk, 2);
        {
            const copyrightText = '© 2025 Gallais Maëlan - Distributed under the MIT License';
            const vlq = EncodeVLQ(copyrightText.length);
            for (const byte of vlq) {
                WriteByte(firstChunk, byte);
            }
            WriteStr(firstChunk, copyrightText);
        }

        WriteByte(firstChunk, 0);
        WriteByte(firstChunk, 0xFF); WriteByte(firstChunk, 0x01);
        {
            const text = GetLocalDateString();
            const vlq = EncodeVLQ(text.length);
            for (const byte of vlq) {
                WriteByte(firstChunk, byte);
            }
            WriteStr(firstChunk, text);
        }

        for (let i = 0; i < sustains.length; i++) {
            const [timestamp, sustainMode] = sustains[i];
            const deltaTime = MsToTicks(!i ? timestamp : timestamp - sustains[i - 1][0]);

            const vlq = EncodeVLQ(deltaTime);
            for (const byte of vlq) {
                WriteByte(firstChunk, byte);
            }
            WriteByte(firstChunk, 0xB0);
            WriteByte(firstChunk, 0x40);
            WriteByte(firstChunk, sustainMode ? 0x7F : 0x00);
        }

        WriteByte(firstChunk, 0x00); WriteByte(firstChunk, 0xFF); WriteByte(firstChunk, 0x2F); WriteByte(firstChunk, 0x00);


        WriteUint32(bytes, firstChunk.length);
        for (const byte of firstChunk) {
            WriteByte(bytes, byte);
        }
    }

    for (let i = 0; i < Math.ceil(size / 15); i++) {
        WriteStr(bytes, 'MTrk');
        const chunk = [];

        const table = new Map();
        let index = 0;
        for (const [inst] of instrumentGroups) {
            if (!table.has(inst)) {
                if (inst === 128) {
                    table.set(inst, 9); //Percussion on canal 10 so index 9
                } else {
                    if (index === 9) index++; //Skip the percussion canal
                    if (index === 16) break; //Max of 16 canals
                    table.set(inst, index);
                    WriteByte(chunk, 0); //DeltaTime of 0 for this
                    WriteByte(chunk, 0xC0 | index); //Event 0xC0 : Program Change
                    WriteByte(chunk, inst);
                    index++;
                }
            }
        }

        const events = [];
        for (const [inst, notes] of instrumentGroups) {
            const canal = table.get(inst);
            if (canal === undefined) continue;

            for (const note of notes) {
                const [start, key, duration] = note;
                const end = start + duration;
                events.push({
                    time: start,
                    key,
                    canal,
                    velocity: defaultInitialVelocity,
                    on: true,
                });
                events.push({
                    time: end,
                    key,
                    canal,
                    velocity: 0,
                    on: false,
                });
            }
        }

        events.sort((a, b) => a.time - b.time);

        let lastTime = 0;
        let lastStatus = null;

        for (const e of events) {
            const deltaTime = e.time - lastTime;
            WriteVLQ(chunk, MsToTicks(deltaTime));
            lastTime = e.time;

            const status = 0x90 | e.canal;
            if (status !== lastStatus) {
                WriteByte(chunk, status);
                lastStatus = status;
            }

            WriteByte(chunk, e.key);
            WriteByte(chunk, e.velocity);
        }

        WriteByte(chunk, 0x00);
        WriteByte(chunk, 0xFF); // Meta event
        WriteByte(chunk, 0x2F); // End of track
        WriteByte(chunk, 0x00);

        WriteUint32(bytes, chunk.length);
        for (const byte of chunk) {
            WriteByte(bytes, byte);
        }
    }
    
    return bytes;
}

function WriteVLQ(buffer, value) {
    const vlq = EncodeVLQ(value);
    for (const byte of vlq) {
        WriteByte(buffer, byte);
    }
}

function MsToTicks(ms, division = 480, tempo = 500_000) {
    return Math.round((ms * division * 1000) / tempo);
}

function EncodeVLQ(value) {
    if (value === 0) return [0];

    const bytes = [];

    while (value > 0) {
        bytes.unshift(value & 0x7F);
        value >>= 7;
    }

    for (let i = 0; i < bytes.length - 1; i++) {
        bytes[i] |= 0x80;
    }

    return bytes;
}

function WriteStr(buffer, str) {
    for (let i = 0; i < str.length; i++) {
        buffer.push(str.charCodeAt(i) & 0xFF);
    }
}

function WriteByte(buffer, val) {
    buffer.push(val & 0xFF);
}

function WriteUint16(buffer, val) {
    buffer.push((val >> 8) & 0xFF, val & 0xFF);
}

function WriteUint32(buffer, val) {
    buffer.push((val >> 24) & 0xFF, (val >> 16) & 0xFF, (val >> 8) & 0xFF, val & 0xFF);
}
