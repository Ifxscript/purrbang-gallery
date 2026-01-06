import { useState, useEffect } from 'react';
import './SparkModal.css';

function SparkModal({ isOpen, onClose, data, allCats, currentIndex, onNavigate, theme }) {
    const [inscriptionData, setInscriptionData] = useState(null);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);

    // Collapsible sections state
    const [traitsOpen, setTraitsOpen] = useState(true);
    const [activityOpen, setActivityOpen] = useState(false);

    // Mobile portrait detection
    const [isMobilePortrait, setIsMobilePortrait] = useState(false);

    useEffect(() => {
        const checkMobilePortrait = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setIsMobilePortrait(width < 1100 && height > width);
        };

        checkMobilePortrait();
        window.addEventListener('resize', checkMobilePortrait);
        return () => window.removeEventListener('resize', checkMobilePortrait);
    }, []);

    // Fetch data when modal opens or data changes
    useEffect(() => {
        if (isOpen && data) {
            setLoading(true);
            setTransfers([]);

            // Fetch inscription details from ordinals.com
            const fetchOrdinals = fetch(`https://ordinals.com/r/inscription/${data.inscriptionId}`)
                .then(res => res.json());

            // Fetch transfer history from Hiro API
            const fetchTransfers = fetch(`https://api.hiro.so/ordinals/v1/inscriptions/${data.inscriptionId}/transfers`)
                .then(res => res.json());

            Promise.all([fetchOrdinals, fetchTransfers])
                .then(([inscData, transferData]) => {
                    setInscriptionData(inscData);
                    setTransfers(transferData.results || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching data:', err);
                    setLoading(false);
                });
        }
    }, [isOpen, data?.inscriptionId]);

    if (!isOpen || !data) return null;

    const traitColors = {
        outfit: 'rgba(255, 84, 0, 0.8)',
        head: 'rgba(191, 146, 63, 0.8)',
        eyes: 'rgba(90, 115, 2, 0.8)',
        ears: 'rgba(39, 89, 80, 0.8)',
        mouth: 'rgba(112, 101, 19, 0.8)',
        pet: 'rgba(139, 92, 246, 0.8)'
    };

    // Format timestamp to readable date
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Shorten address for display
    const shortenAddress = (addr) => {
        if (!addr) return 'Unknown';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Get neighbor thumbnails (2 before, current, 2 after)
    const getNeighbors = () => {
        if (!allCats || currentIndex === null) return [];
        const neighbors = [];
        for (let i = -2; i <= 2; i++) {
            const idx = currentIndex + i;
            if (idx >= 0 && idx < allCats.length) {
                neighbors.push({
                    index: idx,
                    cat: allCats[idx],
                    isCurrent: i === 0
                });
            }
        }
        return neighbors;
    };

    // Refresh canvas (reload iframe)
    const handleRefresh = () => {
        setIframeKey(prev => prev + 1);
    };

    // Open on ordinals.com
    const handleOpenOrdinals = () => {
        window.open(`https://ordinals.com/inscription/${data.inscriptionId}`, '_blank');
    };

    const neighbors = getNeighbors();

    return (
        <div className={`spark-modal ${theme || 'dark'} ${isMobilePortrait ? 'mobile-portrait' : ''}`}>
            <div className="spark-modal__backdrop" onClick={onClose} />

            {/* Navigation Bar - Minimal on mobile */}
            <div className="spark-modal__navbar">
                {/* Left Icons */}
                <div className="spark-modal__navbar-left">
                    <button
                        className="spark-modal__navbar-icon"
                        onClick={handleRefresh}
                        title="Refresh Canvas"
                    >
                        ↻
                    </button>
                    <button
                        className="spark-modal__navbar-icon"
                        onClick={handleOpenOrdinals}
                        title="View on Ordinals.com"
                    >
                        ↗
                    </button>
                    <button
                        className="spark-modal__navbar-icon"
                        onClick={onClose}
                        title="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Right - Thumbnail Gallery (hidden on mobile portrait) */}
                {!isMobilePortrait && (
                    <div className="spark-modal__navbar-right">
                        <button
                            className="spark-modal__navbar-arrow"
                            onClick={() => onNavigate(currentIndex - 1)}
                            disabled={currentIndex <= 0}
                            title="Previous"
                        >
                            ←
                        </button>

                        <div className="spark-modal__thumbnails">
                            {neighbors.map(({ index, cat, isCurrent }) => (
                                <button
                                    key={index}
                                    className={`spark-modal__thumbnail ${isCurrent ? 'active' : ''}`}
                                    onClick={() => onNavigate(index)}
                                >
                                    <iframe
                                        src={`https://ordinals.com/preview/${cat.inscriptionId}`}
                                        title={`purrbang${String(index + 1).padStart(3, '0')}`}
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </button>
                            ))}
                        </div>

                        <button
                            className="spark-modal__navbar-arrow"
                            onClick={() => onNavigate(currentIndex + 1)}
                            disabled={currentIndex >= allCats?.length - 1}
                            title="Next"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>

            <div className="spark-modal__canvas">
                {/* Image Panel - First on mobile */}
                <div className="spark-modal__image-container">
                    <iframe
                        key={iframeKey}
                        src={data.imageUrl}
                        title={data.title}
                        className="spark-modal__image"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>

                {/* Thumbnail Strip - Only on mobile portrait, below image */}
                {isMobilePortrait && (
                    <div className="spark-modal__thumbnail-strip">
                        <button
                            className="spark-modal__navbar-arrow"
                            onClick={() => onNavigate(currentIndex - 1)}
                            disabled={currentIndex <= 0}
                        >
                            ←
                        </button>

                        <div className="spark-modal__thumbnails">
                            {neighbors.map(({ index, cat, isCurrent }) => (
                                <button
                                    key={index}
                                    className={`spark-modal__thumbnail ${isCurrent ? 'active' : ''}`}
                                    onClick={() => onNavigate(index)}
                                >
                                    <iframe
                                        src={`https://ordinals.com/preview/${cat.inscriptionId}`}
                                        title={`purrbang${String(index + 1).padStart(3, '0')}`}
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </button>
                            ))}
                        </div>

                        <button
                            className="spark-modal__navbar-arrow"
                            onClick={() => onNavigate(currentIndex + 1)}
                            disabled={currentIndex >= allCats?.length - 1}
                        >
                            →
                        </button>
                    </div>
                )}

                {/* Info Panel */}
                <div className="spark-modal__info">
                    <span className="spark-modal__title">{data.title}</span>

                    {/* Details Section - Always expanded */}
                    <div className="spark-modal__section">
                        <span className="spark-modal__section-title">Details</span>
                        {loading ? (
                            <span className="spark-modal__loading">Loading...</span>
                        ) : inscriptionData ? (
                            <div className="spark-modal__history">
                                <div className="spark-modal__history-row">
                                    <span className="spark-modal__history-label">Inscription #</span>
                                    <span className="spark-modal__history-value">{inscriptionData.number?.toLocaleString()}</span>
                                </div>
                                <div className="spark-modal__history-row">
                                    <span className="spark-modal__history-label">Created</span>
                                    <span className="spark-modal__history-value">{formatDate(inscriptionData.timestamp)}</span>
                                </div>
                                <div className="spark-modal__history-row">
                                    <span className="spark-modal__history-label">Block</span>
                                    <span className="spark-modal__history-value">{inscriptionData.height?.toLocaleString()}</span>
                                </div>
                                <div className="spark-modal__history-row">
                                    <span className="spark-modal__history-label">Owner</span>
                                    <span className="spark-modal__history-value">{shortenAddress(inscriptionData.address)}</span>
                                </div>
                            </div>
                        ) : (
                            <span className="spark-modal__loading">Unable to load</span>
                        )}
                    </div>

                    {/* Traits Section - Collapsible */}
                    <div className="spark-modal__section spark-modal__section--collapsible">
                        <button
                            className={`spark-modal__section-header ${traitsOpen ? 'expanded' : ''}`}
                            onClick={() => setTraitsOpen(!traitsOpen)}
                        >
                            <span className="spark-modal__section-title">Traits</span>
                            <span className="spark-modal__chevron">{traitsOpen ? '▼' : '▶'}</span>
                        </button>
                        {traitsOpen && (
                            <div className="spark-modal__traits">
                                {Object.entries(data.traits).map(([trait, value]) => (
                                    <div key={trait} className="spark-modal__trait-row">
                                        <span className="spark-modal__trait-label">{trait}</span>
                                        <span
                                            className="spark-modal__trait-value"
                                            style={{ backgroundColor: traitColors[trait] }}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Activity (Transfers) Section - Collapsible */}
                    <div className="spark-modal__section spark-modal__section--collapsible">
                        <button
                            className={`spark-modal__section-header ${activityOpen ? 'expanded' : ''}`}
                            onClick={() => setActivityOpen(!activityOpen)}
                        >
                            <span className="spark-modal__section-title">
                                Activity ({transfers.length})
                            </span>
                            <span className="spark-modal__chevron">{activityOpen ? '▼' : '▶'}</span>
                        </button>
                        {activityOpen && (
                            <>
                                {loading ? (
                                    <span className="spark-modal__loading">Loading...</span>
                                ) : transfers.length > 0 ? (
                                    <div className="spark-modal__transfers">
                                        {transfers.map((transfer, idx) => (
                                            <div key={idx} className="spark-modal__transfer">
                                                <span className="spark-modal__transfer-date">
                                                    {new Date(transfer.timestamp).toLocaleDateString()}
                                                </span>
                                                <span className="spark-modal__transfer-addr">
                                                    → {shortenAddress(transfer.address)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="spark-modal__no-transfers">No transfers</span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SparkModal;
