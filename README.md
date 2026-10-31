# ExactSpace React Assignments

This repository contains the complete solutions for the ExactSpace React developer assignments:
1. **Chat App**: Real-time team chat application in ReactJS with all **Stretch Goals** (Emoji Picker, `@` Mentions, and Express + Socket.IO Publish/Subscribe WebSocket communication).
2. **Photo Gallery**: Single-page infinite scroll photo gallery based on paginated JSON feeds from Picsum Photos with FontAwesome interactive like buttons and 1-column layout.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Assignment 1: Chat App (with all Stretch Goals)](#assignment-1-chat-app-with-all-stretch-goals)
  - [Core Features](#core-features)
  - [Stretch Goals Implemented](#stretch-goals-implemented)
  - [Architecture & Socket.IO Pub/Sub Protocol](#architecture--socketio-pubsub-protocol)
  - [Running the Chat App](#running-the-chat-app)
- [Assignment 2: Photo Gallery (Infinite Scroll)](#assignment-2-photo-gallery-infinite-scroll)
  - [Core Features](#core-features-1)
  - [Implementation Details](#implementation-details)
  - [Running the Photo Gallery](#running-the-photo-gallery)
- [Build & Production](#build--production)

---

## Project Structure

```text
react-assignments/
├── package.json                    # Root package with multi-project scripts
├── .gitignore                      # Git ignore rules
├── README.md                       # Comprehensive assignment documentation
│
├── chat-app/                       # Assignment 1: Chat Application
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── server.js                   # Express + Socket.IO WebSocket Pub/Sub Server
│   ├── reactjs_chat_assignment.md  # Original assignment requirements
│   ├── team-chat-intro.gif         # Visual reference
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Main chat container with sidebar & thread
│       ├── App.css                 # Pixel-faithful styling matching reference
│       ├── index.css
│       ├── constants/
│       │   └── users.js            # user_list, colors, initials helper
│       ├── services/
│       │   └── socketService.js    # Socket.IO Publish & Subscribe client
│       └── components/
│           ├── ChatHeader.jsx      # Channel details & live socket indicator
│           ├── ChatMessageList.jsx # Message list with auto-scroll & typing dots
│           ├── ChatMessageItem.jsx # Message row with avatar, pill & like button
│           ├── ChatInput.jsx       # Input box with @mentions, emojis & send button
│           ├── EmojiPicker.jsx     # Categorized emoji selector & search
│           └── MentionDropdown.jsx # @mention interactive popup
│
└── photo-gallery/                  # Assignment 2: Infinite Scroll Photo Gallery
    ├── package.json
    ├── vite.config.js              # Vite config with CORS proxy
    ├── index.html
    ├── reactjs_photo_gallery_assignment.md
    ├── photo-gallery.jpg           # Visual reference
    ├── photo-gallery.png           # High-res reference
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Infinite scroll & data pagination
        ├── App.css                 # 1-column layout matching reference
        ├── index.css
        └── components/
            └── PhotoItem.jsx       # Card with image, author & FontAwesome like button
```

---

## Quick Start

You can install dependencies and run either application directly from the repository root:

```bash
# 1. Install dependencies for all apps
npm run install:all

# 2. Run Chat App (starts Express + Socket.IO server & React client concurrently)
npm run dev:chat
# -> Frontend: http://localhost:3000
# -> Socket.IO & Express Server: http://localhost:5001

# 3. Run Photo Gallery (Infinite Scroll)
npm run dev:gallery
# -> Frontend: http://localhost:3001
```

---

## Assignment 1: Chat App (with all Stretch Goals)

### Core Features
- **Message Thread & Input Box**: Textbox to type messages and send button. New messages are displayed above the input box, chronologically ordered with automatic smooth scrolling to the latest message.
- **Random User Assignment**: As required by the specification, for each message sent, a random username is assigned from:
  ```javascript
  const user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"]
  ```
- **Consistent User Avatars & Colors**: Each user has initials and a unique distinct avatar color reflecting modern chat interfaces.
- **Interactive Like Button**: Every message features an interactive like button at the right end. Clicking increases the count per click, immediately reflected in the UI and synchronized in real-time.

### Stretch Goals Implemented

#### 1. Emoji Options in Chat Message
- Click the smiley face icon (or browse categorized emojis) to open the interactive Emoji Picker.
- Features categorized tabs (*Smileys & Emotion*, *Gestures & Hands*, *Hearts & Celebration*, *Objects & Symbols*).
- Real-time search filter to find emojis quickly.
- Selecting an emoji automatically inserts it at the current cursor position in the chat input.

#### 2. Mentions (`@`) Feature
- Triggered automatically whenever you type `@` (or by clicking the dedicated `@` button in the input bar).
- Displays a searchable dropdown list populated with the required `user_list` (`@Alan`, `@Bob`, `@Carol`, `@Dean`, `@Elin`).
- Supports keyboard navigation (**Arrow Up**, **Arrow Down**, **Enter**, **Escape**) and mouse click.
- When rendered in the chat thread, all `@mentions` are highlighted with Slack/Discord-style interactive badge pills.

#### 3. WebSocket (Socket.IO) Server using Express.js with Publish & Subscribe
- **Express.js + Socket.IO backend** running on port `5001`.
- Implements the complete **Publish & Subscribe (Pub/Sub)** pattern:
  - **Publish**: When a user sends a message or likes a message, the client publishes an event (`message:send`, `message:like`).
  - **Subscribe**: The server receives the event, persists it in state, and publishes (broadcasts) to all subscribed clients (`message:new`, `message:liked`).
  - **Multi-Tab / Multi-Client Synchronization**: Open two browser tabs on `http://localhost:3000` to witness instant real-time message delivery and like counter synchronization.
  - **Typing Indicator**: Real-time typing status broadcast across connected subscribers.
  - **Active User Counter**: Live connected socket session counter displayed in the header (`X | 5`).
  - **Graceful Offline Fallback**: If the server is offline or restarting, the frontend seamlessly functions in local mode with a status badge indicator (`Socket.io Live` vs `Local Mode`).

### Running the Chat App

```bash
cd chat-app

# Run both the Socket.IO backend and Vite client concurrently:
npm run dev

# Or run separately:
npm run server    # Starts Express & Socket.IO backend on http://localhost:5001
npm run client    # Starts Vite frontend on http://localhost:3000
```

---

## Assignment 2: Photo Gallery (Infinite Scroll)

### Core Features
- **Paginated Feed Consumption**: Fetches photos from the provided paginated API feeds:
  - `https://picsum.photos/v2/list?page=1`
  - `https://picsum.photos/v2/list?page=2`
  - `https://picsum.photos/v2/list?page=3`
  - and continues incrementally until no more items are available.
- **1-Column Layout**: Strict 1-column view faithfully matching `photo-gallery.jpg` and `photo-gallery.png`.
- **Image & Author Rendering**: Utilizes `download_url` and `author` from the API response. Images feature smooth progressive loading and skeleton placeholders.
- **FontAwesome Thumbs Up Icon & Like Count**:
  - Uses the official FontAwesome thumbs up icon (`faThumbsUp`) in brand blue (`#1877f2`), matching the reference image.
  - Count is initialized to `0`.
  - Clicking the thumbs up icon increments the counter for that specific photo on every click.
- **Infinite Scrolling**: Powered by modern `IntersectionObserver` observing a sentinel element with seamless background pre-fetching and graceful retry handling.
- **CORS Handling**: Includes both direct fetching and a built-in Vite development proxy (`/api/picsum`) to guarantee zero CORS issues under any network configuration.

### Running the Photo Gallery

```bash
cd photo-gallery

# Start the Vite development server:
npm run dev
# Open http://localhost:3001 in your browser
```

---

## Build & Production

Both projects build with zero errors using modern Vite bundling:

```bash
# Build both projects from root:
npm run build:all

# Or individually:
cd chat-app && npm run build
cd photo-gallery && npm run build
```
