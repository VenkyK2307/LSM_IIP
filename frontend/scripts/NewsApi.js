

const apiKey = 'a051c9ef4e5b32a6694378c9f3d44fc3';
const apiUrl = `https://gnews.io/api/v4/search?q=stocks&category=business&lang=en&country=in&apikey=${apiKey}`;

async function fetchNews() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const newsContainer = document.getElementById('news-container');
        newsContainer.innerHTML = ''; // Clear existing content

        data.articles.forEach(article => {
            // Skip articles from LiveMint
         

            const newsCard = document.createElement('div');
            newsCard.classList.add('bg-white', 'rounded-lg', 'shadow-lg', 'overflow-hidden', 'transition-transform', 'hover:scale-105');

            newsCard.innerHTML = `
                <img class="w-full h-48 object-cover" src="${article.image || 'https://via.placeholder.com/300x180'}" alt="Image">
                <div class="p-4">
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">
                        <a href="${article.url}" target="_blank" class="text-blue-600 hover:underline">${article.title}</a>
                    </h2>
                    <p class="text-sm text-gray-600 mb-4 truncate">${article.description || 'No description available'}</p>
                </div>
                <div class="p-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <span>${new Date(article.publishedAt).toLocaleString()}</span>
                    <a href="${article.source.url}" target="_blank" class="text-blue-600 hover:underline">${article.source.name}</a>
                </div>
            `;

            newsContainer.appendChild(newsCard);
        });
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

// Fetch news when the page loads
window.onload = fetchNews;
