import React, { useEffect, useState } from 'react';
import './App.css';
import { auth, googleProvider } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { initiateCheckout } from './services/paymentService';
import MatchCard from './MatchCard';
import DataVisualizer from './DataVisualizer';
import ChatSpace from './ChatSpace'; // <--- Add this line
function App() {
  // --- Data State ---
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [matchStats, setMatchStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  // --- UI State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('matches');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('A');
  // --- Auth State ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showSentiment, setShowSentiment] = useState(false);
  const [isPro, setIsPro] = useState(false); //
  
const endpoint = `http://localhost:5678/webhook/generate-chart?group=${selectedGroup}`;  // --- 1. Auth Observer ---
// Replace the conflicting useEffects in App_3.js with this:
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      const idToken = await currentUser.getIdToken();
      setToken(idToken);

      // ✅ SINGLE SOURCE OF TRUTH:
      // Call the endpoint that checks your 'user_subscriptions' table
      try {
        const response = await fetch(`http://localhost:8080/api/v1/billing/status?email=${currentUser.email}`);
        const data = await response.json();
        setIsPro(data.isPro); // This unlocks ChatSpace_2.js
      } catch (err) {
        console.error("Pro status check failed", err);
        setIsPro(false);
      }
    } else {
      setUser(null);
      setToken(null);
      setIsPro(false);
    }
  });
  return () => unsubscribe();
}, []);
  // --- 2. Initial Data Fetch ---
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/v1/football/matches').then(r => r.json()),
      fetch('http://localhost:8080/api/v1/football/standings').then(r => r.json()),
      fetch('http://localhost:8080/api/v1/football/topscorers').then(r => r.json())
    ])
    .then(([matchesData, standingsData, scorersData]) => {
      // FIX: Robust data extraction. Handles both raw arrays and wrapped {response: []} objects
      const parsedMatches = Array.isArray(matchesData) ? matchesData : (matchesData.response || []);
      
      setMatches(parsedMatches);
      setStandings(standingsData.response?.[0]?.league?.standings || []);
      setScorers(scorersData.response || []);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setError("Backend connection failed. Check your Spring Boot server.");
      setLoading(false);
    });
  }, []);

  // --- 3. Live Stats Fetch ---
  useEffect(() => {
    if (!selectedMatch || !selectedMatch.fixture) {
      setMatchStats(null);
      return;
    }

    setStatsLoading(true);
    fetch(`http://localhost:8080/api/v1/football/statistics?fixture=${selectedMatch.fixture.id}`)
      .then(r => r.json())
      .then(data => {
        setMatchStats(data.response); 
        setStatsLoading(false);
      })
      .catch(err => {
        console.error("Stats fetch failed:", err);
        setStatsLoading(false);
      });
  }, [selectedMatch]);

  // --- 4. Handlers ---
  const handleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  const fetchWatchlist = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8080/api/v1/football/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setWatchlist(data);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    }
  };

  const handleDeleteMatch = async (savedMatch) => {
    if (!window.confirm("Remove this match?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/v1/football/favorites/${savedMatch.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setWatchlist((prev) => prev.filter((item) => item.id !== savedMatch.id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };
  
  const handleSaveMatch = (e, match) => {
      if (e && e.stopPropagation) e.stopPropagation();
      if (!token) return alert("Please login first!");

      const savedMatchData = {
          fixtureId: match.fixture.id,
          homeTeam: match.teams.home.name,
          awayTeam: match.teams.away.name,
          homeGoals: match.goals.home,
          awayGoals: match.goals.away,
          homeLogo: match.teams.home.logo,
          awayLogo: match.teams.away.logo,
          venueName: match.fixture.venue.name
      };

      fetch('http://localhost:8080/api/v1/football/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },      
          body: JSON.stringify(savedMatchData)
      })
      .then(res => res.ok ? alert("Saved!") : res.text().then(alert))
      .catch(err => console.error("Save failed:", err));
  };

  // --- RENDER HELPER: Detailed View ---
  if (selectedMatch) {
    return (
      <div className="app-container detail-view">
        <button className="back-button" onClick={() => setSelectedMatch(null)}>← Back to Dashboard</button>
        <div className="detail-card-full">
          <div className="detail-header">
            <span className="round-tag">{selectedMatch.league?.round || "Match"}</span>
            <h1>{selectedMatch.fixture?.venue?.name || "Stadium"}</h1>
            <p className="match-timestamp">{selectedMatch.fixture?.date ? new Date(selectedMatch.fixture.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' }) : ""}</p>
          </div>

          <div className="scoreline-hero">
            <div className="detail-team">
              {selectedMatch.teams?.home?.logo && <img src={selectedMatch.teams.home.logo} alt="home" />}
              <h3>{selectedMatch.teams?.home?.name}</h3>
            </div>
            <div className="score-display">
              <h1>{selectedMatch.goals?.home ?? '-'} - {selectedMatch.goals?.away ?? '-'}</h1>
              {selectedMatch.score?.penalty?.home !== null && selectedMatch.score?.penalty?.home !== undefined && (
                <span className="pens-label">({selectedMatch.score.penalty.home}-{selectedMatch.score.penalty.away} pens)</span>
              )}
            </div>
            <div className="detail-team">
              {selectedMatch.teams?.away?.logo && <img src={selectedMatch.teams.away.logo} alt="away" />}
              <h3>{selectedMatch.teams?.away?.name}</h3>
            </div>
          </div>

          <div className="stats-comparison-container">
            <h3>Match Statistics</h3>
            {statsLoading ? (
              <p>Loading stats...</p>
            ) : matchStats && matchStats.length > 0 ? (
              <div className="stats-bars">
                {['Ball Possession', 'Total Shots', 'Shots on Goal', 'Corner Kicks', 'Fouls'].map((statName) => {
                  const homeStat = matchStats[0]?.statistics.find(s => s.type === statName)?.value || 0;
                  const awayStat = matchStats[1]?.statistics.find(s => s.type === statName)?.value || 0;
                  const homeValue = parseInt(homeStat) || 0;
                  const awayValue = parseInt(awayStat) || 0;
                  const total = homeValue + awayValue;
                  const homeWidth = total === 0 ? 50 : (homeValue / total) * 100;

                  return (
                    <div key={statName} className="stat-row">
                      <div className="stat-labels">
                        <span>{homeStat}</span>
                        <span className="stat-title">{statName}</span>
                        <span>{awayStat}</span>
                      </div>
                      <div className="stat-bar-bg">
                        <div className="stat-bar-fill" style={{ width: `${homeWidth}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p>Statistics not available.</p>}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <h1>🏆 FIFA World Cup 2022</h1>
          <div className="auth-section">
            {user ? (
              <div className="user-profile">
                <img src={user.photoURL} alt="Profile" className="user-avatar" referrerPolicy="no-referrer" />
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            ) : <button onClick={handleLogin} className="login-btn">Login</button>}
          </div>
        </div>
        <nav className="nav-bar">
          <button className={currentTab === 'matches' ? 'active' : ''} onClick={() => setCurrentTab('matches')}>Fixtures</button>
          <button className={currentTab === 'standings' ? 'active' : ''} onClick={() => setCurrentTab('standings')}>Groups</button>
          <button className={currentTab === 'scorers' ? 'active' : ''} onClick={() => setCurrentTab('scorers')}>Scorers</button>
		  <button 
		    className={currentTab === 'ai-workflows' ? 'active' : ''} 
		    onClick={() => setCurrentTab('ai-workflows')}
		  >
		    AI Workflows
		  </button>
          {user && <button className={currentTab === 'watchlist' ? 'active' : ''} onClick={() => { setCurrentTab('watchlist'); fetchWatchlist(); }}>⭐ Watchlist</button>}
        </nav>
      </header>

      {/* FIX: Simplified render logic with fallback keys to ensure visibility */}
	  {currentTab === 'matches' && (
	    <div className="match-grid">
	      {/* Guard: Ensure matches is an array and filter out any null/undefined entries */}
	      {Array.isArray(matches) && matches.length > 0 ? (
	        matches.filter(m => m && m.fixture).map((match, index) => (
	          <MatchCard 
	            key={match?.fixture?.id || `match-${index}`} 
	            match={match} 
	            onSelect={setSelectedMatch} 
	            onAction={(e) => handleSaveMatch(e, match)} 
	            actionLabel="⭐ Save" 
	            actionClass="save-btn" 
	          />
	        ))
	      ) : (
	        <div className="no-data">No fixtures found for this period.</div>
	      )}
	    </div>
	  )}

	  {currentTab === 'standings' && (
	    <div className="standings-container">
	      {Array.isArray(standings) && standings.map((group, idx) => (
	        // Only render if group is actually an array of team data
	        Array.isArray(group) && (
	          <div key={idx} className="group-table">
	            <h3>{group[0]?.group || `Group ${idx + 1}`}</h3>
	            <table>
	              <thead>
	                <tr>
	                  <th>#</th><th>Team</th><th>MP</th><th>W</th><th>D</th><th>L</th><th>Pts</th>
	                </tr>
	              </thead>
	              <tbody>
	                {group.map((teamData) => (
	                  <tr key={teamData?.team?.id || Math.random()}>
	                    <td>{teamData?.rank}</td>
	                    <td className="team-cell">
	                      <img 
	                        src={teamData?.team?.logo} 
	                        alt="" 
	                        className="team-flag" 
	                        onError={(e) => e.target.style.display='none'} 
	                      />
	                      <span>{teamData?.team?.name || 'Unknown'}</span>
	                    </td>
	                    <td>{teamData?.all?.played ?? 0}</td>
	                    <td>{teamData?.all?.win ?? 0}</td>
	                    <td>{teamData?.all?.draw ?? 0}</td>
	                    <td>{teamData?.all?.lose ?? 0}</td>
	                    <td><strong>{teamData?.points ?? 0}</strong></td>
	                  </tr>
	                ))}
	              </tbody>
	            </table>
	          </div>
	        )
	      ))}
	    </div>
	  )}
	  {/* Other tabs up here, like fixtures or standings... */}

	  {/* THE FIX: Wrap the entire scorers grid in this conditional check */}
	  {currentTab === 'scorers' && (
	    <div className="scorers-grid">
	      {Array.isArray(scorers) && scorers.map((item, idx) => (
	        <div key={item?.player?.id || idx} className="scorer-card">
	          <img 
	            className="scorer-photo" 
	            src={item?.player?.photo} 
	            alt={item?.player?.name} 
	            onError={(e) => e.target.src = 'fallback-image-url'}
	          />
	          
	          <div className="scorer-details">
	            <h3>{item?.player?.name || 'Unknown Player'}</h3>
	            {/* Using Optional Chaining to safely reach the team name */}
	            <p className="team-name">{item?.statistics?.[0]?.team?.name || 'No Team Info'}</p>
	            
	            <div className="stats-row">
	              <span className="stat-pill">⚽ {item?.statistics?.[0]?.goals?.total ?? 0} Goals</span>
	              <span className="stat-pill">👟 {item?.statistics?.[0]?.goals?.assists ?? 0} Assists</span>
	            </div>
	          </div>
	        </div>
	      ))}
	    </div>
	  )}
      {currentTab === 'watchlist' && (
        <div className="watchlist-section">
          <div className="match-grid">
            {watchlist.map((m) => (
              <MatchCard 
                key={m.id} 
                match={{
                  fixture: { id: m.fixtureId, venue: { name: m.venueName || "Stadium" }, date: new Date(), status: { long: "Finished" } },
                  teams: { home: { name: m.homeTeam, logo: m.homeLogo }, away: { name: m.awayTeam, logo: m.awayLogo } },
                  goals: { home: m.homeGoals, away: m.awayGoals },
                  score: { halftime: { home: m.homeGoals, away: m.awayGoals }, penalty: { home: null } },
                  league: { round: "Saved" }
                }}
                onSelect={setSelectedMatch}
                onAction={(e) => handleDeleteMatch(m)}
                actionLabel="🗑️ Remove"
                actionClass="delete-btn"
              />
            ))}
          </div>
        </div>
      )}
	  {currentTab === 'ai-workflows' && (
	    <div className="workflow-centered-container">
	      
	      {/* --- World Cup Analytics Card --- */}
	      <div className="workflow-card">
	        <div className="workflow-header">
	          <span className="status-badge">Live</span>
	          <h3>World Cup Analytics</h3>
	          <p>Real-time data visualization via n8n automation</p>
	        </div>
	        <div className="workflow-actions">
	          <button 
	            className={`visualizer-btn ${showStandings ? 'active' : ''}`}
	            onClick={() => setShowStandings(!showStandings)}
	          >
	            {showStandings ? 'Close Visualizer' : 'Open Group Visualizer'}
	          </button>
	        </div>
	        {showStandings && (
	          <div className="visualizer-mounting-point">
	            <DataVisualizer />
	          </div>
	        )}
	      </div>

		  {/* --- Team Sentiment Analysis Card (Gated) --- */}
		  {/* --- Team Sentiment Analysis Card (Gated) --- */}
		            <div className="workflow-card" style={{ marginTop: '30px' }}>
		              <div className="workflow-header">
		                <span className="status-badge" style={{ backgroundColor: '#9b59b6' }}>AI Chat</span>
		                <h3>Team Sentiment Analysis</h3>
		                <p>Analyze global RSS feeds for national team sentiment.</p>
		              </div>
		              
		              <div className="workflow-actions">
		                {isPro ? (
		                  /* 1. If user is Pro, show the normal analysis toggle[cite: 2] */
		                  <button 
		                    className={`visualizer-btn ${showSentiment ? 'active' : ''}`}
		                    onClick={() => setShowSentiment(!showSentiment)}
		                  >
		                    {showSentiment ? 'Close Sentiment Analysis' : 'Open Sentiment Analysis'}
		                  </button>
		                ) : (
		                  /* 2. If user is NOT Pro, show the Gold Upgrade button[cite: 1, 2] */
		                  <button 
		                    className="visualizer-btn upgrade-pro-btn" 
		                    onClick={() => initiateCheckout(token)}
		                  >
		                    🚀 Unlock with Pro
		                  </button>
		                )}
		              </div>

		              {/* 3. Strict Gate: Only mount ChatSpace if isPro is true AND toggled on[cite: 2] */}
		              {isPro && showSentiment && (
		                <div className="chat-mounting-point" style={{ padding: '20px', borderTop: '1px solid #eee' }}>
		                  <ChatSpace />
		                </div>
		              )}
		            </div> {/* Closes workflow-card */}

		          </div> /* Closes workflow-centered-container */
		        )}

		      </div> /* Closes app-container */
		    ); /* Closes return( */
		  } /* Closes function App() */

		  export default App;