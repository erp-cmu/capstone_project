# Frontend

## Notes

### `useCall` vs `call` from `frappe-ui`

`frappe-ui` exposes two different ways to hit `/api/method/...` endpoints, and they expect different response shapes:

- **`call(method, args)`** — plain one-off async call. It POSTs to the method and, on success, returns `data.message` from the JSON response. This matches the classic Frappe whitelisted-method response shape: `{"message": <result>}`.
- **`useCall({ url, ... })`** — reactive composable (loading/error/data refs). It expects the newer REST v2 response shape `{"data": <result>}` and exposes the result via `.data`, which internally reads `response.data`.

If you call an endpoint that returns `{"message": ...}` (e.g. `frappe.auth.get_logged_user`) through `useCall`, `.data` will always be `undefined`/`null` because there's no `data` key in the response — only `message`. Use `call()` for these older-style whitelisted methods instead, and reserve `useCall` for endpoints that actually return the `{"data": ...}` shape.

They also differ in how the URL is built:

- **`call(method, args)`** — takes just the dotted method path (e.g. `'frappe.auth.get_logged_user'`) and automatically prefixes it with `/api/method/`.
- **`useCall({ url, ... })`** — uses `url` as-is, so you must include the `/api/method/` prefix yourself (e.g. `url: '/api/method/frappe.auth.get_logged_user'`).

As a side effect, routing such a `{"message": ...}` response through `useCall` can also trigger a harmless but noisy console error from `frappe-ui`'s internal `onFetchError` handler (`Error parsing error response: TypeError: Cannot read properties of null (reading 'errors')`) when a request is aborted (e.g. due to component unmount or HMR) — this is caught internally and doesn't break the app.
