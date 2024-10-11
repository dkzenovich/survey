import { updateProgressBar } from './dom.js';

export const displayKeyAspects = (aspects) => {
    const keyAspectsTab = document.getElementById('keyAspects');
    if (keyAspectsTab) {
        keyAspectsTab.innerHTML = `
            <h2 class="tab-title">Ключевые аспекты</h2>
            <ul class="key-aspects-list"></ul>
            <div class="key-aspects-actions">
                <button class="add-aspect-btn btn-secondary">Добавить новый аспект</button>
                <button id="continueAnalysisBtn" class="btn-primary">Продолжить анализ</button>
            </div>
        `;

        const aspectsList = keyAspectsTab.querySelector('.key-aspects-list');

        if (Array.isArray(aspects) && aspects.length > 0) {
            aspects.forEach((aspect, index) => {
                aspectsList.appendChild(createAspectElement(aspect, index));
            });
        } else {
            console.error('Аспекты не являются корректным массивом:', aspects);
            aspectsList.innerHTML = '<li class="error-message">Ошибка: Не удалось отобразить ключевые аспекты. Пожалуйста, попробуйте снова.</li>';
        }

        keyAspectsTab.querySelector('.add-aspect-btn').addEventListener('click', addNewAspect);
        keyAspectsTab.querySelector('#continueAnalysisBtn').addEventListener('click', continueAnalysis);
    } else {
        console.error('Вкладка ключевых аспектов не найдена');
    }
    updateProgressBar(20);
};

const createAspectElement = (aspect, index) => {
    const li = document.createElement('li');
    li.className = 'aspect-item';
    li.innerHTML = `
        <span class="aspect-text">${aspect}</span>
        <div class="aspect-actions">
            <button class="edit-aspect-btn btn-secondary" data-index="${index}">Редактировать</button>
            <button class="delete-aspect-btn btn-secondary" data-index="${index}">Удалить</button>
        </div>
    `;
    li.querySelector('.edit-aspect-btn').addEventListener('click', () => editAspect(index));
    li.querySelector('.delete-aspect-btn').addEventListener('click', () => deleteAspect(index));
    return li;
};

const editAspect = (index) => {
    const aspectElement = document.querySelector(`.key-aspects-list li:nth-child(${parseInt(index) + 1})`);
    const aspectText = aspectElement.querySelector('.aspect-text');
    const currentText = aspectText.textContent;

    aspectElement.innerHTML = `
        <input type="text" class="edit-aspect-input" value="${currentText}">
        <div class="aspect-actions">
            <button class="save-aspect-btn btn-primary">Сохранить</button>
            <button class="cancel-edit-btn btn-secondary">Отмена</button>
        </div>
    `;

    const input = aspectElement.querySelector('.edit-aspect-input');
    const saveButton = aspectElement.querySelector('.save-aspect-btn');
    const cancelButton = aspectElement.querySelector('.cancel-edit-btn');

    saveButton.addEventListener('click', () => {
        const newText = input.value.trim();
        if (newText) {
            aspectElement.replaceWith(createAspectElement(newText, index));
        }
    });

    cancelButton.addEventListener('click', () => {
        aspectElement.replaceWith(createAspectElement(currentText, index));
    });
};

const deleteAspect = (index) => {
    const aspectElement = document.querySelector(`.key-aspects-list li:nth-child(${parseInt(index) + 1})`);
    aspectElement.remove();
};

const addNewAspect = () => {
    const aspectsList = document.querySelector('.key-aspects-list');
    const newIndex = aspectsList.children.length;

    const newLi = document.createElement('li');
    newLi.className = 'aspect-item new-aspect';
    newLi.innerHTML = `
        <input type="text" class="new-aspect-input" placeholder="Введите новый аспект">
        <div class="aspect-actions">
            <button class="save-new-aspect-btn btn-primary">Сохранить</button>
            <button class="cancel-new-aspect-btn btn-secondary">Отмена</button>
        </div>
    `;
    aspectsList.appendChild(newLi);

    const input = newLi.querySelector('.new-aspect-input');
    const saveButton = newLi.querySelector('.save-new-aspect-btn');
    const cancelButton = newLi.querySelector('.cancel-new-aspect-btn');

    saveButton.addEventListener('click', () => {
        const newText = input.value.trim();
        if (newText) {
            newLi.replaceWith(createAspectElement(newText, newIndex));
        } else {
            newLi.remove();
        }
    });

    cancelButton.addEventListener('click', () => {
        newLi.remove();
    });

    input.focus();
};

const continueAnalysis = () => {
    console.log('Функция continueAnalysis вызвана');
    const aspectTexts = document.querySelectorAll('.key-aspects-list .aspect-text');
    const aspects = Array.from(aspectTexts).map(aspect => aspect.textContent);
    console.log('Аспекты для отправки:', aspects);

    fetch('/continue_analysis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aspects: aspects }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Полученные данные:', data);
        displayProblems(data.problems);
        displayRelevantDepartments(data.relevant_departments);
        displayInterviewQuestions(data.interview_questions);

        // Переключение на вкладку "План исследования"
        const researchPlanTab = document.querySelector('.tab-btn[data-tab="researchPlan"]');
        researchPlanTab?.click();
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при продолжении анализа. Пожалуйста, попробуйте снова.');
    });
};

const displayProblems = (problems) => {
    console.log('Проблемы:', problems);
};

const displayRelevantDepartments = (departmentsData) => {
    const departmentList = document.getElementById('departmentList');
    if (departmentList) {
        let departments;
        if (typeof departmentsData === 'string') {
            try {
                departments = JSON.parse(departmentsData);
            } catch (e) {
                console.error('Ошибка при парсинге данных отделов:', e);
                departments = null;
            }
        } else {
            departments = departmentsData;
        }

        if (departments && departments.departments && Array.isArray(departments.departments)) {
            departmentList.innerHTML = departments.departments.map(dept => `<li>${dept}</li>`).join('');
        } else {
            console.error('Неверный формат данных отделов:', departmentsData);
            departmentList.innerHTML = '<li>Ошибка: Не удалось загрузить отделы</li>';
        }
    } else {
        console.error('Элемент списка отделов не найден');
    }
};

const displayInterviewQuestions = (questionsData) => {
    const questionsList = document.getElementById('questionsList');
    if (questionsList) {
        let questions;
        if (typeof questionsData === 'string') {
            try {
                questions = JSON.parse(questionsData);
            } catch (e) {
                console.error('Ошибка при парсинге данных вопросов:', e);
                questions = null;
            }
        } else {
            questions = questionsData;
        }

        if (questions && typeof questions === 'object' && questions !== null) {
            questionsList.innerHTML = Object.entries(questions).map(([dept, deptQuestions]) => `
                <div class="department-questions">
                    <h4>${dept}</h4>
                    <ul>
                        ${Array.isArray(deptQuestions) ? deptQuestions.map(q => `<li>${q}</li>`).join('') : '<li>Ошибка: Неверный формат вопросов</li>'}
                    </ul>
                </div>
            `).join('');
        } else {
            console.error('Неверный формат данных вопросов:', questionsData);
            questionsList.innerHTML = '<div>Ошибка: Не удалось загрузить вопросы</div>';
        }
    } else {
        console.error('Элемент списка вопросов не найден');
    }
};
