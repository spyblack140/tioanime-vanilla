import { CONFIG } from './config.js';
import { AnimeAPI } from './api.js';

// Variables globales
let currentPage = 1;

// Elementos del DOM
const animeGrid = document.getElementById('animeGrid');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Funciones de utilidad
function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg';
    
    card.innerHTML = `
        <a href="pages/anime.html?id=${anime.mal_id}">
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
    
    // Siempre mostrar primera página
    pagination.appendChild(createPaginationButton(1, currentPage === 1));
    
    // Puntos suspensivos iniciales si necesario
    if (currentPage > 3) {
        const dots = document.createElement('span');
        dots.className = 'px-2 py-1';
        dots.textContent = '...';
        pagination.appendChild(dots);
    }
    
    // Páginas alrededor de la página actual
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pagination.appendChild(createPaginationButton(i, i === currentPage));
    }
    
    // Puntos suspensivos finales si necesario
    if (currentPage < totalPages - 2) {
        const dots = document.createElement('span');
        dots.className = 'px-2 py-1';
        dots.textContent = '...';
        pagination.appendChild(dots);
    }
    
    // Siempre mostrar última página
    if (totalPages > 1) {
        pagination.appendChild(createPaginationButton(totalPages, currentPage === totalPages));
    }
}

// Funciones principales
async function loadAnimeList(page = 1) {
    try {
        animeGrid.innerHTML = ''; // Limpiar grid
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
        const data = await AnimeAPI.fetchTopAnime(page);
        
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

// Búsqueda
let searchTimeout;
async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (query.length < 3) {
        searchResults.classList.add('hidden');
        return;
    }
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const data = await AnimeAPI.searchAnime(query, 1, 5);
            
            if (data.data.length === 0) {
                searchResults.innerHTML = `
                    <div class="p-4 text-sm text-gray-600 dark:text-gray-400">
                        No se encontraron resultados
                    </div>
                `;
            } else {
                searchResults.innerHTML = data.data.map(anime => `
                    <a href="pages/anime.html?id=${anime.mal_id}" 
                       class="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <img src="${anime.images.jpg.small_image_url}" 
                             alt="${anime.title}"
                             class="w-12 h-16 object-cover rounded">
                        <div>
                            <h4 class="text-sm font-medium line-clamp-1">${anime.title}</h4>
                            <p class="text-xs text-gray-600 dark:text-gray-400">
                                ${anime.type} • ${anime.episodes || '?'} eps
                            </p>
                        </div>
                    </a>
                `).join('');
            }
            
            searchResults.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error searching anime:', error);
            searchResults.innerHTML = `
                <div class="p-4 text-sm text-red-600 dark:text-red-400">
                    Error al buscar. Por favor intenta de nuevo.
                </div>
            `;
        }
    }, CONFIG.DEBOUNCE_DELAY);
}

// Event Listeners
searchInput.addEventListener('input', handleSearch);
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 3) {
        searchResults.classList.remove('hidden');
    }
});

// Click fuera para cerrar resultados
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadAnimeList();
});
