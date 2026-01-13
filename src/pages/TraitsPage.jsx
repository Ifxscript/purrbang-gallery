import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Tags, Sun, Moon } from 'lucide-react';
import './TraitsPage.css';

const HeaderLogo = () => (
    <svg viewBox="-30 -30 60 60" className="traits-page__logo">
        <polygon points="25,-12.5 0,0 0,25 25,12.5" fill="currentColor" transform="translate(1, 0.5)" />
        <polygon points="-25,-12.5 0,0 0,25 -25,12.5" fill="currentColor" transform="translate(-1, 0.5)" />
        <g transform="translate(0, -1)">
            <polygon points="-25,-12.5 0,0 12.5,-6.25 -12.5,-18.75" fill="currentColor" />
            <polygon points="0,-25 25,-12.5 14.5,-7.25 -10.5,-19.5" fill="currentColor" />
        </g>
    </svg>
)

// Trait inscription data mapping
const traitsMapping = {
    pet: [
        { name: "pepe", inscriptionId: "0c468dc10886b2bdd9a07d64faa9d416a16913ae451b86e7a105eb22655b288ei0" },
        { name: "Gizmo", inscriptionId: "d761251b9eb961a7d0e1e2b235fd40311867ac75804b2da1f0f672184ec64381i0" },
        { name: "Puppet", inscriptionId: "954410fdd7ed60bf6cfdb88c729d4efbad3f55d7b7eda1dae05aec541eaadecei0" },
        { name: "Weirdos", inscriptionId: "dc69638099fa86b68fc32b23a08e98c6cadf2532f3d67dc28494a9586a2d3a80i0" }
    ],
    ears: [
        { name: "Ear1", inscriptionId: "c8d8dabdc82e0287121725027f3b0b4870f58854694c87920ab0e791510109f1i0" },
        { name: "Ear2", inscriptionId: "7e93d485a67137f252db722ed157ca11bfe758ef5d0fb62d96ac808403a4a8d2i0" },
        { name: "Ear3", inscriptionId: "ad682a9ffaa79d4fe10354b096deefa57b7bf629d91b8af647bf519ffa10e078i0" },
        { name: "Ear4", inscriptionId: "fcfc44ce4713572b781ff1d23aca7774799ca8b6f1aaf54a3a1b2bc1547c7965i0" },
        { name: "Ear5", inscriptionId: "0834a972aaec679b0fbd0a9b9857561e78952f0ef4b20fb1687b951c68dfaf46i0" }
    ],
    eyes: [
        { name: "Eyes1", inscriptionId: "47b18c592399aaf87c3cc2e63034002853057fa4ac50c3c29d5b15812a816015i0" },
        { name: "Eyes2", inscriptionId: "af4a33e5412662b7af85767662d73bb43df8374ff7da36d148443f7f0f464384i0" },
        { name: "Eyes3", inscriptionId: "fd8ad3da0cc297f04d25fcc84ae6f49d1e7f662b2fbbefb059e0f22a2deab758i0" },
        { name: "Eyes4", inscriptionId: "79eb8bf35c705bcae0bd093a74420a917e5c8f6174ec943b153aa5e8c40392d7i0" },
        { name: "Eyes5", inscriptionId: "de1fa1adc444e0e31874f9271130fa85e0f458b1da1b4b7ddbc7b7c092583074i0" },
        { name: "Eyesr", inscriptionId: "811262cfa5e536193cef7f6513048b41efbce022b49e620342fe3fa4067deb21i0" }
    ],
    head: [
        { name: "Body1", inscriptionId: "a24035442498fad226c889d18adcfd2bcd7e3a18d0284f48ae70645a8fffae97i0" },
        { name: "Body2", inscriptionId: "e9a34afd0c71608e09ad5c9fdba29d42670d1532d34dc98f898866adbdeeeed4i0" },
        { name: "Body3", inscriptionId: "0c6d62a486c7f9fabb7d1f178d635c34d62f81b09278680a454c392db3d36a96i0" },
        { name: "Body4", inscriptionId: "22d7acd678665ff0182788d6433884f6fa910a80d766c92a6770e2a9e00c4d0di0" }
    ],
    mouth: [
        { name: "Mouth1", inscriptionId: "a784de5819e052709389590fa6c41fb679cb921364c5819967eef9ec26e3db9di0" },
        { name: "Mouth2", inscriptionId: "6ff511ea33c8e3081ffcdc71706bce139d218b95abf9c0bf367e48f7e15456c1i0" },
        { name: "Mouth3", inscriptionId: "11bb889a1dd6726c2d77daf7c0069c3aee8b63d4ec65c322351d100758e28553i0" },
        { name: "Mouth4", inscriptionId: "d97f22b5addada477933f49aa36f3eb15ca67ae0e363212557a337fb1a1f6bf5i0" },
        { name: "Mouth5", inscriptionId: "19ae2693fec97015ca7ea99e3f3b21c0e5bf422373c1355f5dd1525519638dfai0" }
    ],
    outfit: [
        { name: "Greenshirt", inscriptionId: "2449cc4d078d80141a91997097d1e28738320fee90e49cf630805708fa482839i0" },
        { name: "Hoodie", inscriptionId: "a8dd265c8ad9e0d63f08c50cae7a57b54a41e3f3723985d1f1ffd43a46972f25i0" },
        { name: "Rockstar", inscriptionId: "ab6db5c7d5455fced3bf744aa13ae2d7a1ceab7533fa211fc4f6112e106fa99ai0" },
        { name: "Suit", inscriptionId: "725a97374ab963f1ef6a6dbc0bdc000cc24ea934c1ec6e828a097132c364fbdei0" },
        { name: "Vest", inscriptionId: "7f97b7406ca9015257d8371f7338a910a578002db1ea5fdb68990e2c371555bdi0" }
    ]
};

