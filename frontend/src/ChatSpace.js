import React, { useState, useEffect, useRef } from 'react';

const ChatSpace = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! Which national team should I analyze for you today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5678/webhook/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      
      // Clean and parse the nested JSON string from Gemini
      const rawAiText = data.text;
      const cleanJsonString = rawAiText.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleanJsonString);

      const aiMessage = { 
        text: result.summary, 
        score: result.score, 
        team: result.team,
        sender: 'ai' 
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Analysis failed:", err);
      setMessages(prev => [...prev, { text: "Error: Could not process sentiment.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatWindow}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            ...styles.bubble, 
            ...(msg.sender === 'user' ? styles.userBubble : styles.aiBubble) 
          }}>
            
            {/* AI BUBBLE CONTENT: Structured Card Layout */}
            {msg.sender === 'ai' && msg.team ? (
              <div style={styles.sentimentCard}>
                <div style={styles.cardHeader}>
                  <span style={styles.teamName}>⚽ {msg.team.toUpperCase()}</span>
                  <span style={{ 
                    ...styles.scoreBadge, 
                    backgroundColor: msg.score > 0 ? '#27ae60' : '#e74c3c' 
                  }}>
                    {msg.score > 0 ? `+${msg.score}` : msg.score}
                  </span>
                </div>
                <div style={styles.summaryText}>{msg.text}</div>
              </div>
            ) : (
              // USER BUBBLE or AI WELCOME MESSAGE
              <div>{msg.text}</div>
            )}

          </div>
        ))}
        {isTyping && <div style={styles.typingIndicator}>Scanning RSS feeds...</div>}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} style={styles.inputArea}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. How is Argentina looking?"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Send</button>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '550px', backgroundColor: '#f4f7f6', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0' },
  chatWindow: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  
  // Base Bubble
  bubble: { maxWidth: '85%', padding: '12px 16px', borderRadius: '15px', fontSize: '14px', lineHeight: '1.5', position: 'relative' },
  
  // Sender Specifics
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2d3436', color: '#fff', borderBottomRightRadius: '2px' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff', color: '#2d3436', borderBottomLeftRadius: '2px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  
  // AI Sentiment Card Elements
  sentimentCard: { display: 'flex', flexDirection: 'column', gap: '8px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '4px' },
  teamName: { fontWeight: '800', color: '#2c3e50', letterSpacing: '0.5px' },
  scoreBadge: { color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  summaryText: { color: '#636e72', fontStyle: 'italic' },

  // Input Area
  inputArea: { display: 'flex', padding: '15px', backgroundColor: '#fff', borderTop: '1px solid #eee' },
  input: { flex: 1, border: '1px solid #dfe6e9', borderRadius: '8px', padding: '10px 15px', outline: 'none', fontSize: '14px' },
  button: { marginLeft: '10px', backgroundColor: '#0984e3', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', fontWeight: '600' },
  typingIndicator: { fontSize: '11px', color: '#b2bec3', fontStyle: 'italic', marginLeft: '10px' }
};

export default ChatSpace;