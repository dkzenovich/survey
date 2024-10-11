document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('scheduleMeetingModal');
    const openModalBtn = document.getElementById('scheduleMeetingBtn');
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('scheduleMeetingForm');

    openModalBtn.onclick = () => {
        modal.style.display = 'block';
    };

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Remove the form.onsubmit event listener, as it's now handled in main.js
});
