# Veranstaltungen im Raum St. Jakob

A web application for displaying events in the St. Jakob area (Basel, Switzerland). It provides users with an intuitive interface to browse events by day or week, view transportation information, and access event details.

## Features

- 📅 **Day View** (`/tagesansicht`) - View events for a specific day
- 📆 **Week View** (`/wochenansicht`) - Browse events for an entire week
- 🚌 **Transport Information** - Access detailed transportation options and route information

## Data source

The event data is sourced from the [Kantonales Datenportal Basel-Stadt](https://data.bs.ch/explore/?refine.tags=eventverkehr-st.jakob).

## Prerequisites

- Node.js 18+ (or Bun)
- npm, pnpm, yarn, or bun

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

The application will automatically open in your browser. 

## Project Structure

```
app/
├── assets/          # CSS files and styling
├── components/      # Vue components
│   ├── AppHeader.vue
│   ├── EventsTable.vue
│   ├── DatePicker.vue
│   └── ...
├── composables/     # Vue composables
│   ├── useBsApi.ts      # API integration
│   ├── useDateUtils.ts  # Date utilities
│   ├── useFilters.ts    # Filtering logic
│   └── useViewMode.ts   # View mode management
├── layouts/         # Layout components
├── pages/           # Route pages
│   ├── index.vue        # Redirects to tagesansicht
│   ├── tagesansicht.vue # Day view
│   └── wochenansicht.vue # Week view
├── plugins/         # Nuxt plugins
├── public/          # Static assets
└── server/          # Server-side code
```


## Building for Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## Environment Variables

Optional environment variables:

- `GITHUB_TOKEN` - GitHub token for API access (if needed)

## Running with Docker

```bash
docker build -t st-jakob-events .
docker run --rm -p 8010:8010 --env-file .env st-jakob-events
```

On push to `main`, `.github/workflows/docker.yml` builds and pushes the image to GitHub Container Registry (`ghcr.io/StataBS/st-jakob-events_abfragetool`).

## Deployment

Check out the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for deployment options.

The application can be deployed as:
- Docker image via GHCR (see above)
- Static site (using `npm run generate`)
- Server-rendered application
- Edge functions

## License

See [LICENSE](./LICENSE) file for details.

## Contributing

This project uses the Basel-Stadt design system and follows the DCC-BS development guidelines. For feedback and issues, please use the integrated feedback control system.

If you want to contribute to the code: Please fork the repository, create a feature branch, and submit your pull request for review.
