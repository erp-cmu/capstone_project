# Reflection: Building a Vue App in the Frappe Framework

_Written while the experience is still fresh._

---

## Background

I have written React applications before, but this was my first "real" Vue application — meaning something beyond a tutorial, with real data, real routing, real form validation, and a component library to wrangle. The project is a capstone project evaluation tool built on top of the Frappe framework, using `frappe-ui` as the component and tooling layer.

---

## TypeScript Types: Worth the Upfront Investment

The API returned flat arrays of objects with many keys and no guaranteed shape. Rather than typing everything as `any` and moving on, I took the time early to define proper TypeScript types for the evaluation data and user objects (`eval.ts` at 63 lines, `user.ts` at 12 lines).

_Commit trail: `1f01839` introduces both type files alongside the auth refactor._

Coming from React, the typing experience in Vue felt familiar at the component level — but Vue's template type-checking is stricter in some ways and more lenient in others compared to React's JSX. Defining the types upfront paid off later when the data transformation layer was being reworked repeatedly: having a known shape made it much easier to reason about what each grouping or transformation was doing, and TypeScript caught several mistakes during the composable extractions.

---

## Frappe UI: More Opinions Than Documentation

### It injects everywhere — quietly

`frappe-ui` is not just a component library. It is a Vite plugin, a Tailwind preset, a proxy config, and more. It hooks into the build process in ways that are not obvious until something breaks.

```typescript
plugins: [
  frappeui({
    lucideIcons: true,
    frontendRoute: '/capstone',
    frappeProxy: {
      port: 8081,
    },
  }),
  vue(),
],
```

The options above — `lucideIcons`, `frontendRoute`, `frappeProxy` — are not explained in the official docs. Understanding what they actually do required asking an AI to read through the source code. This is a recurring theme with `frappe-ui`: the framework has strong opinions, but it does not always explain them.

### ESM / CommonJS breakage

Several dependencies shipped by `frappe-ui` caused ESM/CommonJS interop errors at runtime. The fix was to explicitly pre-bundle them in `optimizeDeps`:

```typescript
optimizeDeps: {
  include: ['frappe-ui > feather-icons', 'debug', 'interactjs'],
},
```

Even then, some packages had to be added as direct `package.json` dependencies to avoid being excluded from Vite's optimization pass:

```json
"highlight.js": "^11.12.0",
"interactjs": "^1.10.28",
"debug": "^4.4.3"
```

This is the kind of issue that costs hours and yields a one-line fix. The root cause is that `frappe-ui` bundles some dependencies loosely, and Vite's module resolution exposes that in dev mode.

### Tailwind preset clobbers utility classes

`frappe-ui` ships its own Tailwind preset:

```javascript
import preset from 'frappe-ui/tailwind';

export default {
  presets: [preset],
};
```

The preset overrides core Tailwind defaults in ways that are hard to predict. Common utilities like `text-2xl` disappeared. The `slate` color palette was gone. Extending or overriding the preset requires reading its source, not its documentation.

### Component slots are undocumented

The `Dialog` component is a good example. Using it correctly requires a named Vue slot:

```vue
<template #body-content>...</template>
```

The documentation does not mention this. Again: read the source, or ask an AI to read it for you.

### `frappe-ui` hooks: promising but bypassed

`frappe-ui` offers built-in data-fetching hooks (`call`, `useCall`, etc.) designed to integrate cleanly with the Frappe backend. In practice, I ended up reaching for TanStack Query instead. The frappe-ui hooks are simpler, but they do not offer the caching, invalidation, and refetch control that TanStack Query provides. As a result, `frappe-ui` became mostly a UI component layer — and a fairly thin one, given the documentation gaps.

---

## Vue vs React: First Impressions

### What Vue gets right

Vue's reactivity system is elegant when it clicks. The "run-once setup, reactivity baked in" mental model of `<script setup>` is genuinely pleasant compared to React's render-on-every-change model. Writing a composable that sets up reactive state once and exposes it cleanly feels more structured than a React hook that re-runs on every render.

### The reactivity chain footgun

The gotcha: if you define a `computed` value but nothing in the template or component actually _reads_ it, Vue skips evaluating it. The reactivity chain is lazy — which is a feature, but it is also a source of subtle bugs. If your column definitions or validation schema are computed values that feed into a third-party hook, and that hook does not access them the way Vue expects, you lose reactivity without a clear error.

This came up in two places:

- **TanStack Table column definitions**: changing them dynamically required careful attention to how the `ref` or `computed` was accessed inside the table instance.
- **VeeValidate schemas**: swapping schemas dynamically (e.g. changing validation rules based on a selected evaluation type) meant threading the schema through as a reactive value rather than a plain object — and making sure it was actually read in the right place at the right time.

In React, this class of problem usually shows up as a stale closure in a `useEffect`. In Vue, it shows up as a reactivity chain that silently stops updating. Neither is better — they are just different shapes of the same headache.

### Composable extraction: Vue's answer to bloated components

One of the more idiomatic Vue patterns I used was extracting logic out of a growing component into a dedicated composable. `EvalForm.vue` accumulated a lot of responsibility — form state, validation schema, score logic, submission handling — and at a certain point it became hard to reason about. The solution was to carve out `useEvalForm.ts` (~109 lines) and keep the component itself focused on the template.

_Commit trail: `bccbe34` extracts `useEvalForm.ts` from `EvalForm.vue`, simultaneously adding `EvalFormCLO.vue` as a sub-component._

