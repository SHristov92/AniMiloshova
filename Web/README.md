# Ani Miloshova – website

A static website: plain HTML, CSS and JavaScript. There is no database and no build step.
All content comes from JSON files, so updating the site means editing JSON and pushing to GitHub.
The site is in English and Bulgarian (the БГ / EN button in the header).

```
Web/
├── index.html          page layout (rarely needs changes)
├── css/style.css       styles – colours are at the top in :root
├── js/main.js          loads the JSON and builds the gallery + lightbox
├── data/site.json      name, tagline, about text, exhibition, commissions, prints, FAQ, story, press, contact, footer
├── data/site.bg.json   the same texts in Bulgarian
├── data/gallery.json   categories and artworks
├── data/media.json     studio videos and "Behind the easel" photos
├── images/
│   ├── gallery/        artwork images (full size)
│   │   └── thumbs/     smaller copies for the grid (about 640 px)
│   ├── photos/         photos of Ani (hero, about, behind the easel)
│   └── og-image.jpg    the picture shown when the site link is shared (1200 × 630)
├── videos/             studio videos (.mp4)
│   └── posters/        a still frame shown before a video plays
├── robots.txt, sitemap.xml   help Google find the site
└── .nojekyll           tells GitHub Pages to serve the files as they are
```

## Adding a new artwork

1. Put the image in `images/gallery/`, e.g. `images/gallery/my-new-painting.jpg`.
   Keep it around **1600–2000 px** on the long side and under **~500 KB** (export as JPG at about 80% quality),
   so the page stays fast.
2. Add an entry to the `artworks` list in `data/gallery.json`. Entries show in the same order as in the file, so put new ones at the top:

```json
{
  "id": "my-new-painting",
  "title": "My New Painting",
  "title_bg": "Моята нова картина",
  "image": "images/gallery/my-new-painting.jpg",
  "category": "landscape",
  "year": 2026,
  "technique": "Oil on canvas",
  "size": "50 × 70 cm",
  "description": "The story behind the painting.",
  "description_bg": "Историята на картината.",
  "status": "available",
  "price": "250 €",
  "featured": false
}
```

| Field         | Required | Notes |
|---------------|----------|-------|
| `id`          | yes      | Unique, lowercase, no spaces. Used for the shareable link `…/#art/my-new-painting`. |
| `title`       | yes      | |
| `image`       | yes      | Path to the full-size image. |
| `thumb`       | no       | Smaller image for the grid (e.g. 800 px wide). If missing, `image` is used. |
| `category`    | no       | One of the `id`s in `categories`. A new id also works: it becomes its own filter button. |
| `year`, `technique`, `size` | no | Shown in the details view; empty fields are skipped. |
| `description` | no       | Text shown in the details view. |
| `status`      | no       | `available` (green), `sold` (red), or any other text such as `private collection` (purple). Available works appear under the "Available to buy" filter. |
| `price`       | no       | e.g. `250 €`. Shown on the card and in the details. An available work without a price shows "Price on request"; sold works never show a price. |
| `mood`        | no       | A short line in Ani's own style, e.g. `Misty and Magical`. Shown in italics. |
| `featured`    | no       | `true` shows the work in the collage at the top (the first 3 featured works are used). |
| `hidden`      | no       | `true` hides the work without deleting the entry. |
| `…_bg`        | no       | Bulgarian version of a field: `title_bg`, `description_bg`, `mood_bg`, `technique_bg`, `size_bg`. If missing, the English text is shown. |

Categories work the same way: `"label_bg": "Пейзажи"`.

> The statuses and prices in `gallery.json` right now are **placeholders**. Replace them with the real ones.

A missing comma or quote in JSON breaks the whole gallery. Check the file at https://jsonlint.com before pushing.

## Editing texts

Everything is in `data/site.json` (English) and `data/site.bg.json` (Bulgarian). The two files have the same
structure: when you change a text in one, change it in the other too. If `site.bg.json` is missing or broken,
the Bulgarian page falls back to the English texts.

- `about`: the paragraphs and the portrait photo
- `facts`: the small coloured number cards under the about text
- `timeline`: the "My story" cards (`year`, `title`, `text`, optional `url`)
- `press`: the "Featured in" cards (`source`, `title`, optional `year` and `url`)
- `event`: the big "Latest exhibition" card under the gallery (`label`, `title`, `date`, `place`, `text`,
  `image`, `imageAlt`, optional `url` and `button` text). Delete the whole `event` block to hide it,
  or change `label` to e.g. `Upcoming exhibition` for a future one.
