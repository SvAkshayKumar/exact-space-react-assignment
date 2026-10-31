# ExactSpace React Assignments

This repository contains the complete solutions for the ExactSpace React developer assignments:
1. **Chat App**: Real-time team chat application in ReactJS with all **Stretch Goals** (Emoji Options, `@all` and `@user` Mentions, Express + Socket.IO Publish/Subscribe WebSocket communication, persistent user identity, toggled like/unlike, multi-channel conversations with state retention, and per-message emoji reactions).
2. **Photo Gallery**: Single-page infinite scroll photo gallery based on paginated JSON feeds from Picsum Photos with FontAwesome interactive like buttons and 1-column layout.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Assignment 1: Chat App (with all Stretch Goals & Advanced Features)](#assignment-1-chat-app)
  - [Core & Advanced Features](#core--advanced-features)
  - [Stretch Goals Implemented](#stretch-goals-implemented)
  - [Architecture & Socket.IO Pub/Sub Protocol](#architecture--socketio-pubsub-protocol)
  - [Running the Chat App](#running-the-chat-app)
- [Assignment 2: Photo Gallery (Infinite Scroll)](#assignment-2-photo-gallery-infinite-scroll)
  - [Core Features](#core-features)
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
│       ├── App.jsx                 # Multi-channel chat container with persistent state
│       ├── App.css                 # Pixel-faithful styling matching reference
│       ├── index.css
│       ├── constants/
│       │   ├── users.js            # user_list, colors, initials helper & cache
│       │   └── channels.js         # #Introductions, #Poland Office, #India Office
│       ├── services/
│       │   └── socketService.js    # Socket.IO Publish & Subscribe client
│       └── components/
│           ├── ChatHeader.jsx      # Channel details, online count & profile pill
│           ├── ChatSidebar.jsx     # Channel switcher & active members list
│           ├── ChatMessageList.jsx # Message list with auto-scroll & typing dots
│           ├── ChatMessageItem.jsx # Message row with avatar, pill, likes & emoji reactions
│           ├── ChatInput.jsx       # Input box with @mentions, emojis & send button
│           ├── EmojiPicker.jsx     # Categorized emoji selector & search
│           ├── ReactionPicker.jsx  # Quick emoji reaction popover for each message
│           └── MentionDropdown.jsx # @mention interactive popup (@all + active users)
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

## Assignment 1: Chat App

### Core & Advanced Features

- **Persistent User Identity**: When a user connects, they are assigned a username from `user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"]` cached in `localStorage`. The name remains constant across refreshes until the cache is cleared or the "Reset" button is pressed.
- **Multi-Channel Navigation with State Retention**:
  - The left sidebar lists `# Poland Office`, `# Introductions`, and `# India Office`.
  - Switching between channels **does not remove or clear** the content of any chat. Each conversation retains its in-memory message history for the duration of the browser session.
  - Only refreshing the page clears the in-memory chat (starting fresh from that instant).
- **Per-Message Emoji Reactions**:
  - Every chat message features an "Add Reaction" button.
  - Hover or click the reaction trigger to pick from popular reactions (👍, ❤️, 😂, 🎉, 🚀, 🔥, 👏, 😮, 👀, 💯).
  - Clicking any reaction pill toggles the current user's reaction on/off in real-time across all connected clients.
- **Like / Unlike Toggle**:
  - Clicking the thumbs-up button on a message likes it (+1).
  - Clicking the button again removes the user's like (-1) rather than continuously increasing it.
- **Session Instant Stream**:
  - A user only receives messages starting from the instant they joined. Refreshing restarts from that new instant.
- **Real-Time Online Count**:
  - The header displays the exact count of active users online at the current moment (`🟢 X online`).

### Stretch Goals Implemented

#### 1. Emoji Options in Chat Message
- Click the smiley face button on the input box to open the full Emoji Picker with categorized tabs (*Smileys & Emotion*, *Gestures & Hands*, *Hearts & Celebration*, *Objects & Symbols*) and instant search. Emojis insert directly at cursor.

#### 2. Mentions (`@all` and `@user`) Feature
- Typing `@` or clicking the `@` toolbar button displays the mention dropdown.
- Offers `@all` at the top with a distinctive badge and subtext to notify everyone in the channel.
- Displays only **currently active/online members** in the list.
- Highlights mentions in chat bubbles (with a special gold badge for `@all`).

#### 3. WebSocket (Socket.IO) Server using Express.js with Publish & Subscribe
- **Express.js + Socket.IO backend** on port `5001`.
- Complete Pub/Sub event flow for `message:send`, `message:new`, `message:like`, `message:liked`, `message:reaction`, `user:join`, `users:online`, and `user:typing`.
- Multi-client real-time synchronization across channels and tabs.

---

## Assignment 2: Photo Gallery (Infinite Scroll)

### Core Features
- **Paginated Feed Consumption**: Fetches photos from `https://picsum.photos/v2/list?page=1`, `page=2`, etc.
- **1-Column Layout**: Strict 1-column view faithfully matching `photo-gallery.jpg` and `photo-gallery.png`.
- **Image & Author Rendering**: Utilizes `download_url` and `author` from the API response with smooth progressive loading.
- **FontAwesome Thumbs Up Icon & Like Count**:
  - Uses the official FontAwesome thumbs up icon (`faThumbsUp`) in brand blue (`#1877f2`).
  - Count starts at `0` and increases with every click.
- **Infinite Scrolling**: Powered by `IntersectionObserver` observing a sentinel element at the bottom.
- **CORS Handling**: Direct fetch with built-in Vite development proxy (`/api/picsum`) fallback.

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
