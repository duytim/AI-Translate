let currentTranslation = null;

export const TranslationStore = {
    set(data) {
        currentTranslation = data;
    },

    get() {
        return currentTranslation;
    },

    clear() {
        currentTranslation = null;
    }
};