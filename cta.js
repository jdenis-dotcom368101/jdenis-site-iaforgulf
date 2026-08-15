/**
 * cta.js — Intent-click measurement (contact, phone, e-mail, offer pages)
 * IA for Gulf (JDENIS Consulting) — iaforgulf.com
 *
 * Adapted from jaydenis.com/cta.js (reference implementation). Same event and
 * same parameters, so both sites can be compared in one GA4 report; only the
 * list of offer links differs — iaforgulf.com is a single page, and its offer
 * links point to the tools hosted on jaydenis.com.
 *
 * Sends a GA4 `clic_cta` event when a visitor clicks a link that signals
 * commercial intent. Without it we know which pages are read but not which
 * page makes a visitor get in touch — the only question that matters.
 *
 * Consent: the event is only sent if `window.gtag` exists, which /consent.js
 * defines after explicit acceptance. A visitor who declines triggers nothing.
 * See /consent.js.
 *
 * Parameters sent: type_cta (contact | telephone | email | offre), lien, texte.
 */
(function () {
  'use strict';

  /* Offer links: the tools and pages hosted on jaydenis.com that a Gulf reader
     is sent to. A click there is the start of a qualification. */
  var OFFRES = /(ai-act-risk-checker|grille-classification-risques-ai-act|methode-hierodeiis|ai-diagnostics-audit|corporate-ai-training|ai-architecture-design)/;

  function typeDuLien(a) {
    var href = a.getAttribute('href') || '';
    if (/^mailto:/i.test(href)) return 'email';
    if (/^tel:/i.test(href)) return 'telephone';
    if (/calendly\.com/i.test(href)) return 'contact';
    if (/(^|[#\/])contact\b/i.test(href)) return 'contact';
    if (OFFRES.test(href)) return 'offre';
    return null;
  }

  /* Capture: we listen before the page's own handlers, some of which stop
     propagation to run smooth scrolling on anchors. */
  document.addEventListener('click', function (ev) {
    var cible = ev.target;
    if (!cible || !cible.closest) return;

    var a = cible.closest('a');
    if (!a) return;

    var type = typeDuLien(a);
    if (!type) return;

    try {
      if (window.gtag) {
        window.gtag('event', 'clic_cta', {
          type_cta: type,
          lien: (a.href || '').slice(0, 200),
          texte: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80)
        });
      }
    } catch (e) {
      /* Measurement must never break navigation. */
    }
  }, true);
})();
