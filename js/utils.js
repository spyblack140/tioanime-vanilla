// Debounce function for search
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format number to K/M format
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Create anime card HTML
function createAnimeCard(anime) {
    return `
        <a href="/anime/${anime.mal_id}" class="anime-card" data-id="${anime.mal_id}">
            <div class="relative aspect-[3/4] rounded-lg overflow-hidden">
                <img 
                    src="${anime.images.jpg.large_image_url}" 
                    alt="${anime.title}"
                    class="w-full h-full object-cover"
                    loading="lazy"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                        <h3 class="text-white text-sm font-medium line-clamp-2">${anime.title}</h3>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-gray-300">${anime.type || 'TV'}</span>
                            <span class="text-xs text-gray-300">•</span>
                            <span class="text-xs text-gray-300">${anime.episodes || '?'} eps</span>
                            ${anime.score ? `
                                <span class="text-xs text-gray-300">•</span>
                                <span class="text-xs text-yellow-400">★ ${anime.score}</span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </a>
    `;
}

// Create pagination HTML
export function createPagination(currentPage, totalPages, onPageChange) {
    const maxPages = Math.min(totalPages, 100);
    let html = '';
    
    // Previous button
    html += `
        <button 
            class="px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}"
            ${currentPage === 1 ? 'disabled' : `onclick="${onPageChange}(${currentPage - 1})"`}
        >
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Page numbers
    for (let i = 1; i <= maxPages; i++) {
        if (
            i === 1 || // First page
            i === maxPages || // Last page
            (i >= currentPage - 2 && i <= currentPage + 2) // Pages around current page
        ) {
            html += `
                <button 
                    class="px-3 py-1 rounded-md ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}"
                    onclick="${onPageChange}(${i})"
                >
                    ${i}
                </button>
            `;
        } else if (
            (i === currentPage - 3 && currentPage > 4) ||
            (i === currentPage + 3 && currentPage < maxPages - 3)
        ) {
            html += '<span class="px-2">...</span>';
        }
    }

    // Next button
    html += `
        <button 
            class="px-3 py-1 rounded-md ${currentPage === maxPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}"
            ${currentPage === maxPages ? 'disabled' : `onclick="${onPageChange}(${currentPage + 1})"`}
        >
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    return html;
}

import { CONFIG } from './config.js';

// Utils object to avoid global namespace pollution
export const Utils = {
    // Show loading skeleton
    showLoadingSkeleton: function() {
        const mainContent = document.getElementById('mainContent');
        const template = document.getElementById('skeletonTemplate');
        
        if (!mainContent || !template) {
            console.warn('Required DOM elements not found');
            return;
        }
        
        mainContent.innerHTML = '';
        for (let i = 0; i < CONFIG.ITEMS_PER_PAGE; i++) {
            mainContent.innerHTML += template.innerHTML;
        }
    },

    // Handle API errors
    handleError: function(error) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) {
            console.error('Main content element not found');
        return;
    }
    mainContent.innerHTML = `
        <div class="col-span-full text-center py-10">
            <p class="text-lg text-red-500 mb-4">${error}</p>
            <button 
                onclick="window.location.reload()" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                Reintentar
            </button>
        </div>
    `;
}
