import { AnimeAPI } from './api.js';
import { CONFIG } from './config.js';

let currentPage = 1;
let currentGenre = null;

// Elementos del DOM
const genreList = document.getElementById('genreList');
const animeGrid = document.getElementById('animeGrid');
const pagination = document.getElementById('pagination');
const genreTitle = document.getElementById('genreTitle');

// Lista completa de géneros
const GENRES = {
    1: "Acción",
    2: "Aventura",
    3: "Carreras",
    4: "Comedia",
    5: "Demencia",
    6: "Demonios",
    7: "Misterio",
    8: "Drama",
    9: "Ecchi",
    10: "Fantasía",
    11: "Juegos",
    12: "Hentai",
    13: "Histórico",
    14: "Terror",
    15: "Infantil",
    16: "Artes Marciales",
    17: "Mecha",
    18: "Música",
    19: "Parodia",
    20: "Samurai",
    21: "Romance",
    22: "Escolar",
    23: "Sci-Fi",
    24: "Shoujo",
    25: "Shoujo Ai",
    26: "Shounen",
    27: "Shounen Ai",
    28: "Espacio",
    29: "Deportes",
    30: "Super Poder",
    31: "Vampiros",
    32: "Yaoi",
    33: "Yuri",
    34: "Harem",
    35: "Slice of Life",
    36: "Sobrenatural",
    37: "Militar",
    38: "Policiaco",
    39: "Psicológico",
    40: "Thriller",
    41: "Seinen",
    42: "Josei"
};

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
    button.onclick = () => loadAnimeByGenre(currentGenre, page);
    return button;
}

function renderPagination(currentPage, totalPages) {
    pagination.innerHTML = '';
    
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

// Función para crear la lista de géneros
function createGenreList() {
    genreList.innerHTML = '';
    
    Object.entries(GENRES).forEach(([id, name]) => {
        const button = document.createElement('button');
        button.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm';
        button.textContent = name;
        button.onclick = () => {
            currentGenre = id;
            loadAnimeByGenre(id, 1);
            
            // Actualizar título
            genreTitle.textContent = `Anime de ${name}`;
            
            // Actualizar botón activo
            document.querySelectorAll('#genreList button').forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-white', 'dark:bg-gray-800');
            });
            button.classList.remove('bg-white', 'dark:bg-gray-800');
            button.classList.add('bg-blue-600', 'text-white');
        };
        genreList.appendChild(button);
    });
}

// Función principal para cargar anime por género
async function loadAnimeByGenre(genreId, page = 1) {
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
            `${CONFIG.API_BASE_URL}/anime?genres=${genreId}&page=${page}&limit=${CONFIG.ITEMS_PER_PAGE}&order_by=popularity`
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
        console.error('Error loading anime by genre:', error);
        animeGrid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-red-600 dark:text-red-400">Error cargando la lista de anime. Por favor intenta de nuevo.</p>
            </div>
        `;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    createGenreList();
    // Cargar el primer género por defecto
    loadAnimeByGenre(1, 1);
});
