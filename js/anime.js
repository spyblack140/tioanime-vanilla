import { AnimeAPI } from './api.js';

// Obtener el ID del anime de la URL
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

// Elemento donde mostraremos los detalles
const mainContent = document.getElementById('animeDetails');

async function loadAnimeDetails() {
    try {
        if (!animeId) {
            throw new Error('ID de anime no proporcionado');
        }

        // Mostrar estado de carga
        mainContent.innerHTML = `
            <div class="flex items-center justify-center min-h-[400px]">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        `;

        const response = await AnimeAPI.fetchAnimeDetails(animeId);
        
        if (!response || !response.data) {
            throw new Error('No se encontró el anime');
        }

        const anime = response.data;
        
        mainContent.innerHTML = `
            <div class="md:col-span-1">
                <img src="${anime.images?.jpg?.large_image_url || 'placeholder.jpg'}" 
                     alt="${anime.title}" 
                     class="w-full rounded-lg shadow-lg">
                
                <div class="mt-4 space-y-2">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Puntuación</span>
                        <span class="font-medium">${anime.score || 'N/A'}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Ranking</span>
                        <span class="font-medium">#${anime.rank || 'N/A'}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Popularidad</span>
                        <span class="font-medium">#${anime.popularity || 'N/A'}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Estado</span>
                        <span class="font-medium">${anime.status || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div class="md:col-span-2 space-y-6">
                <div>
                    <h1 class="text-3xl font-bold mb-2">${anime.title}</h1>
                    <h2 class="text-xl text-gray-600 dark:text-gray-400 mb-4">${anime.title_japanese || ''}</h2>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${anime.genres?.map(genre => 
                            `<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                                ${genre.name}
                            </span>`
                        ).join('') || ''}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold mb-2">Sinopsis</h3>
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                        ${anime.synopsis || 'No hay sinopsis disponible.'}
                    </p>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h4 class="text-sm text-gray-600 dark:text-gray-400 mb-1">Tipo</h4>
                        <p class="font-medium">${anime.type || 'N/A'}</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h4 class="text-sm text-gray-600 dark:text-gray-400 mb-1">Episodios</h4>
                        <p class="font-medium">${anime.episodes || 'N/A'}</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h4 class="text-sm text-gray-600 dark:text-gray-400 mb-1">Duración</h4>
                        <p class="font-medium">${anime.duration || 'N/A'}</p>
                    </div>
                </div>
                
                ${anime.trailer?.embed_url ? `
                <div>
                    <h3 class="text-xl font-semibold mb-4">Trailer</h3>
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe 
                            src="${anime.trailer.embed_url}"
                            class="w-full h-[400px] rounded-lg"
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

    } catch (error) {
        console.error('Error cargando detalles del anime:', error);
        mainContent.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-red-600 dark:text-red-400 mb-4">
                    ${error.message || 'Error cargando los detalles del anime. Por favor intenta de nuevo.'}
                </p>
                <a href="../index.html" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Volver al inicio
                </a>
            </div>
        `;
    }
}

// Cargar los detalles cuando la página esté lista
document.addEventListener('DOMContentLoaded', loadAnimeDetails);
