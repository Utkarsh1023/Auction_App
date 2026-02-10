import { useState } from "react";

export default function AuctionHistory({ history, setHistory }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (index) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const deleteHistoryEntry = (index) => {
    if (window.confirm("Are you sure you want to delete this auction history?")) {
      setHistory(prev => prev.filter((_, i) => i !== index));
    }
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to delete ALL auction history?")) {
      setHistory([]);
    }
  };

  const downloadHistoryData = (auctionData, date) => {
    const blob = new Blob([auctionData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auction-data-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Auction History</h2>
      {history.length === 0 ? (
        <p>No auction history available.</p>
      ) : (
        <>
          <button onClick={clearAllHistory} className="clear-btn" style={{ marginBottom: "20px" }}>
            🗑️ Clear All History
          </button>
          <div className="grid">
            {history.map((entry, index) => (
              <div className="card" key={index}>
                <h3>{entry.sport} Auction</h3>
                <p>Date: {new Date(entry.date).toLocaleString()}</p>
                <p>Players: {entry.playersCount} | Teams: {entry.teamsCount}</p>
                <button onClick={() => toggleExpanded(index)}>
                  {expanded[index] ? "Hide Details" : "Show Details"}
                </button>
                {expanded[index] && (
                  <div style={{ marginTop: "10px" }}>
                    <h4>Players:</h4>
                    <ul>
                      {entry.players.map((p, i) => (
                        <li key={i}>{p.name} ({p.year}) - {p.sold ? "Sold" : "Unsold"}</li>
                      ))}
                    </ul>
                    <h4>Teams:</h4>
                    <ul>
                      {entry.teams.map((t, i) => (
                        <li key={i}>{t.name} (Captain: {t.captain}) - Purse: ₹{t.purse}</li>
                      ))}
                    </ul>
                    <button onClick={() => downloadHistoryData(entry.auctionData, entry.date)}>
                      📄 Download Data
                    </button>
                  </div>
                )}
                <button onClick={() => deleteHistoryEntry(index)} style={{ marginTop: "10px", backgroundColor: "red", color: "white" }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
