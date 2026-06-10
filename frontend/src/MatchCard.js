import React from 'react';
import './App.css';

const MatchCard = ({ match, onSelect, onAction, actionLabel, actionClass }) => {
  if (!match) return null;

  return (
    <div className="match-card clickable" onClick={() => onSelect(match)}>
      <div className="scoreboard">
        {/* Home Team */}
        <div className="team">
          {match?.teams?.home?.logo && (
            <img src={match.teams.home.logo} alt="home" className="team-logo-small" />
          )}
          <span className="team-name">{match?.teams?.home?.name || "TBD"}</span>
        </div>

        {/* Score Center */}
        <div className="score-center">
          <h3>{match?.goals?.home ?? '-'} - {match?.goals?.away ?? '-'}</h3>
          {match?.score?.penalty?.home !== null && (
            <div className="penalty-score">
              <span>(Pens: {match.score.penalty.home}-{match.score.penalty.away})</span>
            </div>
          )}
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
	    <button
	      type="button"
	      className="btn-view-match"
	      onClick={(e) => {
	        e.stopPropagation();
	        onSelect(match);        // This opens the match details
	      }}
	    >
	      📊 View Stats
	    </button>

	    <button
	      className={actionClass}
	      onClick={(e) => {
	        e.stopPropagation();
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