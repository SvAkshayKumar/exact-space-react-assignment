# ExactSpace React Assignments

This repository contains complete solutions for the two ExactSpace React developer assignments:

1. **Chat App** — Real-time multi-channel team chat built with React + Express + Socket.IO, implementing all core requirements and every stretch goal.
2. **Photo Gallery** — Infinite scroll photo gallery built with React, fetching paginated images from the Picsum Photos API.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Assignment 1: Chat Application](#assignment-1-chat-application)
  - [How It Works](#how-it-works)
  - [Features](#features)
  - [Socket.IO Pub/Sub Architecture](#socketio-pubsub-architecture)
  - [Running the Chat App](#running-the-chat-app)
  - [File Reference](#chat-app-file-reference)
- [Assignment 2: Photo Gallery (Infinite Scroll)](#assignment-2-photo-gallery-infinite-scroll)
  - [How It Works](#how-it-works-1)
  - [Features](#features-1)
  - [Running the Photo Gallery](#running-the-photo-gallery)
  - [File Reference](#photo-gallery-file-reference)
- [Building for Production](#building-for-production)

---

## Project Structure

```
react-assignments/
├── package.json                       # Root scripts for install, dev, and build across both apps
├── README.md                          # This file
│
├── chat-app/                          # Assignment 1: Real-time Chat Application
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── server.js                      # Express + Socket.IO server (port 5001)
│   ├── reactjs_chat_assignment.md     # Original assignment brief
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                    # Root component — channel state, socket wiring, message tracking
│       ├── App.css
│       ├── constants/
│       │   ├── users.js               # User list, persistent profile helpers, avatar colors
│       │   └── channels.js            # Channel definitions (#Introductions, #Poland Office, #India Office)
│       ├── services/
│       │   └── socketService.js       # All Socket.IO emit/subscribe wrappers
│       └── components/
│           ├── ChatHeader.jsx         # Channel name, online user count
│           ├── ChatSidebar.jsx        # Channel switcher + active members list
│           ├── ChatMessageList.jsx    # Scrollable message list + typing indicator
│           ├── ChatMessageItem.jsx    # Single message row with like button and emoji reactions
│           ├── ChatInput.jsx          # Text input with @ button, emoji button, send button
│           ├── EmojiPicker.jsx        # Full emoji picker with categories and search
│           ├── MentionDropdown.jsx    # @mention popup showing @all and online users
│           └── ReactionPicker.jsx     # Quick emoji reaction picker per message
│
└── photo-gallery/                     # Assignment 2: Infinite Scroll Photo Gallery
    ├── package.json
    ├── vite.config.js                 # Includes /api/picsum proxy for CORS fallback
    ├── index.html
    ├── reactjs_photo_gallery_assignment.md
    └── src/
        ├── main.jsx
        ├── App.jsx                    # Infinite scroll logic, photo state, like toggle handler
        ├── App.css                    # 1-column card layout
        └── components/
            └── PhotoItem.jsx          # Photo card: image, author, FontAwesome like button
```

---

## Quick Start

Run either application from the repository root without `cd`-ing into subdirectories.

```bash
# Step 1 — Install dependencies for both apps
npm run install:all

# Step 2a — Start the Chat App (server + client together)
npm run dev:chat
#   React client  →  http://localhost:3000
#   Socket.IO server  →  http://localhost:5001

# Step 2b — Start the Photo Gallery
npm run dev:gallery
#   React client  →  http://localhost:3001
```

Open multiple browser tabs/windows on `http://localhost:3000` to test multi-user real-time chat.

---

## Assignment 1: Chat Application

### How It Works

When you open the chat app, you are automatically assigned a **persistent username** chosen randomly from:

```javascript
const user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"]
```

That username is saved in `localStorage` and stays the same every time you reload — until you click **Reset** or clear your browser storage. Even if two users share the same display name, each device is tracked by a hidden unique `userId` stored separately in `localStorage`, so message ownership is always accurate.

The app connects to an **Express + Socket.IO server** running on port `5001`. Every action (sending a message, liking, reacting, typing) is transmitted over a persistent WebSocket connection using a publish/subscribe pattern.

When you reload the page, your session starts fresh from that moment — you only see messages sent after you rejoined, exactly like a real chat room.

---

### Features

#### Channels (Multi-Room Chat)
- The left sidebar contains three channels: **#Introductions**, **#Poland Office**, and **#India Office**.
- Clicking a channel switches the active conversation.
- **Switching channels does not erase any messages.** Each channel's message history is kept in memory for the entire browser session. Only a full page refresh clears the chat.

#### Persistent User Identity
- Your username is randomly assigned once and stored in `localStorage`.
- Reloading the page gives you the same name without re-prompting.
- If two people end up with the same display name, they are still treated as separate users — all likes and reactions are tracked by `userId`, not by username.
- Your own messages always show **"You"** as the sender label, even if you reset and re-pick the same name another user currently has.

#### Real-Time Messaging via Socket.IO
- Messages are sent to the server using `message:send` and broadcast to all connected clients as `message:new`.
- Only messages received **after you joined** appear in your feed — no historical backfill on reconnect.
- A **typing indicator** (animated dots) appears when another user is composing a message.

#### Online Users & Count
- The header shows a live count of how many users are currently connected (e.g. `3 online`).
- The sidebar shows the names of active users. Only users who are currently connected appear here and in the `@mention` dropdown.

#### Like / Unlike Toggle
- Every message has a thumbs-up like button on the right.
- **First click** → adds your like and increments the count by 1.
- **Second click** → removes your like and decrements the count by 1.
- You can never like the same message more than once at a time; the button toggles, it does not stack.

#### Per-Message Emoji Reactions
- Every message has an **Add Reaction** (smiley face) button.
- Clicking it opens a quick reaction picker with common emojis (👍 ❤️ 😂 😮 😢 😡 🎉 🙌 🔥 💯).
- Selecting a reaction adds it to the message in real-time for all connected users.
- Clicking an existing reaction you already added **removes** it (toggle).
- Reactions are tracked per `userId`, so duplicate usernames do not cause confusion.

---

### Stretch Goals Implemented

All three stretch goals from the assignment brief are fully implemented:

#### 1. Emoji Options in Chat Message
Clicking the **smiley-face button** in the input toolbar opens a full **Emoji Picker** with:
- Categorized tabs: *Smileys & Emotion*, *Gestures & Hands*, *Hearts & Celebration*, *Objects & Symbols*.
- A live search box to filter by name.
- Clicking any emoji inserts it directly at the cursor position in the message input.

#### 2. Mentions (`@`) Feature
Typing `@` in the message box (or clicking the `@` toolbar button) opens the **Mention Dropdown**:
- **`@all`** always appears at the top with a distinct badge — mentioning everyone in the channel.
- Below `@all`, only **currently online/active users** are listed (offline users are never shown).
- Clicking a name inserts the mention into the message input.
- Mentions are **highlighted in gold** inside sent messages (with a special badge for `@all`).

#### 3. WebSocket (Socket.IO) Server using Express.js — Publish & Subscribe
A dedicated `server.js` built with **Express.js + Socket.IO** runs as a separate backend process.

**Pub/Sub Event Table:**

| Direction | Event Name | Description |
|---|---|---|
| Client → Server | `user:join` | Announce username and userId on connect |
| Client → Server | `message:send` | Publish a new chat message to a channel |
| Client → Server | `message:like` | Toggle like on a message (add or remove) |
| Client → Server | `message:reaction` | Toggle emoji reaction on a message |
| Client → Server | `user:typing` | Notify others that this user is typing |
| Server → Client | `message:new` | Broadcast a new message to all channel subscribers |
| Server → Client | `message:liked` | Broadcast updated like state to all clients |
| Server → Client | `message:reacted` | Broadcast updated reactions to all clients |
| Server → Client | `users:online` | Push updated list of connected users to all clients |
| Server → Client | `user:typing` | Relay typing notification to other clients |

---

### Running the Chat App

```bash
# From the repository root:
npm run dev:chat

# OR manually in two terminals:
#   Terminal 1 — start the Socket.IO server
cd chat-app
node server.js

#   Terminal 2 — start the React dev server
cd chat-app
npm run dev
```

- React UI: `http://localhost:3000`
- Socket.IO / Express API: `http://localhost:5001`

> **Multi-user testing:** Open `http://localhost:3000` in multiple browser tabs or different browsers simultaneously. Each tab acts as a separate user.

---

### Chat App File Reference

| File | Purpose |
|---|---|
| `server.js` | Express + Socket.IO backend. Handles all pub/sub events, tracks online users, and manages per-message like/reaction state |
| `src/App.jsx` | Root React component. Owns channel messages state, wires all socket subscribers, tracks `mySentMessageIds` for ownership display |
| `src/constants/users.js` | `getPersistentProfile()` — returns `{ userId, username }` from localStorage, generating them on first load |
| `src/constants/channels.js` | Static channel definitions with IDs, display names, and icons |
| `src/services/socketService.js` | Thin wrapper around the Socket.IO client — exports typed `emit` and `subscribe` helpers used by components |
| `src/components/ChatSidebar.jsx` | Left panel with channel list and active online members |
| `src/components/ChatHeader.jsx` | Top bar showing channel name and live online user count |
| `src/components/ChatMessageList.jsx` | Renders the message list, auto-scrolls to bottom, shows typing dots |
| `src/components/ChatMessageItem.jsx` | Single message row: avatar, username (or "You"), message text, like button, reactions |
| `src/components/ChatInput.jsx` | Bottom input area with `@` mention trigger, emoji picker button, and send |
| `src/components/MentionDropdown.jsx` | Popup list of `@all` + online users, filtered as you type |
| `src/components/EmojiPicker.jsx` | Full emoji picker with categories and search |
| `src/components/ReactionPicker.jsx` | Quick emoji reaction picker appearing per message on hover/click |

---

## Assignment 2: Photo Gallery (Infinite Scroll)

### How It Works

The photo gallery fetches photos from the **Picsum Photos** public API in pages of 20:

```
https://picsum.photos/v2/list?page=1&limit=20
https://picsum.photos/v2/list?page=2&limit=20
...
```

Each page returns an array of photo objects. The app uses the `download_url` field to render each image and the `author` field to display the photographer's name.

**Infinite scrolling** is implemented with the browser's native `IntersectionObserver` API. An invisible sentinel `<div>` is placed at the very bottom of the photo list. When the user scrolls down and the sentinel enters the viewport, the next page is automatically fetched and appended — no button required. A loading spinner appears while each batch is being fetched.

All photo state (likes, loaded pages) lives in React's `useState`. There is no external library for scrolling — it is implemented from scratch using the standard Web API.

---

### Features

#### Infinite Scroll
- Automatically loads the next page of 20 photos as the user scrolls toward the bottom.
- Uses `IntersectionObserver` with a `250px` rootMargin to begin fetching slightly before the sentinel is fully visible, making the experience feel seamless.
- A **loading spinner** appears at the bottom while a page is being fetched.
- Duplicate photo IDs are filtered out, so the same photo never appears twice even if the API returns overlapping pages.
- When the API has no more photos, a **"You have reached the end of the gallery"** message is shown instead of the spinner.

#### 1-Column Card Layout
- Photos are displayed in a single centered column, matching the design reference (`photo-gallery.jpg`).
- Each card shows a large photo, the author's name below it, and a like button.
- Images use `loading="lazy"` for native browser lazy loading.
- A **skeleton loader** (grey placeholder) is shown for each image while it is still downloading, then fades into the real image.
- If an image fails to load, a graceful **"Image unavailable"** fallback is shown.

#### Like / Unlike Toggle (Per Photo)
- Each photo card has a **FontAwesome thumbs-up** icon button (blue, `#1877f2`) and a like count.
- **First click** → photo is liked, count increases by 1, button background highlights in light blue.
- **Second click** → like is removed, count decreases by 1, button returns to normal.
- The count never exceeds 1 per photo per session — it is a toggle, not a counter.
- The like state is local to the browser session; refreshing the page resets all counts to 0.

#### CORS Handling & Proxy Fallback
- The app first attempts to fetch photos directly from `https://picsum.photos`.
- If the direct request fails (e.g., CORS in certain environments), it automatically falls back to the Vite dev server proxy at `/api/picsum`, which forwards the request server-side.

#### Error Handling & Retry
- If a fetch fails, an error banner with the error message and a **Retry** button appears at the bottom of the gallery.
- Clicking Retry re-attempts the failed page without resetting the already-loaded photos.

---

### Running the Photo Gallery

```bash
# From the repository root:
npm run dev:gallery

# OR from inside the folder:
cd photo-gallery
npm run dev
```

- Gallery UI: `http://localhost:3001`

> No backend server is required. The photo gallery is entirely client-side and fetches data from the public Picsum Photos API.

---

### Photo Gallery File Reference

| File | Purpose |
|---|---|
| `src/App.jsx` | All application logic: page state, `fetchPhotos()`, `IntersectionObserver` setup, `handleLike()` toggle handler |
| `src/App.css` | Full stylesheet — 1-column layout, card styles, skeleton loader, like button active state, spinner, error banner |
| `src/components/PhotoItem.jsx` | Renders a single photo card with image (lazy + skeleton), author label, and FontAwesome like button |
| `vite.config.js` | Vite configuration with `/api/picsum` proxy to `https://picsum.photos` for CORS fallback in development |

---

## Building for Production

Both apps build with zero errors using Vite:

```bash
# Build both from the repository root
npm run build:all

# Or build individually
cd chat-app && npm run build
cd photo-gallery && npm run build
```

Build output is placed in `chat-app/dist/` and `photo-gallery/dist/` respectively. Each dist folder is a self-contained static site that can be served by any web server (Nginx, Apache, Netlify, Vercel, etc.).

> The chat app's `server.js` (Socket.IO backend) must still be running separately in production for real-time features to work.
