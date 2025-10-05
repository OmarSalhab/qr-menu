# QA & Manual Testing Checklist

Use this as a regression pass before releases.

## Admin Authentication
- [ ] Login with correct password → success
- [ ] Login with wrong password → error & no session
- [ ] Logout clears session

## Categories
- [ ] Create category (Arabic name) → appears in list & tabs
- [ ] Duplicate display name (same normalization) → blocked
- [ ] Edit display text → reflected in items dropdown
- [ ] Delete empty category → success
- [ ] Delete category with items/specials → blocked with error
- [ ] Ordering preserved after refresh

## Items
- [ ] Create item with category → list shows category name
- [ ] Edit price → updated correctly
- [ ] Toggle availability off → disappears (or marked) in public menu
- [ ] Image upload updates preview & old image removed (check logs)
- [ ] Search filter narrows list

## Specials
- [ ] Create special (valid date window) → appears in admin list
- [ ] Active-only filter hides expired/upcoming
- [ ] Edit date window to past → no longer public
- [ ] Category filter works
- [ ] Delete special → removed from list

## Public Menu
- [ ] Loads without console errors
- [ ] Theming (brand color) matches store config
- [ ] Font style toggles in admin then refresh public → updated
- [ ] Working hours label logical (open/close countdown)
- [ ] Category tabs switch items
- [ ] Special offers appear only in correct category
- [ ] Empty state when no categories → graceful message

## Cart (Calculator)
- [ ] Add item increments count & total reflections
- [ ] Remove item updates total
- [ ] Quantities persist during navigation within page (no full refresh resets)

## Images
- [ ] Broken image URL replaced by manual fix path (if fallback implemented)
- [ ] Large image loads with acceptable performance

## Accessibility (Spot Checks)
- [ ] Buttons have discernible text
- [ ] Color contrast acceptable for key UI (brand on light/dark)

## Responsive
- [ ] Mobile width: header, tabs, floating cart button visible & clickable
- [ ] Tablet/desktop layout stable (grid spacing)

## Error Handling
- [ ] Force API 500 (e.g. stop DB) → admin surfaces toast error gracefully
- [ ] Invalid file upload (wrong extension) → error toast (if implemented)

## Security (Basic)
- [ ] Directly hit protected endpoint without cookie → 401
- [ ] Session cookie HTTP-only (inspect dev tools)

## Post-Deployment Smoke
- [ ] Run `SELECT COUNT(*)` on key tables to confirm non-zero data
- [ ] Random open hours inspection vs local time

---
Add new test cases when new features land (update this doc).
