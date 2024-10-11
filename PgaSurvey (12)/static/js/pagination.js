import { state } from './state.js';
import { CONFIG } from './config.js';
import { renderTable } from './dataCollection.js';

export const updatePagination = () => {
    const totalPagesNum = Math.ceil(state.filteredData.length / CONFIG.itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    const nextPage = document.getElementById('nextPage');
    const pageButtons = paginationContainer?.querySelectorAll('.page-number') || [];

    pageButtons.forEach(button => button.remove());

    if (paginationContainer && nextPage) {
        for (let i = 1; i <= totalPagesNum; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('page-number');
            if (i === state.currentPageNum) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                state.currentPageNum = i;
                renderTable();
            });
            paginationContainer.insertBefore(pageButton, nextPage);
        }
    }

    const prevPage = document.getElementById('prevPage');
    if (prevPage) prevPage.disabled = state.currentPageNum === 1;
    if (nextPage) nextPage.disabled = state.currentPageNum === totalPagesNum;
};

export const initPagination = () => {
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');

    prevPage?.addEventListener('click', () => {
        if (state.currentPageNum > 1) {
            state.currentPageNum--;
            renderTable();
        }
    });

    nextPage?.addEventListener('click', () => {
        if (state.currentPageNum < Math.ceil(state.filteredData.length / CONFIG.itemsPerPage)) {
            state.currentPageNum++;
            renderTable();
        }
    });
};
