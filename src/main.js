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
import { PaymentPage } from './pages/PaymentPage.js';
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
      payment: PaymentPage,
      'submit-ppt': SubmitPptPage,
      status: StatusTrackerPage,
      contact: ContactFaqPage,
      login: LoginPage,
      'admin-portalGG': AdminPage,
      admin: AdminPage
    };

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && this.routes[initialHash]) {
      this.currentRoute = initialHash;
    }
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
    const loader = new Loader(() => {
      this.renderCurrentRoute();
      this.lenis?.start();
    });

    const loaderHtml = loader.render();
    if (loaderHtml) {
      this.lenis?.stop();
      document.body.insertAdjacentHTML('afterbegin', loaderHtml);
      loader.startSequence();
    } else {
      this.renderCurrentRoute();
    }

    // Global Click Router listener
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link');
      if (link) {
        const route = link.getAttribute('data-route');
        if (route && this.routes[route]) {
          e.preventDefault();
          soundFx.playClick();
          this.navigate(route);
        }
      }
    });

    // Handle Browser Back / Forward
    window.addEventListener('popstate', (e) => {
      const route = e.state ? e.state.route : 'home';
      this.currentRoute = route;
      this.renderCurrentRoute(false);
    });
  }

  navigate(route, updateHistory = true) {
    if (!this.routes[route]) return;
    this.currentRoute = route;

    if (updateHistory) {
      window.history.pushState({ route }, '', route === 'home' ? '/' : `#${route}`);
    }

    this.renderCurrentRoute();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentRoute(scrollToTop = true) {
    if (!this.appEl) return;

    const PageClass = this.routes[this.currentRoute] || HomePage;
    const pageInstance = new PageClass((targetRoute) => this.navigate(targetRoute));

    const navbar = new Navbar(this.currentRoute, (targetRoute) => this.navigate(targetRoute));
    const footer = new Footer();

    this.appEl.innerHTML = `
      ${navbar.render()}
      <main id="main-content" class="flex-1">
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
  }
}

// App Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
