# MarginOS — margin.work marketing site

Single-page production marketing site for MarginOS. Apple-minimal hybrid aesthetic (Linear / Vercel / Stripe) with warm off-white surfaces for hospitality. Green is the only accent color; red appears only for overcharge flags.

## Structure

```
marginos-site/
├── index.html      # Single-page, 10 sections + header/footer, all SEO + JSON-LD
├── styles.css      # All design tokens + responsive rules
├── script.js       # Sticky-header shadow, mobile nav, FAQ accordion, scroll reveals, smooth anchors
├── favicon.svg     # Green square + ascending bars + "M" mark
├── og-image.svg    # 1200×630 social share placeholder
├── robots.txt
├── sitemap.xml
└── README.md
```

## Brand direction (locked in — do not deviate)

- Page background: `#F9F9F7` warm off-white (NOT pure white).
- Only accent: `--green-primary: #15803D`. Red (`--danger: #DC2626`) reserved for overcharge flags.
- Typography: Geist Sans + Geist Mono via Google Fonts, Inter fallback. All numbers/prices/dollars use `var(--font-mono)` for that Linear/Stripe feel.
- Motion: subtle, 200ms ease. No bouncy; no elaborate scroll effects. Cards lift 2px on hover.
- No emoji icons in UI. Exceptions: the `💡` in the hero product mock and the `⚠` on Card 3 of the product glimpse (both called out in the brief).

## Editing

- Design tokens live at the top of `styles.css` under `:root`.
- Copy is hand-authored in `index.html` — each section has a commented header.
- The hero product mock and all 3 "product glimpse" mocks are pure HTML/CSS — no images.
- Pricing values live inline inside the `.price-card` articles in `index.html`.
- FAQ uses native `<details>`/`<summary>` with JS to keep one open at a time.

## Deploy

```
deploy_website(
  project_path="/home/user/workspace/marginos-site",
  site_name="MarginOS",
  entry_point="index.html",
)
```
