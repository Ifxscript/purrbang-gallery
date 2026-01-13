import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Menu, Terminal, Sun, Moon, Tags, Info } from 'lucide-react'
import SparkCard from '../components/SparkCard'
import SparkModal from '../components/SparkModal'
import FilterSidebar from '../components/FilterSidebar'
import TerminalSearch from '../components/TerminalSearch'
import './CollectionPage.css'

const HeaderLogo = () => (
    <svg viewBox="-30 -30 60 60" className="collection-page__logo">
        <polygon points="25,-12.5 0,0 0,25 25,12.5" fill="currentColor" transform="translate(1, 0.5)" />
        <polygon points="-25,-12.5 0,0 0,25 -25,12.5" fill="currentColor" transform="translate(-1, 0.5)" />
        <g transform="translate(0, -1)">
            <polygon points="-25,-12.5 0,0 12.5,-6.25 -12.5,-18.75" fill="currentColor" />
            <polygon points="0,-25 25,-12.5 14.5,-7.25 -10.5,-19.5" fill="currentColor" />
        </g>
    </svg>
)

function CollectionPage({ onNavigateToTraits }) {
    const [allCats, setAllCats] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [btcPrice, setBtcPrice] = useState(null);
    const [displayCount, setDisplayCount] = useState(30);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    // Filter state
    const [filters, setFilters] = useState({
        outfit: '',
        head: '',
        eyes: '',
        ears: '',
        mouth: '',
        pet: ''
    });

    // Terminal search state - stores the found cat when searching
    const [searchResult, setSearchResult] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);

    // Mobile keyboard detection
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const footerRef = useRef(null);
    const contentRef = useRef(null);

    // Handle mobile keyboard showing/hiding using visualViewport
    // useEffect(() => {
    //     if (!window.visualViewport) return;

    //     const updateFooterPosition = () => {
    //         const viewport = window.visualViewport;
    //         const keyboardHeight = window.innerHeight - viewport.height;
    //         const isKeyboard = keyboardHeight > 100;

    //         setKeyboardVisible(isKeyboard);

    //         if (footerRef.current && isKeyboard) {
    //             // Position footer at exact bottom of visual viewport
    //             // Use top positioning based on visual viewport
    //             const footerHeight = footerRef.current.offsetHeight || 60;
    //             footerRef.current.style.position = 'fixed';
    //             footerRef.current.style.bottom = 'auto';
    //             footerRef.current.style.top = `${viewport.offsetTop + viewport.height - footerHeight}px`;
    //         } else if (footerRef.current) {
    //             // Reset to normal fixed bottom
    //             footerRef.current.style.position = 'fixed';
    //             footerRef.current.style.bottom = '0';
    //             footerRef.current.style.top = 'auto';
    //         }
    //     };

    //     window.visualViewport.addEventListener('resize', updateFooterPosition);
    //     window.visualViewport.addEventListener('scroll', updateFooterPosition);

    //     return () => {
    //         window.visualViewport.removeEventListener('resize', updateFooterPosition);
    //         window.visualViewport.removeEventListener('scroll', updateFooterPosition);
    //     };
    // }, []);

    useEffect(() => {
        if (!window.visualViewport || !footerRef.current) return;

        const footer = footerRef.current;
        const content = contentRef.current;

        const updateFooterPosition = () => {
            const vv = window.visualViewport;
            const keyboardHeight = window.innerHeight - vv.height;
            const isKeyboard = keyboardHeight > 100;

            setKeyboardVisible(isKeyboard);

            if (isKeyboard) {
                // Hide footer when keyboard is open
                footer.style.display = 'none';

                // Adjust content padding for keyboard
                if (content) {
                    content.style.paddingBottom = `${keyboardHeight}px`;
                }
            } else {
                // Show footer and let CSS handle safe-area
                footer.style.display = 'block';
                footer.style.top = 'auto';
                footer.style.bottom = '0px';

                // Reset content padding
                if (content) {
                    content.style.paddingBottom = '';
                }
            }
        };

        window.visualViewport.addEventListener('resize', updateFooterPosition);
        window.visualViewport.addEventListener('scroll', updateFooterPosition);

        return () => {
            window.visualViewport.removeEventListener('resize', updateFooterPosition);
            window.visualViewport.removeEventListener('scroll', updateFooterPosition);
        };
    }, []);

    // Load traits data
    useEffect(() => {
        fetch('/all-traits.json')
            .then(res => res.json())
            .then(data => {
                setAllCats(data);
            })
            .catch(err => console.error('Error loading traits:', err));
    }, []);

    // Fetch Bitcoin price
    useEffect(() => {
        const fetchBtcPrice = () => {
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
                .then(res => res.json())
                .then(data => {
                    if (data.bitcoin?.usd) {
                        setBtcPrice(data.bitcoin.usd);
                    }
                })
                .catch(err => console.error('Error fetching BTC price:', err));
        };

        fetchBtcPrice();
        const interval = setInterval(fetchBtcPrice, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Get unique values for each trait
    const traitOptions = useMemo(() => {
        const options = {
            outfit: new Set(),
            head: new Set(),
            eyes: new Set(),
            ears: new Set(),
            mouth: new Set(),
            pet: new Set()
        };

        allCats.forEach(cat => {
            Object.keys(options).forEach(trait => {
                if (cat.traits[trait]) {
                    options[trait].add(cat.traits[trait]);
                }
            });
        });

        return {
            outfit: Array.from(options.outfit).sort(),
            head: Array.from(options.head).sort(),
            eyes: Array.from(options.eyes).sort(),
            ears: Array.from(options.ears).sort(),
            mouth: Array.from(options.mouth).sort(),
            pet: Array.from(options.pet).sort()
        };
    }, [allCats]);

    // Filter cats based on selected filters (AND logic)
    const filteredCats = useMemo(() => {
        return allCats.filter(cat => {
            return Object.entries(filters).every(([trait, value]) => {
                if (!value) return true; // No filter selected for this trait
                return cat.traits[trait] === value;
            });
        });
    }, [allCats, filters]);

    // Only display first N cats (pagination) OR the search result
    const displayedCats = useMemo(() => {
        if (searchResult) {
            return [searchResult];
        }
        return filteredCats.slice(0, displayCount);
    }, [filteredCats, displayCount, searchResult]);

    const hasMore = displayCount < filteredCats.length;

    // Infinite scroll - load more when sentinel is visible
    const sentinelRef = useRef(null);
    const loadMore = useCallback(() => {
        setDisplayCount(prev => Math.min(prev + 30, filteredCats.length));
    }, [filteredCats.length]);

    useEffect(() => {
        if (!sentinelRef.current || !hasMore || searchResult) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadMore, searchResult]);

    const handleCardClick = (cat, index) => {
        // Store the actual cat for the search result case
        if (searchResult) {
            // Find the index in allCats for proper modal data
            const allCatsIndex = allCats.findIndex(c => c.inscriptionId === cat.inscriptionId);
            setSelectedIndex(allCatsIndex);
        } else {
            // Find the actual index in filteredCats
            const filteredIndex = filteredCats.findIndex(c => c.inscriptionId === cat.inscriptionId);
            setSelectedIndex(filteredIndex);
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedIndex(null);
    };

    const handleNavigate = (newIndex) => {
        if (newIndex >= 0 && newIndex < filteredCats.length) {
            setSelectedIndex(newIndex);
        }
    };

    const handleFilterChange = (trait, value) => {
        setFilters(prev => ({ ...prev, [trait]: value }));
    };

    const clearFilters = () => {
        setFilters({
            outfit: '',
            head: '',
            eyes: '',
            ears: '',
            mouth: '',
            pet: ''
        });
    };

    // Build current data from index
    const getCurrentData = () => {
        if (selectedIndex === null) return null;

        // When using search result, use allCats
        const catsArray = searchResult ? allCats : filteredCats;
        const cat = catsArray[selectedIndex];

        if (!cat) return null;

        const originalIndex = allCats.findIndex(c => c.inscriptionId === cat.inscriptionId);
        return {
            title: `purrbang${String(originalIndex + 1).padStart(3, '0')}`,
            inscriptionId: cat.inscriptionId,
            traits: cat.traits,
            imageUrl: `https://ordinals.com/preview/${cat.inscriptionId}`
        };
    };

    const activeFiltersCount = Object.values(filters).filter(v => v).length;

    // Terminal search - by cat number (like '023') or inscription ID
    const handleTerminalSearch = (query) => {
        // Check if query is a number (cat number search)
        const numMatch = query.match(/^(\d+)$/);

        if (numMatch) {
            // Search by cat number - must match exactly with leading zeros
            const catNumber = parseInt(numMatch[1], 10);
            const paddedQuery = query.padStart(3, '0');

            // Cat numbers are 1-indexed (purrbang001 is index 0)
            if (catNumber >= 1 && catNumber <= allCats.length) {
                // Check if the query matches the expected format
                const expectedName = `purrbang${paddedQuery}`;
                const catIndex = catNumber - 1;
                const cat = allCats[catIndex];

                if (cat) {
                    setSearchResult(cat);
                    return { found: true, message: `${expectedName} found` };
                }
            }
            return { found: false };
        } else {
            // Search by inscription ID (exact match)
            const cat = allCats.find(c =>
                c.inscriptionId.toLowerCase() === query.toLowerCase()
            );

            if (cat) {
                const originalIndex = allCats.findIndex(c => c.inscriptionId === cat.inscriptionId);
                const catName = `purrbang${String(originalIndex + 1).padStart(3, '0')}`;
                setSearchResult(cat);
                return { found: true, message: `${catName} found` };
            }
            return { found: false };
        }
    };

    // Clear terminal search
    const handleSearchClear = () => {
        setSearchResult(null);
    };

    return (
        <div className={`collection-page ${theme}`}>
            {sidebarOpen && (
                <FilterSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    filters={filters}
                    traitOptions={traitOptions}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    activeFiltersCount={activeFiltersCount}
                />
            )}

            {/* Fixed Header - outside content so it positions correctly */}
            <header className={`collection-page__header ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="collection-page__header-row">
                    <button
                        className="collection-page__filter-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu size={20} />
                    </button>
                    <div className="collection-page__header-center">
                        <h1 className="collection-page__title">
                            Purrb<HeaderLogo />ng
                        </h1>
                        <p className="collection-page__subtitle">{filteredCats.length} items</p>
                    </div>
                    <div className="collection-page__header-actions">
                        <button
                            className={`collection-page__search-toggle ${searchOpen ? 'active' : ''}`}
                            onClick={() => {
                                setSearchOpen(!searchOpen);
                                if (aboutOpen) setAboutOpen(false); // Close about if search is opened
                            }}
                        >
                            <span className="collection-page__search-toggle-icon">&gt;</span>
                        </button>
                    </div>
                </div>

                {/* Search overlay - always mounted to preserve state, hidden via CSS */}
                <div className={`collection-page__search-container ${!searchOpen ? 'is-hidden' : ''}`}>
                    <TerminalSearch onSearch={handleTerminalSearch} onClear={handleSearchClear} />
                </div>
            </header>

            {/* Main Content */}
            <div ref={contentRef} className={`collection-page__content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <main className={`collection-page__grid ${sidebarOpen ? 'sidebar-open' : ''}`}>
                    {displayedCats.map((cat, index) => {
                        const originalIndex = allCats.findIndex(c => c.inscriptionId === cat.inscriptionId);
                        return (
                            <SparkCard
                                key={cat.inscriptionId}
                                title={`purrbang${String(originalIndex + 1).padStart(3, '0')}`}
                                imageUrl={`https://ordinals.com/preview/${cat.inscriptionId}`}
                                traits={cat.traits}
                                onClick={() => handleCardClick(cat, index)}
                            />
                        );
                    })}
                </main>

                {/* Infinite scroll sentinel */}
                {hasMore && !searchResult && (
                    <div ref={sentinelRef} className="collection-page__sentinel" />
                )}
            </div>

            <SparkModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                data={getCurrentData()}
                allCats={filteredCats}
                currentIndex={selectedIndex}
                onNavigate={handleNavigate}
                theme={theme}
            />

            {/* Fixed Footer */}
            <footer
                ref={footerRef}
                className={`collection-page__footer ${sidebarOpen ? 'sidebar-open' : ''}`}
            >
                <div className="collection-page__footer-content">
                    <div className="collection-page__btc-price">
                        <span className="collection-page__btc-icon">₿</span>
                        <span className="collection-page__btc-value">
                            ${btcPrice ? btcPrice.toLocaleString() : '---'}
                        </span>
                        <span className="collection-page__sats">
                            1 sats/vB
                        </span>
                    </div>

                    <div className="collection-page__footer-actions">
                        <button
                            className={`collection-page__info-toggle ${aboutOpen ? 'active' : ''}`}
                            onClick={() => {
                                setAboutOpen(!aboutOpen);
                                if (searchOpen) setSearchOpen(false);
                            }}
                            title="About Collection"
                        >
                            <span className="collection-page__info-toggle-icon">&lt;</span>
                        </button>
                        <button
                            onClick={onNavigateToTraits}
                            className="collection-page__theme-toggle"
                            title="Traits Library"
                        >
                            <Tags size={20} />
                        </button>
                        <button
                            className="collection-page__theme-toggle"
                            title="Toggle Theme"
                            onClick={() => {
                                const newTheme = theme === 'dark' ? 'light' : 'dark';
                                setTheme(newTheme);
                                localStorage.setItem('theme', newTheme);
                            }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>

                {/* About Section overlay - moved to footer for slide-up effect */}
                <div className={`collection-page__about-section ${!aboutOpen ? 'is-hidden' : ''}`}>
                    <div className="collection-page__about-content">
                        <h2 className="collection-page__about-title">About Purrbang</h2>
                        <p className="collection-page__about-description">
                            Purrbang is an generative art pfp collection on mother chain pushing limits of whats possible.
                        </p>
                        <div className="collection-page__about-links">
                            <a href="https://magiceden.io/ordinals/marketplace/purrbang" target="_blank" rel="noopener noreferrer" className="collection-page__about-link">Marketplace</a>
                            <a href="https://x.com/purrBangBTC" target="_blank" rel="noopener noreferrer" className="collection-page__about-link">Twitter / X</a>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    )
}

export default CollectionPage
