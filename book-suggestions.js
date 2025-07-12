// Book suggestions app functionality
class BookSage {
    constructor() {
        this.books = this.getBookData();
        this.readingList = this.loadReadingList();
        this.currentBooks = [...this.books];
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderFeaturedBooks();
        this.renderReadingList();
        this.setupGenreCards();
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Filter functionality
        document.getElementById('genreFilter').addEventListener('change', () => this.filterBooks());
        document.getElementById('ratingFilter').addEventListener('change', () => this.filterBooks());
        document.getElementById('sortBy').addEventListener('change', () => this.filterBooks());

        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => this.closeBookModal());
        document.getElementById('bookModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('bookModal')) {
                this.closeBookModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('bookModal').style.display === 'block') {
                this.closeBookModal();
            }
        });
    }

    // Handle search input
    handleSearch(query) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            this.showSearchSuggestions(query);
        }, 300);
    }

    // Show search suggestions
    showSearchSuggestions(query) {
        const suggestions = this.books.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.genre.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (suggestions.length > 0 && query.trim()) {
            suggestionsContainer.innerHTML = suggestions.map(book => `
                <div class="suggestion-item" onclick="bookSage.selectSuggestion('${book.title}')">
                    <i class="fas fa-book"></i>
                    <div>
                        <strong>${book.title}</strong><br>
                        <small>${book.author} • ${book.genre}</small>
                    </div>
                </div>
            `).join('');
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }

    // Select suggestion
    selectSuggestion(bookTitle) {
        document.getElementById('searchInput').value = bookTitle;
        document.getElementById('searchSuggestions').style.display = 'none';
        this.performSearch();
    }

    // Perform search
    performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;

        this.currentBooks = this.books.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.genre.toLowerCase().includes(query.toLowerCase())
        );

        this.renderSearchResults(query);
        document.getElementById('searchSuggestions').style.display = 'none';
    }

    // Filter books
    filterBooks() {
        const genreFilter = document.getElementById('genreFilter').value;
        const ratingFilter = document.getElementById('ratingFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        let filteredBooks = [...this.books];

        // Apply genre filter
        if (genreFilter) {
            filteredBooks = filteredBooks.filter(book => book.genre.toLowerCase() === genreFilter.toLowerCase());
        }

        // Apply rating filter
        if (ratingFilter) {
            const minRating = parseFloat(ratingFilter);
            filteredBooks = filteredBooks.filter(book => book.rating >= minRating);
        }

        // Apply sorting
        filteredBooks.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'rating':
                    return b.rating - a.rating;
                case 'year':
                    return b.year - a.year;
                case 'popularity':
                    return b.popularity - a.popularity;
                default:
                    return 0;
            }
        });

        this.currentBooks = filteredBooks;
        this.renderSearchResults('Filtered Results');
    }

    // Render search results
    renderSearchResults(query) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsCount = document.getElementById('resultsCount');
        const booksGrid = document.getElementById('booksGrid');
        const noResults = document.getElementById('noResults');

        resultsTitle.textContent = `Results for "${query}"`;
        resultsCount.textContent = `${this.currentBooks.length} book${this.currentBooks.length !== 1 ? 's' : ''} found`;

        if (this.currentBooks.length === 0) {
            resultsSection.style.display = 'none';
            noResults.style.display = 'flex';
            return;
        }

        resultsSection.style.display = 'block';
        noResults.style.display = 'none';

        booksGrid.innerHTML = this.currentBooks.map(book => `
            <div class="book-card" onclick="bookSage.openBookModal('${book.id}')">
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/300x400/667eea/ffffff?text=${encodeURIComponent(book.title)}'">
                <div class="book-card-content">
                    <h3>${book.title}</h3>
                    <div class="author">by ${book.author}</div>
                    <div class="genre">${book.genre}</div>
                    <div class="rating">
                        <div class="stars">${this.generateStars(book.rating)}</div>
                        <div class="rating-text">${book.rating}/5</div>
                    </div>
                    <div class="year">${book.year}</div>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="event.stopPropagation(); bookSage.addToReadingList('${book.id}')">
                            <i class="fas fa-bookmark"></i> Add to List
                        </button>
                        <button class="btn btn-secondary" onclick="event.stopPropagation(); bookSage.openBookModal('${book.id}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render featured books
    renderFeaturedBooks() {
        const featuredBooks = this.books.filter(book => book.featured).slice(0, 6);
        const featuredGrid = document.getElementById('featuredGrid');

        featuredGrid.innerHTML = featuredBooks.map(book => `
            <div class="book-card" onclick="bookSage.openBookModal('${book.id}')">
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/300x400/667eea/ffffff?text=${encodeURIComponent(book.title)}'">
                <div class="book-card-content">
                    <h3>${book.title}</h3>
                    <div class="author">by ${book.author}</div>
                    <div class="genre">${book.genre}</div>
                    <div class="rating">
                        <div class="stars">${this.generateStars(book.rating)}</div>
                        <div class="rating-text">${book.rating}/5</div>
                    </div>
                    <div class="year">${book.year}</div>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="event.stopPropagation(); bookSage.addToReadingList('${book.id}')">
                            <i class="fas fa-bookmark"></i> Add to List
                        </button>
                        <button class="btn btn-secondary" onclick="event.stopPropagation(); bookSage.openBookModal('${book.id}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Setup genre cards
    setupGenreCards() {
        document.querySelectorAll('.genre-card').forEach(card => {
            card.addEventListener('click', () => {
                const genre = card.dataset.genre;
                document.getElementById('genreFilter').value = genre;
                this.filterBooks();
            });
        });
    }

    // Open book modal
    openBookModal(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="modal-book-header">
                <div class="modal-book-poster">
                    <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/300x400/667eea/ffffff?text=${encodeURIComponent(book.title)}'">
                </div>
                <div class="modal-book-info">
                    <h2>${book.title}</h2>
                    <div class="author">by ${book.author}</div>
                    <div class="genre">${book.genre}</div>
                    <div class="rating-section">
                        <div class="stars">${this.generateStars(book.rating)}</div>
                        <div class="rating-text">${book.rating}/5 (${book.reviews} reviews)</div>
                    </div>
                    <div class="description">${book.description}</div>
                    <div class="details">
                        <div class="detail-item">
                            <h4>Publication Year</h4>
                            <p>${book.year}</p>
                        </div>
                        <div class="detail-item">
                            <h4>Pages</h4>
                            <p>${book.pages}</p>
                        </div>
                        <div class="detail-item">
                            <h4>Language</h4>
                            <p>${book.language}</p>
                        </div>
                        <div class="detail-item">
                            <h4>ISBN</h4>
                            <p>${book.isbn}</p>
                        </div>
                    </div>
                    <div style="margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="bookSage.addToReadingList('${book.id}')">
                            <i class="fas fa-bookmark"></i> Add to Reading List
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('bookModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Close book modal
    closeBookModal() {
        document.getElementById('bookModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Add to reading list
    addToReadingList(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        if (!this.readingList.find(item => item.id === bookId)) {
            this.readingList.push(book);
            this.saveReadingList();
            this.renderReadingList();
            this.showNotification(`${book.title} added to your reading list!`);
        } else {
            this.showNotification(`${book.title} is already in your reading list!`);
        }
    }

    // Remove from reading list
    removeFromReadingList(bookId) {
        this.readingList = this.readingList.filter(book => book.id !== bookId);
        this.saveReadingList();
        this.renderReadingList();
        this.showNotification('Book removed from reading list!');
    }

    // Render reading list
    renderReadingList() {
        const container = document.getElementById('readingListContainer');
        
        if (this.readingList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <h3>Your reading list is empty</h3>
                    <p>Start adding books to your reading list!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.readingList.map(book => `
            <div class="reading-list-item">
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/60x80/667eea/ffffff?text=${encodeURIComponent(book.title)}'">
                <div class="reading-list-content">
                    <h4>${book.title}</h4>
                    <div class="author">by ${book.author}</div>
                    <div class="rating">${this.generateStars(book.rating)} ${book.rating}/5</div>
                </div>
                <div class="reading-list-actions">
                    <button class="view-btn" onclick="bookSage.openBookModal('${book.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="remove-btn" onclick="bookSage.removeFromReadingList('${book.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Generate stars
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        
        return starsHTML;
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 1rem 2rem;
            border-radius: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Load reading list from localStorage
    loadReadingList() {
        const saved = localStorage.getItem('bookSageReadingList');
        return saved ? JSON.parse(saved) : [];
    }

    // Save reading list to localStorage
    saveReadingList() {
        localStorage.setItem('bookSageReadingList', JSON.stringify(this.readingList));
    }

    // Get book data
    getBookData() {
        return [
            {
                id: '1',
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                genre: 'Fiction',
                year: 1925,
                rating: 4.5,
                reviews: 1250000,
                pages: 180,
                language: 'English',
                isbn: '978-0743273565',
                cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
                description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
                featured: true,
                popularity: 95
            },
            {
                id: '2',
                title: 'To Kill a Mockingbird',
                author: 'Harper Lee',
                genre: 'Fiction',
                year: 1960,
                rating: 4.8,
                reviews: 2100000,
                pages: 281,
                language: 'English',
                isbn: '978-0446310789',
                cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
                description: 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.',
                featured: true,
                popularity: 98
            },
            {
                id: '3',
                title: '1984',
                author: 'George Orwell',
                genre: 'Science Fiction',
                year: 1949,
                rating: 4.6,
                reviews: 1800000,
                pages: 328,
                language: 'English',
                isbn: '978-0451524935',
                cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
                description: 'A dystopian novel about totalitarianism and surveillance society.',
                featured: true,
                popularity: 92
            },
            {
                id: '4',
                title: 'Pride and Prejudice',
                author: 'Jane Austen',
                genre: 'Romance',
                year: 1813,
                rating: 4.4,
                reviews: 950000,
                pages: 432,
                language: 'English',
                isbn: '978-0141439518',
                cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop',
                description: 'The story of Elizabeth Bennet and Mr. Darcy in 19th century England.',
                featured: false,
                popularity: 88
            },
            {
                id: '5',
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                genre: 'Fantasy',
                year: 1937,
                rating: 4.7,
                reviews: 1500000,
                pages: 366,
                language: 'English',
                isbn: '978-0547928241',
                cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
                description: 'The adventure of Bilbo Baggins, a hobbit who embarks on a quest.',
                featured: true,
                popularity: 94
            },
            {
                id: '6',
                title: 'The Catcher in the Rye',
                author: 'J.D. Salinger',
                genre: 'Fiction',
                year: 1951,
                rating: 4.2,
                reviews: 800000,
                pages: 277,
                language: 'English',
                isbn: '978-0316769488',
                cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
                description: 'The story of Holden Caulfield and his experiences in New York City.',
                featured: false,
                popularity: 85
            },
            {
                id: '7',
                title: 'Lord of the Flies',
                author: 'William Golding',
                genre: 'Fiction',
                year: 1954,
                rating: 4.3,
                reviews: 750000,
                pages: 224,
                language: 'English',
                isbn: '978-0399501487',
                cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
                description: 'A group of British boys stranded on an uninhabited island.',
                featured: false,
                popularity: 82
            },
            {
                id: '8',
                title: 'Animal Farm',
                author: 'George Orwell',
                genre: 'Fiction',
                year: 1945,
                rating: 4.4,
                reviews: 900000,
                pages: 140,
                language: 'English',
                isbn: '978-0451526342',
                cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
                description: 'An allegorical novella about farm animals who rebel against their human farmer.',
                featured: false,
                popularity: 87
            },
            {
                id: '9',
                title: 'The Alchemist',
                author: 'Paulo Coelho',
                genre: 'Fiction',
                year: 1988,
                rating: 4.5,
                reviews: 1200000,
                pages: 208,
                language: 'Portuguese',
                isbn: '978-0062315007',
                cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
                description: 'A shepherd boy named Santiago who dreams of finding a worldly treasure.',
                featured: true,
                popularity: 90
            },
            {
                id: '10',
                title: 'The Little Prince',
                author: 'Antoine de Saint-Exupéry',
                genre: 'Fiction',
                year: 1943,
                rating: 4.6,
                reviews: 1100000,
                pages: 96,
                language: 'French',
                isbn: '978-0156013987',
                cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
                description: 'A young prince who visits various planets in space.',
                featured: false,
                popularity: 89
            }
        ];
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
let bookSage;
document.addEventListener('DOMContentLoaded', () => {
    bookSage = new BookSage();
}); 