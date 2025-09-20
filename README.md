This is a [Next.js](https://nextjs.org) project.

## QR Menu styling system

- Central tokens live in `src/styles/theme.css`.
- To change the brand color for both client and admin, change only `--brand` in `:root`.
- Arabic font: `Cairo` via `next/font`. Global RTL is enabled in `src/app/layout.tsx` (`<html lang="ar" dir="rtl">`).
- Common primitives: `Button` (`src/components/ui/Button.tsx`), `Sidebar` (`src/components/layout/Sidebar.tsx`).
- Header pieces: `TopNav`, `StoreHeader` in `src/components/header/`.

### Change brand color

Edit this line in `src/styles/theme.css`:

```
:root {
	--brand: oklch(60% 0.17 264); /* set your brand color here */
}
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load the Cairo font for Arabic UI.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
