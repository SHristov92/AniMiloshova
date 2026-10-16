# Ani Miloshova – website

A static website: plain HTML, CSS and JavaScript. There is no database and no build step.
All content comes from two JSON files, so updating the site means editing JSON and pushing to GitHub.

```
Web/
├── index.html          page layout (rarely needs changes)
├── css/style.css       styles – colours are at the top in :root
├── js/main.js          loads the JSON and builds the gallery + lightbox
├── data/site.json      name, tagline, about text, facts, story timeline, press, contact
├── data/gallery.json   categories and artworks
├── data/media.json     studio videos and "Behind the easel" photos
├── images/
│   ├── gallery/        artwork images (full size)
│   │   └── thumbs/     smaller copies for the grid (about 640 px)
│   └── photos/         photos of Ani (hero, about, behind the easel)
├── videos/             studio videos (.mp4)
│   └── posters/        a still frame shown before a video plays
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
  "image": "images/gallery/my-new-painting.jpg",
  "category": "landscape",
  "year": 2026,
  "technique": "Oil on canvas",
  "size": "50 × 70 cm",
  "description": "The story behind the painting.",
  "status": "available",
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
| `status`      | no       | `available` (green), `sold` (red), or any other text such as `private collection` (purple). |
| `mood`        | no       | A short line in Ani's own style, e.g. `Misty and Magical`. Shown in italics. |
| `featured`    | no       | `true` shows the work in the collage at the top (the first 3 featured works are used). |
| `hidden`      | no       | `true` hides the work without deleting the entry. |

A missing comma or quote in JSON breaks the whole gallery. Check the file at https://jsonlint.com before pushing.

## Editing texts

Everything is in `data/site.json`:

- `about`: the paragraphs and the portrait photo
- `facts`: the small coloured number cards under the about text
- `timeline`: the "My story" cards (`year`, `title`, `text`, optional `url`)
- `press`: the "Featured in" cards (`source`, `title`, optional `year` and `url`)
- `contact`: email, Instagram handle, phone, location
- `social`: extra links shown as buttons

An empty list (`[]`) hides its section.
Leaving `phone` empty hides that card.

## Videos and photos

`data/media.json` has two lists:

- `videos.items`: `src` (the .mp4 file), `poster` (a still image shown before playing) and `title`.
  Videos load only when someone presses play, so they don't slow the page down.
  Keep each one under ~15 MB; GitHub refuses files over 100 MB.
- `photos.items`: `src` and `alt` (a short description for screen readers).

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
