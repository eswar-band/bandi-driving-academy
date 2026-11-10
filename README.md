# Bandi Driving Academy

Marketing website for Bandi Driving Academy: course overview, testimonials, a light/dark theme,
and a lesson enquiry form that opens WhatsApp with the details pre-filled.

It is a plain static site (HTML, CSS, JavaScript). There is no build step and no server code.

## Project structure

```
bandi-driving-academy/
├── index.html           Page markup only (no inline styles or scripts)
├── css/styles.css       All styles, including light and dark themes
├── js/
│   └── app.js           Loads academy.json, theme toggle, menu highlighting, enquiry form
├── data/
│   └── academy.json     ALL academy details: name, address, phone, WhatsApp, hours, areas, social
├── assets/
│   ├── images/          Illustrations. Put logos, car banners and instructor photos here
│   └── icons/           favicon.svg
├── .env.example         Template for real secrets (see Security)
├── .gitignore
└── README.md
```

## Run locally

The site reads `data/academy.json` with `fetch`, and browsers block that on `file://` pages.
Serve the folder instead of double-clicking `index.html`:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

VS Code's Live Server extension works too. If the file cannot be loaded, the page still shows
the placeholder text that is written in `index.html`.

## Edit the academy details

Everything that changes from one academy to another lives in one file, `data/academy.json`:

```json
{
  "name": "Bandi Driving Academy",
  "shortName": "Bandi",
  "logoSubtitle": "DRIVING ACADEMY",
  "tagline": "Drive with confidence. Learn from the best.",
  "city": "[Your City Name]",
  "state": "[Your State]",
  "address": { "line1": "123 Main Street", "postalCode": "12345" },
  "contact": {
    "phone": "+1 (555) 123-4567",
    "phoneLink": "+15551234567",
    "email": "info@example.com",
    "whatsapp": "919876543210"
  },
  "hours": "Mon to Sat: 6:00 AM to 8:00 PM",
  "serviceAreas": ["Downtown", "West End", "Lakeside", "Riverside"],
  "social": { "facebook": "", "instagram": "", "youtube": "", "linkedin": "" }
}
```

- `contact.whatsapp`: country code + number, digits only. Until it is set, the enquiry form shows
  "Bookings are not connected to WhatsApp yet". The form never sends anything by itself: it opens
  WhatsApp with the message ready, and the visitor taps Send.
- `contact.phone` is the text people see; `contact.phoneLink` is the digits used for tap-to-call.
- `social`: full `https://` links. Empty entries are left as plain `#` links.
- The JSON must stay valid: keep the quotes and commas.

The text for courses, testimonials and headlines is still written in `index.html`.

## Deploy with GitHub Pages

1. Push the repository to GitHub (commands below).
2. In the repository, open Settings, then Pages.
3. Under "Build and deployment", choose "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Your site appears at `https://<your-username>.github.io/<repository-name>/`.

## Push to GitHub

Create an empty repository on GitHub first (no README, no .gitignore), then:

```bash
cd bandi-driving-academy
git init -b main
git add .
git status          # check that .env is NOT listed
git commit -m "Initial commit: Bandi Driving Academy website"
git remote add origin https://github.com/<your-username>/<repository-name>.git
git push -u origin main
```

## Security notes

- **Secrets:** nothing in this repository is a secret. If you later add an API key, RTO server
  credential or database password, keep it in `.env` (blocked by `.gitignore`) and read it from
  server-side code. A browser cannot read `.env`, and anything shipped to the browser is public.
  `data/academy.json` is committed on purpose because the WhatsApp number, phone and address are public by nature.
  Values from the file are written to the page as plain text, and links are only accepted if they start with `https:`, `mailto:` or `tel:`.
- **Input handling:** the enquiry form validates every field against an allow-list, strips control
  characters and angle brackets, limits lengths, and writes to the page only with `textContent`
  (never `innerHTML`). The message is URL-encoded before it goes into the WhatsApp link.
  Client-side checks are a first line of defence. If you add a server later, validate again there.
- **Outbound links:** links that open a new tab use `rel="noopener noreferrer"`, and the script
  opens WhatsApp with `noopener,noreferrer`.
- **Third-party resources:** the only external resource is Google Fonts, loaded over `https://`.
- **Hardening when hosting:** GitHub Pages cannot set response headers. On Netlify, Cloudflare Pages
  or your own server you can add a Content-Security-Policy such as
  `default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; base-uri 'self'; form-action 'none'`.
  The site has no inline scripts or styles, so this policy works as written.
