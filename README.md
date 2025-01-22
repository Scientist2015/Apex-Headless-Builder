# High-Performance Headless SSG with Incremental Hydration

An enterprise-grade, lightweight Static Site Generator (SSG) built with an **Islands Architecture** approach. It compiles content markdown down to highly optimized, static HTML while identifying dynamic "Islands" (e.g., subscription bars, paywalls) and embedding localized, non-blocking client-side hydration scripts.

## Senior Engineering Design & V8 Optimization

1. **Imperative Loop Execution over Functional Iterators:**
   Functional pipeline mutations (`.map().filter().reduce()`) incur an allocation overhead by instantiating execution contexts for closures on every single block iteration. In high-volume compilation environments (thousands of posts per minute), this leads to severe heap fragmentation and CPU execution stuttering due to Garbage Collection (GC) sweeps. This engine strictly employs highly optimized, predictable native `for` loops for template scanning, payload processing, and asset generation.

2. **Incremental Hydration (The Island Pattern):**
   Instead of forcing a full-page client-side runtime boot (like standard Next.js/Nuxt hydration), this engine operates on an individual component level. The build tool automatically parses `data-island` nodes, leaves a static skeleton, and embeds a targeted script executing dynamic behavior *only* where user interactivity is demanded.

3. **Flat Zero-Dependency Layout & Render Pipeline:**
   The entire template token replacement, HTML stitching, and layout binding lifecycle is written natively with memory efficiency in mind, leveraging zero-copy operations wherever feasible.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Execute Build Run:**
   ```bash
   npm run build
   ```
   *The compiler will read raw layouts from `templates/`, parse production markdown articles from `content/`, and compile them instantly into highly optimized static structures inside `dist/`.*

## File Architecture
* `src/index.js` - Compiler Entry Point & System orchestrator.
* `src/compiler.js` - Core rendering engine utilizing optimal loop constructs and template interpolation.
* `src/islands.js` - Registry storing atomic hydration client bundles.
