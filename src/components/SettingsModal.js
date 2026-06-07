import { StorageService } from '../services/storage.js';

export function setupSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const btnOpen = document.getElementById('settingsBtn');
    const btnClose = document.getElementById('closeSettingsBtn');
    const modelSelect = document.getElementById('modelSelect');
    const themeToggle = document.getElementById('themeToggle');

    const applyTheme = (isDark) => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const settings = StorageService.getSettings();
    
    const optionsArray = Array.from(modelSelect.options).map(opt => opt.value);
    if (optionsArray.includes(settings.model)) {
        modelSelect.value = settings.model;
    } else {
        settings.model = 'google/gemma-4-31b-it:free';
        modelSelect.value = settings.model;
        StorageService.updateSettings(settings);
    }

    themeToggle.checked = (settings.theme === 'dark');
    applyTheme(themeToggle.checked);

    btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    
    modelSelect.addEventListener('change', (e) => {
        settings.model = e.target.value;
        StorageService.updateSettings(settings);
    });

    themeToggle.addEventListener('change', (e) => {
        settings.theme = e.target.checked ? 'dark' : 'light';
        StorageService.updateSettings(settings);
        applyTheme(e.target.checked);
    });
}