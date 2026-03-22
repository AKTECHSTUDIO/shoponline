/* ============================================
   ShopOnline — Core JS
   ============================================ */

'use strict';

// ---- Data store ----
const Store = {
  _cache: {},
  async get(file) {
    if (this._cache[file]) return this._cache[file];
    try {
      const r = await fetch(`/data/${file}.json?v=${Date.now()}`);
      if (!r.ok) throw new Error(`Failed to load ${file}`);
      const data = await r.json();
      this._cache[file] = data;
      return data;
    } catch (e) {
      console.error('Store.get error:', e);
      return null;
    }
  },
  invalidate(file) { delete this._cache[file]; }
};

// ---- Toast notifications ----
const Toast = {
  container: null,
  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  show(msg, type = 'info', duration = 4000) {
    this.init();
    const t = document.createElement('div');
    const icons = { success: '✓', error: '✗', info: 'ℹ' };
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
    this.container.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0'; t.style.transform = 'translateX(30px)'; t.style.transition = 'all .3s';
      setTimeout(() => t.remove(), 300);
    }, duration);
  }
};

// ---- Navigation ----
const Nav = {
  _nav: null,
  _hamburger: null,
  _mobile: null,
  _isOpen: false,

  init() {
    this._nav = document.querySelector('.nav');
    this._hamburger = document.querySelector('.nav__hamburger');
    this._mobile = document.querySelector('.nav__mobile');
    if (!this._nav) return;

    // Scroll shadow
    window.addEventListener('scroll', () => {
      this._nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    // Active link
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop() || 'index.html';
      if (href === path) a.classList.add('active');
    });

    // Hamburger toggle
    if (this._hamburger) {
      this._hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    // Close when clicking a nav link inside mobile menu
    if (this._mobile) {
      this._mobile.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => this.close());
      });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this._isOpen && !this._nav.contains(e.target)) this.close();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isOpen) this.close();
    });

    // ResizeObserver: force-close when viewport goes above mobile breakpoint
    const ro = new ResizeObserver(() => {
      if (window.innerWidth >= 769 && this._isOpen) this.close();
    });
    ro.observe(document.documentElement);
  },

  toggle() {
    this._isOpen ? this.close() : this.open();
  },

  open() {
    if (!this._nav) return;
    this._isOpen = true;
    this._nav.setAttribute('data-open', '');
    if (this._hamburger) this._hamburger.setAttribute('aria-expanded', 'true');
  },

  close() {
    if (!this._nav) return;
    this._isOpen = false;
    this._nav.removeAttribute('data-open');
    if (this._hamburger) this._hamburger.setAttribute('aria-expanded', 'false');
  }
};

// ---- Scroll animations ----
const ScrollAnim = {
  init() {
    const els = document.querySelectorAll('.fade-up');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }
};

// ---- Admin check ----
const Admin = {
  isAdmin() {
    return new URLSearchParams(window.location.search).get('admin') === 'true'
        || localStorage.getItem('so_admin') === 'true';
  },
  init() {
    if (!this.isAdmin()) return;
    const bar = document.createElement('div');
    bar.className = 'admin-bar';
    bar.innerHTML = `🔧 Admin Mode &nbsp;|&nbsp; <a href="/admin/">Open Dashboard</a> &nbsp;|&nbsp; <a href="#" onclick="Admin.exit()">Exit Admin</a>`;
    document.body.appendChild(bar);
    document.body.style.paddingBottom = '48px';
  },
  exit() {
    localStorage.removeItem('so_admin');
    window.location.href = window.location.pathname;
  }
};

// ---- Components ----
const Components = {
  navHTML(siteData) {
    const d = siteData || {};
    return `
    <nav class="nav" id="mainNav">
      <div class="container nav__inner">
        <a href="/" class="nav__logo">${d.name || 'Shop<span>Online</span>'}</a>
        <div class="nav__links">
          <a href="/" class="nav__link">Home</a>
          <a href="/pages/services.html" class="nav__link">Services</a>
          <a href="/pages/works.html" class="nav__link">Portfolio</a>
          <a href="/pages/pricing.html" class="nav__link">Pricing</a>
          <a href="/pages/about.html" class="nav__link">About</a>
          <a href="/pages/contact.html" class="nav__link">Contact</a>
          <a href="/pages/client-form.html" class="btn btn-primary btn-sm nav__cta">Get Started</a>
        </div>
        <div class="nav__hamburger" id="hamburger">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="nav__mobile" id="mobileMenu">
        <a href="/" class="nav__link">Home</a>
        <a href="/pages/services.html" class="nav__link">Services</a>
        <a href="/pages/works.html" class="nav__link">Portfolio</a>
        <a href="/pages/pricing.html" class="nav__link">Pricing</a>
        <a href="/pages/about.html" class="nav__link">About</a>
        <a href="/pages/contact.html" class="nav__link">Contact</a>
        <a href="/pages/client-form.html" class="btn btn-primary w-full" style="margin-top:12px">Get Started →</a>
      </div>
    </nav>`;
  },

  footerHTML(siteData) {
    const d = siteData || {};
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <h3>${d.name || 'Shop<span>Online</span>'}</h3>
            <p>${d.tagline || 'Transforming local shops into thriving online businesses across India.'}</p>
            <div class="footer__social" style="margin-top:20px">
              <a href="${d.social?.instagram || '#'}" title="Instagram">📸</a>
              <a href="${d.social?.whatsapp || '#'}" title="WhatsApp">💬</a>
              <a href="${d.social?.facebook || '#'}" title="Facebook">📘</a>
              <a href="${d.social?.linkedin || '#'}" title="LinkedIn">💼</a>
            </div>
          </div>
          <div class="footer__col">
            <h4>Pages</h4>
            <a href="/pages/services.html">Services</a>
            <a href="/pages/works.html">Portfolio</a>
            <a href="/pages/pricing.html">Pricing</a>
            <a href="/pages/about.html">About Us</a>
            <a href="/pages/contact.html">Contact</a>
          </div>
          <div class="footer__col">
            <h4>Quick Links</h4>
            <a href="/pages/client-form.html">Get Started</a>
            <a href="/pages/pricing.html">View Plans</a>
            <a href="/pages/works.html">Our Work</a>
            <a href="/pages/privacy.html">Privacy Policy</a>
          </div>
          <div class="footer__col">
            <h4>Contact</h4>
            <a href="mailto:${d.contact?.email || 'hello@shoponline.in'}">📧 ${d.contact?.email || 'hello@shoponline.in'}</a>
            <a href="https://wa.me/${d.contact?.whatsapp || '919876543210'}">💬 WhatsApp Us</a>
            <a href="tel:${d.contact?.phone || '+919876543210'}">📞 ${d.contact?.phone || '+91 98765 43210'}</a>
            <span style="display:block;margin-top:8px;font-size:.82rem;opacity:.5">${d.contact?.address || 'Ahmedabad, Gujarat, India'}</span>
          </div>
        </div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} ${d.name || 'ShopOnline'}. All rights reserved.</span>
          <span>Made with ❤️ for local businesses</span>
        </div>
      </div>
    </footer>`;
  }
};

// ---- Render nav + footer from JSON ----
async function initPage() {
  Nav.init();
  ScrollAnim.init();
  Admin.init();
}

// Auto-init
document.addEventListener('DOMContentLoaded', initPage);
