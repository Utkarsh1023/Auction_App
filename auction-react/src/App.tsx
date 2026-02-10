import { useEffect, useState } from "react";
import "./App.css";
import AddPlayer from "./components/AddPlayer.tsx";
import AddTeam from "./components/AddTeam.tsx";
import PlayerList from "./components/PlayerList.tsx";
import TeamList from "./components/TeamList.tsx";
import AddPlayerExcel from "./components/AddPlayerExcel.tsx";
import AddTeamExcel from "./components/AddTeamExcel";
import Login from "./components/Login";
import AuctionHistory from "./components/AuctionHistory";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Player, Team, HistoryEntry } from "./types";

export default function App() {
  const [players, setPlayers] = useState<Player[]>(() =>
    (JSON.parse(localStorage.getItem("players") || "[]") as Player[]).map(p => ({
      ...p,
      basePrice: p.basePrice || 0
    }))
  );

  const [teams, setTeams] = useState<Team[]>(() =>
    JSON.parse(localStorage.getItem("teams") || "[]") as Team[]
  );

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("isLoggedIn") || "false") as boolean
  );

  const [currentUser, setCurrentUser] = useState<string>(() =>
    localStorage.getItem("currentUser") || ""
  );

  const [users, setUsers] = useState<Record<string, string>>(() =>
    JSON.parse(localStorage.getItem("users") || "{}") as Record<string, string>
  );

  const [sport, setSport] = useState<string>(() =>
    localStorage.getItem("sport") || "Cricket"
  );

  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    JSON.parse(localStorage.getItem("history") || "[]") as HistoryEntry[]
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
  const buyPlayer = (playerIndex: number, teamIndex: number, bid: number) => {
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

      const result = doc.autoTable({
        startY: startY + 5,
        head: [["Player", "Year", "Bid"]],
        body: team.squad.map((p: { name: string; year: string; bid: number }) => [p.name, p.year, `${p.bid} Cr`])
      });

      startY = result.finalY + 10;
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
  const handleLogin = (username: string, password: string) => {
    if (users[username] && users[username] === password) {
      setIsLoggedIn(true);
      setCurrentUser(username);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleRegister = (username: string, password: string) => {
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

  const exportHistoryToExcel = () => {
    if (history.length === 0) {
      alert("No history to export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = history.map((entry, index) => ({
      "Index": index + 1,
      "Sport": entry.sport,
      "Date": new Date(entry.date).toLocaleDateString(),
      "Players Count": entry.playersCount,
      "Teams Count": entry.teamsCount
    }));
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "History Summary");

    // Detailed sheets for each auction
    history.forEach((entry, index) => {
      const auctionData = JSON.parse(entry.auctionData);
      const playersData = auctionData.players.map((p: Player) => ({
        Name: p.name,
        "Registration No": p.reg,
        Year: p.year,
        "Base Price": p.basePrice,
        Status: p.sold ? "Sold" : "Unsold"
      }));
      const teamsData = auctionData.teams.map((t: Team) => ({
        Name: t.name,
        Captain: t.captain,
        "Remaining Purse": t.purse,
        "Squad Size": t.squad.length
      }));

      const playersSheet = XLSX.utils.json_to_sheet(playersData);
      const teamsSheet = XLSX.utils.json_to_sheet(teamsData);

      XLSX.utils.book_append_sheet(workbook, playersSheet, `Auction ${index + 1} - Players`);
      XLSX.utils.book_append_sheet(workbook, teamsSheet, `Auction ${index + 1} - Teams`);
    });

    XLSX.writeFile(workbook, "auction-history.xlsx");
  };

  const saveAuctionData = () => {
    // Prepare data for Excel
    const playersData = players.map(p => ({
      Name: p.name,
      "Registration No": p.reg,
      Year: p.year,
      "Base Price": p.basePrice,
      Status: p.sold ? "Sold" : "Unsold"
    }));

    const teamsData = teams.map(t => ({
      Name: t.name,
      Captain: t.captain,
      "Remaining Purse": t.purse,
      "Squad Size": t.squad.length
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const playersSheet = XLSX.utils.json_to_sheet(playersData);
    const teamsSheet = XLSX.utils.json_to_sheet(teamsData);

    XLSX.utils.book_append_sheet(workbook, playersSheet, "Players");
    XLSX.utils.book_append_sheet(workbook, teamsSheet, "Teams");

    // Download Excel file
    XLSX.writeFile(workbook, "auction-data.xlsx");

    // Save to history
    const historyEntry = {
      sport,
      date: new Date().toISOString(),
      playersCount: players.length,
      teamsCount: teams.length,
      players: [...players],
      teams: [...teams],
      auctionData: JSON.stringify({ players, teams }) // Keep JSON for history storage
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
            <option value="Volleyball">Volleyball</option>
            <option value="Badminton">Badminton</option>
            <option value="Table Tennis">Table Tennis</option>
            <option value="E-Sports">E-Sports</option>
            <option value="Kabbadi">Kabbadi</option>
            <option value="Chess">Chess</option>
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
          <AuctionHistory history={history} setHistory={setHistory} exportHistoryToExcel={exportHistoryToExcel} />
        </section>

        <>
          {isAuctionCompleted && (
            <section>
              <div className="card" style={{ textAlign: "center" }}>
                <h2>🏆 Auction Completed!</h2>
                <p>All players have been sold.</p>
                <button onClick={saveAuctionData} style={{ marginTop: "20px" }}>
                  💾 Save Auction Data (Excel)
                </button>
              </div>
            </section>
          )}

          <section>
            <div className="export-buttons">
              <button onClick={downloadPDF}>
                📄 Download Auction Results
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
