import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
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
import type { Player, Team, HistoryEntry } from "./types";

export default function App() {
  const { userId, isSignedIn } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sport, setSport] = useState<string>("Cricket");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load shared data from Firestore on login
  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const docRef = doc(db, 'shared', 'auctionData');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPlayers((data.players || []).map((p: any) => ({ ...p, basePrice: p.basePrice || 0 })));
          setTeams(data.teams || []);
          setSport(data.sport || "Cricket");
          setHistory(data.history || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [isSignedIn]);

  // Save data to Firestore on changes
  useEffect(() => {
    if (!isSignedIn || loading) return;
    const saveData = async () => {
      try {
        await setDoc(doc(db, 'shared', 'auctionData'), { players, teams, sport, history }, { merge: true });
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };
    saveData();
  }, [players, teams, sport, history, isSignedIn, loading]);

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

      const result = (doc as any).autoTable({
        startY: startY + 5,
        head: [["Player", "Year", "Bid"]],
        body: team.squad.map(p => [p.name, p.year, `${p.bid} Cr`])
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
  const clearAllData = async () => {
    if (!window.confirm("⚠️ This will delete auction data (players, teams). History will be preserved. Continue?")) return;

    setPlayers([]);
    setTeams([]);
    // Preserve sport, history
    if (isSignedIn) {
      try {
        await setDoc(doc(db, 'shared', 'auctionData'), { players: [], teams: [], sport, history }, { merge: true });
      } catch (error) {
        console.error("Error clearing data:", error);
      }
    }
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
  if (loading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <header>
          <h1> Player Bidding & Squad Builder</h1>
          <p>Manage live bids, track team purses, and build a powerful squad in real time.</p>
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
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <UserButton />
          </div>
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
      </SignedIn>
    </div>
  );
}
