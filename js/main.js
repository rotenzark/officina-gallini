/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'officina-gallini',    // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Scheda Google (24/9/2026): lun–ven 08:30–12 e 14–18, sabato e domenica chiusi. */
    hours: {
      0: [],
      1: [['08:30', '12:00'], ['14:00', '18:00']],
      2: [['08:30', '12:00'], ['14:00', '18:00']],
      3: [['08:30', '12:00'], ['14:00', '18:00']],
      4: [['08:30', '12:00'], ['14:00', '18:00']],
      5: [['08:30', '12:00'], ['14:00', '18:00']],
      6: [],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "intro.1": "Intake",
      "intro.2": "Compression",
      "intro.3": "Power",
      "intro.4": "Exhaust",
      "intro.skip": "skip",
      "nav.home": "Officina Gallini, back to top",
      "nav.apri": "Open the menu",
      "marchio.s": "auto electrics & mechanics · since 1978",
      "nav.ciclo": "The four strokes",
      "nav.restauri": "Restorations",
      "nav.voci": "Reviews",
      "nav.dove": "Where & hours",
      "cta.chiama": "Call",
      "cta.chiama2": "Call 02 257 2928",
      "h.kicker": "Officina Gallini · Via Aristotele 48, Precotto, Milan",
      "h.w1": "Four",
      "h.w2": "strokes.",
      "h.sub": "An engine works in four strokes. So do we: you tell us what's wrong, we find the fault, we repair it, we hand it back. Auto electrics and mechanics, in Milan since 1978.",
      "h.cta1": "Call the workshop",
      "h.cta2": "How we work",
      "h.alt": "A mechanic bent over the engine bay of a car in the workshop, in black and white, with the red tool cabinet behind him",
      "h.cap": "At the engine bay, in the workshop",
      "k.ciclo": "How we work",
      "c.h": "Like an engine, in four strokes.",
      "c.p": "Intake, compression, power, exhaust: the piston next to this text makes its cycle as you scroll. Each stroke is one part of the job.",
      "c.pistone": "A cross-section of a piston in its cylinder, drawn in outline: it moves as the page scrolls",
      "f.1": "Intake",
      "f.2": "Compression",
      "f.3": "Power",
      "f.4": "Exhaust",
      "t1.eti": "Stroke 1 · Intake",
      "t1.h": "You tell us what's wrong.",
      "t1.p": "Cars, motorbikes and scooters, today's and yesterday's. You come in through the gate on Via Ranzato, describe the problem and leave the vehicle with us. Better to phone first: Google says «booking recommended», and it is right.",
      "t1.m1": "Cars",
      "t1.m1d": "all makes, new and old",
      "t1.m2": "Motorbikes and scooters",
      "t1.m2d": "repairs and tuning",
      "t1.m3": "Classic vehicles",
      "t1.m3d": "maintenance, repairs and conservative restorations",
      "t1.alt": "A white BMW i8 parked in front of the workshop gate on Via Ranzato",
      "t1.cap": "In front of the gate on Via Ranzato",
      "t1.alt2": "The rear of a yellow Lotus Elise in front of the Officina Gallini sign",
      "t1.alt3": "The rear of a black Tesla in front of the Officina Gallini sign",
      "t1.cap2": "In front of the sign",
      "t2.eti": "Stroke 2 · Compression",
      "t2.h": "We find the fault.",
      "t2.p": "Before touching anything, we measure: computer diagnostics on the control unit, tests on the electrical systems, a check of whatever does not add up. Auto electrics has been the trade of the house since 1978, and among the 40 Google reviews with a text, 21 talk about expertise.",
      "t2.dato": "customers tell of a fault that was fixed here after other attempts elsewhere.",
      "t2.alt": "The workshop bench with the red tool cabinets and the wall of tools",
      "t2.cap": "The tool bench",
      "t3.eti": "Stroke 3 · Power",
      "t3.h": "We repair.",
      "t3.p": "Mechanics and auto electrics under the same roof: what is needed gets done here, from services to installations.",
      "s.1": "Electrical systems",
      "s.1d": "repair and rewiring",
      "s.2": "Services and mechanics",
      "s.2d": "scheduled maintenance and mechanical repairs",
      "s.3": "Computer diagnostics",
      "s.3d": "reading the control unit and tracing the fault",
      "s.4": "Air conditioning",
      "s.4d": "recharge, system repair and cabin sanitising",
      "s.5": "LPG systems",
      "s.5d": "installation and tank replacement",
      "s.6": "Alarms and satellite trackers",
      "s.6d": "for cars and motorbikes, including the devices required by insurers",
      "s.7": "Audio, video and navigation",
      "s.7d": "stereo systems, screens and sat-navs",
      "s.8": "Parking sensors and dashcams",
      "s.8d": "fitted and set up",
      "s.9": "Cabin LED lighting",
      "s.9d": "the interior of the car, lit",
      "s.10": "Pre-MOT check and MOT",
      "s.10d": "the check before the inspection, and the inspection",
      "s.11": "Classic vehicles",
      "s.11d": "maintenance, repairs and conservative restorations",
      "t3.alt": "A red classic Fiat 500 on the lift, with a wheel removed",
      "t3.cap": "A Fiat 500 on the lift",
      "t3.alt2": "An LPG tank fitted in the spare-wheel well of a car",
      "t3.alt3": "Red leather seats with an Alpine subwoofer between them",
      "t3.alt4": "The engine cover of a Mercedes-AMG",
      "t4.eti": "Stroke 4 · Exhaust",
      "t4.h": "We hand it back.",
      "t4.p": "The vehicle goes back on the road with the work explained. You can pay by card, debit card and phone too.",
      "t4.l1": "Credit and debit cards, NFC payments",
      "t4.l1d": "as well as cash",
      "t4.l2": "Monday to Friday, 8.30–12 and 2–6 pm",
      "t4.l2d": "closed on Saturday and Sunday",
      "t4.l3": "Entrance from Via Ranzato",
      "t4.l3d": "on the corner of Via Aristotele 48",
      "t4.alt": "The front of the workshop: the black gate, the sign «Officina Gallini — Elettrauto & Meccanica» and the round logo with the piston",
      "t4.cap": "The sign: auto electrics & mechanics, since 1978",
      "k.rest": "Off the cycle",
      "re.h": "The restorations.",
      "re.p": "Do you have an old family vehicle you would like to see reborn? We do it: below, a 1972 Vespa 50 R, a conservative restoration, from the stripped body to the day it went back on the road.",
      "v.1": "The body, stripped",
      "v.2": "Bare metal",
      "v.3": "The engine, open",
      "v.4": "The engine, rebuilt",
      "v.5": "The assembly",
      "v.6": "Finished",
      "v.7": "On the road",
      "v.alt1": "The stripped body of a Vespa 50 R, old blue paint",
      "v.alt2": "The bare metal body of the Vespa on the workbench",
      "v.alt3": "The open engine of the Vespa, gears and casings on the bench",
      "v.alt4": "The rebuilt Vespa engine with its exhaust",
      "v.alt5": "The blue Vespa on stands during assembly, with the mechanic lying underneath",
      "v.alt6": "The finished blue Vespa, seen from the front",
      "v.alt7": "The finished blue Vespa in profile, in the workshop",
      "re.y": "Yamaha Thunderace 1000, tune-up",
      "re.alty": "A red and white Yamaha Thunderace 1000 in the workshop",
      "re.mini": "A Mini, in the workshop",
      "re.altm": "The mechanic at the front of a black classic Mini, in black and white",
      "re.abarth": "A 500 Abarth, in the workshop",
      "re.alta": "A grey Fiat 500 Abarth with the door open inside the workshop",
      "k.voci": "What customers say",
      "vo.h": "The dashboard.",
      "vo.badge": "from 71 Google reviews",
      "q.1": "Expertise",
      "q.2": "Kindness",
      "q.3": "Speed",
      "q.4": "Advice",
            "vo.nota": "We counted the words in the 40 Google reviews that have a text: these are the four themes that come up most often.",
      "vo.cit": "«A competent mechanic, but above all a very honest one»",
      "vo.citda": "From a Google review (translated)",
      "vo.btn": "Read all the reviews on Google",
      "k.dove": "Where and when",
      "d.h": "Via Aristotele 48, corner of Via Ranzato.",
      "d.p": "In Precotto, north-east Milan. The workshop entrance is the gate on Via Ranzato.",
      "d.no1": "<b>Entrance</b> from the gate on Via Ranzato.",
      "d.no2": "<b>Saturday and Sunday</b> closed.",
      "d.no3": "<b>Booking recommended:</b> a phone call first.",
      "d.strada": "Take me there with Google Maps",
      "d.mappa": "Map: Officina Gallini, Via Aristotele 48, Milan",
      "d.alt": "The front of the workshop with the sign and the round logo",
      "d.cap": "Via Aristotele 48, corner of Via Ranzato",
      "o.cap": "Opening hours",
      "g.lun": "Monday",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.chiuso": "closed",
      "k.dom": "Questions",
      "do.h": "What we are asked.",
      "qa.1": "Do I need an appointment?",
      "ra.1": "Better to: a phone call beforehand lets us organise the work. The number is 02 257 2928.",
      "qa.2": "Do you also work on motorbikes and scooters?",
      "ra.2": "Yes: repairs and tuning of motorbikes and scooters, as well as cars, and the restoration of classic vehicles such as the Vespa.",
      "qa.3": "Do you fit the satellite devices required by insurers?",
      "ra.3": "Yes, alarms and satellite trackers for cars and motorbikes, including those required by insurance companies: you book by phone.",
      "qa.4": "Do you install LPG systems?",
      "ra.4": "Yes: installation of the system and replacement of the tank.",
      "qa.5": "What are your hours?",
      "ra.5": "Monday to Friday, 8.30 am to 12 and 2 to 6 pm. Closed on Saturday and Sunday.",
      "qa.6": "How can I pay?",
      "ra.6": "Credit and debit cards and NFC payments from your phone, as well as cash.",
      "piede.s": "auto electrics & mechanics · Milan, Precotto",
      "piede.d": "Officina Gallini di Luca Gallini · VAT no. 08467200963 · Via Aristotele 48, corner of Via Ranzato, 20128 Milan · <a href='tel:+39022572928'>02 257 2928</a>",
      "piede.b": "Demo website made by <a href='https://bespokestud.io' target='_blank' rel='noopener'>Bespoke Studio</a> · texts, hours and services from the business's public sources; photographs published by the business.",
      "b.chiama": "Call",
      "b.tempi": "Strokes",
      "b.orari": "Hours",
      "b.mappa": "Map",
      "lb.chiudi": "Close",
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  /* ═══ FIRMA · Officina Gallini — «Quattro tempi.» ═══
     Il pistone della loro insegna scorre nel cilindro seguendo lo scroll: manovella e biella
     fanno due giri lungo i quattro tempi (aspirazione, compressione, scoppio, scarico), le
     valvole si aprono al primo e al quarto, la scintilla scatta al terzo. I quadranti del
     cruscotto salgono al valore contato. Regole: gsap.set + gsap.to / ScrollTrigger.create;
     nessun elemento-firma è un .reveal; senza GSAP tutto resta visibile e fermo a metà corsa. */

  /* — il pistone: cinematica vera (manovella r=38, biella l=120, viewBox 200x360) — */
  var pist = document.getElementById('pistone');
  var pistParts = pist ? {
    corpo: pist.querySelector('#pistCorpo'), biella: pist.querySelector('#pistBiella'),
    manovella: pist.querySelector('#pistManovella'), valvA: pist.querySelector('#pistValvA'),
    valvS: pist.querySelector('#pistValvS'), scintilla: pist.querySelector('#pistScintilla'),
    carica: pist.querySelector('#pistCarica')
  } : null;
  var fasi = Array.prototype.slice.call(document.querySelectorAll('.fasi li'));
  var tempi = Array.prototype.slice.call(document.querySelectorAll('.tempo'));
  var TAU = Math.PI * 2;
  function setPiston(theta) {
    if (!pistParts) return;
    var r = 38, l = 120, cx = 100, cy = 310;
    var px = cx + r * Math.sin(theta), py = cy - r * Math.cos(theta);
    var piny = py - Math.sqrt(l * l - (px - cx) * (px - cx));   // 152 al punto morto superiore, 228 all'inferiore
    var stroke = Math.floor((theta % (2 * TAU)) / Math.PI) % 4;   // 0 aspirazione · 1 compressione · 2 scoppio · 3 scarico
    pistParts.corpo.setAttribute('transform', 'translate(0 ' + (piny - 152).toFixed(2) + ')');
    pistParts.biella.setAttribute('y1', piny.toFixed(2));
    pistParts.biella.setAttribute('x2', px.toFixed(2));
    pistParts.biella.setAttribute('y2', py.toFixed(2));
    pistParts.manovella.setAttribute('transform', 'rotate(' + (theta * 180 / Math.PI).toFixed(2) + ' 100 310)');
    pistParts.valvA.setAttribute('transform', 'translate(0 ' + (stroke === 0 ? 12 : 0) + ')');
    pistParts.valvS.setAttribute('transform', 'translate(0 ' + (stroke === 3 ? 12 : 0) + ')');
    var t = theta % (2 * TAU);
    var spark = Math.max(0, 1 - Math.abs(t - TAU) / 0.45);
    pistParts.scintilla.style.opacity = spark.toFixed(2);
    var top = piny - 22;
    pistParts.carica.setAttribute('height', Math.max(0, top - 44).toFixed(2));
    var op = stroke === 0 ? 0.06 + 0.1 * (t / Math.PI) : stroke === 1 ? 0.16 + 0.18 * ((t - Math.PI) / Math.PI) : stroke === 2 ? 0.34 * (1 - (t - TAU) / Math.PI) + 0.04 : 0.05;
    pistParts.carica.style.opacity = op.toFixed(2);
    pistParts.carica.style.fill = stroke === 2 ? '#D9915F' : '';
    fasi.forEach(function (li, i) { li.classList.toggle('is-on', i === stroke); });
  }
  setPiston(Math.PI / 2);   // senza GSAP o con motion ridotto: fermo a metà aspirazione, tutto visibile

  /* — i quadranti del cruscotto (semicerchio: lancetta da -90° a +90°) — */
  var quadranti = Array.prototype.slice.call(document.querySelectorAll('.quadrante'));
  function setGauge(q, frac) {
    var ago = q.querySelector('.q-ago'), val = q.querySelector('.q-valore'), n = q.querySelector('.quadrante__n b');
    var max = +q.getAttribute('data-max') || 40, v = +q.getAttribute('data-val') || 0;
    var f = Math.max(0, Math.min(1, frac));
    if (ago) ago.setAttribute('transform', 'rotate(' + (-90 + 180 * f * (v / max)).toFixed(2) + ' 60 60)');
    if (val) { var len = Math.PI * 50; val.setAttribute('stroke-dasharray', len.toFixed(2)); val.setAttribute('stroke-dashoffset', (len * (1 - f * (v / max))).toFixed(2)); }
    if (n) n.textContent = Math.round(v * f);
  }
  quadranti.forEach(function (q) { setGauge(q, 1); });   // stato finale subito: senza GSAP i numeri sono già veri

  /* entrata dell'apertura: chiamata dal plumbing a fine intro */
  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.apertura__foto img', { scale: 1.06, duration: 1.4, ease: 'power2.out' }, 0)
      .from('.apertura__w', { opacity: 0, y: 40, duration: 0.7, stagger: 0.14 }, 0.05)
      .from('.apertura__kicker, .apertura__sub, .apertura__azioni, .apertura__stato', { opacity: 0, y: 14, duration: 0.5, stagger: 0.1 }, 0.6);
  };

  if (hasGsap && hasST && !reducedMotion) {
    /* il pistone segue lo scroll lungo i quattro tempi: due giri di manovella */
    var tempiWrap = document.querySelector('.ciclo__tempi');
    if (pistParts && tempiWrap) {
      ScrollTrigger.create({
        trigger: tempiWrap, start: 'top 55%', end: 'bottom 55%', scrub: 0.6,
        onUpdate: function (self) { setPiston(self.progress * 2 * TAU); }
      });
    }
    /* il tempo in corso si accende (etichetta e numero in rame) */
    tempi.forEach(function (t) {
      ScrollTrigger.create({ trigger: t, start: 'top 55%', end: 'bottom 55%', toggleClass: { targets: t, className: 'is-on' } });
    });
    /* i quadranti salgono al valore quando entrano */
    quadranti.forEach(function (q, i) {
      setGauge(q, 0);
      var proxy = { f: 0 };
      gsap.to(proxy, { f: 1, duration: 1.4, ease: 'power2.out', delay: i * 0.12, onUpdate: function () { setGauge(q, proxy.f); }, scrollTrigger: { trigger: q, start: 'top 85%', once: true } });
    });
    /* le foto della Vespa entrano in fila */
    gsap.utils.toArray('.vespa li').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 14 });
      gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: (i % 7) * 0.08, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
  }
})();
