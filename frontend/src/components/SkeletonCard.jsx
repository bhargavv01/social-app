import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card glass-panel">
      <div className="skeleton-vote">
        <div className="skeleton-line skeleton-circle"></div>
        <div className="skeleton-line skeleton-sm"></div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-xs"></div>
        <div className="skeleton-line skeleton-lg"></div>
        <div className="skeleton-line skeleton-md"></div>
        <div className="skeleton-line skeleton-md"></div>
      </div>
    </div>
  );
}
