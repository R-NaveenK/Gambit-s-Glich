/**
 * GAMBIT'S GLITCH - Custom Technical Toast Notification System
 */

export const toast = {
  show(message, type = 'info', duration = 4500) {
    let container = document.getElementById('gg-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'gg-toast-container';
      container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-md w-full px-4';
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast-item pointer-events-auto border p-4 bg-carbon text-signal shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 flex items-start gap-3 font-mono text-xs leading-relaxed ${
      type === 'error'
        ? 'border-alertRed text-alertRed bg-opacity-95'
        : type === 'success'
        ? 'border-acidLime text-acidLime bg-opacity-95'
        : 'border-cyan text-cyan bg-opacity-95'
    }`;

    const iconSymbol = type === 'error' ? '[ERR]' : type === 'success' ? '[OK]' : '[SYS]';

    toastEl.innerHTML = `
      <div class="font-bold tracking-widest uppercase">${iconSymbol}</div>
      <div class="flex-1 text-signal-white">${message}</div>
      <button class="ml-2 text-muted hover:text-signal cursor-pointer font-mono font-bold" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toastEl);

    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toastEl.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toastEl.remove(), 300);
    }, duration);
  }
};
