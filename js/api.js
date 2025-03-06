import { CONFIG } from './config.js';

console.log('API Base URL:', CONFIG.API_BASE_URL);

class Translator {
    static async translate(text) {
        if (!text) return '';
        
        const maxRetries = 3;
        let retryCount = 0;
        let delay = 1000;

        // Dividir el texto en párrafos más pequeños si es muy largo
        const maxChunkSize = 500;
        const chunks = [];
        let currentChunk = '';
        const sentences = text.split('. ');

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxChunkSize) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += (currentChunk ? '. ' : '') + sentence;
            }
        }
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        // Traducir cada chunk
        const translatedChunks = [];
        for (const chunk of chunks) {
            retryCount = 0;
            while (retryCount < maxRetries) {
                try {
                    const encodedText = encodeURIComponent(chunk);
                    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|es&de=cascadeanime@example.com`;
                    
                    console.log('Traduciendo chunk:', chunk.substring(0, 50) + '...');
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log('Respuesta de traducción:', data);

                    if (data.responseData?.translatedText) {
                        translatedChunks.push(data.responseData.translatedText);
                        break; // Éxito, pasar al siguiente chunk
                    } else {
                        throw new Error('Formato de respuesta inválido');
                    }
                } catch (error) {
                    console.error(`Error en intento ${retryCount + 1} de traducción:`, error);
                    retryCount++;
                    
                    if (retryCount === maxRetries) {
                        console.warn('Máximo de intentos alcanzado para chunk, usando texto original');
                        translatedChunks.push(chunk);
                        break;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                }
            }
        }

        return translatedChunks.join('. ');
    }
}

export const AnimeAPI = {
    async fetchTopAnime(page = 1, limit = CONFIG.ITEMS_PER_PAGE) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/top/anime?page=${page}&limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching top anime:', error);
            return { data: [], pagination: { last_visible_page: 1 } };
        }
    },

    async fetchRecentAnime(page = 1, limit = CONFIG.ITEMS_PER_PAGE) {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/anime?status=airing&order_by=popularity&sort=asc&page=${page}&limit=${limit}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching recent anime:', error);
            return { data: [], pagination: { last_visible_page: 1 } };
        }
    },

    async searchAnime(query, page = 1, limit = CONFIG.ITEMS_PER_PAGE) {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error searching anime:', error);
            return { data: [], pagination: { last_visible_page: 1 } };
        }
    },

    async fetchAnimeByGenre(genreId, page = 1, limit = CONFIG.ITEMS_PER_PAGE) {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/anime?genres=${genreId}&page=${page}&limit=${limit}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching anime by genre:', error);
            return { data: [], pagination: { last_visible_page: 1 } };
        }
    },

    async fetchAnimeDetails(id) {
        console.log('Fetching details for anime ID:', id);
        try {
            console.log('Making request to Jikan API...');
            const url = `${CONFIG.API_BASE_URL}/anime/${id}/full`;
            console.log('Fetching from URL:', url);
            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);

            // Traducir la sinopsis si existe
            if (data.data?.synopsis) {
                console.log('Traduciendo sinopsis...');
                try {
                    data.data.synopsis = await Translator.translate(data.data.synopsis);
                    console.log('Sinopsis traducida exitosamente');
                } catch (translationError) {
                    console.error('Error traduciendo sinopsis:', translationError);
                    // Mantener la sinopsis original si hay error
                }
            }

            return data;
        } catch (error) {
            console.error('Error fetching anime details:', error);
            throw error;
        }
    }
};
