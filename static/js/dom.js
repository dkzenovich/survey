import { $, $$ } from './utils.js';

// DOM Elements
export const elements = {
    tabButtons: $$('.tab-btn'),
    tabContents: $$('.tab-content'),
    startAnalysisBtn: $('#startAnalysisBtn'),
    startSurveyBtn: $('#startSurveyBtn'),
    researchPlanTab: $('.tab-btn[data-tab="researchPlan"]'),
    questionInput: $('#questionInput'),
    departmentList: $('#departmentList'),
    questionsList: $('#questionsList'),
    stepsList: $('#stepsList'),
    editDepartmentsBtn: $('#editDepartmentsBtn'),
    editQuestionsBtn: $('#editQuestionsBtn'),
    regenerateQuestionsBtn: $('#regenerateQuestionsBtn'),
    saveChangesBtn: $('#saveChangesBtn'),
    startResearchBtn: $('#startResearchBtn'),
    departmentFilter: $('#departmentFilter'),
    dataTable: $('#dataTable'),
    currentPage: $('#currentPage'),
    totalPages: $('#totalPages'),
    prevPage: $('#prevPage'),
    nextPage: $('#nextPage'),
    exportData: $('#exportData'),
    paginationContainer: $('.pagination'),
    progressBar: $('#progressBar'),
    progressPercentage: $('#progressPercentage')
};

export const updateProgressBar = (percentage) => {
    if (elements.progressBar && elements.progressPercentage) {
        elements.progressBar.style.width = percentage + '%';
        elements.progressPercentage.textContent = percentage + '% завершено';
    }
};
