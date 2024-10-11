import { elements } from './dom.js';

export const initTabs = () => {
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            elements.tabButtons.forEach(btn => btn.classList.remove('active'));
            elements.tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tabName)?.classList.add('active');
        });
    });

    if (elements.tabButtons.length > 0 && elements.tabContents.length > 0) {
        elements.tabButtons[0].classList.add('active');
        elements.tabContents[0].classList.add('active');
    }
};
