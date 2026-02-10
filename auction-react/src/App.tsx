import { useEffect, useState } from "react";
import "./App.css";
import AddPlayer from "./components/AddPlayer";
import AddTeam from "./components/AddTeam";
import PlayerList from "./components/PlayerList";
import TeamList from "./components/TeamList";
import AddPlayerExcel from "./components/AddPlayerExcel";
import AddTeamExcel from "./components/AddTeamExcel";
import Login from "./components/Login";
import AuctionHistory from "./components/AuctionHistory";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function App() {
  const [players, setPlayers] = useState(() =>
    (JSON.parse(localStorage.getItem("players")) || []).map(p => ({
      ...p,
      basePrice: p.basePrice || 0
    }))
  );

  const [teams, setTeams] = useState(() =>
    (JSON.parse(localStorage.getItem("teams")) || [])
  );

  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    JSON.parse(localStorage.getItem("isLoggedIn")) || false
  );

  const [currentUser, setCurrentUser] = useState(() =>
    localStorage.getItem("currentUser") || ""
  );

  const [users, setUsers] = useState(() =>
    JSON.parse(localStorage.getItem("users")) || {}
  );

  const [sport, setSport] = useState(() =>
    localStorage.getItem("sport") || "Cricket"
  );

  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem("history")) || []
  );

  /* ================= AUTO SAVE ================= */
  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem("currentUser", currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("sport", sport);
  }, [sport]);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  /* ================= BUY PLAYER ================= */
  const buyPlayer = (playerIndex, teamIndex, bid) => {
    const team = teams[teamIndex];
    const player = players[playerIndex];

    if (!team || !player) return;

    if (bid > team.purse) {
      alert("Bid exceeds team's remaining purse!");
      return;
    }

    if (bid < player.basePrice) {
      alert("Bid must be at least the base price!");
      return;
    }

    // mark player sold
    setPlayers(prev =>
      prev.map((p, i) =>
        i === playerIndex ? { ...p, sold: true } : p
      )
    );

    // update team
    setTeams(prev =>
      prev.map((t, i) =>
        i === teamIndex
          ? {
              ...t,
              purse: t.purse - bid,
              squad: [...t.squad, {name: player.name, year: player.year, bid: bid}]
            }
          : t
      )
    );
  };

  /* ================= PDF ================= */
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("🏏 Auction Result", 14, 10);

    let startY = 20;

    teams.forEach(team => {
      doc.text(
        `${team.name} (Captain: ${team.captain})`,
        14,
        startY
      );

      doc.autoTable({
        startY: startY + 5,
        head: [["Player", "Year", "Bid"]],
        body: team.squad.map(p => [p.name, p.year, `${p.bid} Cr`])
      });

      startY = doc.lastAutoTable.finalY + 10;
    });

    doc.save("auction-result.pdf");
  };

  /* ================= EXCEL ================= */
  const exportPlayersExcel = () => {
    const data = players.map(p => {
      let soldTo = "";
      if (p.sold) {
        // Find which team bought this player
        for (const team of teams) {
          const playerInSquad = team.squad.find(s => s.name === p.name && s.year === p.year);
          if (playerInSquad) {
            soldTo = team.name;
            break;
          }
        }
      }
      return {
        Name: p.name,
        "Registration No": p.reg,
        Year: p.year,
        "Base Price": p.basePrice,
        Status: p.sold ? "Sold" : "Unsold",
        "Sold To": soldTo
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Players");
    XLSX.writeFile(workbook, "player-list.xlsx");
  };

  /* ================= CLEAR ================= */
  const clearAllData = () => {
    if (!window.confirm("⚠️ This will delete auction data (players, teams). Registered users and history will be preserved. Continue?")) return;

    setPlayers([]);
    setTeams([]);
    setIsLoggedIn(false);
    setCurrentUser("");
    localStorage.removeItem("players");
    localStorage.removeItem("teams");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    // Preserve users, sport, history
  };

  /* ================= AUTH ================= */
  const handleLogin = (username, password) => {
    if (users[username] && users[username] === password) {
      setIsLoggedIn(true);
      setCurrentUser(username);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleRegister = (username, password) => {
    if (users[username]) {
      alert("Username already exists");
      return;
    }
    setUsers(prev => ({ ...prev, [username]: password }));
    alert("Registration successful! Please login.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
  };

  /* ================= AUCTION COMPLETION ================= */
  const isAuctionCompleted = players.every(p => p.sold);

  const saveAuctionData = () => {
    const data = { players, teams };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auction-data.json';
    a.click();
    URL.revokeObjectURL(url);

    // Save to history
    const historyEntry = {
      sport,
      date: new Date().toISOString(),
      playersCount: players.length,
      teamsCount: teams.length,
      players: [...players],
      teams: [...teams],
      auctionData: JSON.stringify(data)
    };
    setHistory(prev => [...prev, historyEntry]);
  };

  /* ================= UI ================= */
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="App">
      <header>
        <h1> Player Bidding & Squad Builder</h1>
        <p>Manage live bids, track team purses, and build a powerful squad in rela time.</p>
        <p>Every Bid counts - strategy decides the champion.</p>
        <div style={{ marginBottom: "20px" }}>
          <label>Sport: </label>
          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="Cricket">Cricket</option>
            <option value="Football">Football</option>
            <option value="Basketball">Basketball</option>
            <option value="Baseball">Baseball</option>
            <option value="Soccer">Soccer</option>
          </select>
        </div>
        <p>Logged in as: {currentUser} <button onClick={handleLogout}>Logout</button></p>
      </header>

      <main>
        <section>
          <h2>Add Player & Team Captain or Upload File</h2>
          <div className="grid">
            <AddPlayer setPlayers={setPlayers} players={players} />
            <AddTeam setTeams={setTeams} teams={teams} />
            <div className="card">
              <AddPlayerExcel setPlayers={setPlayers} />
              <AddTeamExcel setTeams={setTeams} />
            </div>
          </div>
        </section>

        <section>
          <PlayerList
            players={players}
            teams={teams}
            buyPlayer={buyPlayer}
          />
        </section>

        <section>
          <TeamList teams={teams} />
        </section>

        <section>
          <AuctionHistory history={history} setHistory={setHistory} />
        </section>

        <>
          {isAuctionCompleted && (
            <section>
              <div className="card" style={{ textAlign: "center" }}>
                <h2>🏆 Auction Completed!</h2>
                <p>All players have been sold.</p>
                <button onClick={saveAuctionData} style={{ marginTop: "20px" }}>
                  💾 Save Auction Data (JSON)
                </button>
              </div>
            </section>
          )}

          <section>
            <div className="export-buttons">
              <button onClick={downloadPDF}>
                📄 Download Auction Results (PDF)
              </button>

              <button onClick={exportPlayersExcel}>
                📊 Export Players to Excel
              </button>

              <button onClick={clearAllData} className="clear-btn">
                🗑️ Clear All Data
              </button>
            </div>
          </section>
        </>
      </main>
    </div>
  );
}
