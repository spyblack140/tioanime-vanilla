import { UI } from './ui.js';
import { AnimeAPI } from './api.js';
import { Utils } from './utils.js';

import { CONFIG } from './config.js';
import { UI } from './ui.js';
import { AnimeAPI } from './api.js';
import { Utils } from './utils.js';

export const Router = {
    renderAnimeGrid: function(animeList) {
        return animeList.map(anime => `
            <a href="/anime/${anime.mal_id}" class="group relative">
                <div class="aspect-w-2 aspect-h-3 rounded-lg overflow-hidden">
                    <img 
                        src="${anime.images.jpg.large_image_url}" 
                        alt="${anime.title}"
                        class="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-200"
                    >
                </div>
                <h3 class="mt-2 text-sm font-medium truncate">${anime.title}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    ${anime.type} • ${anime.episodes || '?'} eps
                </p>
            </a>
        `).join('');
    },
    init: async function() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initRouter());
        } else {
            this.initRouter();
        }
    }

    initRouter: async function() {
        // Handle initial route
        this.handleRoute();

        // Handle navigation
        window.addEventListener('popstate', () => this.handleRoute());

        // Handle link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const url = new URL(link.href);
                history.pushState({}, '', url.pathname);
                this.handleRoute();
            }
        });
    }

    handleRoute: async function() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) {
            console.error('Main content element not found');
            return;
        }

        // Normalizar la ruta
        let path = window.location.pathname;
        if (path === '/index.html') path = '/';
        
        // Actualizar título de la página
        const titles = {
            '/': 'AnimeVision - Inicio',
            '/directorio': 'Directorio de Anime',
            '/emision': 'Anime en Emisión',
            '/generos': 'Géneros de Anime',
            '/favoritos': 'Mis Favoritos'
        };
        document.title = titles[path] || 'AnimeVision';

        // Mostrar loading skeleton
        Utils.showLoadingSkeleton();

        try {
            let content = '';
            let page = new URLSearchParams(window.location.search).get('page') || 1;
            
            switch(path) {
                case '/':
                    const topAnime = await AnimeAPI.fetchTopAnime(page);
                    content = this.renderAnimeGrid(topAnime.data);
                    break;
                    
                case '/emision':
                    const recentAnime = await AnimeAPI.fetchRecentAnime(page);
                    content = this.renderAnimeGrid(recentAnime.data);
                    break;
                    
                default:
                    content = '<div class="text-center py-10"><h1 class="text-2xl">Página no encontrada</h1></div>';
            }
            
            UI.updateMainContent(content);
        } catch (error) {
            Utils.handleError('Error al cargar el contenido');
        }

        showLoadingSkeleton();

        try {
            if (path === '/' || path === '/index.html') {
                const [topAnime, recentAnime] = await Promise.all([
                    AnimeAPI.fetchTopAnime(1, 12),
                    AnimeAPI.fetchRecentAnime(1, 12)
                ]);

                mainContent.innerHTML = `
                    <div class="col-span-full mb-8">
                        <h2 class="text-2xl font-bold mb-4">Top Anime</h2>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            ${topAnime.data.map(anime => createAnimeCard(anime)).join('')}
                        </div>
                    </div>
                    <div class="col-span-full">
                        <h2 class="text-2xl font-bold mb-4">Últimos Episodios</h2>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            ${recentAnime.data.map(anime => createAnimeCard(anime)).join('')}
                        </div>
                    </div>
                `;

            } else if (path === '/directorio') {
                const results = await AnimeAPI.fetchTopAnime(page);
                mainContent.innerHTML = results.data.map(anime => createAnimeCard(anime)).join('');
                UI.updatePagination(page, results.pagination.last_visible_page, 'Router.goToPage');

            } else if (path.startsWith('/generos/')) {
                const genreId = path.split('/').pop();
                const results = await AnimeAPI.fetchAnimeByGenre(genreId, page);
                const genreName = CONFIG.GENRES[genreId] || 'Género';
                
                document.querySelector('h1').textContent = `Anime de ${genreName}`;
                mainContent.innerHTML = results.data.map(anime => createAnimeCard(anime)).join('');
                UI.updatePagination(page, results.pagination.last_visible_page, 'Router.goToPage');

            } else if (path.startsWith('/anime/')) {
                const animeId = path.split('/').pop();
                const anime = await AnimeAPI.fetchAnimeDetails(animeId);
                
                if (anime) {
                    mainContent.innerHTML = `
                        <div class="col-span-full">
                            <div class="flex flex-col md:flex-row gap-8">
                                <div class="w-full md:w-1/3 lg:w-1/4">
                                    <img 
                                        src="${anime.images.jpg.large_image_url}" 
                                        alt="${anime.title}"
                                        class="w-full rounded-lg shadow-lg"
                                    >
                                </div>
                                <div class="flex-1">
                                    <h1 class="text-3xl font-bold mb-4">${anime.title}</h1>
                                    <p class="text-gray-600 dark:text-gray-400 mb-4">${anime.synopsis}</p>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 class="font-medium mb-2">Información</h3>
                                            <ul class="space-y-1 text-sm">
                                                <li><span class="font-medium">Tipo:</span> ${anime.type}</li>
                                                <li><span class="font-medium">Episodios:</span> ${anime.episodes || '?'}</li>
                                                <li><span class="font-medium">Estado:</span> ${anime.status}</li>
                                                <li><span class="font-medium">Puntuación:</span> ★ ${anime.score || '?'}</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 class="font-medium mb-2">Géneros</h3>
                                            <div class="flex flex-wrap gap-2">
                                                ${anime.genres.map(genre => `
                                                    <a 
                                                        href="/generos/${genre.mal_id}"
                                                        class="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    >
                                                        ${genre.name}
                                                    </a>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    handleError('No se pudo cargar el anime');
                }
            } else {
                mainContent.innerHTML = `
                    <div class="col-span-full text-center py-10">
                        <h1 class="text-3xl font-bold mb-4">404 - Página no encontrada</h1>
                        <p class="text-gray-600 dark:text-gray-400 mb-4">
                            La página que buscas no existe.
                        </p>
                        <a 
                            href="/" 
                            class="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Volver al inicio
                        </a>
                    </div>
                `;
            }
        } catch (error) {
            handleError('Error al cargar el contenido');
        }
    }

    static async goToPage(newPage) {
        const path = window.location.pathname;
        showLoadingSkeleton();

        try {
            let results;
            if (path === '/directorio') {
                results = await AnimeAPI.fetchTopAnime(newPage);
            } else if (path.startsWith('/generos/')) {
                const genreId = path.split('/').pop();
                results = await AnimeAPI.fetchAnimeByGenre(genreId, newPage);
            }

            if (results) {
                const mainContent = document.getElementById('mainContent');
                mainContent.innerHTML = results.data.map(anime => createAnimeCard(anime)).join('');
                UI.updatePagination(newPage, results.pagination.last_visible_page, 'Router.goToPage');
            }
        } catch (error) {
            handleError('Error al cargar la página');
        }
    }
}
