import './SparkCard.css';

function SparkCard({ title, imageUrl, traits, onClick }) {
    const traitColors = {
        outfit: 'rgba(255, 84, 0, 0.7)',
        head: 'rgba(191, 146, 63, 0.7)',
        eyes: 'rgba(90, 115, 2, 0.7)',
        ears: 'rgba(39, 89, 80, 0.7)',
        mouth: 'rgba(112, 101, 19, 0.7)',
        pet: 'rgba(139, 92, 246, 0.7)'
    };

    return (
        <div className="spark-card" onClick={onClick}>
            <div className="spark-card__image">
                <iframe
                    src={imageUrl}
                    title={title}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                />
                <div className="spark-card__info">
                    <span className="spark-card__title">{title}</span>

                    <div className="spark-card__traits">
                        {Object.entries(traits).map(([trait, value]) => (
                            <span
                                key={trait}
                                className="spark-card__trait"
                                style={{ backgroundColor: traitColors[trait] }}
                            >
                                {value}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SparkCard;
