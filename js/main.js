/**
 * D-Medva Portfolio Website — Main Interactive Controller
 * Vanilla JavaScript (ES6+), zero external dependencies, XSS-safe DOM updates.
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 1. Dynamic Footer Copyright Year
   * -------------------------------------------------------------------------- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* --------------------------------------------------------------------------
   * 2. Mobile Navigation Toggle & Keyboard Accessibility
   * -------------------------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  function closeMobileMenu() {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    primaryNav.classList.remove('is-open');
  }

  function openMobileMenu() {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    primaryNav.classList.add('is-open');
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when an anchor link inside navigation is clicked
    primaryNav.addEventListener('click', function (event) {
      const link = event.target.closest('a');
      if (link) {
        closeMobileMenu();
      }
    });

    // Close menu on Escape key or outside click
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        closeMobileMenu();
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (
        primaryNav.classList.contains('is-open') &&
        !primaryNav.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        closeMobileMenu();
      }
    });
  }

  // Keep Browser Address Bar Clean (Never show #hero, #capabilities, or /index.html in URL)
  function getCleanBaseUrl() {
    const cleanPath = window.location.pathname.replace(/\/index\.html$/i, '/') || '/';
    return cleanPath + window.location.search;
  }

  function stripHashFromUrl() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, document.title, getCleanBaseUrl());
    }
  }

  if (window.location.hash || /\/index\.html$/i.test(window.location.pathname)) {
    const initialHash = window.location.hash;
    if (initialHash && initialHash !== '#hero' && initialHash !== '#top') {
      const initialTarget = document.querySelector(initialHash);
      if (initialTarget) {
        setTimeout(function () {
          initialTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
    stripHashFromUrl();
  }

  document.addEventListener('click', function (event) {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    event.preventDefault();
    closeMobileMenu();

    if (href === '#hero' || href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetSection = document.querySelector(href);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    stripHashFromUrl();
  });


  /* --------------------------------------------------------------------------
   * 3. Scroll-Spy Active Navigation Highlight
   * -------------------------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const observedSections = navLinks
    .map(function (link) {
      const href = link.getAttribute('href');
      return href && href.startsWith('#') ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = '#' + entry.target.id;
            navLinks.forEach(function (link) {
              link.classList.toggle('is-active', link.getAttribute('href') === id);
            });
          }
        });
      },
      {
        rootMargin: '-25% 0px -60% 0px',
        threshold: 0
      }
    );

    observedSections.forEach(function (sec) {
      sectionObserver.observe(sec);
    });
  }

  /* --------------------------------------------------------------------------
   * 4. Campaign Gallery Category Filtering
   * -------------------------------------------------------------------------- */
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));

  if (filterButtons.length > 0 && galleryCards.length > 0) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const selectedCategory = btn.getAttribute('data-filter') || 'all';

        filterButtons.forEach(function (b) {
          const isCurrent = b === btn;
          b.classList.toggle('is-active', isCurrent);
          b.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        });

        galleryCards.forEach(function (card) {
          const cardCategory = card.getAttribute('data-category');
          const shouldShow = selectedCategory === 'all' || cardCategory === selectedCategory;
          if (shouldShow) {
            card.removeAttribute('hidden');
          } else {
            card.setAttribute('hidden', '');
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 5. Accessible Lightbox Preview for Gallery Cards
   * -------------------------------------------------------------------------- */
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  let lastFocusedGalleryCard = null;

  function openLightbox(imgSrc, imgAlt, captionText, triggerEl) {
    if (!lightboxModal || !lightboxImg || !lightboxCaption) return;
    lastFocusedGalleryCard = triggerEl || null;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = imgAlt || '';
    lightboxCaption.textContent = captionText || imgAlt || '';
    lightboxModal.removeAttribute('hidden');
    if (lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (!lightboxModal || !lightboxImg) return;
    lightboxModal.setAttribute('hidden', '');
    lightboxImg.src = '';
    if (lastFocusedGalleryCard) {
      lastFocusedGalleryCard.focus();
      lastFocusedGalleryCard = null;
    }
  }

  if (lightboxModal) {
    if (lightboxClose) {
      lightboxClose.addEventListener('click', function (event) {
        event.stopPropagation();
        closeLightbox();
      });
    }
    if (lightboxBackdrop) {
      lightboxBackdrop.addEventListener('click', closeLightbox);
    }
    lightboxModal.addEventListener('click', function (event) {
      if (event.target === lightboxModal || event.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !lightboxModal.hasAttribute('hidden')) {
        closeLightbox();
      }
    });
  }

  if (lightboxModal && galleryCards.length > 0) {
    galleryCards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');

      function activateCard() {
        const img = card.querySelector('img');
        const titleEl = card.querySelector('.gallery-caption strong');
        if (!img) return;
        const caption = titleEl ? titleEl.textContent : img.alt;
        openLightbox(img.getAttribute('src'), img.alt, caption, card);
      }

      card.addEventListener('click', activateCard);
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateCard();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 5B. Meta Ads & Google Ads Showcase Filtering, Lightbox & Mobile Marquee
   * -------------------------------------------------------------------------- */
  const adFilterButtons = Array.from(document.querySelectorAll('.ad-filter-btn'));
  const adPosterCards = Array.from(document.querySelectorAll('.ad-poster-card:not(.is-mobile-clone)'));
  const adQuickTriggers = Array.from(document.querySelectorAll('[data-ad-filter-trigger]'));
  const adShowcaseGrid = document.getElementById('adPostersShowcaseGrid');

  let lastTouchPressTime = 0;
  let wasLongTouchHold = false;

  function bindAdPosterLightbox(card) {
    if (!lightboxModal) return;
    if (!card.classList.contains('is-mobile-clone')) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    }

    function activateAdPoster(event) {
      if (wasLongTouchHold) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      const img = card.querySelector('.ad-poster-img-box img');
      const titleEl = card.querySelector('.ad-poster-body strong');
      const descEl = card.querySelector('.ad-poster-body p');
      if (!img) return;
      const caption = titleEl
        ? titleEl.textContent + (descEl ? ' — ' + descEl.textContent : '')
        : img.alt;
      openLightbox(img.getAttribute('src'), img.alt, caption, card);
    }

    card.addEventListener('click', activateAdPoster);
    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateAdPoster(event);
      }
    });
  }

  function syncAdMobileMarqueeClones() {
    if (!adShowcaseGrid) return;
    const oldClones = adShowcaseGrid.querySelectorAll('.ad-poster-card.is-mobile-clone');
    oldClones.forEach(function (clone) {
      clone.remove();
    });

    const visibleCards = adPosterCards.filter(function (card) {
      return !card.hasAttribute('hidden');
    });

    visibleCards.forEach(function (card) {
      const clone = card.cloneNode(true);
      clone.classList.add('is-mobile-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('tabindex');
      bindAdPosterLightbox(clone);
      adShowcaseGrid.appendChild(clone);
    });

    const durationSec = Math.max(14, Math.round(visibleCards.length * 2.4));
    adShowcaseGrid.style.setProperty('--ad-marquee-duration', durationSec + 's');
    adShowcaseGrid.style.animation = 'none';
    void adShowcaseGrid.offsetWidth;
    adShowcaseGrid.style.animation = '';
  }

  function applyAdHospitalFilter(selectedHospital) {
    const target = selectedHospital || 'all';
    adFilterButtons.forEach(function (btn) {
      const isCurrent = (btn.getAttribute('data-ad-filter') || 'all') === target;
      btn.classList.toggle('is-active', isCurrent);
      btn.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
    });

    adPosterCards.forEach(function (card) {
      const cardHosp = card.getAttribute('data-ad-hospital');
      const shouldShow = target === 'all' || cardHosp === target;
      if (shouldShow) {
        card.removeAttribute('hidden');
      } else {
        card.setAttribute('hidden', '');
      }
    });

    syncAdMobileMarqueeClones();
  }

  if (adPosterCards.length > 0) {
    adPosterCards.forEach(bindAdPosterLightbox);
    syncAdMobileMarqueeClones();
  }

  if (adFilterButtons.length > 0 && adPosterCards.length > 0) {
    adFilterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyAdHospitalFilter(btn.getAttribute('data-ad-filter') || 'all');
      });
    });

    adQuickTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const targetHosp = trigger.getAttribute('data-ad-filter-trigger') || 'all';
        applyAdHospitalFilter(targetHosp);
        if (adShowcaseGrid) {
          adShowcaseGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Universal Marquee Controller:
  // - Desktop mouse: pause on pointerenter (mouse only), resume on pointerleave
  // - Mobile / Touch: pause while finger is pressing down, resume immediately when finger lifts
  const allMarqueeElements = Array.from(
    document.querySelectorAll('.brand-carousel-marquee-wrapper, #adPostersShowcaseGrid')
  );

  function resumeAllMarquees() {
    if (lastTouchPressTime > 0 && Date.now() - lastTouchPressTime > 200) {
      wasLongTouchHold = true;
      setTimeout(function () {
        wasLongTouchHold = false;
      }, 300);
    }
    lastTouchPressTime = 0;
    allMarqueeElements.forEach(function (el) {
      el.classList.remove('is-paused');
    });
  }

  allMarqueeElements.forEach(function (el) {
    // Desktop mouse hover only (ignores synthetic mobile touch mouseenter)
    el.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse') {
        el.classList.add('is-paused');
      }
    });

    el.addEventListener('pointerleave', function (event) {
      if (event.pointerType === 'mouse') {
        el.classList.remove('is-paused');
      }
    });

    // Touch / press hold -> pause while held down
    el.addEventListener(
      'touchstart',
      function () {
        lastTouchPressTime = Date.now();
        wasLongTouchHold = false;
        el.classList.add('is-paused');
      },
      { passive: true }
    );

    el.addEventListener(
      'pointerdown',
      function (event) {
        if (event.pointerType !== 'mouse') {
          lastTouchPressTime = Date.now();
          wasLongTouchHold = false;
          el.classList.add('is-paused');
        }
      },
      { passive: true }
    );

    el.addEventListener('touchend', resumeAllMarquees, { passive: true });
    el.addEventListener('touchcancel', resumeAllMarquees, { passive: true });
    el.addEventListener('pointerup', resumeAllMarquees, { passive: true });
    el.addEventListener('pointercancel', resumeAllMarquees, { passive: true });

    // Prevent long-press context menu from swallowing touchend on mobile
    el.addEventListener('contextmenu', function (event) {
      if (window.innerWidth <= 1024) {
        event.preventDefault();
      }
    });
  });

  window.addEventListener('touchend', resumeAllMarquees, { passive: true });
  window.addEventListener('touchcancel', resumeAllMarquees, { passive: true });
  window.addEventListener('pointerup', resumeAllMarquees, { passive: true });
  window.addEventListener('pointercancel', resumeAllMarquees, { passive: true });

  /* --------------------------------------------------------------------------
   * 6. Enquiry Form Validation & Honest Destination Handling
   * -------------------------------------------------------------------------- */
  const enquiryForm = document.getElementById('enquiryForm');
  const statusBox = document.getElementById('formStatusBox');

  function setFieldError(inputEl, errorId, message) {
    const errEl = document.getElementById(errorId);
    if (inputEl) {
      inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    if (errEl) {
      errEl.textContent = message || '';
    }
  }

  function getEnquiryValues(form) {
    const fullName = form.elements.namedItem('fullName');
    const workEmail = form.elements.namedItem('workEmail');
    const organisation = form.elements.namedItem('organisation');
    const phone = form.elements.namedItem('phone');
    const serviceInterest = form.elements.namedItem('serviceInterest');
    const message = form.elements.namedItem('message');

    return {
      fullName: fullName && fullName.value.trim() ? fullName.value.trim() : '[Enter Your Full Name]',
      workEmail: workEmail && workEmail.value.trim() ? workEmail.value.trim() : '[Enter Your Work Email]',
      organisation:
        organisation && organisation.value.trim()
          ? organisation.value.trim()
          : '[Enter Hospital / Organisation Name]',
      phone: phone && phone.value.trim() ? phone.value.trim() : '[Enter Phone Number]',
      serviceInterest:
        serviceInterest && serviceInterest.value.trim()
          ? serviceInterest.value.trim()
          : 'Full-Hospital Growth (Multi-Channel)',
      message:
        message && message.value.trim()
          ? message.value.trim()
          : '[Share your hospital departments, location, or marketing goals here]'
    };
  }

  function buildGmailComposeUrl(data) {
    const hasCustomOrg =
      data.organisation && data.organisation !== '[Enter Hospital / Organisation Name]';
    const hasCustomName = data.fullName && data.fullName !== '[Enter Your Full Name]';
    const subject = hasCustomOrg
      ? 'Healthcare Marketing Enquiry — ' +
        data.organisation +
        (hasCustomName ? ' (' + data.fullName + ')' : '')
      : 'Healthcare Marketing Enquiry — D-Medva Strategy Discussion';

    const bodyLines = [
      'Hello D-Medva Team,',
      '',
      'We would like to discuss healthcare marketing and patient growth goals with D-Medva.',
      '',
      '--------------------------------------------------',
      'HOSPITAL / ENQUIRY DETAILS',
      '--------------------------------------------------',
      '• Full Name: ' + data.fullName,
      '• Work Email: ' + data.workEmail,
      '• Hospital / Organisation: ' + data.organisation,
      '• Phone Number: ' + data.phone,
      '• Primary Service / Package: ' + data.serviceInterest,
      '',
      '--------------------------------------------------',
      'GROWTH GOALS & DEPARTMENT FOCUS',
      '--------------------------------------------------',
      data.message,
      '',
      '--------------------------------------------------',
      'Regards,',
      hasCustomName ? data.fullName : 'Hospital Leadership Team',
      hasCustomOrg ? data.organisation : ''
    ];

    const formattedSummary = bodyLines.join('\r\n');
    return {
      subject: subject,
      formattedSummary: formattedSummary,
      gmailUrl:
        'https://mail.google.com/mail/?view=cm&fs=1&to=' +
        encodeURIComponent('corporate@dmedva.com') +
        '&su=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(formattedSummary),
      mailtoUrl:
        'mailto:corporate@dmedva.com?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(formattedSummary)
    };
  }

  const submitBtn = document.getElementById('submitBtn');

  function syncGmailButtonHref() {
    if (!enquiryForm || !submitBtn) return null;
    const data = getEnquiryValues(enquiryForm);
    const composed = buildGmailComposeUrl(data);
    submitBtn.setAttribute('href', composed.gmailUrl);
    return composed;
  }

  if (enquiryForm) {
    enquiryForm.reset();
    const serviceSelect = document.getElementById('serviceInterest');
    if (serviceSelect) {
      serviceSelect.selectedIndex = 0;
    }
    syncGmailButtonHref();
    enquiryForm.addEventListener('input', syncGmailButtonHref);
    enquiryForm.addEventListener('change', syncGmailButtonHref);

    if (submitBtn) {
      submitBtn.addEventListener('pointerdown', syncGmailButtonHref);
      submitBtn.addEventListener('touchstart', syncGmailButtonHref, { passive: true });
      submitBtn.addEventListener('click', function () {
        const composed = syncGmailButtonHref();
        if (statusBox && composed) {
          statusBox.className = 'form-status-box is-info';
          statusBox.textContent = '';

          const infoText = document.createElement('p');
          infoText.textContent =
            'Gmail has been opened with your pre-filled enquiry template addressed to corporate@dmedva.com. Just click "Send" in Gmail to send your message directly.';
          statusBox.appendChild(infoText);

          const actionsWrap = document.createElement('div');
          actionsWrap.style.display = 'flex';
          actionsWrap.style.flexWrap = 'wrap';
          actionsWrap.style.gap = '0.5rem';
          actionsWrap.style.marginTop = '0.6rem';

          const gmailLinkBtn = document.createElement('a');
          gmailLinkBtn.href = composed.gmailUrl;
          gmailLinkBtn.target = '_blank';
          gmailLinkBtn.rel = 'noopener noreferrer';
          gmailLinkBtn.className = 'copy-summary-btn';
          gmailLinkBtn.style.marginTop = '0';
          gmailLinkBtn.textContent = 'Open in Gmail';
          actionsWrap.appendChild(gmailLinkBtn);

          const mailAppBtn = document.createElement('a');
          mailAppBtn.href = composed.mailtoUrl;
          mailAppBtn.className = 'copy-summary-btn';
          mailAppBtn.style.marginTop = '0';
          mailAppBtn.textContent = 'Open in Mail App';
          actionsWrap.appendChild(mailAppBtn);

          statusBox.appendChild(actionsWrap);
          statusBox.removeAttribute('hidden');
        }
      });
    }

    enquiryForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const composed = syncGmailButtonHref();
      if (composed) {
        window.open(composed.gmailUrl, '_blank');
      }
    });
  }
})();
