# 🎹 Virtual Piano – Version 2.0

A handmade, fully customizable virtual piano coded in HTML, CSS and JavaScript.  
This version introduces advanced audio features, soundfont support, MIDI file management, and fine control over playback behavior — all directly in your browser.

👉 The virtual piano is available online here: [https://maelangallais.github.io/Piano](https://maelangallais.github.io/Piano)

Or, you can download it directly from GitHub — which is where you are right now. Both options have pros and cons:
 - Even though both versions run in the same browser, they do not share the same memory. This means you won’t be able to access presets saved in one version from the other.
 - The main advantage of the local version is that it works offline, which can come in handy if you want to play while you’re without an internet connection.

---

## 🌟 What's New in Version 2.0

- ✅ Rewritten with the **Web Audio API** (no more `Audio()`), allowing:
  - 🎧 Reverb, Echo, Chorus
  - 🎚️ Volume & Pan control
  - 🎛️ ADSR envelope, Dynamic Release
  - ⚡ Distortion & Effects toggling
  - 🔔 Metronome feature
- 📥 Support for `.mid` and `.sf2` files (play, record, export)
- 🧠 SoundFont buffer storage in RAM or IndexedDB (with size limits)
- 🎼 Playback system that handles MIDI timing and velocity
- 🎛️ Custom keyboard mapping for all 88 keys (all explained)
- 📁 Reverb impulse loading via `.wav` import
- 🧩 Simple caching for last-used files (15 MIDI, 5 SF2, 5 WAV)
- 🧠 LocalStorage-based persistent state

---

## 🚀 More ?

📖 Detailed documentation is available in the [Project Wiki](https://github.com/maelangallais/Piano/wiki).