- `commissions`: the "Paintings made for you" cards (`title`, `text`, `image`, optional `price` such as `from 150 €`)
  plus an `intro` and a `note`. Each card has an "Ask about it" link that opens an email.
- `prints`: the "Prints & cards" section, same shape as `commissions` (`title`, `intro`, `items`, `note`). Delete it to hide the section.
- `faq`: questions and answers, each item `{ "q": "...", "a": "..." }`.
- `instagram`: the "Follow along on Instagram" section (`title`, `text`, `button`). `images` is a list of photo paths to show;
  if it is empty, the "Behind the easel" photos from `media.json` are used. Delete the block to hide the section.
- `newsletter`: the signup band above the footer (`title`, `text`, `button`, `endpoint`, see below).
- `kindWords`: quotes from buyers or visitors, shown as cards. Each item: `text`, `name`, optional `from`
  (e.g. `Sofia` or `bought "Peonies"`). The list is empty, so the section is hidden until real quotes are added:

  ```json
  { "text": "The painting of our house is the best gift we ever got!", "name": "Maria", "from": "Plovdiv" }
  ```
- `contact`: email, Instagram handle, phone, location (also shown in the footer), `formEndpoint` (see below).
  **The email is still the placeholder `hello@example.com`.**
- `footer.about`: the short text in the footer
- `social`: extra links shown as buttons

An empty list (`[]`) hides its section, and menu links to hidden sections are hidden too.
Leaving `phone` empty hides that card.

## Contact form and newsletter

Both work without any setup: when someone presses Send, their own email app opens with the message ready,
addressed to `contact.email`.

To receive messages straight from the page instead, create a free form at [formspree.io](https://formspree.io)
(or a similar service) and paste its address into `site.json` **and** `site.bg.json`:

- `"formEndpoint": "https://formspree.io/f/abcdwxyz"` in `contact` for the contact form
- `"endpoint": "https://formspree.io/f/…"` in `newsletter` for the signup (a second form, or a Mailchimp/Buttondown form address)

## Languages

The language is picked from the address (`?lang=bg` / `?lang=en`), then from the visitor's last choice,
then from their browser's language. Texts that are part of the page itself (menu, buttons, form labels) are in
`js/main.js` under `UI`.

## Search engines and share previews

`index.html`, `robots.txt` and `sitemap.xml` use **`https://animiloshova.com/` as a placeholder address**.
Replace it everywhere once the real domain is known. `images/og-image.jpg` is the picture shown when the link is
shared on Facebook, Viber, etc.

## Videos and photos

`data/media.json` has two lists:

- `videos.items`: `src` (the .mp4 file), `poster` (a still image shown before playing) and `title`.
  Videos load only when someone presses play, so they don't slow the page down.
  Keep each one under ~15 MB; GitHub refuses files over 100 MB.
- `photos.items`: `src` and `alt` (a short description for screen readers).

Titles and descriptions have Bulgarian versions in `title_bg`, `intro_bg` and `alt_bg`.

The hero photo (`heroPhoto`) and the about photo (`about.photo`) are set in `site.json`.

## Testing on your computer

Browsers block loading JSON from a page opened by double-clicking `index.html`, so start a tiny local server:

```bash
cd Web
python3 -m http.server 8000
# open http://localhost:8000
```

## Publishing on GitHub Pages with a custom domain

1. GitHub Pages can only publish the repository root or a folder named `docs`. Pick one:
   - push the **contents** of this `Web` folder as the repository, so `index.html` is at the root, then choose **main** / **/(root)**; or
   - keep the bigger project repo and rename `Web` to `docs`, then choose **main** / **/docs**.
   Keep `Resources/` (the raw Instagram downloads) and `Templates/` out of the published repo, or add them to `.gitignore`.
2. In the repository, go to **Settings → Pages → Build and deployment** and choose **Deploy from a branch** with the branch/folder from step 1.
3. Under **Custom domain**, enter the domain (e.g. `animiloshova.com`) and save. GitHub creates a `CNAME` file in the repo; pull it so it isn't lost.
4. At the domain registrar, add DNS records:
   - apex domain (`animiloshova.com`): four `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: a `CNAME` record → `<your-github-username>.github.io`
5. After the DNS check passes, tick **Enforce HTTPS**.

Every push to `main` updates the site in a minute or two.
