import { AnimeAPI } from './api.js';
import { CONFIG } from './config.js';

let currentPage = 1;
let currentSort = 'title';
let currentOrder = 'asc';

// Elementos del DOM
const animeGrid = document.getElementById('animeGrid');
const pagination = document.getElementById('pagination');
const sortSelect = document.getElementById('sortSelect');
const orderSelect = document.getElementById('orderSelect');

// Funciones de utilidad
function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg';
    
    card.innerHTML = `
        <a href="anime.html?id=${anime.mal_id}">
            <img src="${anime.images.jpg.large_image_url}" 
                 alt="${anime.title}" 
                 class="w-full h-64 object-cover"
                 loading="lazy">
            <div class="p-4">
                <h3 class="text-sm font-medium line-clamp-2">${anime.title}</h3>
                <div class="mt-2 flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <span>${anime.type || 'TV'}</span>
                    <span class="mx-2">•</span>
                    <span>${anime.episodes || '?'} eps</span>
                </div>
            </div>
        </a>
    `;
    
    return card;
}

function createPaginationButton(page, isActive = false) {
    const button = document.createElement('button');
    button.className = `px-3 py-1 rounded-md text-sm font-medium ${
        isActive 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;
    button.textContent = page;
    button.onclick = () => loadAnimeList(page);
    return button;
}

function renderPagination(currentPage, totalPages) {
    pagination.innerHTML = '';
    
    // Primera página
    pagination.appendChild(createPaginationButton(1, currentPage === 1));
    
    if (currentPage > 3) {
        const dots = document.createElement('span');
        dots.className = 'px-2 py-1';
        dots.textContent = '...';
        pagination.appendChild(dots);
    }
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pagination.appendChild(createPaginationButton(i, i === currentPage));
    }
    
    if (currentPage < totalPages - 2) {
        const dots = document.createElement('span');
        dots.className = 'px-2 py-1';
        dots.textContent = '...';
        pagination.appendChild(dots);
    }
    
    if (totalPages > 1) {
        pagination.appendChild(createPaginationButton(totalPages, currentPage === totalPages));
    }
}

// Función principal para cargar la lista de anime
async function loadAnimeList(page = 1) {
    try {
        animeGrid.innerHTML = '';
        currentPage = page;
        
        // Mostrar loading skeleton
        for (let i = 0; i < CONFIG.ITEMS_PER_PAGE; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton space-y-2';
            skeleton.innerHTML = `
                <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            `;
            animeGrid.appendChild(skeleton);
        }
        
        // Cargar datos
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/anime?page=${page}&limit=${CONFIG.ITEMS_PER_PAGE}&order_by=${currentSort}&sort=${currentOrder}`
        );
        const data = await response.json();
        
        // Limpiar skeletons
        animeGrid.innerHTML = '';
        
        // Renderizar anime cards
        data.data.forEach(anime => {
            animeGrid.appendChild(createAnimeCard(anime));
        });
        
        // Actualizar paginación
        const totalPages = Math.ceil(data.pagination.items.total / CONFIG.ITEMS_PER_PAGE);
        renderPagination(page, totalPages);
        
    } catch (error) {
        console.error('Error loading anime list:', error);
        animeGrid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-red-600 dark:text-red-400">Error cargando la lista de anime. Por favor intenta de nuevo.</p>
            </div>
        `;
    }
}

// Event Listeners
sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    loadAnimeList(1);
});

orderSelect.addEventListener('change', () => {
    currentOrder = orderSelect.value;
    loadAnimeList(1);
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadAnimeList();
});
