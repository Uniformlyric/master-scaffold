# master-scaffold

Astro template that the orchestrator clones (via GitHub's repo-from-template) for every client site. Reads `site-dna.json` at the project root and renders sections in the order declared by `layout.sectionOrder`.

## Run locally

```sh
pnpm --filter master-scaffold dev
```

## How the site customizes itself

1. The orchestrator writes a fully populated `site-dna.json` into the new repo before the first build.
2. `src/lib/siteDna.ts` parses + validates it via `@flashpoint/site-dna`.
3. `Layout.astro` reads `designTokens.vibe` and applies `<html data-vibe="...">` so the matching CSS variable preset in `src/styles/vibes.css` activates.
4. `SectionRenderer.astro` switches on each value in `layout.sectionOrder` and mounts the corresponding section component.

## Adding a new section

1. Add the enum value to the schema in `packages/site-dna/src/schema.json` and the matching `SectionEnum` in `packages/site-dna/src/zod.ts`.
2. Create `src/components/sections/MySection.astro`.
3. Add a branch to `SectionRenderer.astro`.

## Deployment target

This repo is intended to be marked as a **GitHub Template Repository** at `Uniformlyric/master-scaffold` so the orchestrator can call `POST /repos/Uniformlyric/master-scaffold/generate` to mint per-client repos.
