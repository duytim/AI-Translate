import { StorageService } from '../services/storage.js';

export function setupHistoryPanel(outputPanel) {
    const modal = document.getElementById('historyModal');
    const btnOpen = document.getElementById('historyBtn');
    const btnClose = document.getElementById('closeHistoryBtn');
    const listEl = document.getElementById('historyList');
    const clearBtn = document.getElementById('clearHistoryBtn');
    const inputEl = document.getElementById('inputText');

    btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));

    const render = () => {
        const history = StorageService.getHistory();
        listEl.innerHTML = '';
        if (history.length === 0) {
            listEl.innerHTML = '<div class="text-gray-500 text-center mt-10">Chưa có bản dịch nào</div>';
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl cursor-pointer active:scale-[0.98] transition-transform';
            div.innerHTML = `
                <div class="text-lg text-gray-900 dark:text-white font-medium mb-1">${item.original}</div>
                <div class="text-gray-500 dark:text-gray-400">${item.translation}</div>
            `;
            div.onclick = () => {
                modal.classList.add('hidden');
                inputEl.value = item.original;
                document.getElementById('targetLang').value = item.targetLang || 'zh';
                document.getElementById('targetLang').dispatchEvent(new Event('change'));
                outputPanel.renderFinal(item, item.targetLang || 'zh');
            };
            listEl.appendChild(div);
        });
    };

    clearBtn.addEventListener('click', () => {
        StorageService.clearHistory();
        render();
    });

    render();
    return { refresh: render };
}