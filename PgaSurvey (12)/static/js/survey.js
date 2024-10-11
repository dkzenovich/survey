document.addEventListener('DOMContentLoaded', function() {
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    const questionNumber = document.getElementById('questionNumber');
    const questionText = document.getElementById('questionText');
    const answerInput = document.getElementById('answerInput');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const attachFileBtn = document.getElementById('attachFileBtn');
    const addDiagramBtn = document.getElementById('addDiagramBtn');
    const hintText = document.getElementById('hintText');

    let questions = [];
    let answers = [];
    let currentQuestionIndex = 0;
    let totalQuestions = 0;

    function loadQuestions() {
        const storedQuestions = localStorage.getItem('interviewQuestions');
        if (storedQuestions) {
            questions = JSON.parse(storedQuestions);
            totalQuestions = questions.reduce((total, dept) => total + dept.questions.length, 0);
        } else {
            console.warn('Вопросы не найдены в localStorage. Используем тестовые вопросы.');
            questions = [{ department: 'Общие вопросы', questions: ['Это вопрос номер 1. Здесь будет текст вопроса.', 'Это вопрос номер 2. Здесь будет текст вопроса.'] }];
            totalQuestions = 2;
        }
        answers = new Array(totalQuestions).fill('');
        updateProgress();
        updateQuestion();
    }

    function updateProgress() {
        const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
        if (progressBarFill) progressBarFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `Прогресс: ${currentQuestionIndex + 1}/${totalQuestions} вопросов`;
    }

    function updateQuestion() {
        if (questions.length === 0) return;
        let questionCount = 0;
        for (let dept of questions) {
            if (currentQuestionIndex < questionCount + dept.questions.length) {
                const questionIndex = currentQuestionIndex - questionCount;
                if (questionNumber) questionNumber.textContent = `Вопрос ${currentQuestionIndex + 1}:`;
                if (questionText) questionText.textContent = dept.questions[questionIndex];
                break;
            }
            questionCount += dept.questions.length;
        }
        if (answerInput) answerInput.value = answers[currentQuestionIndex] || '';
        if (hintText) hintText.textContent = `Подсказка для вопроса ${currentQuestionIndex + 1}`;
    }

    function saveAnswer() {
        if (answerInput) answers[currentQuestionIndex] = answerInput.value;
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentQuestionIndex > 0) {
                saveAnswer();
                currentQuestionIndex--;
                updateProgress();
                updateQuestion();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            saveAnswer();
            if (currentQuestionIndex < totalQuestions - 1) {
                currentQuestionIndex++;
                updateProgress();
                updateQuestion();
            } else {
                sendAnswersToServer();
            }
        });
    }

    if (attachFileBtn) {
        attachFileBtn.addEventListener('click', function() {
            alert('Функция прикрепления файла будет реализована позже.');
        });
    }

    if (addDiagramBtn) {
        addDiagramBtn.addEventListener('click', function() {
            alert('Функция добавления диаграммы будет реализована позже.');
        });
    }

    function sendAnswersToServer() {
        const surveyData = {
            questions: questions,
            answers: answers
        };

        fetch('/submit-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(surveyData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            localStorage.setItem('lastSurveyData', JSON.stringify(data.data));
            alert('Survey completed successfully!');
            window.location.href = '/';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while submitting the survey. Please try again.');
        });
    }

    // Инициализация опроса
    loadQuestions();
});
