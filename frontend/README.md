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

### TanStack Table Grouping & Cell Rendering

1. **Dynamic column keys**

  Changing ``id: `grouping_column_${group_mode.value}``` forces TanStack Table to
   invalidate internal row-model caches and recalculate groups on mode toggle.

2. **`info.getValue()` vs `info.row.original`**

   - Columns using `info.getValue()` (e.g. CLO, Score) naturally clear their values
     on grouped parent rows and return `undefined`.
   - Columns reading `info.row.original` directly (e.g. Recipient) bypass TanStack's
     cell-clearing engine. On grouped parent rows, `row.original` fallback-binds to
     the first leaf child's raw data object.

3. **Aggregation prevention**

   To prevent data leakage on parent rows for `row.original` accessors, either:

   - Check `if (info.row.getIsGrouped()) return null;` inside `cell()`, or
   - Declare an `aggregationFn` so `cell.getIsAggregated()` evaluates to `true` and
     triggers `aggregatedCell: () => null`.
