# TourJS

Background: During the pandemic, I wanted to race bikes online with friends, without needing everyone to sign up to one of the paid services.  I also wanted to learn about websockets and try making a real-time multiplayer browser game, so I made TourJS!

## Design
TourJS is a ReactJS single page app.  It uses Auth0 for authentication and talks to a custom NodeJS server for REST calls and game state.  During the game, it uses three.js for 3D display.  It receives cycling data from your powermeter via web-bluetooth, which means it requires Chrome (on Android, MacOS, or Windows) to work.

## Shortcomings
As with any personal project, there's lots of things that aren't perfect, are buggy, are unfinished, are hacks, etc.  The UI is ugly, the 3D portion ain't great, and probably lots of the JS/TS portions are unclean.  But it works!

## How do I play?
If you just want to play, it _should_ be working at https://tourjs.ca.  Sign up, get on your trainer, connect, and play.

## How do I develop?
For both websockets and bluetooth access, chrome prefers to be running a named https server.  The react app is set up to create a local https server while developing, but to get the hostname right you need to add the line `127.0.0.1 dev.tourjs.ca` to your `/etc/hosts` file.  Consult your OS docs to find out where `hosts` lives on your system.

### Cloning / Installing

- Versions: I successfully built a fresh clone of this repo on Oct 11, 2024 with node 20.10.0 and npm 10.5.0
 - `git clone <this repo>`
 - `cd <this repo>/tourjs-react` 
 - `npm install` 
 - Make sure you've added `127.0.0.1 dev.tourjs.ca` to your OS's `hosts` file
 - `npm run start` 
 - Open your browser to `https://dev.tourjs.ca:3000` and you'll immediately get bounced to Auth0 to sign in.  
 - Sign up, then try opening `https://dev.tourjs.ca:3000` again and you should be in.
	 - Known bug: incognito mode tends to get stuck in a loop because auth0 is unable to save some token it needs.  So make sure to open in a normal chrome window.  Or fix that bug!

### Editing The Game Experience
With all fitness-related apps, it can be a big pain to develop since you don't necessarily _want_ to have to ride your bike to reproduce an issue or test a new feature.  To this end, you can use https://dev.tourjs.ca:3000/test-hacks.  The `test-hacks` page starts a new, fake, race with all players at random locations.  You can then modify the UI as needed.  If you need to modify the starting position of the rider or opponents, you can edit the `FakeUserProvider` to provide different users.

### Editing the Homepage UI
Since the game is designed to need an active connection to a powermeter in order to get connected and you may not have one, the dev.tourjs.ca edition should let you "connect" a fake powermeter just by clicking on the powermeter button.  It will pop an alert dialog asking if you want a fake powermeter, just click yes.

### Editing the Race-Lobby UI
You can go to https://dev.tourjs.ca:3000/racelobby-hacks and the game will set up a fake race lobby populated with other riders (yourself, other "humans", and AI bots).