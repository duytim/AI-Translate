import { StorageService } from '../services/storage.js';
import { TranslationStore } from '../stores/translationStore.js';
import { Logger } from '../utils/constants.js';

/**
 * History Panel Setup
 * Displays translation history with search, delete, and clear features
 */
export function setupHistoryPanel() {
  const modal = document.getElementById('historyModal');
  const btnOpen = document.getElementById('historyBtn');
  const btnClose = document.getElementById('closeHistoryBtn');
  const listEl = document.getElementById('historyList');
  const clearBtn = document.getElementById('clearHistoryBtn');
  const searchInput = document.getElementById('historySearch') || createSearchInput();
  const inputEl = document.getElementById('inputText');
  const targetLangSelect = document.getElementById('targetLang');

  let allHistory = [];

  /**
   * Create search input if it doesn't exist
   */
  function createSearchInput() {
    const search = document.createElement('input');
    search.id = 'historySearch';
    search.type = 'text';
    search.placeholder = 'Tìm kiếm...';
    search.className = 'w-full px-4 py-2 mb-4 bg-gray-100 dark:bg-[#2a2a2a] rounded-lg outline-none text-gray-900 dark:text-white';

    const header = modal.querySelector('[class*="border-b"]');
    if (header) {
      header.parentElement.insertBefore(search, listEl);
    }

    return search;
  }

  /**
   * Render history list
   */
  function render() {
    allHistory = StorageService.getHistory();
    listEl.innerHTML = '';

    if (allHistory.length === 0) {
      listEl.innerHTML = '<div class="text-gray-500 text-center mt-10">Chưa có bản dịch nào</div>';
      clearBtn.classList.add('hidden');
      return;
    }

    clearBtn.classList.remove('hidden');

    const filtered = filterHistory(allHistory, searchInput.value);

    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="text-gray-500 text-center mt-10">Không tìm thấy</div>';
      return;
    }

    filtered.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-100 dark:hover:bg-[#333] group flex justify-between items-start gap-3';

      const contentDiv = document.createElement('div');
      contentDiv.className = 'flex-1 min-w-0';
      contentDiv.innerHTML = `
        <div class="text-lg text-gray-900 dark:text-white font-medium mb-1 truncate">${escapeHtml(item.original)}</div>
        <div class="text-gray-500 dark:text-gray-400 text-sm truncate">${escapeHtml(item.translation)}</div>
        <div class="text-gray-400 dark:text-gray-500 text-xs mt-1">${formatTime(item.timestamp || item.time)}</div>
      `;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500';
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash text-lg"></i>';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryItem(index);
      });

      div.appendChild(contentDiv);
      div.appendChild(deleteBtn);

      // Load history item on click
      div.addEventListener('click', () => {
        modal.classList.add('hidden');
        inputEl.value = item.original;
        targetLangSelect.value = item.targetLang || 'zh';
        targetLangSelect.dispatchEvent(new Event('change', { bubbles: true }));
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      });

      listEl.appendChild(div);
    });

    Logger.debug('HistoryPanel', `Rendered ${filtered.length} items`);
  }

  /**
   * Filter history by search term
   */
  function filterHistory(items, searchTerm) {
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.original.toLowerCase().includes(term) ||
      item.translation.toLowerCase().includes(term)
    );
  }

  /**
   * Delete single history item
   */
  function deleteHistoryItem(index) {
    allHistory.splice(index, 1);
    StorageService.clearHistory();
    allHistory.forEach(item => StorageService.saveHistory(item));
    render();
  }

  /**
   * Format timestamp to readable time
   */
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins}m trước`;
    if (diffHours < 24) return `${diffHours}h trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event listeners
  btnOpen.addEventListener('click', () => {
    modal.classList.remove('hidden');
    render();
  });

  btnClose.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  searchInput.addEventListener('input', () => {
    render();
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Xóa toàn bộ lịch sử dịch?')) {
      StorageService.clearHistory();
      allHistory = [];
      render();
      Logger.debug('HistoryPanel', 'History cleared');
    }
  });

  // Close modal on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  Logger.debug('HistoryPanel', 'Setup complete');

  return () => {
    // Cleanup if needed
  };
}