function TraitsPage({ onNavigateToCollection }) {
    const [allCats, setAllCats] = useState([]);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        fetch('/all-traits.json')
            .then(res => res.json())
            .then(data => setAllCats(data))
            .catch(err => console.error('Error loading traits:', err));
    }, []);

    const traitGroups = useMemo(() => {
        if (!allCats.length) return {};

        const groups = {
            outfit: {},
            head: {},
            eyes: {},
            ears: {},
            mouth: {},
            pet: {}
        };

        allCats.forEach(cat => {
            Object.entries(cat.traits).forEach(([category, value]) => {
                if (groups[category]) {
                    groups[category][value] = (groups[category][value] || 0) + 1;
                }
            });
        });

        const sortedGroups = {};
        Object.entries(groups).forEach(([category, values]) => {
            sortedGroups[category] = Object.entries(values)
                .map(([name, count]) => {
                    // Find matching inscriptionId from mapping
                    const mapping = traitsMapping[category]?.find(m => m.name.toLowerCase() === name.toLowerCase());
                    return {
                        name,
                        count,
                        percentage: ((count / allCats.length) * 100).toFixed(1),
                        inscriptionId: mapping?.inscriptionId
                    };
                })
                .sort((a, b) => b.count - a.count);
        });

        return sortedGroups;
    }, [allCats]);

    return (
        <div className={`traits-page ${theme}`}>
            <header className="traits-page__header">
                <div className="traits-page__header-left">
                    <a href="#/collection" className="traits-page__back-btn">
                        <ChevronLeft size={20} />
                        <span>Gallery</span>
                    </a>
                    <div className="traits-page__brand">
                        <HeaderLogo />
                        <span className="traits-page__title">Traits Library</span>
                    </div>
                </div>
                <div className="traits-page__header-right">
                    <div className="traits-page__stats">
                        <span className="traits-page__count">{allCats.length || '---'} Items</span>
                    </div>
                </div>
            </header>

            <main className="traits-page__content">
                {!allCats.length ? (
                    <div className="traits-page__loading">
                        <div className="traits-page__loading-text">Loading Traits...</div>
                    </div>
                ) : (
                    <div className="traits-page__grid">
                        {Object.entries(traitGroups).map(([category, traits]) => (
                            <section key={category} className="traits-page__category">
                                <h2 className="traits-page__category-title">
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                    <span className="traits-page__category-count">{traits.length}</span>
                                </h2>
                                <div className="traits-page__trait-grid">
                                    {traits.map(trait => (
                                        <div key={trait.name} className="traits-page__trait-card-visual">
                                            <div className="traits-page__trait-image-container">
                                                {trait.inscriptionId ? (
                                                    <img
                                                        src={`https://ordinals.com/content/${trait.inscriptionId}`}
                                                        alt={trait.name}
                                                        className="traits-page__trait-image"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="traits-page__trait-image-placeholder">?</div>
                                                )}
                                                <div className="traits-page__trait-badge">
                                                    {trait.percentage}%
                                                </div>
                                                <div className="traits-page__trait-info">
                                                    <span className="traits-page__trait-name">{trait.name}</span>
                                                    <span className="traits-page__trait-count">{trait.count} pcs</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            <footer className="traits-page__footer">
                <div className="traits-page__footer-content">
                    <div className="traits-page__footer-left">
                        <Tags size={16} />
                        <span>Library Statistics</span>
                    </div>
                    <div className="traits-page__footer-actions">
                        <button
                            className="traits-page__theme-toggle"
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
            </footer>
        </div>
    );
}

export default TraitsPage;
