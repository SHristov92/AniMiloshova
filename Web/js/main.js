/* ==========================================================
   Ani Miloshova – site script
   Loads data/site.json (or site.bg.json), data/media.json and data/gallery.json and builds the page.
   No build step, no libraries – just plain JavaScript.
   ========================================================== */

(function () {
  "use strict";

  // Accent colours given to categories (in order) and to contact cards.
  var PALETTE = ["#ff5d73", "#00b8a9", "#7b5cff", "#ffb020", "#3db7ff", "#ff7a3d", "#e04fd8"];

  /* ---------- Language ----------
     The <head> script has already picked the language and put it on <html lang>.
     Texts written in index.html and in this file are below; everything else comes from the JSON files:
     site.json / site.bg.json, and "_bg" fields (e.g. "title_bg") in gallery.json and media.json. */
  var LANG = document.documentElement.lang === "bg" ? "bg" : "en";

  var UI = {
    en: {
      menu: "Open menu", theme: "Change colour theme", featured: "Featured paintings", filters: "Filter paintings",
      nav_gallery: "Gallery", nav_studio: "Studio", nav_about: "About", nav_commissions: "Commissions",
      nav_prints: "Prints", nav_faq: "FAQ", nav_contact: "Contact",
      hero_see: "See the paintings", hero_contact: "Get in touch",
      gallery_title: "Gallery", gallery_intro: "Click on a painting to see it bigger and read its story.",
      loading: "Loading paintings…", all: "All", available_only: "Available to buy",
      empty: "No paintings here yet.", gallery_error: "The gallery could not be loaded. Please try again later.",
      open_details: "open details", painting: "Painting",
      year: "Year", technique: "Technique", size: "Size", price: "Price", price_on_request: "Price on request",
      status_available: "available", status_sold: "sold",
      ask_painting: "Ask about this painting →", ask_service: "Ask about it →", subject_painting: "About the painting",
      read: "Read →", see_more: "See more",
      email: "Email", instagram: "Instagram", phone: "Phone", based_in: "Based in",
      contact_title: "Let's talk", form_title: "Send me a message", form_name: "Your name", form_email: "Your email",
      form_subject: "What is it about?", form_message: "Message", form_send: "Send", form_sending: "Sending…",
      form_thanks: "Thank you! Your message is on its way, and I will write back soon.",
      form_mailto: "Your email app should open with the message ready. Just press send there.",
      form_error: "Sorry, the message could not be sent. Please write to me directly by email.",
      form_invalid: "Please fill in your name, a valid email and a message.",
      newsletter_join: "Sign me up", newsletter_invalid: "Please enter a valid email address.",
      newsletter_thanks: "Thank you! You will hear from me when there are new paintings.",
      newsletter_subject: "Please add me to your list", newsletter_body: "Please send news about new paintings to: ",
      follow: "Follow", footer_gallery: "Gallery", footer_about: "About me", footer_contacts: "Contacts",
      copyright: "All paintings are protected by copyright.",
      zoom: "Zoom in (Z)", info: "Show or hide the details (I)", close: "Close (Esc)",
      prev: "Previous painting", next: "Next painting",
      lang_switch: "БГ", lang_switch_label: "Български"
    },
    bg: {
      menu: "Отвори менюто", theme: "Смени цветовете", featured: "Избрани картини", filters: "Филтър на картините",
      nav_gallery: "Галерия", nav_studio: "Ателие", nav_about: "За мен", nav_commissions: "Поръчки",
      nav_prints: "Принтове", nav_faq: "Въпроси", nav_contact: "Контакт",
      hero_see: "Разгледай картините", hero_contact: "Пиши ми",
      gallery_title: "Галерия", gallery_intro: "Натисни върху картина, за да я видиш по-голяма и да прочетеш историята ѝ.",
      loading: "Картините се зареждат…", all: "Всички", available_only: "Налични за покупка",
      empty: "Тук още няма картини.", gallery_error: "Галерията не можа да се зареди. Моля, опитай по-късно.",
      open_details: "виж подробности", painting: "Картина",
      year: "Година", technique: "Техника", size: "Размер", price: "Цена", price_on_request: "Цена при запитване",
      status_available: "налична", status_sold: "продадена",
      ask_painting: "Попитай за тази картина →", ask_service: "Попитай →", subject_painting: "За картината",
      read: "Прочети →", see_more: "Виж още",
      email: "Имейл", instagram: "Instagram", phone: "Телефон", based_in: "Живея в",
      contact_title: "Да поговорим", form_title: "Изпрати ми съобщение", form_name: "Твоето име", form_email: "Твоят имейл",
      form_subject: "За какво става дума?", form_message: "Съобщение", form_send: "Изпрати", form_sending: "Изпращане…",
      form_thanks: "Благодаря! Съобщението ти е изпратено и скоро ще ти отговоря.",
      form_mailto: "Имейл програмата ти би трябвало да се отвори с готово съобщение. Просто натисни „Изпрати“ там.",
      form_error: "За съжаление съобщението не можа да се изпрати. Моля, пиши ми директно на имейла.",
      form_invalid: "Моля, попълни име, валиден имейл и съобщение.",
      newsletter_join: "Абонирай ме", newsletter_invalid: "Моля, въведи валиден имейл адрес.",
      newsletter_thanks: "Благодаря! Ще ти пиша, когато има нови картини.",
      newsletter_subject: "Моля, добави ме в списъка", newsletter_body: "Моля, изпращай новини за нови картини на: ",
      follow: "Последвай", footer_gallery: "Галерия", footer_about: "За мен", footer_contacts: "Контакти",
      copyright: "Всички картини са защитени с авторско право.",
      zoom: "Увеличи (Z)", info: "Покажи или скрий подробностите (I)", close: "Затвори (Esc)",
      prev: "Предишна картина", next: "Следваща картина",
      lang_switch: "EN", lang_switch_label: "English"
    }
  };

  function t(key) { return UI[LANG][key] != null ? UI[LANG][key] : UI.en[key]; }

  // Copies "title_bg" over "title" (and so on) when the page is in Bulgarian.
  function localize(obj) {
    if (!obj || LANG === "en") return obj;
    var suffix = "_" + LANG;
    Object.keys(obj).forEach(function (key) {
      if (key.slice(-suffix.length) === suffix && obj[key] !== "") obj[key.slice(0, -suffix.length)] = obj[key];
    });
    return obj;
  }

  function applyStaticTexts() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
    });
    var other = LANG === "bg" ? "en" : "bg";
    var sw = $("#lang-switch");
    sw.textContent = t("lang_switch");
    sw.setAttribute("aria-label", t("lang_switch_label"));
    sw.setAttribute("lang", other);
    sw.setAttribute("hreflang", other);
    sw.href = "?lang=" + other;
    sw.addEventListener("click", function (e) {
      e.preventDefault();
      try { localStorage.setItem("lang", other); } catch (err) { /* the address still carries the choice */ }
      location.href = location.pathname + "?lang=" + other + location.hash;
    });
  }

  var state = {
    artworks: [],
    categories: [],   // [{ id, label, color }]
    filter: "all",
    onlyAvailable: false,
    visible: [],      // artworks currently shown in the grid (lightbox navigates these)
    current: -1,
    contact: {},
    media: {}
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

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------- Site info ---------- */

  function renderSite(site) {
    document.querySelectorAll("[data-site]").forEach(function (node) {
      var value = site[node.getAttribute("data-site")];
      if (value) node.textContent = value;
    });
    if (site.name) document.title = site.name + (site.tagline ? " – " + site.tagline : "");
    var description = (site.footer && site.footer.about) || site.intro;
    if (description) document.querySelector('meta[name="description"]').setAttribute("content", description);

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
          p.url ? el("span", { class: "press-more", text: t("read") }) : null
        ]));
      });
      $("#press").hidden = false;
    }

    renderEvent(site.event);
    renderServices("commissions", site.commissions);
    renderServices("prints", site.prints);
    renderKindWords(site.kindWords);
    renderFaq(site.faq);

    var contact = site.contact || {};
    state.contact = contact;
    if (contact.text) $("#contact-text").textContent = contact.text;
    var cards = $("#contact-cards");
    var items = [
      contact.email && { label: t("email"), value: contact.email, href: "mailto:" + contact.email },
      contact.instagram && { label: t("instagram"), value: "@" + contact.instagram, href: instagramUrl(contact.instagram) },
      contact.phone && { label: t("phone"), value: contact.phone, href: "tel:" + contact.phone.replace(/\s+/g, "") },
      contact.location && { label: t("based_in"), value: contact.location }
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

    setupContactForm(contact);
    setupNewsletter(site.newsletter, contact.email);

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

  function instagramUrl(handle) { return "https://www.instagram.com/" + handle + "/"; }

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
      link.textContent = event.button || t("see_more");
      link.hidden = false;
    }
    $("#event").hidden = false;
  }

  // Cards with a picture, text, optional price and an "Ask about it" link:
  // used for "commissions" and "prints" in site.json. "price" is optional, e.g. "from 120 €".
  function renderServices(id, data) {
    if (!data || !(data.items || []).length) return;
    if (data.title) $("#" + id + "-title").textContent = data.title;
    $("#" + id + "-intro").textContent = data.intro || "";
    var box = $("#" + id + "-items");
    data.items.forEach(function (item, i) {
      var ask = el("a", { class: "service-ask", href: "#contact", text: t("ask_service") });
      ask.addEventListener("click", function (e) {
        e.preventDefault();
        askAbout((data.title ? data.title + ": " : "") + (item.title || ""));
      });
      box.appendChild(el("article", { class: "service", style: "--accent:" + PALETTE[i % PALETTE.length] }, [
        item.image ? el("div", { class: "service-img" }, [el("img", { src: item.image, alt: item.title || "", loading: "lazy" })]) : null,
        el("div", { class: "service-body" }, [
          el("h3", { text: item.title || "" }),
          item.text ? el("p", { text: item.text }) : null,
          item.price ? el("p", { class: "service-price", text: item.price }) : null,
          ask
        ])
      ]));
    });
    if (data.note) { $("#" + id + "-note").textContent = data.note; $("#" + id + "-note").hidden = false; }
    $("#" + id).hidden = false;
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

  // Questions and answers (site.json "faq"), each one opens and closes on click.
  function renderFaq(data) {
    if (!data || !(data.items || []).length) return;
    if (data.title) $("#faq-title").textContent = data.title;
    $("#faq-intro").textContent = data.intro || "";
    var box = $("#faq-list");
    data.items.forEach(function (item, i) {
      if (!item.q) return;
      box.appendChild(el("details", { class: "faq-item", style: "--accent:" + PALETTE[i % PALETTE.length] }, [
        el("summary", { text: item.q }),
        el("p", { text: item.a || "" })
      ]));
    });
    $("#faq").hidden = !box.children.length;
  }

  // "Follow along on Instagram": a few photos linking to the profile (site.json "instagram").
  // "images" in site.json picks the photos; without it the "Behind the easel" photos are used.
  function renderInstagram(data, contact, media) {
    var handle = contact.instagram;
    if (!data || !handle) return;
    var images = (data.images || []).length ? data.images
      : ((media.photos || {}).items || []).map(function (p) { return p.src; });
    var url = instagramUrl(handle);
    if (data.title) $("#insta-title").textContent = data.title;
    $("#insta-text").textContent = data.text || "";
    var grid = $("#insta-grid");
    images.slice(0, 6).forEach(function (src) {
      grid.appendChild(el("a", { class: "insta-tile", href: url, target: "_blank", rel: "noopener", "aria-label": "@" + handle }, [
        el("img", { src: src, alt: "", loading: "lazy" })
      ]));
    });
    var link = $("#insta-link");
    link.href = url;
    link.textContent = (data.button || t("follow")) + " @" + handle;
    $("#instagram").hidden = false;
  }

  // Hide menu links whose section has nothing to show.
  function syncNav() {
    document.querySelectorAll('.site-nav a[href^="#"], .footer-nav a[href^="#"]').forEach(function (a) {
      var target = document.getElementById(a.getAttribute("href").slice(1));
      a.hidden = !!(target && target.hidden);
    });
  }

  /* ---------- Contact form & newsletter ----------
     With a form service address in site.json ("contact.formEndpoint", "newsletter.endpoint", e.g. from
     formspree.io) the messages are sent from the page. Without one, the visitor's email app opens instead. */

  function setStatus(node, text, kind) {
    node.textContent = text || "";
    node.className = "form-status" + (kind ? " " + kind : "");
  }

  function postForm(endpoint, data) {
    return fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); });
  }

  function setupContactForm(contact) {
    var form = $("#contact-form");
    var status = $("#form-status");
    if (!contact.formEndpoint && !contact.email) { form.hidden = true; return; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get("_gotcha")) return;
      var name = String(data.get("name") || "").trim();
      var email = String(data.get("email") || "").trim();
      var message = String(data.get("message") || "").trim();
      var subject = String(data.get("subject") || "").trim();
      if (!name || !EMAIL_RE.test(email) || !message) return setStatus(status, t("form_invalid"), "error");

      if (!contact.formEndpoint) {
        var body = message + "\n\n" + name + "\n" + email;
        location.href = "mailto:" + contact.email + "?subject=" + encodeURIComponent(subject || name) + "&body=" + encodeURIComponent(body);
        return setStatus(status, t("form_mailto"), "ok");
      }
      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      setStatus(status, t("form_sending"));
      postForm(contact.formEndpoint, data)
        .then(function () { form.reset(); setStatus(status, t("form_thanks"), "ok"); })
        .catch(function () { setStatus(status, t("form_error"), "error"); })
        .then(function () { button.disabled = false; });
    });
  }

  // Fill in the form's subject and bring the visitor to it ("Ask about this painting", "Ask about it").
  function askAbout(subject) {
    var form = $("#contact-form");
    if (form.hidden) {
      if (state.contact.email) location.href = "mailto:" + state.contact.email + "?subject=" + encodeURIComponent(subject);
      return;
    }
    $("#form-subject").value = subject;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    var message = form.querySelector("textarea");
    setTimeout(function () { message.focus({ preventScroll: true }); }, 400);
  }

  function setupNewsletter(data, email) {
    if (!data || (!data.endpoint && !email)) return;
    if (data.title) $("#newsletter-title").textContent = data.title;
    $("#newsletter-text").textContent = data.text || "";
    if (data.button) $("#newsletter-form button").textContent = data.button;
    var form = $("#newsletter-form");
    var status = $("#newsletter-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get("_gotcha")) return;
      var address = String(fd.get("email") || "").trim();
      if (!EMAIL_RE.test(address)) return setStatus(status, t("newsletter_invalid"), "error");
      if (!data.endpoint) {
        location.href = "mailto:" + email + "?subject=" + encodeURIComponent(t("newsletter_subject")) + "&body=" + encodeURIComponent(t("newsletter_body") + address);
        return setStatus(status, t("form_mailto"), "ok");
      }
      postForm(data.endpoint, fd)
        .then(function () { form.reset(); setStatus(status, t("newsletter_thanks"), "ok"); })
        .catch(function () { setStatus(status, t("form_error"), "error"); });
    });
    $("#newsletter").hidden = false;
  }

  /* ---------- Gallery ---------- */

  function categoryOf(art) {
    for (var i = 0; i < state.categories.length; i++) {
      if (state.categories[i].id === art.category) return state.categories[i];
    }
    return { id: art.category || "", label: art.category || "", color: PALETTE[0] };
  }

  // art.statusKey is the status as written in gallery.json ("available", "sold" or any other text).
  function statusClass(art) {
    if (art.statusKey === "available") return "status";
    if (art.statusKey === "sold") return "status sold";
    return "status other";
  }

  function statusLabel(art) {
    if (art.statusKey === "available" || art.statusKey === "sold") return t("status_" + art.statusKey);
    return art.status || "";
  }

  function isAvailable(art) { return art.statusKey === "available"; }

  // The price shown for an available painting; sold ones show no price.
  function priceOf(art) {
    if (art.statusKey === "sold") return "";
    return art.price || (isAvailable(art) ? t("price_on_request") : "");
  }

  function setupCategories(data) {
    var defined = (data.categories || []).map(localize);
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
    if (state.categories.length >= 2) {
      var all = [{ id: "all", label: t("all"), color: "var(--coral)" }].concat(state.categories);
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
    // An on/off switch next to the categories: only the paintings that can be bought.
    if (state.artworks.some(isAvailable)) {
      var toggle = el("button", {
        type: "button",
        class: "chip chip-available" + (state.onlyAvailable ? " active" : ""),
        "aria-pressed": String(state.onlyAvailable)
      }, [el("span", { class: "dot", "aria-hidden": "true" }), document.createTextNode(t("available_only"))]);
      toggle.addEventListener("click", function () {
        state.onlyAvailable = !state.onlyAvailable;
        renderFilters();
        renderGrid();
      });
      bar.appendChild(toggle);
    }
  }

  function renderGrid() {
    var grid = $("#grid");
    grid.innerHTML = "";
    gridCards = [];
    state.visible = state.artworks.filter(function (a) {
      return (state.filter === "all" || a.category === state.filter) && (!state.onlyAvailable || isAvailable(a));
    });

    if (!state.visible.length) {
      grid.appendChild(el("p", { class: "empty", text: t("empty") }));
      return;
    }

    state.visible.forEach(function (art, index) {
      var cat = categoryOf(art);
      var meta = [art.technique, art.year].filter(Boolean).join(" · ") || cat.label;
      var price = art.statusKey === "sold" ? "" : art.price;
      var img = el("img", { src: art.thumb || art.image, alt: art.title || "", loading: "lazy" });
      if (art.width && art.height) { img.width = art.width; img.height = art.height; }

      var card = el("button", {
        type: "button",
        class: "card",
        style: "--accent:" + cat.color + ";animation-delay:" + Math.min(index * 60, 600) + "ms",
        "aria-label": (art.title || t("painting")) + " – " + t("open_details")
      }, [
        el("div", { class: "card-img" }, [
          img,
          art.status ? el("span", { class: statusClass(art), text: statusLabel(art) }) : null
        ]),
        el("div", { class: "card-body" }, [
          el("p", { class: "card-title", text: art.title || "" }),
          art.mood ? el("p", { class: "card-mood", text: art.mood }) : null,
          meta ? el("p", { class: "card-meta", text: meta }) : null,
          price ? el("p", { class: "card-price", text: price }) : null
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

  // Clear the filters, then open one painting (used by the hero collage and the footer squares).
  function showInGallery(art) {
    state.filter = "all";
    state.onlyAvailable = false;
    renderFilters();
    renderGrid();
    openLightbox(state.visible.indexOf(art));
  }

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
      frame.addEventListener("click", function () { showInGallery(art); });
      box.appendChild(frame);
    });
  }

  // Footer: small squares of the first paintings, each opening the lightbox.
  function renderFooterThumbs() {
    var box = $("#footer-thumbs");
    box.innerHTML = "";
    state.artworks.slice(0, 6).forEach(function (art) {
      var thumb = el("button", { type: "button", class: "footer-thumb", "aria-label": art.title || t("painting") }, [
        el("img", { src: art.thumb || art.image, alt: "", loading: "lazy" })
      ]);
      thumb.addEventListener("click", function () { showInGallery(art); });
      box.appendChild(thumb);
    });
  }

  /* ---------- Studio videos & photos (media.json) ---------- */

  function renderMedia(media) {
    var videos = localize(media.videos || {});
    if ((videos.items || []).length) {
      if (videos.title) $("#studio-title").textContent = videos.title;
      if (videos.intro) $("#studio-intro").textContent = videos.intro;
      var box = $("#videos");
      videos.items.map(localize).forEach(function (v, i) {
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

    var photos = localize(media.photos || {});
    if ((photos.items || []).length) {
      if (photos.title) $("#moments-title").textContent = photos.title;
      var strip = $("#moments-strip");
      photos.items.map(localize).forEach(function (p) {
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
    return media;
  }

  /* ---------- Lightbox ---------- */

  var lightbox = $("#lightbox");
  var lbImg = $("#lb-img");
  var lbFigure = $("#lb-figure");

  function showArtwork(index) {
    var count = state.visible.length;
    if (!count) return;
    resetZoom();
    state.current = (index + count) % count;
    var art = state.visible[state.current];
    var cat = categoryOf(art);

    lightbox.style.setProperty("--accent", cat.color);
    if (lbImg.getAttribute("src") !== art.image) {
      // Fade the new painting in once it has loaded.
      lbImg.classList.add("is-loading");
      lbImg.onload = lbImg.onerror = function () { lbImg.classList.remove("is-loading"); };
      lbImg.src = art.image;
    }
    lbImg.alt = art.title || "";
    $("#lb-counter").textContent = (state.current + 1) + " / " + count;
    $("#lb-category").textContent = cat.label;
    $("#lb-title").textContent = art.title || "";
    $("#lb-mood").textContent = art.mood || "";
    $("#lb-mood").hidden = !art.mood;
    $("#lb-desc").textContent = art.description || "";

    var meta = $("#lb-meta");
    meta.innerHTML = "";
    [[t("year"), art.year], [t("technique"), art.technique], [t("size"), art.size], [t("price"), priceOf(art)]].forEach(function (row) {
      if (!row[1]) return;
      meta.appendChild(el("dt", { text: row[0] }));
      meta.appendChild(el("dd", { text: String(row[1]) }));
    });

    var status = $("#lb-status");
    status.hidden = !art.status;
    status.className = statusClass(art);
    status.textContent = statusLabel(art);

    var ask = $("#lb-ask");
    ask.textContent = t("ask_painting");
    ask.hidden = $("#contact-form").hidden && !state.contact.email;

    var multiple = count > 1;
    $("#lb-prev").hidden = !multiple;
    $("#lb-next").hidden = !multiple;
    $("#lb-counter").hidden = !multiple;

    // Load the neighbours in the background, so the arrows feel instant.
    if (multiple) [1, -1].forEach(function (step) {
      new Image().src = state.visible[(state.current + step + count) % count].image;
    });

    // Shareable link to this painting, e.g. https://site/#art/sea-storm
    if (art.id) history.replaceState(null, "", location.pathname + location.search + "#art/" + art.id);
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
    resetZoom();
    if (location.hash.indexOf("#art/") === 0) history.replaceState(null, "", location.pathname + location.search + "#gallery");
  });
  // Esc while zoomed in only zooms out.
  lightbox.addEventListener("cancel", function (e) {
    if (zoom.s > 1) { e.preventDefault(); resetZoom(); }
  });
  $("#lb-close").addEventListener("click", closeLightbox);

  $("#lb-ask").addEventListener("click", function (e) {
    e.preventDefault();
    var art = state.visible[state.current];
    closeLightbox();
    askAbout(t("subject_painting") + " “" + (art.title || "") + "”");
  });

  // "i" button / key: hide the label so only the painting is on the wall.
  function toggleInfo() {
    var hide = !lightbox.classList.contains("no-info");
    lightbox.classList.toggle("no-info", hide);
    $("#lb-info-toggle").setAttribute("aria-pressed", String(!hide));
  }
  $("#lb-info-toggle").addEventListener("click", toggleInfo);
  $("#lb-prev").addEventListener("click", function () { showArtwork(state.current - 1); });
  $("#lb-next").addEventListener("click", function () { showArtwork(state.current + 1); });
  // A click on the empty wall around the painting closes it (or zooms out, when zoomed in).
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.classList.contains("lb-stage") || e.target === lbFigure) {
      if (zoom.s > 1) resetZoom(); else closeLightbox();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.open || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "ArrowLeft") showArtwork(state.current - 1);
    if (e.key === "ArrowRight") showArtwork(state.current + 1);
    if (e.key === "i" || e.key === "I") toggleInfo();
    if (e.key === "z" || e.key === "Z") toggleZoom();
    if (e.key === "+" || e.key === "=") zoomAt(zoom.s * 1.4);
    if (e.key === "-") zoomAt(zoom.s / 1.4);
  });

  // Swipe left / right on phones (not while zoomed in or pinching).
  var touchX = null;
  lightbox.addEventListener("touchstart", function (e) {
    touchX = e.touches.length === 1 && zoom.s === 1 ? e.touches[0].clientX : null;
  }, { passive: true });
  lightbox.addEventListener("touchend", function (e) {
    if (touchX === null || zoom.s > 1 || pinch) { touchX = null; return; }
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showArtwork(state.current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Lightbox zoom ----------
     Click the painting (or press Z / the magnifier) to look closer; drag to move around.
     On phones: double-tap or pinch. The full-size image is already loaded, so no extra download. */

  var MAX_ZOOM = 5, CLICK_ZOOM = 2.5;
  var zoom = { s: 1, x: 0, y: 0 };
  var pointers = {};   // active pointers on the painting, by id
  var pinch = null;    // { dist, s } while two fingers are down
  var drag = null;     // { x, y, moved } while one pointer is down
  var lastTap = 0;

  function applyZoom() {
    var zoomed = zoom.s > 1;
    lbImg.style.transform = zoomed ? "translate(" + zoom.x + "px," + zoom.y + "px) scale(" + zoom.s + ")" : "";
    lightbox.classList.toggle("is-zoomed", zoomed);
    $("#lb-zoom").setAttribute("aria-pressed", String(zoomed));
  }

  // Keep the painting from being dragged completely off screen.
  function clampPan() {
    var maxX = lbImg.offsetWidth * (zoom.s - 1) / 2;
    var maxY = lbImg.offsetHeight * (zoom.s - 1) / 2;
    zoom.x = Math.max(-maxX, Math.min(maxX, zoom.x));
    zoom.y = Math.max(-maxY, Math.min(maxY, zoom.y));
  }

  // Zoom to scale s, keeping the point under (clientX, clientY) still. Without a point: the centre.
  function zoomAt(s, clientX, clientY) {
    s = Math.max(1, Math.min(MAX_ZOOM, s));
    var rect = lbFigure.getBoundingClientRect();
    var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    var px = clientX == null ? cx : clientX, py = clientY == null ? cy : clientY;
    // The image point under the pointer, measured from the image centre at scale 1.
    var qx = (px - cx - zoom.x) / zoom.s, qy = (py - cy - zoom.y) / zoom.s;
    zoom.x += (zoom.s - s) * qx;
    zoom.y += (zoom.s - s) * qy;
    zoom.s = s;
    if (s === 1) { zoom.x = 0; zoom.y = 0; }
    clampPan();
    applyZoom();
  }

  function resetZoom() {
    zoom = { s: 1, x: 0, y: 0 };
    pointers = {}; pinch = null; drag = null;
    applyZoom();
  }

  function toggleZoom(clientX, clientY) {
    if (zoom.s > 1) resetZoom(); else zoomAt(CLICK_ZOOM, clientX, clientY);
  }

  $("#lb-zoom").addEventListener("click", function () { toggleZoom(); });

  function pointerList() { return Object.keys(pointers).map(function (id) { return pointers[id]; }); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  lbImg.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var list = pointerList();
    if (list.length === 2) {
      pinch = { dist: distance(list[0], list[1]), s: zoom.s };
      drag = null;
    } else if (list.length === 1) {
      drag = { x: e.clientX, y: e.clientY, moved: 0 };
      if (zoom.s > 1 || e.pointerType === "mouse") e.preventDefault();
    }
    lbImg.setPointerCapture(e.pointerId);
  });

  lbImg.addEventListener("pointermove", function (e) {
    if (!pointers[e.pointerId]) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var list = pointerList();
    if (pinch && list.length === 2) {
      var mid = { x: (list[0].x + list[1].x) / 2, y: (list[0].y + list[1].y) / 2 };
      zoomAt(pinch.s * distance(list[0], list[1]) / pinch.dist, mid.x, mid.y);
    } else if (drag) {
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.x = e.clientX; drag.y = e.clientY;
      if (zoom.s > 1) {
        lightbox.classList.add("is-panning");
        zoom.x += dx; zoom.y += dy;
        clampPan();
        applyZoom();
      }
    }
  });

  function endPointer(e) {
    if (!pointers[e.pointerId]) return;
    delete pointers[e.pointerId];
    lightbox.classList.remove("is-panning");
    var wasTap = drag && drag.moved < 8 && e.type === "pointerup";
    if (pinch) {
      if (pointerList().length < 2) {
        pinch = null;
        if (zoom.s < 1.05) resetZoom();
      }
      drag = null;
      return;
    }
    drag = null;
    if (!wasTap) return;
    if (e.pointerType === "mouse") return toggleZoom(e.clientX, e.clientY);
    // Touch: a double-tap zooms in or out.
    var now = Date.now();
    if (now - lastTap < 320) { lastTap = 0; toggleZoom(e.clientX, e.clientY); }
    else lastTap = now;
  }
  lbImg.addEventListener("pointerup", endPointer);
  lbImg.addEventListener("pointercancel", endPointer);

  // Mouse wheel / trackpad over the painting zooms around the pointer.
  lbFigure.addEventListener("wheel", function (e) {
    if (!lightbox.open) return;
    e.preventDefault();
    zoomAt(zoom.s * Math.pow(1.0015, -e.deltaY), e.clientX, e.clientY);
  }, { passive: false });

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

  /* ---------- Colour themes ---------- */

  // Colours for each theme live in css/style.css ([data-theme="..."]); the first one is the default.
  // a/b are the two halves of the little swatch shown next to each name.
  var THEMES = [
    { id: "default", label: "Classic", bg: "Класика", a: "#ff5d73", b: "#fffdf9", meta: "#ff5d73" },
    { id: "dark",    label: "Dark",    bg: "Тъмна",   a: "#ff5d73", b: "#16141b", meta: "#16141b" },
    { id: "ocean",   label: "Ocean",   bg: "Океан",   a: "#0077b6", b: "#48cae4", meta: "#0077b6" },
    { id: "sunset",  label: "Sunset",  bg: "Залез",   a: "#e63946", b: "#f4a261", meta: "#e63946" },
    { id: "forest",  label: "Forest",  bg: "Гора",    a: "#2d6a4f", b: "#d4a373", meta: "#2d6a4f" },
    { id: "terracotta", label: "Terracotta", bg: "Теракота", a: "#c17d5d", b: "#fbf4ec", meta: "#9a5530" },
    { id: "plum",    label: "Plum",    bg: "Слива",   a: "#c98a45", b: "#280d12", meta: "#280d12" },
    { id: "peach",   label: "Peach",   bg: "Праскова", a: "#e84a5f", b: "#fecea8", meta: "#e84a5f" },
    { id: "peach-dark", label: "Peach dark", bg: "Праскова тъмна", a: "#e84a5f", b: "#2a0e12", meta: "#2a0e12" },
    { id: "pastel",  label: "Pastel",  bg: "Пастел",  a: "#ff7c7c", b: "#88e1f2", meta: "#21243d" },
    { id: "pastel-dark", label: "Pastel dark", bg: "Пастел тъмна", a: "#ff7c7c", b: "#1a1c30", meta: "#1a1c30" },
    { id: "olive",   label: "Olive",   bg: "Маслина", a: "#616f39", b: "#ffb677", meta: "#616f39" }
  ];

  var themeToggle = $(".theme-toggle");
  var themeMenu = $("#theme-menu");

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "default";
  }

  function applyTheme(id) {
    var theme = THEMES.filter(function (th) { return th.id === id; })[0] || THEMES[0];
    if (theme.id === "default") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme.id);
    try {
      if (theme.id === "default") localStorage.removeItem("theme");
      else localStorage.setItem("theme", theme.id);
    } catch (e) { /* storage blocked: the theme still applies for this visit */ }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme.meta);
    Array.prototype.forEach.call(themeMenu.querySelectorAll("button"), function (b) {
      b.setAttribute("aria-checked", String(b.getAttribute("data-theme-id") === theme.id));
    });
  }

  function setThemeMenu(open) {
    themeMenu.hidden = !open;
    themeToggle.setAttribute("aria-expanded", String(open));
  }

  THEMES.forEach(function (th) {
    var swatch = el("span", { class: "swatch", "aria-hidden": "true", style: "--a:" + th.a + ";--b:" + th.b });
    var button = el("button", { type: "button", role: "menuitemradio", "data-theme-id": th.id }, [swatch, document.createTextNode(LANG === "bg" ? th.bg : th.label)]);
    themeMenu.appendChild(el("li", { role: "none" }, [button]));
  });
  applyTheme(currentTheme());

  themeToggle.addEventListener("click", function () { setThemeMenu(themeMenu.hidden); });
  themeMenu.addEventListener("click", function (e) {
    var button = e.target.closest("button");
    if (!button) return;
    applyTheme(button.getAttribute("data-theme-id"));
    setThemeMenu(false);
    themeToggle.focus();
  });
  document.addEventListener("click", function (e) {
    if (!themeMenu.hidden && !e.target.closest(".theme-switch")) setThemeMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !themeMenu.hidden) { setThemeMenu(false); themeToggle.focus(); }
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Start ---------- */

  applyStaticTexts();
  // A language picked through the address (?lang=bg) is remembered for the next visit.
  if (/[?&]lang=/.test(location.search)) { try { localStorage.setItem("lang", LANG); } catch (e) { /* ignore */ } }

  // Bulgarian texts are in site.bg.json; if that file is missing the English ones are used.
  var siteFile = LANG === "en" ? "data/site.json" : "data/site." + LANG + ".json";
  var siteLoaded = loadJSON(siteFile)
    .catch(function (err) {
      if (siteFile === "data/site.json") throw err;
      console.warn("Could not load " + siteFile + ", using site.json", err);
      return loadJSON("data/site.json");
    })
    .then(function (site) {
      state.siteName = site.name;
      renderSite(site);
      return site;
    })
    .catch(function (err) { console.error("Could not load site.json", err); return {}; });

  var mediaLoaded = loadJSON("data/media.json")
    .then(renderMedia)
    .catch(function (err) { console.error("Could not load media.json", err); return {}; });

  Promise.all([siteLoaded, mediaLoaded]).then(function (res) {
    renderInstagram(res[0].instagram, res[0].contact || {}, res[1] || {});
    syncNav();
  });

  loadJSON("data/gallery.json")
    .then(function (data) {
      state.artworks = (data.artworks || []).filter(function (a) { return a.image && !a.hidden; }).map(function (a) {
        a.statusKey = String(a.status || "").trim().toLowerCase();
        return localize(a);
      });
      setupCategories(data);
      renderFilters();
      renderGrid();
      renderFooterThumbs();
      // Wait for site.json too, so the contact details are known.
      siteLoaded.then(function (site) {
        renderHero(site.heroPhoto);
        openFromHash();
      });
    })
    .catch(function (err) {
      console.error("Could not load gallery.json", err);
      $("#grid").innerHTML = "";
      $("#grid").appendChild(el("p", { class: "empty", text: t("gallery_error") }));
    });
})();
