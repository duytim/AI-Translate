import { setupInputPanel } from './components/InputPanel.js';
import { setupOutputPanel } from './components/OutputPanel.js';
import { setupHistoryPanel } from './components/HistoryPanel.js';
import { setupSettingsModal } from './components/SettingsModal.js';

document.addEventListener('DOMContentLoaded', () => {
    setupSettingsModal();
    const outputPanel = setupOutputPanel();
    const historyPanel = setupHistoryPanel(outputPanel);
    setupInputPanel(outputPanel, historyPanel);
});