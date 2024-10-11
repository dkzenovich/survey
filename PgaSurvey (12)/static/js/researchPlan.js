import { CONFIG } from './config.js';
import { updateProgressBar } from './dom.js';

export const generateResearchPlan = (question) => {
    updateProgressBar(40);
    // TODO: Replace this placeholder with an actual API call
    displayResearchPlan(CONFIG.placeholderPlan);
};

export const displayResearchPlan = (plan) => {
    updateProgressBar(80);
    const researchPlanTab = document.getElementById('researchPlan');
    if (researchPlanTab) {
        researchPlanTab.innerHTML = `
            <h2 class="tab-title">План исследования</h2>
            <div class="research-plan-section">
                <h3>Релевантные отделы</h3>
                <ul id="departmentList"></ul>
                <button id="editDepartmentsBtn" class="btn-secondary">Редактировать отделы</button>
            </div>
            <div class="research-plan-section">
                <h3>Вопросы для интервью</h3>
                <div id="questionsList"></div>
                <button id="editQuestionsBtn" class="btn-secondary">Редактировать вопросы</button>
                <button id="regenerateQuestionsBtn" class="btn-secondary">Перегенерировать вопросы</button>
            </div>
            <button id="saveChangesBtn" class="btn-primary">Сохранить изменения</button>
            <button id="startResearchBtn" class="btn-primary">Начать исследование</button>
        `;

        const departmentList = document.getElementById('departmentList');
        const questionsList = document.getElementById('questionsList');

        // Display departments
        departmentList.innerHTML = plan.departments.map(dept => `<li>${dept}</li>`).join('');

        // Display questions for each department
        questionsList.innerHTML = Object.entries(plan.questions).map(([dept, questions]) => `
            <div class="department-questions">
                <h4>${dept}</h4>
                <ul>
                    ${questions.map(q => `<li>${q}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        // Add event listeners for buttons
        document.getElementById('editDepartmentsBtn').addEventListener('click', editDepartments);
        document.getElementById('editQuestionsBtn').addEventListener('click', editQuestions);
        document.getElementById('regenerateQuestionsBtn').addEventListener('click', regenerateQuestions);
        document.getElementById('saveChangesBtn').addEventListener('click', saveChanges);
        document.getElementById('startResearchBtn').addEventListener('click', startResearch);
    }
};

const editDepartments = () => {
    const departmentList = document.getElementById('departmentList');
    const departments = Array.from(departmentList.children).map(li => li.textContent);
    departmentList.innerHTML = departments.map(dept => `
        <li><input type="text" value="${dept}" class="edit-input"></li>
    `).join('');
    toggleEditButton('editDepartmentsBtn', 'Сохранить', saveDepartments);
};

const saveDepartments = () => {
    const departmentList = document.getElementById('departmentList');
    const departments = Array.from(departmentList.querySelectorAll('input')).map(input => input.value);
    departmentList.innerHTML = departments.map(dept => `<li>${dept}</li>`).join('');
    toggleEditButton('editDepartmentsBtn', 'Редактировать отделы', editDepartments);
};

const editQuestions = () => {
    const questionsList = document.getElementById('questionsList');
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
    const questionsList = document.getElementById('questionsList');
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
    const button = document.getElementById(buttonId);
    button.textContent = text;
    const oldListener = text === 'Сохранить' ? editDepartments : saveDepartments;
    button.removeEventListener('click', oldListener);
    button.addEventListener('click', newListener);
};

const regenerateQuestions = () => {
    // TODO: Implement API call to regenerate questions
    alert('Функция перегенерации вопросов будет реализована позже.');
};

const saveChanges = () => {
    // TODO: Implement API call to save changes
    alert('Изменения сохранены успешно!');
};

const startResearch = () => {
    console.log('Функция startResearch вызвана');
    const questionsList = document.getElementById('questionsList');
    console.log('questionsList:', questionsList);
    if (questionsList) {
        const questions = [];
        const departmentQuestions = questionsList.querySelectorAll('.department-questions');
        console.log('departmentQuestions:', departmentQuestions);
        departmentQuestions.forEach(deptQuestions => {
            const department = deptQuestions.querySelector('h4').textContent;
            const departmentQuestionsList = Array.from(deptQuestions.querySelectorAll('li')).map(li => li.textContent);
            questions.push({ department, questions: departmentQuestionsList });
        });
        console.log('Собранные вопросы:', questions);
        localStorage.setItem('interviewQuestions', JSON.stringify(questions));
        console.log('Вопросы сохранены в localStorage');
        console.log('Перенаправление на /survey');
        window.location.href = '/survey';
    } else {
        console.error('Список вопросов не найден');
        alert('Произошла ошибка при начале исследования. Пожалуйста, попробуйте снова.');
    }
};
