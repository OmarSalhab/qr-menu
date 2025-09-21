export type CSSVars = Record<string, string>;

/**
 * Generates the full palette from the base brand color.
 * Uses color-mix strings so the browser computes them at runtime.
 * Inline <body style="..."> avoids any PostCSS build-time transforms.
 */
export function makeBrandVars(brand: string): CSSVars {
  return {
    "--brand": brand,
    "--brand-950": `color-mix(in oklch, ${brand}, black 72%)`,
    "--brand-900": `color-mix(in oklch, ${brand}, black 60%)`,
    "--brand-800": `color-mix(in oklch, ${brand}, black 48%)`,
    "--brand-700": `color-mix(in oklch, ${brand}, black 36%)`,
    "--brand-600": `color-mix(in oklch, ${brand}, black 24%)`,
    "--brand-500": brand,
    "--brand-400": `color-mix(in oklch, ${brand}, white 16%)`,
    "--brand-300": `color-mix(in oklch, ${brand}, white 32%)`,
    "--brand-200": `color-mix(in oklch, ${brand}, white 48%)`,
    "--brand-100": `color-mix(in oklch, ${brand}, white 64%)`,
    "--brand-50": `color-mix(in oklch, ${brand}, white 80%)`,
  };
}