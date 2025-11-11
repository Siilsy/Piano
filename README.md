# 🎹 Virtual Piano – Version 2.0

A handmade, fully customizable virtual piano coded in HTML, CSS and JavaScript.  
This version introduces advanced audio features, soundfont support, MIDI file management, and fine control over playback behavior — all directly in your browser.

👉 The virtual piano is available online here: [https://siilsy.github.io/Piano](https://siilsy.github.io/Piano)

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

## ▶️ How to run it ?

**You can either:**
- Download everything inside the Piano folder, open it on your computer, and then launch the piano.html file in a browser (like Chrome, Firefox, etc.). This allows you to run a specific version of the piano locally.

**Or:**
- Simply use the online version via the link above.

  It always runs the latest version, which is more convenient — but not ideal if you need to access an older version.

---

## 🎧 Reverb & Impulse Response

Reverb only works when a `.wav` impulse response is provided. Without it, the reverb will not function — the casual sound of the piano will be heard if it's enabled with an empty buffer.

You can import your own `.wav` files (mono or stereo), or use this file with 134 impulse responses included:  
🧷 File not included by default for size reasons.

Here's the link to it: [Samplicity Bri M7 Main – 02 – Wave, 32 bit, 48 Khz, v1.1.zip (409 Mb)](https://web.archive.org/web/20190201211631/http://173.255.214.63/m7lib/Samplicity%20M7%20Main%20-%2002%20-%20Wave,%2032%20bit,%2048%20Khz,%20v1.1.zip)

And its most recent version: [Samplicity – Bricasti IRs version 2023-10.zip (964 Mb)](http://www.samplicity.com/bricasti-m7-impulse-responses/)

Recommended external IR packs:
- [Samplicity Bricasti M7 Impulses (Web Archive)](https://web.archive.org/web/20190201211631/http://www.samplicity.com/bricasti-m7-impulse-responses/)  
  These range from 196MB to 409MB — too large to embed by default.

⚠️ The file will be treated the same whether it’s mono, stereo, left channel, or right channel — so don’t worry too much about what exactly you’re importing.
Sure, it may not be ultra-realistic, but it’s more than enough: it works well, it sounds fine, and it does the job.

---

## 🎵 SoundFonts & MIDI

⚠️ Please note that the overall output level of some instruments — or even specific notes — may sound unexpectedly low. For example, in the best_for_low_data.sf2 soundfont, certain instruments are routed to the reverb effects processor at only 11% of their full level. As a result, they may sound up to 10 times quieter than expected.
Others are sent at just 1%, making them almost inaudible.
🎧 This behavior is **not a bug**, nor an issue with this synthesizer — it’s part of the original design of the soundfont itself. While it may seem unusual, that’s how the author intended it.

To mitigate this, the app includes a **toggle** to adjust how these effects are handled when they are activated in the effects window. You will find a button, either green or red and wihtout icon to activate / deactivate the inputs from `.sf2` files and only care about _your_ inputs.

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

A **dynamic release** is applied by default when you release a key.
It can feel quite rough or even awkward, and I fully agree — it’s far from perfect.
Accurately predicting how long a sound should take to fade out is tricky, and I haven't found a reliable way to improve it yet.
So yes, it may sound a bit off or unnatural in some cases, but that’s just how it is for now.

I prefer being transparent about this rather than pretending everything works flawlessly.

It only happens on the sounds from `.sf2` files. I mean, there's a dynamic release with the basic piano too but I tried my best to make it as near as perfect as I could and it's fine but for the other intruments, I did not try to find the perfect release time... 

---

## ⌨️ Keyboard Shortcuts (not tooltipped)

Some controls are accessible via keyboard as shortcuts.

So when you are on the effects window you can control theses settings via your keyboard when you're on the concerned window:

- **Volume panel**: `↑ ↓` to increase/decrease volume
- **Panoramic knob**: `W A S D` to move the panner
- **Toggle Effects**: `Enter` or `Space` to enable/disable:
  - Sustain
  - Metronome
  - Reverb
  - Chorus
  - ADSR
  - Echo
  - Distortion
- **Close window**: 'Escape' to close any opened window

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

All played or loaded files are temporarily stored in RAM so they can be accessed again during the session.

However, only files that are below a certain size limit will be saved persistently and remain available after reloading the site.

- 🎵 Last **10 MIDI files played** (max 500KB each) are cached
- 🎶 Last **5 `.mid` files loaded** (max 500KB each)
- 🥁 Last **5 `.sf2` files loaded** (max 20MB each)
- 🎧 Last **5 `.wav` impulse files** (max 5MB each)

Because .sf2 files often exceed 20MB, I implemented a manual pinning system:
You can manually “pin” a large .sf2 file to force it to persist in IndexedDB, even if it’s too large to be saved automatically.

⚠️ If the storage quota is exceeded, the file will not be saved at all — this is a safety measure to prevent errors and failed imports.

---

## 🧹 Code Notes

- Some features were added over time, so you might find parts of the code that feel inconsistent or unnecessarily       complicated — they probably could have been written more cleanly.
  The overall structure isn't always logical either: certain blocks might appear in the middle of unrelated code, and things aren’t always in the order you’d expect.
  In short... it can get pretty messy.
- Variable names are inconsistent in places (you try naming 2,174 variables!)
- Icons used from [Font Awesome](https://fontawesome.com/) (free tier)

---

## 📜 Some short explanations of tricky features
It may seem a bit tricky at first, but you'll quickly get the hang of it.

You can play everything using just your mouse, so it's easy to try out.

The piano has 88 keys, but a regular keyboard doesn't — so I divided the keyboard into 4 usable octaves, each mapped to 12 keys. You can switch octaves by pressing the digits 1 to 9, which correspond to octaves 0 to 8.

The displayed key labels follow a QWERTY layout, but it works fine with other layouts like AZERTY — just keep in mind that the key shown as "Q" will actually be "A", for example.

Finding 48 usable keyboard keys wasn’t simple, so I had to assign some unusual ones. The default layout might feel odd, but you can change everything using the Assignment Button (the cog).
All key assignment instructions are clearly explained when you open it for the first time.

---

## 👤 Personal notes

### 🛠️ Details
At first, the notes won't be playable right away because they’re still loading.
A loading screen is shown during this short delay — it usually takes less than half a second, so it’s hardly noticeable.

I tried to make the page responsive (adapted to all screen sizes), but I didn't fully succeed.
On a standard 16:9 computer screen, everything should look fine, but with unusual formats, the layout might appear a bit off. Sorry about that!

As for the visual design — I did my best.
It's just a piano, so it didn’t need to be stunning, but I still tried to make it look as nice as possible. Hopefully, the result is good enough that you won’t notice the imperfections too much.

The interface is currently only available in English.

The project was completed on July 25th, 2025, after several days of work — probably between 200 and 300 hours in total.
It turned out to be a much bigger project than I originally expected!

---

### 📍 Origin of the project 
I actually started wanting a simple piano to play for fun back in middle school. 
During tech class in 9th grade I was bored out of my mind, so I played games on Poki and discovered Piano Tiles on PC. 
I played at this game on phone and on tablet when I was younger, so I was thrilled by the game. 
It used 4 computer keys to simulate the screen instead of tapping on the tiles and I loved the idea. 
A few years later, in high school, I wanted to play it again but the game had disappeared. I looked everywhere for some alternative just to play on a keyboard, but nothing convincing ever showed up, even after installing a few supposedly “promising” apps. 

After searching for a while, I was really into learning how to play, and I wanted something simple to practice with.
At first, I downloaded a piano app from the Microsoft Store (Piano10), but the default key assignments were awful and the features were very limited.
I tried recording with OBS (or sometimes exporting MP3s), but in reality, the app just created .xscore files that could only be read by itself — completely useless.

Eventually, I got tired of the limitations and decided to build my own piano.
That app also had default chords, but they weren’t great either. So I basically copied every broken feature from that piano, reworked them, improved them, and made everything easier to use and to access.

The original app only had 31 notes...
I built a full 88-key piano!

(They’ve actually improved their product since then, and it looks better now, but it's still far away from mine...)

For the sounds, I "borrowed" the audio from an online piano that made 88 network requests at startup — so I was able to grab all the notes quite easily.
While inspecting other online pianos, I came across one with a visual keyboard preview showing which part of the piano was visible — I liked the idea, so I reused it too.

In short, I didn't plan it, but by exploring various online pianos, I ended up collecting the features I liked and bringing them into my own project. So my piano is like a best-of of online pianos. 

The first version was already promising, but then I wanted to record and replay music.
At first, I thought of building my own custom format — until I discovered that MIDI files already did exactly what I had in mind.
It looked great, but the songs I had required more instruments, so I tried downloading extra ones — which was a pain — until I found out about SoundFonts (.sf2). That discovery saved me.

Reading and decoding .sf2 files was incredibly hard. The official spec was 88 pages long, but I pushed through it, and the results were worth the effort.

Later on, I wanted persistent features — so I added LocalStorage and IndexedDB, which turned out to be perfect.
My piano finally became useful, reliable, and powerful.

Then I added all the effects I wanted — and that was it.
I had a super complete piano that matched all my expectations.

> In the end... I created something amazing.
> But the funny thing is — I don't even use it.

---

## 🗺️ Project timeline

**Version 1:**
- started in July 2024 (Monday, June 3rd, 2024, 19:42:18)
- finished in August 2024 (Monday, August 26th, 2024, 13:55:22)

**Version 2:**
- started in February 2025 (Saturday, February 15th, 2025, 23:30:20)
- paused in April 2025 (around Wednesday, April 23rd, 2025, 23:59:58)
- resumed on Monday, June 30th, 2025 (around 2 p.m. — file modified at 14:58:30)
- finished on July 25th, 2025 (Friday, July 25th, 2025, 21:22:30)

| Version | Start | End |
|---------|-------|-----|
| **V1** | June 3, 2024 | August 26, 2024 |
| **V2** | Feb 15, 2025 | July 25, 2025 |
