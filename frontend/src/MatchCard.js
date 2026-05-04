import React from 'react';

const MatchCard = ({ match, onSelect, onAction, actionLabel, actionClass }) => {
  // 1. Safety check to ensure component doesn't attempt to render null data
  if (!match) return null;

  return (
    <div className="match-card clickable" onClick={() => onSelect(match)}>
      <div className="scoreboard">
        {/* Home Team - Using ?. to prevent "Cannot read property 'home' of undefined" */}
        <div className="team">
          {match?.teams?.home?.logo && (
            <img src={match.teams.home.logo} alt="home" className="team-logo-small" />
          )}
          <span className="team-name">{match?.teams?.home?.name || "TBD"}</span>
        </div>

        {/* Score Center */}
        <div className="score-center">
          <h3>
            {/* Fallback to '-' if goals are null (common for future fixtures) */}
            {match?.goals?.home ?? '-'} - {match?.goals?.away ?? '-'}
          </h3>
          
          {/* Penalty Display */}
          {match?.score?.penalty?.home !== null && match?.score?.penalty?.home !== undefined && (
            <div className="penalty-score">
              <span>(Pens: {match.score.penalty.home}-{match.score.penalty.away})</span>
            </div>
          )}

          {/* Venue Info */}
          <div className="venue-info">
            <span className="venue-icon">📍</span>
            <span className="venue-name">{match?.fixture?.venue?.name || "Stadium"}</span>
          </div>
        </div>

        {/* Away Team */}
        <div className="team">
          {match?.teams?.away?.logo && (
            <img src={match.teams.away.logo} alt="away" className="team-logo-small" />
          )}
          <span className="team-name">{match?.teams?.away?.name || "TBD"}</span>
        </div>
      </div>

      <div className="card-footer">
        <span className="details-hint">View Match Stats</span>
        
        <button 
          className={actionClass} 
          onClick={(e) => {
            e.stopPropagation(); // Prevents triggering the card's onClick
            onAction(e); 
          }}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default MatchCard;