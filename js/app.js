import { UI } from './ui.js';
import { Router } from './router.js';

// Initialize the application when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    console.log('Initializing app...');
    // Initialize UI components
    UI.init();
    
    // Initialize router
    Router.init();
}