This felt natural in Vue in a way that React hooks sometimes don't. Because Vue composables run once in `setup()` and return reactive state, the extracted composable reads almost like a self-contained module — state, derived values, and actions all in one place, with no need to think about which render triggered which hook. The React equivalent would be a custom hook, but the mental overhead of "does this re-run, and when?" is genuinely lower in Vue.

---

## Authentication and Route Guards

The app required real authentication — not a demo login but a proper auth layer with protected routes. This meant building a `useAuth` composable on the frontend (`useAuth.ts`, ~67 lines) and a corresponding `auth.py` utility on the Frappe backend, with the login page wired up to redirect appropriately.

_Commit trail: `abb3ed3` adds `useAuth.ts` and reworks the login page; `1f01839` adds `auth.py`, `eval.ts` types, and wires up the full auth flow._

### The route guard friction point

Once protected routes existed, the `beforeEach` guard needed to check whether the user was authenticated before allowing navigation. In React, this is straightforward — a custom hook like `useAuth()` can be called anywhere, including in module-level guard functions. Vue's composition API does not work this way. `useQuery` can only be called inside a component's `setup()` context, so calling it inside `beforeEach` fails because there is no active component instance.

The solution was to bypass `useQuery` entirely for the guard and call the `QueryClient` directly:

```typescript
const result = await queryClient.fetchQuery({ queryKey: [...], queryFn: ... });
```

This works, but it took time to land on. The Vue mental model of "composables are tied to component lifecycle" is consistent and makes sense in isolation — but it creates friction when integrating libraries like TanStack Query that are designed around React's more permissive hook semantics.

---

## API Design: Permissions Were Not Designed Upfront

The backend API for fetching evaluation data went through several access control iterations that were not planned from the start:

1. **Guest access allowed** (`252cbb9`) — early development convenience.
2. **Require employee name, POST only** (`cbf221a`) — tightened once the auth layer existed.
3. **Guest access restricted again** (`e679dd3`) — final hardening before the app was considered complete.

This is worth noting because it reflects a real pattern: security constraints tend to be retrofitted rather than designed in. The first version opened access broadly to unblock frontend development. Once `useAuth` and the route guard were in place, it became obvious what the actual access model should be, and the API was tightened to match. It would have been cleaner to design this upfront, but in practice the frontend auth work had to happen first to make the right backend constraints clear.

---

## The Data Transformation Layer: A Design Journey

This was the most time-consuming part of the project — roughly a full day — and also the most instructive.

The API returned flat arrays of objects with many keys. The goal was to display this data grouped by multiple dimensions (subject, CLO, student, etc.) in a way that was useful to the user.

### Phase 1: Manual grouping with lodash-es and remeda

The first approach was to use `lodash-es` to group arrays by key, then later switch to `remeda` for a more pipeline-oriented style. Both worked, but the result was rigid: each grouping strategy produced a deeply nested structure, and changing the grouping meant rewriting the transformation. The view layer mirrored this complexity.

_Commit trail: `85f35d9` adds lodash-es; `5bd2c69` removes it in favour of a manual composable; `8f4f749` removes remeda._

### Phase 2: TanStack Table with multi-level grouping

Replacing the accordion-based display with TanStack Table's built-in grouping was an improvement. The table could group by multiple columns natively, and the display was more structured.

But with four levels of grouping, the table became visually overwhelming. Every attempt to simplify the display logic added more conditional rendering code. The more I tried to make it cleaner for the user, the more complex the code became.

_Commit trail: `0c6a1ba` adds TanStack Table and an Accordion component; `fc70362` removes the Accordion and reworks the table; `ab695ff` cleans up the commented-out remains._

### Phase 3: Composite grouping column (the solution)

The breakthrough was recognising that the display complexity was a consequence of the data model, not the rendering code. Instead of grouping on four separate columns, I combined the grouping dimensions into a single composite column. This capped the grouping depth at one level, which dramatically simplified both the table configuration and the rendering logic.

_Commit trail: `5df196d` introduces the composite column approach._

### What AI could not do here

AI was useful throughout this project for looking up APIs, reading source code, and generating boilerplate. But it was not useful for this design problem. When I asked for help simplifying the table, it gave me more code — more clever grouping logic, more custom renderers, more configuration options. It gave me what I asked for, not what I needed.

The simplification required sitting with the problem long enough to question the premise: _do I need multi-level grouping at all?_ That question did not come from AI. It came from looking at a complicated table and asking whether it was actually serving the user, or just serving the data model.

This is the most transferable thing I learned from this project. The ability to simplify — to remove a requirement rather than implement it — is not a skill that can be accelerated by tooling. It requires time with the problem.

---

## Summary

| Area                          | Takeaway                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `frappe-ui` setup             | Heavily opinionated, lightly documented. Expect to read source code.                                |
| ESM issues                    | Pre-bundle problem deps in `optimizeDeps`; add some as direct dependencies.                         |
| Tailwind preset               | May silently remove utilities you rely on. Check before building.                                   |
| TypeScript types              | Define them early — they pay dividends when the data layer is in flux.                              |
| Vue reactivity                | Elegant, but the lazy chain requires discipline with `computed` and third-party hooks.              |
| Composables                   | Vue's composable pattern is a clean way to decompose logic; lower mental overhead than React hooks. |
| Auth + route guards           | Build the auth layer before locking down the API — the right constraints become clear only then.    |
| Route guards + TanStack Query | Use `queryClient.fetchQuery` instead of `useQuery` outside component context.                       |
| Data design                   | The right abstraction eliminates complexity; AI helps you execute, not simplify.                    |

---

_Project: Capstone Evaluation Tool · Stack: Vue 3 + TypeScript, Frappe / frappe-ui, TanStack Query, TanStack Table, VeeValidate, Tailwind CSS_
