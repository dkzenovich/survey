import { CONFIG } from './config.js';
import { state, updateCollectedData } from './state.js';
import { $, $$, getStatusText } from './utils.js';
import { elements, updateProgressBar } from './dom.js';
import { initTabs } from './tabs.js';
import { displayKeyAspects } from './keyAspects.js';
import { generateResearchPlan, displayResearchPlan } from './researchPlan.js';
import { renderTable, filterData } from './dataCollection.js';
import { updatePagination, initPagination } from './pagination.js';
import { updateConclusionsTab, displayErrorMessage } from './conclusions.js';

const initApp = () => {
    console.log('Initializing application');
    initTabs();
    initStartAnalysis();
    initEventListeners();
    initializeDataAndPagination();
    loadLastSurveyData();
    initScheduleMeeting();
};

const initializeDataAndPagination = () => {
    state.filteredData = state.collectedData;
    renderTable();
    initPagination();
};

const loadLastSurveyData = () => {
    const lastSurveyData = localStorage.getItem('lastSurveyData');
    if (lastSurveyData) {
        const parsedData = JSON.parse(lastSurveyData);
        displaySurveyData(parsedData);
        localStorage.removeItem('lastSurveyData');
    }
};

const initStartAnalysis = () => {
    console.log('Initializing start analysis');
    elements.startAnalysisBtn?.addEventListener('click', handleStartAnalysis);
};

const handleStartAnalysis = () => {
    console.log('Start Analysis button clicked');
    const question = elements.questionInput?.value.trim();
    if (question) {
        console.log('Starting analysis with question:', question);
        startAnalysis(question);
    } else {
        console.log('No question entered');
        alert('Пожалуйста, введите вопрос для анализа.');
    }
};

const startAnalysis = async (question) => {
    console.log('Начало анализа с вопросом:', question);
    updateProgressBar(5);

    try {
        const response = await fetch('/process_query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: question }),
        });
        const data = await response.json();
        console.log('Ответ сервера:', data);

        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsedData && parsedData.problems) {
            displayKeyAspects(parsedData.problems);
            elements.keyAspectsTab?.click();
        } else {
            throw new Error('Неверный формат данных');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        displayKeyAspects(null);
        alert('Произошла ошибка при обработке запроса. Пожалуйста, попробуйте снова.');
    }
};

const initEventListeners = () => {
    elements.departmentFilter?.addEventListener('change', filterData);
    elements.prevPage?.addEventListener('click', handlePrevPage);
    elements.nextPage?.addEventListener('click', handleNextPage);
    elements.exportData?.addEventListener('click', handleExportData);
    elements.startSurveyBtn?.addEventListener('click', handleStartSurvey);

    $('#startResearchBtn')?.addEventListener('click', startResearch);
    $('#editDepartmentsBtn')?.addEventListener('click', editDepartments);
    $('#editQuestionsBtn')?.addEventListener('click', editQuestions);
    $('#regenerateQuestionsBtn')?.addEventListener('click', regenerateQuestions);
    $('#saveChangesBtn')?.addEventListener('click', saveChanges);
    $('#scheduleMeetingBtn')?.addEventListener('click', openScheduleMeetingModal);
};

const handlePrevPage = () => {
    if (state.currentPageNum > 1) {
        state.currentPageNum--;
        renderTable();
    }
};

const handleNextPage = () => {
    if (state.currentPageNum < Math.ceil(state.filteredData.length / CONFIG.itemsPerPage)) {
        state.currentPageNum++;
        renderTable();
    }
};

const handleExportData = () => {
    alert('Функция экспорта данных будет реализована позже.');
};

const handleStartSurvey = () => {
    console.log('Кнопка "Начать опрос" нажата');
    window.location.href = '/survey';
};

const startResearch = () => {
    const questionsList = $('#questionsList');
    if (questionsList) {
        const questions = collectQuestions(questionsList);
        localStorage.setItem('interviewQuestions', JSON.stringify(questions));
        window.location.href = '/survey';
    } else {
        console.error('Список вопросов не найден');
        alert('Произошла ошибка при начале исследования. Пожалуйста, попробуйте снова.');
    }
};

const collectQuestions = (questionsList) => {
    const questions = [];
    const departmentQuestions = questionsList.querySelectorAll('.department-questions');
    departmentQuestions.forEach(deptQuestions => {
        const department = deptQuestions.querySelector('h4').textContent;
        const departmentQuestionsList = Array.from(deptQuestions.querySelectorAll('li')).map(li => li.textContent);
        questions.push({ department, questions: departmentQuestionsList });
    });
    return questions;
};

const editDepartments = () => {
    const departmentList = $('#departmentList');
    const departments = Array.from(departmentList.children).map(li => li.textContent);
    departmentList.innerHTML = departments.map(dept => `
        <li><input type="text" value="${dept}" class="edit-input"></li>
    `).join('');
    toggleEditButton('editDepartmentsBtn', 'Сохранить', saveDepartments);
};

const saveDepartments = () => {
    const departmentList = $('#departmentList');
    const departments = Array.from(departmentList.querySelectorAll('input')).map(input => input.value);
    departmentList.innerHTML = departments.map(dept => `<li>${dept}</li>`).join('');
    toggleEditButton('editDepartmentsBtn', 'Редактировать отделы', editDepartments);
};

