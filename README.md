# 🎹 Virtual Piano – Version 2.0

A handmade, fully customizable virtual piano coded in HTML, CSS and JavaScript.  
This version introduces advanced audio features, soundfont support, MIDI file management, and fine control over playback behavior — all directly in your browser.

---

## 🌟 What's New in Version 2.0

- ✅ Rewritten with the **Web Audio API** (no more `Audio()`), allowing:
  - 🎧 Reverb, Echo, Chorus
  - 🎚️ Volume & Pan control
  - 🎛️ ADSR envelope, Dynamic Release
  - ⚡ Distortion & Effects toggling
- 📥 Support for `.mid` and `.sf2` files (play, record, export)
- 🧠 SoundFont buffer storage in RAM or IndexedDB (with size limits)
- 🎼 Playback system that handles MIDI timing and velocity
- 🎛️ Custom keyboard mapping for all 88 keys (4 active octaves)
- 📁 Reverb impulse loading via `.wav` import (optional)
- 🧩 Simple caching for last-used files (10 MIDI, 5 SF2, 5 WAV)
- 🧠 LocalStorage-based persistent state
- 🕹️ Keyboard shortcuts to control effects directly

---

## 🎧 Reverb & Impulse Response

Reverb only works when a `.wav` impulse response is provided. Without it, the reverb will not function — no sound will be heard if it's enabled with an empty buffer.

You can import your own `.wav` files (mono or stereo), or use this file with 134 impulse responses included:  
🧷 File not included by default for size reasons.

Recommended external IR packs:
- [Samplicity Bricasti M7 Impulses (Web Archive)](https://web.archive.org/web/20190201211631/http://www.samplicity.com/bricasti-m7-impulse-responses/)  
  These range from 196MB to 409MB — too large to embed by default.

---

## 🎵 SoundFonts & MIDI

⚠️ SoundFonts may sound unusually quiet. Some `.sf2` files send instruments to reverb processors at only 11%, 5%, or even 1% volume.  
This is **not a bug**, it's the original design of the soundfont.

To mitigate this, the app includes a **toggle** to adjust how these effects are handled.

You can import your own `.sf2` files, but some are too large to be saved persistently. Files under 20MB are saved; larger files must be pinned manually in IndexedDB.

Recommended free SF2s (Wayback Machine):

| Name | Size | Link |
|------|------|------|
| Creative (emu10k1) 8MBGMSFX | 7.2MB | [🔗 Download](https://archive.org/download/free-soundfonts-sf2-2019-04/Creative%20%28emu10k1%298MBGMSFX.SF2) |
| airfont_320_neo | 18.8MB | [🔗 Download](https://archive.org/download/free-soundfonts-sf2-2019-04/airfont_320_neo.sf2) |
| airfont_340 | 76.8MB | [🔗 Download](https://archive.org/download/free-soundfonts-sf2-2019-04/airfont_340.sf2) |
| airfont_380_final | 263.1MB | [🔗 Download](https://archive.org/download/free-soundfonts-sf2-2019-04/airfont_380_final.sf2) |

Those are the best I came up with (and I heard about the airfont that are apparently really good) but if you want to check it by yourself the best place to do so (for me) is on the WayBack Machine (but you can surely find SoundFonts else where by yourself if you want to!): 
[WayBack Machine page](https://archive.org/download/free-soundfonts-sf2-2019-04)

> Fully compatible with SoundFont 2 specs !!

---

## 🔊 ADSR Behavior

- `.sf2` notes automatically receive a basic ADSR envelope on load.
- Real recorded piano notes already include their natural decay.
- When you apply your own ADSR, it **layers on top** of the existing one.
- This can cause unusual results but is usually subtle and acceptable.

The same applies to the **dynamic release** system: it's intentionally basic, and timing may not feel 100% natural.

---

## ⌨️ Keyboard Shortcuts (not tooltipped)

Some controls are accessible only via keyboard:

- **Volume panel**: `↑ ↓` to increase/decrease volume
- **Panoramic knob**: `W A S D` to move the panner
- **Toggle Effects**: `Enter` or `Space` to enable/disable:
  - Sustain
  - Reverb
  - Chorus
  - ADSR
  - Echo
  - Distortion

---

## 📱 Compatibility Notice

⚠️ Not usable on mobile — the screen is too small, and there's no hover interaction on certain buttons.  
You can still play basic piano notes, but for the full experience, please use a computer.
If you want to have a piano on your phone, check the first version which was just a simple piano but with way less features, so it's clearly better for you if you just want to play with a basic piano.

🛠️ Tested on:  
> **Laptop model**: Inspiron 14 5435 (Windows 11, Chrome)  
> Not tested on other systems, so bug reports are welcome!

---

## 📦 Storage & Limits

- 🎵 Last **10 MIDI files played** (max 500KB each) are cached
- 🎶 Last **5 `.sf2` files loaded** (max 20MB each)
- 🎧 Last **5 `.wav` impulse files** (max 5MB each)
- ✅ Large files can be "pinned" manually to persist in IndexedDB

---

## 🧹 Code Notes

- Many features were added incrementally → logic may be messy
- Variable names are inconsistent in places (you try naming 2,174 variables!)
- Some features interrupt others — sorry in advance!
- Icons used from [Font Awesome](https://fontawesome.com/) (free tier)

---

## 📜 Project Timeline

| Version | Start | End |
|---------|-------|-----|
| **V1** | June 3, 2024 | August 26, 2024 |
| **V2** | Feb 15, 2025 | July 25, 2025 |
