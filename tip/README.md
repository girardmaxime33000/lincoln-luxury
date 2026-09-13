# Tip & Review page

A single, ultra-light standalone page for passengers to leave a tip and a
Google review after a ride. Reached only through the printed QR code (or the
"Service" link in the site footer) — deliberately not in the main menu and
marked `noindex` so it stays out of search results.

Files:

- `index.html` — the page itself (HTML + inlined CSS/JS, no build step, no
  external CDN — loads only the site's own self-hosted fonts).
- `generate_qr.py` — generates the QR code and a print-ready passenger card.
- `output/` — created by the script; not committed (regenerate it any time).

## 1. Configure before going live

Everything to edit lives at the top of `index.html`, each spot marked with an
HTML comment (`DRIVER_NAME / DRIVER_PHOTO`, `STRIPE LINKS`,
`GOOGLE REVIEW LINK`):

1. **Driver identity** — replace the `LL` initials in `.avatar` with an
   `<img src="driver-photo.jpg" alt="">`, and edit the name in `.brand`.
2. **Stripe Payment Links** — replace the five
   `https://buy.stripe.com/REPLACE_...` placeholders (see below).
3. **Google review link** — replace `REPLACE_WITH_PLACE_ID` (see below).

### Stripe Payment Links (Apple Pay / Google Pay included)

You need **five** Payment Links: one per fixed amount (10 / 20 / 50 / 100 €)
and one that lets the passenger type their own amount.

1. In the [Stripe Dashboard](https://dashboard.stripe.com/) go to
   **Payment links → + New**.
2. For each fixed amount: create a product (e.g. "Tip — €10") with that
   price, one-time payment. Copy the generated `https://buy.stripe.com/...`
   link into the matching `href` in `index.html`.
3. For the custom-amount link: create one more Payment Link and enable
   **"Customer can enter any amount they want"** under the price. Use that
   link for `#custom-pay-btn`'s `href`. Stripe does not support passing a
   price via URL parameter, so the amount the passenger sees on the page is
   only a preview — they confirm the real amount on Stripe's own secure
   checkout page. This is why the page is worded that way; don't change it
   to imply otherwise.
4. Apple Pay and Google Pay require no extra code — Stripe shows them
   automatically on the Payment Link checkout once:
   - the page is served over **HTTPS** (any of the hosts below give you
     that for free), and
   - **Apple Pay** is turned on for your Stripe account
     (Settings → Payment methods) with your domain added under
     Settings → Payment methods → Apple Pay → **Add a new domain**
     (`www.lincoln-luxury.fr`, or your final domain).
   - **Google Pay** is on by default for card-capable accounts in
     supported countries — no domain registration needed.
5. All tips settle directly into your Stripe balance; nothing here touches
   your funds or holds them.

### Google review link

The button needs your Google **Place ID**:

1. Fastest path: open your Google Business Profile, click **"Ask for
   reviews"** — Google gives you a short `https://g.page/r/.../review`
   link. Use that directly as the button's `href` and skip the rest of
   this section.
2. Or build the link yourself: find your Place ID with Google's
   [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id),
   then use:
   `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`

Either way, the CTA sends every passenger to the same public Google review
form — the page never filters or routes people by the rating they intend to
leave. Don't add that kind of branching: Google's guidelines explicitly
prohibit review-gating, and it risks the listing being penalized.

### Testimonials

The three quotes under "Rate Your Ride" are demo placeholders (same
convention as the rest of the site — see the `<!-- DEMO -->` comment above
them in `index.html`). Replace them with real client quotes, obtained with
their consent, before publishing.

## 2. Test locally

No build step — any static file server works:

```bash
cd tip
python3 -m http.server 8000
# open http://localhost:8000
```

Test on an actual phone on the same network (`http://<your-computer-ip>:8000`)
to check the Apple Pay / Google Pay buttons and mobile layout — wallet
buttons don't render over plain HTTP or on `localhost` from a phone, so for
a full payment test push to a real HTTPS deployment first (step 3).

## 3. Deploy (free)

Any static host works since the page is a single self-contained file. Three
options, pick one:

### Cloudflare Pages
1. Push this repo to GitHub (already the case).
2. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages →
   Create → Pages → Connect to Git** → select the repo.
3. Build settings: none needed (framework preset "None", no build command).
4. Set the **root directory** to `/` (it serves the whole repo, so the page
   ends up at `/tip/`), or point a dedicated Pages project at just this
   folder if you'd rather deploy it separately.

### Netlify
1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an
   existing project** → select the repo.
2. Build command: none. Publish directory: `/` (repo root).
3. Deploys on every push; the page is served at `/tip/`.

### Vercel
1. [vercel.com/new](https://vercel.com/new) → import the repo.
2. Framework preset: **Other**. No build command needed for a static repo.
3. Deploys on every push; the page is served at `/tip/`.

Whichever host you pick, once it's live update `TARGET_URL` in
`generate_qr.py` to the final address (e.g.
`https://www.lincoln-luxury.fr/tip/`) and regenerate the QR code (step 4).

## 4. Generate the QR code

```bash
pip install "qrcode[pil]" Pillow
python3 generate_qr.py
```

Edit `TARGET_URL` at the top of `generate_qr.py` first if it doesn't match
your deployed URL yet. This writes to `output/`:

- `qr_code.png` — high-resolution PNG (print quality)
- `qr_code.svg` — vector version (best for a print shop / large format)
- `tip_card.png` — a 10×15 cm, 300 DPI passenger card with the QR code
  already laid out, ready to send to a printer for a seatback chevalet or
  window sticker

The QR code uses the highest error-correction level (H), so it stays
scannable even printed small, laminated, or partly worn.
