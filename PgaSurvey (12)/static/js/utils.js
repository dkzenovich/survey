// Utility functions
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export const getStatusText = (status) => {
    const statusMap = {
        completed: 'Завершено',
        'in-progress': 'В процессе',
        planned: 'Запланировано'
    };
    return statusMap[status] || 'Неизвестно';
};
