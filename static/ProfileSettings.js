document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profile-btn');
    const sidePanel = document.getElementById('side-panel');
    const closePanel = document.getElementById('close-panel');
    const overlay = document.getElementById('panel-overlay');

    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Iwasan ang default action
            sidePanel.classList.add('active');
            overlay.classList.add('active');
            console.log("Panel opened"); // I-check sa console (F12) kung lumalabas ito
        });
    }

    function closeSidePanel() {
        sidePanel.classList.remove('active');
        overlay.classList.remove('active');
    }

    if (closePanel) closePanel.addEventListener('click', closeSidePanel);
    if (overlay) overlay.addEventListener('click', closeSidePanel);
});