const editQuestions = () => {
    const questionsList = $('#questionsList');
    const departmentQuestions = questionsList.querySelectorAll('.department-questions');
    departmentQuestions.forEach(deptQuestions => {
        const department = deptQuestions.querySelector('h4').textContent;
        const questions = Array.from(deptQuestions.querySelectorAll('li')).map(li => li.textContent);
        deptQuestions.innerHTML = `
            <h4>${department}</h4>
            <ul>
                ${questions.map(q => `<li><input type="text" value="${q}" class="edit-input"></li>`).join('')}
            </ul>
        `;
    });
    toggleEditButton('editQuestionsBtn', 'Сохранить', saveQuestions);
};

const saveQuestions = () => {
    const questionsList = $('#questionsList');
    const departmentQuestions = questionsList.querySelectorAll('.department-questions');
    departmentQuestions.forEach(deptQuestions => {
        const department = deptQuestions.querySelector('h4').textContent;
        const questions = Array.from(deptQuestions.querySelectorAll('input')).map(input => input.value);
        deptQuestions.innerHTML = `
            <h4>${department}</h4>
            <ul>
                ${questions.map(q => `<li>${q}</li>`).join('')}
            </ul>
        `;
    });
    toggleEditButton('editQuestionsBtn', 'Редактировать вопросы', editQuestions);
};

const toggleEditButton = (buttonId, text, newListener) => {
    const button = $(`#${buttonId}`);
    button.textContent = text;
    const oldListener = text === 'Сохранить' ? editDepartments : saveDepartments;
    button.removeEventListener('click', oldListener);
    button.addEventListener('click', newListener);
};

const regenerateQuestions = () => {
    alert('Функция перегенерации вопросов будет реализована позже.');
};

const saveChanges = () => {
    alert('Изменения сохранены успешно!');
};

const displaySurveyData = (surveyData) => {
    console.log('displaySurveyData function called with:', surveyData);
    updateCollectedData(surveyData);
    renderSurveyData(surveyData);
    updateConclusionsTab(surveyData);
};

const renderSurveyData = (surveyData) => {
    const collectedDataTab = $('#collectedData');
    if (collectedDataTab) {
        const html = generateSurveyDataHTML(surveyData);
        collectedDataTab.innerHTML = html;
        attachToggleListeners();
        navigateToCollectedDataTab();
    }
};

const generateSurveyDataHTML = (surveyData) => {
    let html = `
        <h2>Собранные данные</h2>
        <div class="survey-data-container">
            <div class="data-container">
    `;

    surveyData.questions.forEach((questionSet, index) => {
        questionSet.questions.forEach((question, qIndex) => {
            const answer = surveyData.answers[index * questionSet.questions.length + qIndex] || '';
            html += `
                <div class="data-card">
                    <div class="card-header">
                        <span class="question-text">${question}</span>
                        <span class="toggle-answer">▼</span>
                    </div>
                    <div class="card-body">
                        <div class="answer">${answer}</div>
                    </div>
                </div>
            `;
        });
    });

    html += `
            </div>
        </div>
    `;

    return html;
};

const attachToggleListeners = () => {
    const toggles = $$('.toggle-answer');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', toggleAnswer);
    });
};

const toggleAnswer = (event) => {
    const card = event.target.closest('.data-card');
    const cardBody = card.querySelector('.card-body');
    const toggle = card.querySelector('.toggle-answer');

    if (cardBody.style.display === 'none' || cardBody.style.display === '') {
        cardBody.style.display = 'block';
        toggle.textContent = '▲';
    } else {
        cardBody.style.display = 'none';
        toggle.textContent = '▼';
    }
};

const navigateToCollectedDataTab = () => {
    const collectedDataTabButton = $('.tab-btn[data-tab="collectedData"]');
    if (collectedDataTabButton) {
        collectedDataTabButton.click();
    }
};

const initScheduleMeeting = () => {
    const modal = $('#scheduleMeetingModal');
    const closeBtn = modal.querySelector('.close');
    const form = $('#scheduleMeetingForm');

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        scheduleMeeting();
    };

    $('#scheduleMeetingBtn').addEventListener('click', openScheduleMeetingModal);
};

const openScheduleMeetingModal = async () => {
    const modal = $('#scheduleMeetingModal');
    const agendaTextarea = $('#agenda');
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loadingIndicator';
    loadingIndicator.textContent = 'Generating agenda...';
    
    modal.style.display = 'block';
    agendaTextarea.value = '';
    agendaTextarea.parentNode.insertBefore(loadingIndicator, agendaTextarea);

    try {
        const summary = $('#summary').textContent;
        const recommendations = Array.from($('#recommendations').querySelectorAll('li')).map(li => li.textContent);
        const tasks = Array.from($('#tasksList').querySelectorAll('li')).map(li => li.textContent);

        const inputData = { summary, recommendations, tasks };
        console.log('Input data for agenda generation:', inputData);

        const response = await fetch('/generate_agenda', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Generated agenda response:', data);

        if (data.agenda && Array.isArray(data.agenda)) {
            const formattedAgenda = data.agenda.map(item => 
                `${item.topic} (${item.duration})\n${item.description}`
            ).join('\n\n');
            agendaTextarea.value = formattedAgenda;
        } else {
            throw new Error('Invalid agenda data received');
        }
    } catch (error) {
        console.error('Error generating agenda:', error);
        agendaTextarea.value = 'Error generating agenda. Please try again.';
    } finally {
        loadingIndicator.remove();
    }
};

const scheduleMeeting = () => {
    const form = $('#scheduleMeetingForm');
    const formData = new FormData(form);

    console.log('Meeting scheduled with the following details:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    $('#scheduleMeetingModal').style.display = 'none';
    alert('Встреча успешно запланирована!');
};

document.addEventListener('DOMContentLoaded', initApp);