/**
 * GAMBIT'S GLITCH - Swiss Editorial Countdown Timer
 */

import { eventConfig } from '../config/eventConfig.js';

export class Countdown {
  constructor(containerId) {
    this.containerId = containerId;
    this.timerId = null;
    this.targetDate = new Date(eventConfig.dates.registrationDeadline).getTime();
  }

  render() {
    return `
      <div id="${this.containerId}" class="grid grid-cols-4 gap-2 md:gap-3 font-mono">
        
        <div class="p-3 md:p-4 text-center border border-line bg-paper">
          <div id="cnt-days" class="font-mono text-2xl md:text-3xl font-bold text-ink">00</div>
          <div class="text-[9px] md:text-[10px] text-muted tracking-widest uppercase mt-1">DAYS</div>
        </div>

        <div class="p-3 md:p-4 text-center border border-line bg-paper">
          <div id="cnt-hours" class="font-mono text-2xl md:text-3xl font-bold text-ink">00</div>
          <div class="text-[9px] md:text-[10px] text-muted tracking-widest uppercase mt-1">HOURS</div>
        </div>

        <div class="p-3 md:p-4 text-center border border-line bg-paper">
          <div id="cnt-mins" class="font-mono text-2xl md:text-3xl font-bold text-accent-dark">00</div>
          <div class="text-[9px] md:text-[10px] text-muted tracking-widest uppercase mt-1">MINS</div>
        </div>

        <div class="p-3 md:p-4 text-center border border-line bg-paper">
          <div id="cnt-secs" class="font-mono text-2xl md:text-3xl font-bold text-accent">00</div>
          <div class="text-[9px] md:text-[10px] text-muted tracking-widest uppercase mt-1">SECS</div>
        </div>

      </div>
    `;
  }

  start() {
    const update = () => {
      const now = new Date().getTime();
      const diff = this.targetDate - now;

      const daysEl = document.getElementById('cnt-days');
      const hoursEl = document.getElementById('cnt-hours');
      const minsEl = document.getElementById('cnt-mins');
      const secsEl = document.getElementById('cnt-secs');

      if (!daysEl) {
        clearInterval(this.timerId);
        return;
      }

      if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        clearInterval(this.timerId);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      daysEl.textContent = days < 10 ? '0' + days : days;
      hoursEl.textContent = hours < 10 ? '0' + hours : hours;
      minsEl.textContent = minutes < 10 ? '0' + minutes : minutes;
      secsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
    };

    update();
    this.timerId = setInterval(update, 1000);
  }

  stop() {
    if (this.timerId) clearInterval(this.timerId);
  }
}
