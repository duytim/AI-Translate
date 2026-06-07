import { translateText } from '../services/translator.js';
import { StorageService } from '../services/storage.js';
import { SpeechService } from '../services/speech.js';
import { TranslationStore } from '../stores/translationStore.js';

export function setupInputPanel(
    outputPanel,
    historyPanel
) {

    const inputEl =
        document.getElementById(
            'inputText'
        );

    const sourceLangSelect =
        document.getElementById(
            'sourceLang'
        );

    const targetLangSelect =
        document.getElementById(
            'targetLang'
        );

    const clearBtn =
        document.getElementById(
            'clearBtn'
        );

    const newTransBtn =
        document.getElementById(
            'newTranslationBtn'
        );

    let debounceTimer;

    let currentRequestId = 0;

    inputEl.addEventListener(
        'input',
        (e) => {

            const text =
                e.target.value.trim();

            clearTimeout(
                debounceTimer
            );

            if (!text) {

                outputPanel.hide();

                return;
            }

            debounceTimer =
                setTimeout(
                    () => {

                        const requestId =
                            ++currentRequestId;

                        outputPanel.showLoading();

                        const settings =
                            StorageService
                            .getSettings();

                        translateText(
                            text,
                            targetLangSelect.value,
                            settings.model,

                            (finalData) => {

                                if (
                                    requestId !==
                                    currentRequestId
                                ) {
                                    return;
                                }

                                if (
                                    !finalData
                                ) {

                                    outputPanel
                                        .showError();

                                    return;
                                }

                                TranslationStore.set(
                                    finalData
                                );

                                outputPanel
                                    .renderFinal(
                                        finalData,
                                        targetLangSelect.value
                                    );

                                StorageService
                                    .saveHistory({
                                        ...finalData,
                                        targetLang:
                                            targetLangSelect.value
                                    });

                                historyPanel
                                    .refresh();

                                newTransBtn
                                    .classList
                                    .remove(
                                        'hidden'
                                    );
                            }
                        );

                    },
                    500
                );
        }
    );
}