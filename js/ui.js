import { CONFIG } from './config.js';
import { AnimeAPI } from './api.js';
import { debounce, createPagination } from './utils.js';

export const UI = {
    init: function() {
        this.initHeader();
        this.initSearch();
        this.initMobileMenu();
    },

    initHeader: function() {
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (window.scrollY > 10) {
                header.classList.add('bg-white/80', 'dark:bg-gray-900/80', 'backdrop-blur-lg', 'shadow-sm');
            } else {
                header.classList.remove('bg-white/80', 'dark:bg-gray-900/80', 'backdrop-blur-lg', 'shadow-sm');
            }
        });
    }

    initSearch: function() {
        const searchToggle = document.getElementById('searchToggle');
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        // Toggle search bar
        searchToggle.addEventListener('click', () => {
            const isOpen = searchBar.classList.contains('max-h-24');
            searchBar.classList.toggle('max-h-24', !isOpen);
            searchBar.classList.toggle('max-h-0', isOpen);
            searchToggle.innerHTML = isOpen ? 
                '<i class="fas fa-search"></i>' : 
                '<i class="fas fa-times"></i>';
            
            if (!isOpen) {
                searchInput.focus();
            }
        });

        // Handle search input
        const handleSearch = debounce(async (value) => {
            if (value.length < 2) {
                searchResults.classList.add('hidden');
                return;
            }

            try {
                const results = await AnimeAPI.searchAnime(value, 1, 5);
                
                if (results.data.length > 0) {
                    searchResults.innerHTML = results.data.map(anime => `
                        <a 
                            href="/anime/${anime.mal_id}" 
                            class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <img 
                                src="${anime.images.jpg.small_image_url}" 
                                alt="${anime.title}"
                                class="w-10 h-14 object-cover rounded"
                            >
                            <div>
                                <div class="font-medium text-sm">${anime.title}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                    ${anime.type} • ${anime.episodes || '?'} eps
                                </div>
                            </div>
                        </a>
                    `).join('');
                    searchResults.classList.remove('hidden');
                } else {
                    searchResults.innerHTML = `
                        <div class="p-2 text-sm text-gray-500 dark:text-gray-400">
                            No se encontraron resultados
                        </div>
                    `;
                    searchResults.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error searching:', error);
            }
        }, CONFIG.DEBOUNCE_DELAY);

        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }

    initMobileMenu: function() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'md:hidden fixed inset-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg transition-all duration-300 flex flex-col opacity-0 invisible pointer-events-none';
        document.body.appendChild(mobileMenu);

        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('opacity-0');
            mobileMenu.classList.toggle('opacity-0', isOpen);
            mobileMenu.classList.toggle('invisible', isOpen);
            mobileMenu.classList.toggle('pointer-events-none', isOpen);
            
            mobileMenu.innerHTML = `
                <div class="flex justify-end p-4">
                    <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <nav class="flex flex-col items-center justify-center flex-1 gap-6">
                    <a href="/" class="text-xl font-medium hover:text-blue-600 dark:hover:text-blue-400">Inicio</a>
                    <a href="/directorio" class="text-xl font-medium hover:text-blue-600 dark:hover:text-blue-400">Directorio</a>
                    <a href="/emision" class="text-xl font-medium hover:text-blue-600 dark:hover:text-blue-400">Emisión</a>
                    <a href="/generos" class="text-xl font-medium hover:text-blue-600 dark:hover:text-blue-400">Géneros</a>
                    <a href="/favoritos" class="text-xl font-medium hover:text-blue-600 dark:hover:text-blue-400">Favoritos</a>
                </nav>
            `;

            // Close menu when clicking close button
            const closeButton = mobileMenu.querySelector('button');
            closeButton.addEventListener('click', () => {
                mobileMenu.classList.add('opacity-0', 'invisible', 'pointer-events-none');
            });
        });
    }

    updateMainContent: function(content) {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = content;
    }

    updatePagination: function(currentPage, totalPages, onPageChange) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = createPagination(currentPage, totalPages, onPageChange);
    }
}
