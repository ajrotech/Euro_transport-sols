Transport Solutions — Static Website
=================================

Overview
--------
This is a small static website for a transport/logistics company (Transport Solutions). It uses plain HTML, CSS, and JavaScript — no build tools required. The main pages are:

- `index.html` — Home (hero, services, fleet, testimonials, contact)
- `services.html` — Services details
- `about.html` — About page
- `contact.html` — Contact page

CSS
---
- `css/styles.css` — Primary site styles (well-formed)
- `css/premium.css` — Enhanced/premium styles (recently rebuilt and cleaned)

JavaScript
----------
- `js/script.js` — Form validation, navigation, scroll effects, and animations.

Run Locally
-----------
The site is a static site and can be served with Python's simple HTTP server. From the project root run:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open http://127.0.0.1:8080 in your browser.

Notes
-----
- `premium.css` was corrupted previously and has been reconstructed to restore layout and premium UI effects. If you make edits, validate CSS to avoid layout breakage.
- Icons in the site currently use simple Unicode; consider replacing them with an SVG icon set or an icon font for a more professional look.

Next steps
----------
- Replace text/emoji icons with an inline SVG icon system for `services`, `fleet`, `why us`, `about`, and `testimonials`.
- Polish animations and transitions; test responsive breakpoints (1024px, 768px, 480px).
- Add a small CI/check (stylelint/prettier) if you plan to expand the codebase.

Contact
-------
If you want me to implement the SVG icon system now, tell me which icon style you prefer (outline, solid, duotone) and I'll replace the current symbols.
