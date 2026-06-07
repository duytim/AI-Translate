const HISTORY_KEY = 'translator_history';
const SETTINGS_KEY = 'translator_settings';
const CACHE_KEY = 'translator_cache';

const DEFAULT_SETTINGS = {
    model: 'google/gemma-4-31b-it:free',
    theme: 'dark'
};

const MAX_HISTORY = 200;

export const StorageService = {

    saveHistory(record) {

        const history = StorageService.getHistory();

        if (
            history.length > 0 &&
            history[0].original === record.original
        ) {
            return;
        }

        history.unshift({
            ...record,
            time: new Date().toISOString()
        });

        if (history.length > MAX_HISTORY) {
            history.length = MAX_HISTORY;
        }

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(history)
        );
    },

    getHistory() {
        try {
            return JSON.parse(
                localStorage.getItem(HISTORY_KEY)
            ) || [];
        } catch {
            return [];
        }
    },

    clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
    },

    getSettings() {
        try {

            const stored =
                localStorage.getItem(
                    SETTINGS_KEY
                );

            return stored
                ? {
                    ...DEFAULT_SETTINGS,
                    ...JSON.parse(stored)
                }
                : DEFAULT_SETTINGS;

        } catch {

            return DEFAULT_SETTINGS;
        }
    },

    updateSettings(newSettings) {

        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(newSettings)
        );
    },

    getCache(key) {

        try {

            const cache =
                JSON.parse(
                    localStorage.getItem(
                        CACHE_KEY
                    ) || '{}'
                );

            return cache[key];

        } catch {

            return null;
        }
    },

    saveCache(key, value) {

        try {

            const cache =
                JSON.parse(
                    localStorage.getItem(
                        CACHE_KEY
                    ) || '{}'
                );

            cache[key] = value;

            localStorage.setItem(
                CACHE_KEY,
                JSON.stringify(cache)
            );

        } catch {}
    }
};