# 🎹 Piano
A simple handmade virtual piano, very easy to play with and coded mostly in JavaScript!
#

## ⌨️ Inputs
It's a bit hard but you'll understand very quickly how it works.

You can do everything only with your mouse so it's pretty easy, right?

I have 88 keys on my piano but on a normal keyboard, there aren't that many keys. So I had to assign 4 octaves to deal with and assign each octave 12 keys on my keyboard. To change the selected octaves, you can press the first 9 digits. There are 9 octaves from 0 to 8, so the digits from 1 to 9 fit perfectly!

Everything will be explained. First, you need to select an octave to edit, and then you'll choose the target octave with which you want to exchange. This will transfer all your key assignments at the same time! There are two different sets of selected octaves: one for each of the two piano modes. This makes it more practical!

The keyboard keys for the piano are displayed for a 'QWERTY' keyboard, but it doesn't matter which keyboard layout you have. If you are using 'AZERTY', you just have to remember that the displayed 'Q' on a piano key is actually the 'A' on your keyboard.

I had to find the 48 keyboard keys I needed and it wasn't easy, so I sometimes used rare keys. By default, the keys are strange and can be disturbing, but you have the 'Assignment Button' (a cog) to change the keys. You can also press the 'Delete' button to activate the mode. You will be able to select a note to assign it a new key. You can also put different piano keys on one keyboard key to play a chord. If you want to create a song with certain keys, you can simply activate Assignment Mode and press 'Delete' to delete all the assignments. To delete keys individually, you can choose them, and when you need to assign a new key, press the 'Delete' key and it will delete the assignment.

You can change the view of the piano with the arrows at the top. The single arrows move you by one note and the double arrows move you by one octave to the left or right. You can also use the directional arrows on your keyboard.
You also have the small visualization with which you can interact by dragging and dropping the selection part of the piano that you currently see. This will move the part of the piano that you see.

The notes are normally named by default with the MIDI notation (C5, C#5, D5 ...), but you can switch to Latin notation (Do, Do#, Re) with the button at the top, which is two circular arrows. And of course, you also have the 'Insert' button.

By default, the notes are very ugly because you don't have Sustain Mode. You can fortunately switch the Mode with the button in the top center, represented by the classic image of the Pedal. Otherwise, the keyboard key for that is 'Alt Right'. 

To finish, there is also a button to switch between two modes: 'piano mode' and 'keyboard mode'. It's quite simple; one is the basic mode where you can assign one keyboard key to each piano key, and the other allows you to assign as many piano keys as you want to each keyboard key. 

I will now explain the little changes that happen with 'keyboard mode', it looks hard but in practice it's really simple. Assigning a new key is similar. You can still remove all the assignments with 'Escape' and change all the piano keys assigned to one keyboard key to another. In this mode, you can select a piano key that is already assigned and assign a new key. To remove a specific keyboard key from a piano key, you can press that key after selecting the piano key. If you press 'Escape' at this moment, all the assignments of this piano key will disappear. 
##

## 🛠️ Details
At the beginning, the notes are not going to be playable because they are still loading. I put a Loading Screen for that but it's a bit longer. I tried to add a timer to prevent playing for about 1 second but it doesn't really matter. This also happens when you leave and come back to the page. Just wait a good second and it will be alright!

I tried to make a responsive page (adapted to all screen sizes) but I didn't really succeed, but it's roughly correct. I'm sorry, but it will be hard to play on a phone I think... maybe if you turn the phone on its side?

For the beauty of this project, I tried my best... It's just a piano, it didn't need to be THAT beautiful. I tried and I hope I succeeded in making it as beautiful as I could and normally, it's alright. You won't pay attention to these types of details...

Unfortunately, it's in French, but there isn't much text so it shouldn't be hard to understand (at least I hope).

The project was finished on July 18th, 2024 after several hours of work (something like 50 - 60 hours I think (I was discovering JavaScript)).
##
