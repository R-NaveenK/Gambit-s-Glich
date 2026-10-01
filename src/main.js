/**
 * GAMBIT'S GLITCH 2026 - Main Application Entry & SPA Router
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Loader } from './components/Loader.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { HeroCanvas } from './components/HeroCanvas.js';

import { HomePage } from './pages/HomePage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ThemesPage } from './pages/ThemesPage.js';
import { TimelinePage } from './pages/TimelinePage.js';
import { RulesPrizesPage } from './pages/RulesPrizesPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { SubmitPptPage } from './pages/SubmitPptPage.js';
import { StatusTrackerPage } from './pages/StatusTrackerPage.js';
import { ContactFaqPage } from './pages/ContactFaqPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { AdminPage } from './pages/AdminPage.js';

import { soundFx } from './utils/audio.js';

gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.appEl = document.getElementById('app');
    this.currentRoute = 'home';
    this.lenis = null;
    this.canvasEngine = null;

    this.routes = {
      home: HomePage,
      about: AboutPage,
      themes: ThemesPage,
      timeline: TimelinePage,
      rules: RulesPrizesPage,
      register: RegisterPage,
      'submit-ppt': SubmitPptPage,
      status: StatusTrackerPage,
      contact: ContactFaqPage,
      login: LoginPage,
      'admin-portalGG': AdminPage,
      admin: AdminPage
    };

    const getInitialRoute = () => {
      let hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim();
      if (hash === 'payment') hash = 'register';
      if (hash && this.routes[hash]) return hash;
      let path = window.location.pathname.replace(/^\//, '').split('?')[0].trim();
      if (path === 'payment') path = 'register';
      if (path && this.routes[path]) return path;
      return 'home';
    };
    this.currentRoute = getInitialRoute();
  }

  init() {
    // Keep native scrolling when reduced motion is requested.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0
      });

      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    // 3. Initialize Background Canvas Engine
    this.canvasEngine = new HeroCanvas('hero-bg-canvas');

    // 4. Mount one intro. Its callback runs exactly once.
    const isDirectSubpage = this.currentRoute && this.currentRoute !== 'home';
    const loader = new Loader(() => {
      this.renderCurrentRoute(true, false);
      this.lenis?.start();
    }, isDirectSubpage);

    const loaderHtml = loader.render();
    if (loaderHtml) {
      this.lenis?.stop();
      document.body.insertAdjacentHTML('afterbegin', loaderHtml);
      loader.startSequence();
    } else {
      this.renderCurrentRoute(true, false);
    }

    // Global Click Router listener
    document.addEventListener('click', (e) => {
      const trackEl = e.target.closest('[data-track]');
      if (trackEl) {
        const trackVal = trackEl.getAttribute('data-track');
        if (trackVal) {
          sessionStorage.setItem('selected_track_id', trackVal);
        }
      }

      const link = e.target.closest('.nav-link, [data-route]');
      if (link) {
        const route = link.getAttribute('data-route');
        if (route && this.routes[route]) {
          e.preventDefault();
          this.navigate(route);
        }
      }
    });

    // Handle Hash Changes dynamically (e.g., pasting #admin-portalGG)
    window.addEventListener('hashchange', () => {
      let hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim();
      if (hash === 'payment') hash = 'register';
      if (hash && this.routes[hash] && this.currentRoute !== hash) {
        this.currentRoute = hash;
        this.renderCurrentRoute(true, true);
      }
    });

    // Handle Browser Back / Forward
    window.addEventListener('popstate', (e) => {
      let hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim();
      let route = (e.state && e.state.route) || hash || 'home';
      if (route === 'payment') route = 'register';
      if (this.routes[route]) {
        this.currentRoute = route;
        this.renderCurrentRoute(false, true);
      }
    });
  }

  navigate(route, updateHistory = true) {
    if (route === 'payment') route = 'register';
    if (!this.routes[route]) return;
    this.currentRoute = route;

    if (updateHistory) {
      window.location.hash = `#${route}`;
    }

    this.renderCurrentRoute(true, true);
  }

  renderCurrentRoute(scrollToTop = true, animateTransition = true) {
    if (!this.appEl) return;

    const PageClass = this.routes[this.currentRoute] || HomePage;
    const pageInstance = new PageClass((targetRoute) => this.navigate(targetRoute));

    const navbar = new Navbar(this.currentRoute, (targetRoute) => this.navigate(targetRoute));
    const footer = new Footer();

    this.appEl.innerHTML = `
      ${navbar.render()}
      <main id="main-content" class="flex-1 ${animateTransition ? 'opacity-0' : ''}">
        ${pageInstance.render()}
      </main>
      ${footer.render()}
    `;

    navbar.attachEvents();

    if (typeof pageInstance.attachEvents === 'function') {
      pageInstance.attachEvents();
    }

    if (scrollToTop) {
      window.scrollTo(0, 0);
    }

    // Refresh Lucide Icons if available
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Smooth Page & Route Transition
    const mainContent = document.getElementById('main-content');
    const signalLine = document.getElementById('nav-signal-line');

    if (mainContent) {
      if (animateTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(mainContent, 
          { opacity: 0, y: 10 }, 
          { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'transform' }
        );

        if (signalLine) {
          gsap.fromTo(signalLine,
            { scaleX: 0, opacity: 1, transformOrigin: '0% 50%' },
            { scaleX: 1, opacity: 0, duration: 0.42, ease: 'power2.out' }
          );
        }
      } else {
        mainContent.style.opacity = '1';
      }
    }
  }
}

// App Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
