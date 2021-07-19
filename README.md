![YoutubeTogether Logo](https://github.com/yelshall/YoutubeTogether-chrome-extension/blob/main/images/128logo.png)

# YoutubeTogether-chrome-extension

YoutubeTogether is a Google Chrome extension that allows you to watch Youtube videos synchronously with your friends! Just click the start watching button, enter a username, and send the link to all your friends! 

## Description

You know the joke about computer scientists where they could just do a task in 5 minutes, but instead end up trying to automate for 2 hours? This is exactly this. 

The extension started from a small problem that me and my friend had when we wanted to watch videos together, none of the extensions worked! So... I built YoutubeTogether! It was made using JavaScript + HTML + CSS for the client-side, and Node.js + Socket.io + Javascript for the server-side. This project was my first exposure to Web Development and this was the first time I ever coded in JavaScript, so the code might look a bit messy.

Moving forward, I hope this extension into something more solid and has better functionality, but I am happy leaving it as is for now. Anyone is free to contribute whatever they want to this project (List of wanted features/bugs to fix below).

## Getting Started

### Dependencies

* Socket.io (Client-side version - already in the files)
* Socket.io (Server-side version)
* Express
* Nodemon (For ease-of-use while developing)

### Installing and running

1. Download the files from this repository.
2. In the background.js file, change line 140 to `socket = io("https://youtubetogetherserver.herokuapp.com/");` if you want to connect to the server locally, or keep as is to connect to the remote server that I hosted (If so, skip instructions 3-5).
3. Add the entire folder to Chrome (Instructions can be found on the Chrome dev website on how to load Chrome extensions from your device).
4. Navigate to the server folder and type in: `npm install`.
5. Start server using `npm run devStart` (Restarts the server if changes are made) or `npm run start` (Regular startup).
6. Enjoy!

## Help

Email me at youtubetogethersupport@gmail.com

## Authors

* yelshall - Developer
* omar - Design

## Version History

* 0.1
    * Initial Release

## Wanted Features, Bugs, Todo
* Wanted Features
   * Want multiple users to control the video instead of having only master control.
   * Want a better chatting interface, with options of sending gifs and emojis.
   * Want better integration with Youtube so that you can watch multiple videos in one room, instead of starting a new room for each video.
   * Want better integration with Youtube playlists.
* Todo
   * Better server implementation such that it removes idle users after inactivity.
   * Better server implementation such that it stores users and rooms externally in a database rather than in an array.
   * Cleanup the client-server communication code.
   * Clean up scripts for the extension's pages.
   * Write better comments in the code.
   * Get better screenshots.
* Bugs
   * There bugs that I probably didn't catch. Feel free to report them.
# Screenshots

![Startwatching screenshot](https://github.com/yelshall/YoutubeTogether-chrome-extension/blob/main/images/start-watching-screenshot.PNG)
![Enterusername screenshot](https://github.com/yelshall/YoutubeTogether-chrome-extension/blob/main/images/enter-username-screenshot.PNG)
![Mainpage screenshot](https://github.com/yelshall/YoutubeTogether-chrome-extension/blob/main/images/main-page-screenshot.PNG)
![Settingspage screenshot](https://github.com/yelshall/YoutubeTogether-chrome-extension/blob/main/images/settings-page-screenshot.PNG)
