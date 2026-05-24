# BinksBot

**Telegram backend service for the Binks music ecosystem.**

BinksBot is a self-hosted Telegram bot and HTTP API server that turns Telegram into a personal music library. Users send audio files to the bot, which stores them in a Telegram channel and serves them via streaming, search, and library APIs — all consumed by [BinksConnect](https://github.com/Krrish557/BinksConnect).

---

## Architecture

```
Telegram Bot (grammY)  ──►  Telegram CDN
        │                        │
        │                   ┌────┘
        ▼                   ▼
 Fastify HTTP API  ──►  fileResolver ──► Stream/Download
        │
        ├── /api/tracks       — Track listing & lookup
        ├── /api/stream       — Audio streaming (range requests)
        ├── /api/artwork      — Album artwork serving
        ├── /api/search       — Full-text search
        ├── /api/library      — Per-user library data
        └── /api/telegram     — Verification & channel setup
```

### How it works

1. **Send audio** — User sends an MP3/FLAC/etc. to the bot via DM
2. **Store** — Bot copies the file to the user's connected Telegram channel
3. **Index** — Metadata (title, artist, album, duration) is extracted locally and stored in a JSON index
4. **Artwork** — Embedded album art is extracted, optimized with Sharp, and cached as JPEG
5. **Stream** — BinksConnect requests audio via the API; the bot proxies range requests from Telegram CDN
6. **Auth** — Onboarding uses a verification-code flow via Telegram DM

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/telegram/request-verification` | Request a verification code sent to Telegram DM |
| `POST` | `/telegram/verify-code` | Confirm verification code |
| `POST` | `/telegram/validate` | Validate channel configuration |
| `GET` | `/library/:telegramUserId` | Get a user's library |
| `GET` | `/tracks/:trackId` | Get track metadata |
| `GET` | `/stream/:trackId` | Stream audio (supports `Range` header) |
| `HEAD` | `/stream/:trackId` | Stream headers only |
| `GET` | `/search?q=` | Search tracks by title/artist/album |
| `GET` | `/artwork/:trackId` | Get album artwork JPEG |

---

## Tech Stack

- **[Fastify](https://fastify.dev/)** — HTTP server
- **[grammY](https://grammy.dev/)** — Telegram bot framework
- **[music-metadata](https://github.com/Borewit/music-metadata)** — Audio metadata extraction
- **[Sharp](https://sharp.pixelplumbing.com/)** — Image processing & artwork optimization
- **[Zod](https://zod.dev/)** — Runtime config validation
- **[Pino](https://getpino.io/)** — Structured logging
- **[undici](https://undici.nodejs.org/)** — HTTP client for Telegram CDN proxying

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Telegram bot token](https://t.me/BotFather)
- A Telegram channel (bot must be added as an administrator)

### Installation

```bash
git clone https://github.com/Krrish557/BinksBot.git
cd BinksBot
npm install
```

### Configuration

Copy `sample.env` to `.env` and fill in your values:

```env
BOT_TOKEN=your_bot_token_here
PORT=3001
HOST=0.0.0.0
```

Run the bot:

```bash
npm run dev
```

### Connecting to BinksConnect

1. Run BinksBot on your server
2. Open BinksConnect and select **Telegram** as your music provider
3. Enter your backend URL, Telegram user ID, and channel ID
4. Check your Telegram DM for the verification code
5. Start listening to your music

---

## Project Structure

```
src/
├── api/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Error handling
│   └── routes/            # Fastify route registrations
├── bot/
│   ├── commands/          # /start, /ping, /id
│   ├── handlers/          # Audio, message, channel post handlers
│   └── setup/             # Bot initialization & middleware
├── config/                # Env validation & config object
├── media/
│   ├── artwork/           # Extract, save, serve album art
│   └── metadata/          # Extract audio metadata via music-metadata
├── storage/
│   ├── indexes/           # Track index (JSON-backed store)
│   └── mappings/          # User-to-channel mapping store
├── telegram/
│   ├── channels/          # Channel connection logic
│   ├── services/          # Bot client, file resolver, validator, verification
│   ├── streams/           # Stream response builder
│   └── uploads/           # Audio processing pipeline
└── utils/                 # Logger, errors, atomic file store
```

---

## Related

- **[BinksConnect](https://github.com/Krrish557/BinksConnect)** — The web frontend that consumes this API as a provider
- **[TELEGRAM_INTEGRATION.md](https://github.com/Krrish557/BinksConnect/blob/main/docs/TELEGRAM_INTEGRATION.md)** — Detailed integration docs in the BinksConnect repo

---

## License

MIT
