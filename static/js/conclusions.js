import { $ } from './utils.js';

export const updateConclusionsTab = async (surveyData) => {
    console.log('Updating Conclusions tab with survey data:', surveyData);
    try {
        const summaryAndRecommendations = await getSummaryAndRecommendations(surveyData);
        console.log('Received summary and recommendations:', summaryAndRecommendations);

        const recommendedTasks = await getRecommendedTasks(summaryAndRecommendations);
        console.log('Received recommended tasks:', recommendedTasks);

        updateConclusionsTabContent(summaryAndRecommendations, recommendedTasks);
        navigateToConclusionsTab();
    } catch (error) {
        console.error('Error in updateConclusionsTab:', error);
        displayErrorMessage('An error occurred while updating the Conclusions tab. Please try again.');
    }
};

const updateConclusionsTabContent = (summaryAndRecommendations, recommendedTasks) => {
    console.log('Updating Conclusions tab content');
    const conclusionsTab = document.getElementById('conclusions');
    if (conclusionsTab) {
        updateElement('summary', summaryAndRecommendations.summary);
        updateElement('recommendations', summaryAndRecommendations.recommendations);
        updateElement('tasksList', recommendedTasks.tasks);
    } else {
        console.error('Conclusions tab not found');
        throw new Error('Conclusions tab element not found');
    }
};

const navigateToConclusionsTab = () => {
    const conclusionsTabButton = document.querySelector('.tab-btn[data-tab="conclusions"]');
    if (conclusionsTabButton) {
        conclusionsTabButton.click();
    } else {
        console.error('Conclusions tab button not found');
    }
};

const updateElement = (elementId, content) => {
    console.log(`Updating element: ${elementId}`);
    const element = document.getElementById(elementId);
    if (element) {
        if (Array.isArray(content)) {
            element.innerHTML = content.map(item => `<li contenteditable="true">${item}</li>`).join('');
        } else {
            element.textContent = content;
        }
        console.log(`Updated ${elementId} with content:`, content);
    } else {
        console.error(`Element with id '${elementId}' not found`);
        throw new Error(`Element with id '${elementId}' not found`);
    }
};

const getSummaryAndRecommendations = async (surveyData) => {
    console.log('Fetching summary and recommendations');
    try {
        const response = await fetch('/get_summary_and_recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ collected_data: surveyData }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received summary and recommendations:', data);

        if (!data || typeof data.summary !== 'string' || !Array.isArray(data.recommendations)) {
            console.error('Invalid data structure received from server:', data);
            throw new Error('Invalid data structure received from server');
        }

        return data;
    } catch (error) {
        console.error('Error in getSummaryAndRecommendations:', error);
        throw error;
    }
};

const getRecommendedTasks = async (summaryAndRecommendations) => {
    console.log('Fetching recommended tasks');
    try {
        const response = await fetch('/get_recommended_tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ summary_and_recommendations: summaryAndRecommendations }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received recommended tasks:', data);

        if (!data || !Array.isArray(data.tasks)) {
            console.error('Invalid data structure received from server:', data);
            throw new Error('Invalid data structure received from server');
        }

        return data;
    } catch (error) {
        console.error('Error in getRecommendedTasks:', error);
        throw error;
    }
};

export const displayErrorMessage = (message) => {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.textContent = message;
    document.body.appendChild(errorContainer);
    setTimeout(() => {
        errorContainer.remove();
    }, 5000);
};
