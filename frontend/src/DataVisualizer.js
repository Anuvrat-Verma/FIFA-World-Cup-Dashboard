import React, { useState, useEffect } from 'react';

const DataVisualizer = () => {
  const [chartImage, setChartImage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [loading, setLoading] = useState(false);

  const fetchChart = async () => {
    setLoading(true);
    
    // THE FIX: Use backticks and ${} to make the URL dynamic
    const n8nUrl = `http://localhost:5678/webhook/generate-chart?group=${selectedGroup}`;

    try {
      const response = await fetch(n8nUrl);
      if (!response.ok) throw new Error("n8n error");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setChartImage(imageUrl);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
    return () => { if (chartImage) URL.revokeObjectURL(chartImage); };
  }, [selectedGroup]);

  return (
    <div className="visualizer-container" style={{ textAlign: 'center', padding: '10px' }}>
      {/* 1. Only ONE dropdown, no extra headers or badges */}
      <div style={{ marginBottom: '20px' }}>
        <select 
          value={selectedGroup} 
          onChange={(e) => setSelectedGroup(e.target.value)}
          style={{ 
            padding: '10px 20px', borderRadius: '25px', border: '2px solid #2ecc71', 
            fontWeight: 'bold', fontSize: '16px', outline: 'none'
          }}
        >
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(g => (
            <option key={g} value={g}>Group {g}</option>
          ))}
        </select>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

      {/* 2. Chart area */}
      <div style={{ minHeight: '350px' }}>
        {loading ? (
          <p style={{ color: '#888' }}>Generating Group {selectedGroup} Chart...</p>
        ) : chartImage ? (
          <img 
            src={chartImage} 
            alt={`Group ${selectedGroup} Analytics`} 
            style={{ width: '100%', borderRadius: '15px' }} 
          />
        ) : (
          <p>Ready to visualize.</p>
        )}
      </div>
    </div>
  );
};

export default DataVisualizer;