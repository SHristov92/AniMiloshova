/* ==========================================================
   Ani Miloshova – site script
   Loads data/site.json, data/media.json and data/gallery.json and builds the page.
   No build step, no libraries – just plain JavaScript.
   ========================================================== */

(function () {
  "use strict";

  // Accent colours given to categories (in order) and to contact cards.
  var PALETTE = ["#ff5d73", "#00b8a9", "#7b5cff", "#ffb020", "#3db7ff", "#ff7a3d", "#e04fd8"];

  var state = {
    artworks: [],
    categories: [],   // [{ id, label, color }]
    filter: "all",
    visible: [],      // artworks currently shown in the grid (lightbox navigates these)
    current: -1,
    contactEmail: ""
  };

  var $ = function (sel) { return document.querySelector(sel); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (attrs[key] == null) return;
      if (key === "text") node.textContent = attrs[key];
      else if (key === "style") node.style.cssText = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  // "no-cache" makes the browser re-check the JSON, so updates pushed to GitHub show up quickly.
  function loadJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error(url + " → HTTP " + res.status);
      return res.json();
    });
  }

  /* ---------- Site info ---------- */

  function renderSite(site) {
    document.querySelectorAll("[data-site]").forEach(function (node) {
      var value = site[node.getAttribute("data-site")];
      if (value) node.textContent = value;
    });
    if (site.name) document.title = site.name + (site.tagline ? " – " + site.tagline : "");

    var about = site.about || {};
    if (about.title) $("#about-title").textContent = about.title;
    if (about.quote) { $("#about-quote").textContent = about.quote; $("#about-quote").hidden = false; }
    if (about.photo) $("#about-photo").src = about.photo;
    $("#about-photo").alt = site.name || "";
    var paragraphs = $("#about-paragraphs");
    (about.paragraphs || []).forEach(function (text) { paragraphs.appendChild(el("p", { text: text })); });

    var facts = site.facts || [];
    if (facts.length) {
      var factBox = $("#facts");
      facts.forEach(function (f, i) {
        factBox.appendChild(el("div", { class: "fact", style: "--accent:" + PALETTE[i % PALETTE.length] }, [
          el("span", { class: "fact-value", text: f.value || "" }),
          el("span", { class: "fact-label", text: f.label || "" })
        ]));
      });
      factBox.hidden = false;
    }

    var timeline = site.timeline || {};
    if ((timeline.items || []).length) {
      if (timeline.title) $("#timeline-title").textContent = timeline.title;
      var list = $("#timeline-list");
      timeline.items.forEach(function (item, i) {
        var title = item.url
          ? el("a", { href: item.url, target: "_blank", rel: "noopener", text: item.title || "" })
          : el("span", { text: item.title || "" });
        list.appendChild(el("li", { style: "--accent:" + PALETTE[i % PALETTE.length] }, [
          el("span", { class: "tl-year", text: item.year || "" }),
          el("div", { class: "tl-body" }, [
            el("strong", {}, [title]),
            item.text ? el("p", { text: item.text }) : null
          ])
        ]));
      });
      $("#timeline").hidden = false;
    }

    var press = site.press || {};
    if ((press.items || []).length) {
      if (press.title) $("#press-title").textContent = press.title;
      var pressBox = $("#press-list");
      press.items.forEach(function (p, i) {
        pressBox.appendChild(el(p.url ? "a" : "div", {
          class: "press-card",
          href: p.url,
          target: p.url ? "_blank" : null,
          rel: p.url ? "noopener" : null,
          style: "--accent:" + PALETTE[i % PALETTE.length]
        }, [
          el("span", { class: "press-source", text: [p.source, p.year].filter(Boolean).join(" · ") }),
          el("span", { class: "press-title", text: p.title || "" }),
          p.url ? el("span", { class: "press-more", text: "Read →" }) : null
        ]));
      });
      $("#press").hidden = false;
    }

    renderEvent(site.event);
    renderCommissions(site.commissions, (site.contact || {}).email);
    renderKindWords(site.kindWords);

    var contact = site.contact || {};
    state.contactEmail = contact.email || "";
    if (contact.text) $("#contact-text").textContent = contact.text;
    var cards = $("#contact-cards");
    var items = [
      contact.email && { label: "Email", value: contact.email, href: "mailto:" + contact.email },
      contact.instagram && { label: "Instagram", value: "@" + contact.instagram, href: "https://www.instagram.com/" + contact.instagram + "/" },
      contact.phone && { label: "Phone", value: contact.phone, href: "tel:" + contact.phone.replace(/\s+/g, "") },
      contact.location && { label: "Based in", value: contact.location }
    ].filter(Boolean);
    items.forEach(function (item, i) {
      cards.appendChild(el(item.href ? "a" : "div", {
        class: "contact-card",
        href: item.href || null,
        style: "--accent:" + PALETTE[i % PALETTE.length]
      }, [
        el("span", { class: "label", text: item.label }),
        el("span", { class: "value", text: item.value })
      ]));
    });

    var social = $("#social");
    (site.social || []).forEach(function (s) {
      if (s.url) social.appendChild(el("a", { href: s.url, target: "_blank", rel: "noopener", text: s.label || s.url }));
    });

    // Footer: a short line about the artist and the same contacts in a list.
    $("#footer-about").textContent = (site.footer && site.footer.about) || site.intro || "";
    var footerContacts = $("#footer-contacts");
    items.forEach(function (item) {
      footerContacts.appendChild(el("li", {}, [
        el("span", { class: "label", text: item.label }),
        item.href ? el("a", { href: item.href, text: item.value }) : el("span", { text: item.value })
      ]));
    });
  }

  // A highlighted exhibition or event (site.json "event"). Leave it out to hide the section.
  function renderEvent(event) {
    if (!event || !event.title) return;
    $("#event-title").textContent = event.title;
    if (event.label) $("#event-label").textContent = event.label;
    $("#event-when").textContent = [event.date, event.place].filter(Boolean).join(" · ");
    $("#event-text").textContent = event.text || "";
    if (event.image) { $("#event-img").src = event.image; $("#event-img").alt = event.imageAlt || event.title; }
    else $(".event-img").hidden = true;
    if (event.url) {
      var link = $("#event-link");
      link.href = event.url;
      link.textContent = event.button || "See more";
      link.hidden = false;
    }
    $("#event").hidden = false;
  }

  // What she paints to order (site.json "commissions"). "price" is optional, e.g. "from 120 €".
  function renderCommissions(data, email) {
    if (!data || !(data.items || []).length) return;
    if (data.title) $("#commissions-title").textContent = data.title;
    $("#commissions-intro").textContent = data.intro || "";
    var box = $("#services");
    data.items.forEach(function (item, i) {
      var subject = "Commission: " + (item.title || "a painting");
      box.appendChild(el("article", { class: "service", style: "--accent:" + PALETTE[i % PALETTE.length] }, [
        item.image ? el("div", { class: "service-img" }, [el("img", { src: item.image, alt: item.title || "", loading: "lazy" })]) : null,
        el("div", { class: "service-body" }, [
          el("h3", { text: item.title || "" }),
          item.text ? el("p", { text: item.text }) : null,
          item.price ? el("p", { class: "service-price", text: item.price }) : null,
          email ? el("a", { class: "service-ask", href: "mailto:" + email + "?subject=" + encodeURIComponent(subject), text: "Ask about it →" }) : null
        ])
      ]));
    });
    if (data.note) { $("#commissions-note").textContent = data.note; $("#commissions-note").hidden = false; }
    $("#commissions").hidden = false;
  }

  // Testimonials (site.json "kindWords"). Hidden until there is at least one real quote.
  function renderKindWords(data) {
    if (!data || !(data.items || []).length) return;
    if (data.title) $("#kind-words-title").textContent = data.title;
    var box = $("#quotes");
    data.items.forEach(function (q, i) {
      if (!q.text) return;
      box.appendChild(el("figure", { class: "quote", style: "--accent:" + PALETTE[i % PALETTE.length] }, [
        el("blockquote", { text: q.text }),
        q.name ? el("figcaption", {}, [
          el("strong", { text: q.name }),
          q.from ? el("span", { text: q.from }) : null
        ]) : null
      ]));
    });
    $("#kind-words").hidden = !box.children.length;
  }

  // Hide menu links whose section has nothing to show.
  function syncNav() {
    document.querySelectorAll('.site-nav a[href^="#"], .footer-nav a[href^="#"]').forEach(function (a) {
      var target = document.getElementById(a.getAttribute("href").slice(1));
      a.hidden = !!(target && target.hidden);
    });
  }

  /* ---------- Gallery ---------- */

  function categoryOf(art) {
    for (var i = 0; i < state.categories.length; i++) {
      if (state.categories[i].id === art.category) return state.categories[i];
    }
    return { id: art.category || "", label: art.category || "", color: PALETTE[0] };
  }

  function statusClass(status) {
    var s = (status || "").toLowerCase();
    if (s === "available") return "status";
    if (s === "sold") return "status sold";
    return "status other";
  }

  function setupCategories(data) {
    var defined = data.categories || [];
    var used = {};
    state.artworks.forEach(function (a) { if (a.category) used[a.category] = true; });

    // Keep the order from the JSON, then add any category used by a painting but not listed.
    var list = defined.filter(function (c) { return used[c.id]; }).map(function (c) { return { id: c.id, label: c.label || c.id, color: c.color }; });
    Object.keys(used).forEach(function (id) {
      if (!list.some(function (c) { return c.id === id; })) list.push({ id: id, label: id });
    });
    list.forEach(function (c, i) { c.color = c.color || PALETTE[i % PALETTE.length]; });
    state.categories = list;
  }

  function renderFilters() {
    var bar = $("#filters");
    bar.innerHTML = "";
    if (state.categories.length < 2) return;
    var all = [{ id: "all", label: "All", color: "#23202b" }].concat(state.categories);
    all.forEach(function (c) {
      var chip = el("button", {
        type: "button",
        class: "chip" + (state.filter === c.id ? " active" : ""),
        "aria-pressed": String(state.filter === c.id),
        style: "--chip-color:" + c.color,
        text: c.label
      });
      chip.addEventListener("click", function () {
        state.filter = c.id;
        renderFilters();
        renderGrid();
      });
      bar.appendChild(chip);
    });
  }

  function renderGrid() {
    var grid = $("#grid");
    grid.innerHTML = "";
    gridCards = [];
    state.visible = state.artworks.filter(function (a) {
      return state.filter === "all" || a.category === state.filter;
    });

    if (!state.visible.length) {
      grid.appendChild(el("p", { class: "empty", text: "No paintings here yet." }));
      return;
    }

    state.visible.forEach(function (art, index) {
      var cat = categoryOf(art);
      var meta = [art.technique, art.year].filter(Boolean).join(" · ") || cat.label;
      var img = el("img", { src: art.thumb || art.image, alt: art.title || "", loading: "lazy" });
      if (art.width && art.height) { img.width = art.width; img.height = art.height; }

      var card = el("button", {
        type: "button",
        class: "card",
        style: "--accent:" + cat.color + ";animation-delay:" + Math.min(index * 60, 600) + "ms",
        "aria-label": (art.title || "Painting") + " – open details"
      }, [
        el("div", { class: "card-img" }, [
          img,
          art.status ? el("span", { class: statusClass(art.status), text: art.status }) : null
        ]),
        el("div", { class: "card-body" }, [
          el("p", { class: "card-title", text: art.title || "" }),
          art.mood ? el("p", { class: "card-mood", text: art.mood }) : null,
          meta ? el("p", { class: "card-meta", text: meta }) : null
        ])
      ]);
      card.addEventListener("click", function () { openLightbox(index); });
      gridCards.push(card);
    });
    layoutGrid();
    relayoutWhenLoaded();
  }

  // Masonry: deal the cards into columns left-to-right, so the order in the JSON reads across rows.
  var gridCards = [];
  var columnCount = 0;

  function columnsForWidth() {
    var w = window.innerWidth;
    return w < 760 ? 2 : 3;
  }

  // Each card goes into the currently shortest column (by image shape), so columns end evenly.
  // Until an image has loaded its shape is unknown, so it counts as square.
  function layoutGrid(rebalance) {
    var grid = $("#grid");
    columnCount = columnsForWidth();
    grid.innerHTML = "";
    var cols = [], heights = [];
    for (var i = 0; i < columnCount; i++) {
      cols.push(grid.appendChild(el("div", { class: "grid-col" })));
      heights.push(0);
    }
    gridCards.forEach(function (card) {
      var img = card.querySelector("img");
      var ratio = img && img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1;
      var shortest = heights.indexOf(Math.min.apply(null, heights));
      // Moving a card restarts its fade-in animation – skip it when only re-balancing.
      if (rebalance) card.style.animation = "none";
      cols[shortest].appendChild(card);
      heights[shortest] += ratio + 0.3; // + card text area
    });
  }

  // Re-balance once all thumbnails of the current grid have loaded.
  function relayoutWhenLoaded() {
    var cards = gridCards;
    var pending = cards.length;
    cards.forEach(function (card) {
      var img = card.querySelector("img");
      if (img.complete) return --pending;
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    });
    if (!pending) layoutGrid(true);
    function done() { if (--pending === 0 && cards === gridCards) layoutGrid(true); }
  }

  window.addEventListener("resize", function () {
    if (gridCards.length && columnsForWidth() !== columnCount) layoutGrid(true);
  });


  // The hero collage: an optional photo of the artist (site.json "heroPhoto") plus featured works.
  function renderHero(heroPhoto) {
    var featured = state.artworks.filter(function (a) { return a.featured; });
    if (featured.length < 3) featured = featured.concat(state.artworks.filter(function (a) { return !a.featured; }));
    var box = $("#hero-art");
    if (heroPhoto) {
      var photo = el("figure", { class: "frame frame-photo" }, [el("img", { src: heroPhoto, alt: state.siteName || "" })]);
      photo.addEventListener("click", function () { $("#about").scrollIntoView(); });
      box.appendChild(photo);
    }
    featured.slice(0, heroPhoto ? 2 : 3).forEach(function (art) {
      var frame = el("figure", { class: "frame", title: art.title || "" }, [
        el("img", { src: art.thumb || art.image, alt: art.title || "" })
      ]);
      frame.addEventListener("click", function () {
        state.filter = "all";
        renderFilters();
        renderGrid();
        openLightbox(state.visible.indexOf(art));
      });
      box.appendChild(frame);
    });
  }

  // Footer: small squares of the first paintings, each opening the lightbox.
  function renderFooterThumbs() {
    var box = $("#footer-thumbs");
    box.innerHTML = "";
    state.artworks.slice(0, 6).forEach(function (art) {
      var thumb = el("button", { type: "button", class: "footer-thumb", "aria-label": art.title || "Painting" }, [
        el("img", { src: art.thumb || art.image, alt: "", loading: "lazy" })
      ]);
      thumb.addEventListener("click", function () {
        state.filter = "all";
        renderFilters();
        renderGrid();
        openLightbox(state.visible.indexOf(art));
      });
      box.appendChild(thumb);
    });
  }

  /* ---------- Studio videos & photos (media.json) ---------- */

  function renderMedia(media) {
    var videos = media.videos || {};
    if ((videos.items || []).length) {
      if (videos.title) $("#studio-title").textContent = videos.title;
      if (videos.intro) $("#studio-intro").textContent = videos.intro;
      var box = $("#videos");
      videos.items.forEach(function (v, i) {
        // preload="none": nothing is downloaded until the visitor presses play.
        var video = el("video", {
          src: v.src, poster: v.poster, preload: "none", controls: "", playsinline: "",
          "aria-label": v.title || "Video"
        });
        video.addEventListener("play", function () {
          box.querySelectorAll("video").forEach(function (other) { if (other !== video) other.pause(); });
        });
        box.appendChild(el("figure", { class: "video-card", style: "--accent:" + PALETTE[i % PALETTE.length] }, [
          video,
          v.title ? el("figcaption", { text: v.title }) : null
        ]));
      });
      $("#studio").hidden = false;
    }

    var photos = media.photos || {};
    if ((photos.items || []).length) {
      if (photos.title) $("#moments-title").textContent = photos.title;
      var strip = $("#moments-strip");
      photos.items.forEach(function (p) {
        strip.appendChild(el("figure", { class: "moment" }, [
          el("img", { src: p.src, alt: p.alt || "", loading: "lazy" })
        ]));
      });
      $("#moments").hidden = false;
      // Start in the middle of the strip, so there are photos to discover on both sides.
      requestAnimationFrame(function () {
        strip.scrollLeft = (strip.scrollWidth - strip.clientWidth) / 2;
      });
    }
  }

  /* ---------- Lightbox ---------- */

  var lightbox = $("#lightbox");

  function showArtwork(index) {
    var count = state.visible.length;
    if (!count) return;
    state.current = (index + count) % count;
    var art = state.visible[state.current];
    var cat = categoryOf(art);

    lightbox.style.setProperty("--accent", cat.color);
    var img = $("#lb-img");
    if (img.getAttribute("src") !== art.image) {
      // Fade the new painting in once it has loaded.
      img.classList.add("is-loading");
      img.onload = img.onerror = function () { img.classList.remove("is-loading"); };
      img.src = art.image;
    }
    img.alt = art.title || "";
    $("#lb-counter").textContent = (state.current + 1) + " / " + count;
    $("#lb-category").textContent = cat.label;
    $("#lb-title").textContent = art.title || "";
    $("#lb-mood").textContent = art.mood || "";
    $("#lb-mood").hidden = !art.mood;
    $("#lb-desc").textContent = art.description || "";

    var meta = $("#lb-meta");
    meta.innerHTML = "";
    [["Year", art.year], ["Technique", art.technique], ["Size", art.size]].forEach(function (row) {
      if (!row[1]) return;
      meta.appendChild(el("dt", { text: row[0] }));
      meta.appendChild(el("dd", { text: String(row[1]) }));
    });

    var status = $("#lb-status");
    status.hidden = !art.status;
    status.className = statusClass(art.status);
    status.textContent = art.status || "";

    var ask = $("#lb-ask");
    ask.hidden = !state.contactEmail;
    ask.href = "mailto:" + state.contactEmail + "?subject=" + encodeURIComponent("About the painting \"" + (art.title || "") + "\"");

    var multiple = count > 1;
    $("#lb-prev").hidden = !multiple;
    $("#lb-next").hidden = !multiple;
    $("#lb-counter").hidden = !multiple;

    // Load the neighbours in the background, so the arrows feel instant.
    if (multiple) [1, -1].forEach(function (step) {
      new Image().src = state.visible[(state.current + step + count) % count].image;
    });

    // Shareable link to this painting, e.g. https://site/#art/sea-storm
    if (art.id) history.replaceState(null, "", "#art/" + art.id);
  }

  function openLightbox(index) {
    if (index < 0) return;
    showArtwork(index);
    if (!lightbox.open) lightbox.showModal();
  }

  function closeLightbox() {
    if (lightbox.open) lightbox.close();
  }

  lightbox.addEventListener("close", function () {
    if (location.hash.indexOf("#art/") === 0) history.replaceState(null, "", location.pathname + location.search + "#gallery");
  });
  $("#lb-close").addEventListener("click", closeLightbox);

  // "i" button / key: hide the label so only the painting is on the wall.
  function toggleInfo() {
    var hide = !lightbox.classList.contains("no-info");
    lightbox.classList.toggle("no-info", hide);
    $("#lb-info-toggle").setAttribute("aria-pressed", String(!hide));
  }
  $("#lb-info-toggle").addEventListener("click", toggleInfo);
  $("#lb-prev").addEventListener("click", function () { showArtwork(state.current - 1); });
  $("#lb-next").addEventListener("click", function () { showArtwork(state.current + 1); });
  // A click on the empty wall around the painting closes it.
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.classList.contains("lb-stage") || e.target.classList.contains("lb-figure")) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.open) return;
    if (e.key === "ArrowLeft") showArtwork(state.current - 1);
    if (e.key === "ArrowRight") showArtwork(state.current + 1);
    if ((e.key === "i" || e.key === "I") && !e.ctrlKey && !e.metaKey && !e.altKey) toggleInfo();
  });

  // Swipe left / right on phones.
  var touchX = null;
  lightbox.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showArtwork(state.current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  function openFromHash() {
    var match = location.hash.match(/^#art\/(.+)$/);
    if (!match) return;
    var id = decodeURIComponent(match[1]);
    var index = state.visible.findIndex(function (a) { return a.id === id; });
    if (index >= 0) openLightbox(index);
  }

  /* ---------- Header / nav ---------- */

  var header = $(".site-header");
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  var toggle = $(".nav-toggle");
  var nav = $("#site-nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Start ---------- */

  var siteLoaded = loadJSON("data/site.json")
    .then(function (site) {
      state.siteName = site.name;
      renderSite(site);
      return site;
    })
    .catch(function (err) { console.error("Could not load site.json", err); return {}; });

  var mediaLoaded = loadJSON("data/media.json")
    .then(renderMedia)
    .catch(function (err) { console.error("Could not load media.json", err); });

  Promise.all([siteLoaded, mediaLoaded]).then(syncNav);

  loadJSON("data/gallery.json")
    .then(function (data) {
      state.artworks = (data.artworks || []).filter(function (a) { return a.image && !a.hidden; });
      setupCategories(data);
      renderFilters();
      renderGrid();
      renderFooterThumbs();
      // Wait for site.json too, so the "Ask about this painting" email is known.
      siteLoaded.then(function (site) {
        renderHero(site.heroPhoto);
        openFromHash();
      });
    })
    .catch(function (err) {
      console.error("Could not load gallery.json", err);
      $("#grid").innerHTML = "";
      $("#grid").appendChild(el("p", { class: "empty", text: "The gallery could not be loaded. Please try again later." }));
    });
})();
