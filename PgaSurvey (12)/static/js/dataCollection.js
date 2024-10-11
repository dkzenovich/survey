import { state } from './state.js';
import { getStatusText } from './utils.js';
import { CONFIG } from './config.js';

export const displaySurveyData = (surveyData) => {
    updateCollectedData(surveyData);
    const collectedDataTab = document.querySelector('[data-tab="collectedData"]');
    if (collectedDataTab) {
        let cardsHtml = `
            <h2>Собранные данные</h2>
            <div class="filter-sort-container">
                <select id="departmentFilter" class="filter-select">
                    <option value="">Все отделы</option>
                    ${[...new Set(state.collectedData.map(item => item.department))].map(dept => `<option value="${dept}">${dept}</option>`).join('')}
                </select>
                <button id="sortButton" class="sort-button">Сортировать по статусу</button>
            </div>
            <div class="data-container">
        `;

        state.collectedData.forEach(item => {
            cardsHtml += `
                <div class="data-card">
                    <div class="card-header">
                        <span class="department">${item.department}</span>
                        <span class="status-badge status-${item.status}">${getStatusText(item.status)}</span>
                    </div>
                    <div class="card-body">
                        <div class="question">${item.question}</div>
                        <div class="answer">${item.answer}</div>
                    </div>
                </div>
            `;
        });

        cardsHtml += `
            </div>
            <div class="pagination-container">
                <button id="prevPage" class="pagination-button">Предыдущая</button>
                <span>Страница <span id="currentPage"></span> из <span id="totalPages"></span></span>
                <button id="nextPage" class="pagination-button">Следующая</button>
            </div>
        `;

        collectedDataTab.innerHTML = cardsHtml;

        document.getElementById('departmentFilter').addEventListener('change', filterData);
        document.getElementById('sortButton').addEventListener('click', sortData);
        document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
        document.getElementById('nextPage').addEventListener('click', () => changePage(1));

        const collectedDataTabButton = document.querySelector('.tab-btn[data-tab="collectedData"]');
        if (collectedDataTabButton) {
            collectedDataTabButton.click();
        }
    }
    renderCards();
};

export const renderCards = () => {
    const startIndex = (state.currentPageNum - 1) * CONFIG.itemsPerPage;
    const endIndex = startIndex + CONFIG.itemsPerPage;
    const pageData = state.filteredData.slice(startIndex, endIndex);

    const dataContainer = document.querySelector('.data-container');
    if (dataContainer) {
        dataContainer.innerHTML = pageData.map(item => `
            <div class="data-card">
                <div class="card-header">
                    <span class="department">${item.department}</span>
                    <span class="status-badge status-${item.status}">${getStatusText(item.status)}</span>
                </div>
                <div class="card-body">
                    <div class="question">${item.question}</div>
                    <div class="answer">${item.answer}</div>
                </div>
            </div>
        `).join('');
    }

    const currentPage = document.getElementById('currentPage');
    const totalPages = document.getElementById('totalPages');
    if (currentPage) currentPage.textContent = state.currentPageNum;
    if (totalPages) totalPages.textContent = Math.ceil(state.filteredData.length / CONFIG.itemsPerPage);

    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    if (prevButton) prevButton.disabled = state.currentPageNum === 1;
    if (nextButton) nextButton.disabled = state.currentPageNum === Math.ceil(state.filteredData.length / CONFIG.itemsPerPage);
};

export const renderTable = () => {
    const startIndex = (state.currentPageNum - 1) * CONFIG.itemsPerPage;
    const endIndex = startIndex + CONFIG.itemsPerPage;
    const pageData = state.filteredData.slice(startIndex, endIndex);
    const tbody = document.querySelector('#dataTable tbody');
    if (tbody) {
        tbody.innerHTML = pageData.map((item, index) => `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td>${item.department}</td>
                <td>${item.question}</td>
                <td>${item.answer}</td>
                <td><span class="status-badge status-${item.status}">${getStatusText(item.status)}</span></td>
            </tr>
        `).join('');
    }
    const currentPage = document.getElementById('currentPage');
    const totalPages = document.getElementById('totalPages');
    if (currentPage) currentPage.textContent = state.currentPageNum;
    if (totalPages) totalPages.textContent = Math.ceil(state.filteredData.length / CONFIG.itemsPerPage);
};

export const filterData = () => {
    const selectedDepartment = document.getElementById('departmentFilter')?.value;
    state.filteredData = selectedDepartment
        ? state.collectedData.filter(item => item.department === selectedDepartment)
        : state.collectedData;
    state.currentPageNum = 1;
    renderCards();
};

export const sortData = () => {
    state.filteredData.sort((a, b) => a.status.localeCompare(b.status));
    renderCards();
};

const changePage = (direction) => {
    const newPage = state.currentPageNum + direction;
    if (newPage >= 1 && newPage <= Math.ceil(state.filteredData.length / CONFIG.itemsPerPage)) {
        state.currentPageNum = newPage;
        renderCards();
    }
};

const updateCollectedData = (surveyData) => {
    state.collectedData = surveyData;
    state.filteredData = surveyData;
};