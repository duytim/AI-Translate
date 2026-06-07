import { setupInputPanel } from './components/InputPanel.js';
import { setupOutputPanel } from './components/OutputPanel.js';
import { setupHistoryPanel } from './components/HistoryPanel.js';
import { setupSettingsModal } from './components/SettingsModal.js';
import { Logger } from './utils/constants.js';

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
  Logger.info('App', 'Initializing...');

  try {
    // Setup components (order matters for dependencies)
    setupSettingsModal();
    const cleanupOutput = setupOutputPanel();
    const cleanupHistory = setupHistoryPanel();
    const cleanupInput = setupInputPanel();

    Logger.info('App', 'Initialization complete');

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      cleanupInput?.();
      cleanupOutput?.();
      cleanupHistory?.();
    });

  } catch (error) {
    Logger.error('App', 'Initialization failed: ' + error.message);
    console.error(error);
  }
});

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        Logger.info('ServiceWorker', 'Registered successfully');
      })
      .catch(err => {
        Logger.error('ServiceWorker', err);
      });
  });
}