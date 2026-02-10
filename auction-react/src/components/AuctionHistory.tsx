import { useState } from "react";
import type { HistoryEntry } from "../types";

interface AuctionHistoryProps {
  history: HistoryEntry[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  exportHistoryToExcel: () => void;
}

export default function AuctionHistory({ history, setHistory, exportHistoryToExcel }: AuctionHistoryProps) {
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const deleteHistory = (index: number) => {
    if (window.confirm("Delete this auction history?")) {
      setHistory(prev => prev.filter((_, i) => i !== index));
    }
  };

  const clearAllHistory = () => {
    if (window.confirm("Clear all auction history?")) {
      setHistory([]);
    }
  };

  const viewTeams = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
  };

  const closeModal = () => {
    setSelectedEntry(null);
  };

  return (
    <div>
      <h2>Auction History</h2>
      {history.length === 0 ? (
        <p>No auction history available.</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button onClick={clearAllHistory}>
              Clear All History
            </button>
            <button onClick={exportHistoryToExcel}>
              📊 Export History to Excel
            </button>
          </div>
          <div className="grid">
            {history.map((entry, index) => (
              <div className="card" key={index}>
                <h3>{entry.sport} Auction - {new Date(entry.date).toLocaleDateString()}</h3>
                <p>Players: {entry.playersCount} | Teams: {entry.teamsCount}</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button onClick={() => viewTeams(entry)}>View Teams</button>
                  <button onClick={() => deleteHistory(index)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedEntry && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEntry.sport} Auction Teams - {new Date(selectedEntry.date).toLocaleDateString()}</h3>
            <div className="teams-list">
              {selectedEntry.teams.map((team, teamIndex) => (
                <div className="card" key={teamIndex} style={{ marginBottom: "20px" }}>
                  <h4>{team.name} (Captain: {team.captain})</h4>
                  <p>Purse Remaining: {team.purse} Cr</p>
                  <h5>Squad:</h5>
                  <ul>
                    {team.squad.map((player, playerIndex) => (
                      <li key={playerIndex}>
                        {player.name} ({player.year}) - {player.bid} Cr
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button onClick={closeModal} style={{ marginTop: "20px" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
