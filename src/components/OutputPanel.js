import { SpeechService } from '../services/speech.js';

export function setupOutputPanel() {
    const panelEl = document.getElementById('outputPanel');
    const labelEl = document.getElementById('targetLangLabel');
    const loadingEl = document.getElementById('loadingIndicator');
    const contentEl = document.getElementById('resultContent');
    
    const outTranslation = document.getElementById('outTranslation');
    const outPhonetic = document.getElementById('outPhonetic');
    const copyBtn = document.getElementById('copyBtn');
    
    const ttsOriginalBtn = document.getElementById('ttsOriginal');
    const ttsTranslationBtn = document.getElementById('ttsTranslation');
    const sourceLangSelect = document.getElementById('sourceLang');

    let currentData = null;
    let currentTargetLang = null;

    // TTS Setup
    ttsOriginalBtn.addEventListener('click', () => {
        if(currentData) SpeechService.speak(currentData.original, currentData.detected_source_language || sourceLangSelect.value);
    });

    ttsTranslationBtn.addEventListener('click', () => {
        if(currentData) SpeechService.speak(currentData.translation, currentTargetLang);
    });

    // Copy Setup
    copyBtn.addEventListener('click', () => {
        if(currentData) {
            navigator.clipboard.writeText(currentData.translation);
            copyBtn.innerHTML = '<i class="fa-solid fa-check text-green-500"></i>';
            setTimeout(() => { copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>'; }, 2000);
        }
    });

    return {
        setTargetLabel: (text) => { labelEl.innerText = text; },
        getCurrentTranslation: () => currentData?.translation || '',
        hide: () => {
            panelEl.classList.add('hidden');
            ttsOriginalBtn.classList.add('hidden');
            currentData = null;
        },
        showLoading: () => {
            panelEl.classList.remove('hidden');
            loadingEl.classList.remove('hidden');
            contentEl.classList.add('hidden');
            ttsOriginalBtn.classList.add('hidden');
        },
        showError: () => {
            loadingEl.classList.add('hidden');
            contentEl.classList.remove('hidden');
            outTranslation.innerHTML = '<span class="text-red-500 text-xl">Lỗi dịch thuật. Vui lòng thử lại.</span>';
            outPhonetic.innerText = '';
        },
        renderFinal: (data, targetLangCode) => {
            currentData = data;
            currentTargetLang = targetLangCode;
            
            loadingEl.classList.add('hidden');
            contentEl.classList.remove('hidden');
            ttsOriginalBtn.classList.remove('hidden');

            outTranslation.innerText = data.translation;
            
            if (data.phonetic) {
                outPhonetic.classList.remove('hidden');
                outPhonetic.innerText = data.phonetic;
            } else {
                outPhonetic.classList.add('hidden');
            }
        }
    };
}