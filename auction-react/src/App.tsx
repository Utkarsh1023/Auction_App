import { useEffect, useState, useRef } from "react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { io, Socket } from "socket.io-client";
import "./App.css";

import AddPlayer from "./components/AddPlayer";
import AddTeam from "./components/AddTeam";
import PlayerList from "./components/PlayerList";
import TeamList from "./components/TeamList";
import AddPlayerExcel from "./components/AddPlayerExcel";
import AddTeamExcel from "./components/AddTeamExcel";
import Login from "./components/Login";
import AuctionHistory from "./components/AuctionHistory";

import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Player, Team, HistoryEntry } from "./types";

export default function App() {
  const { isSignedIn, user } = useUser();
  const userId = user?.id;

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sport, setSport] = useState<string>("Cricket");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [auctionCompletedHandled, setAuctionCompletedHandled] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const socketRef = useRef<Socket | null>(null);

  // Helper functions for localStorage
  const saveToLocalStorage = (data: { players: Player[], teams: Team[], sport: string, history: HistoryEntry[] }) => {
    if (userId) {
      localStorage.setItem(`auctionData_${userId}`, JSON.stringify(data));
    }
  };

  const loadFromLocalStorage = (): { players: Player[], teams: Team[], sport: string, history: HistoryEntry[] } | null => {
    if (userId) {
      const data = localStorage.getItem(`auctionData_${userId}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  };

  const isAuctionCompleted =
    players.length > 0 && players.every(p => p.sold);

  /* ================= SOCKET CONNECTION ================= */
  useEffect(() => {
    if (isSignedIn && userId) {
      socketRef.current = io('http://localhost:5000');

      socketRef.current.emit('join', userId);

      socketRef.current.on('dataUpdated', (updatedData) => {
        setPlayers(updatedData.players || []);
        setTeams(updatedData.teams || []);
        setSport(updatedData.sport || "Cricket");
        setHistory(updatedData.history || []);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isSignedIn, userId]);

  /* ================= LOAD USER DATA ================= */
  useEffect(() => {
    if (!isSignedIn || !userId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      let dataLoaded = false;

      // Load from localStorage first
      const localData = loadFromLocalStorage();
      if (localData) {
        setPlayers(localData.players || []);
        setTeams(localData.teams || []);
        setSport(localData.sport || "Cricket");
        setHistory(localData.history || []);
        dataLoaded = true;
      } else {
        // No local data, set defaults
        setPlayers([]);
        setTeams([]);
        setSport("Cricket");
        setHistory([]);
        dataLoaded = true;
      }

      // Try to load from server and update if server has data
      try {
        const response = await fetch('http://localhost:5000/api/auction/data', {
          headers: {
            'user-id': userId
          }
        });
        const data = await response.json();

        // If server has data (e.g., players array is not empty), update the state and localStorage
        if (data.players && data.players.length > 0) {
          setPlayers(data.players);
          setTeams(data.teams || []);
          setSport(data.sport || "Cricket");
          setHistory(data.history || []);
          saveToLocalStorage(data);
        }
      } catch (error) {
        console.error("Error loading data from server:", error);
        // Ignore, keep local data
      } finally {
        setLoading(false);
        setDataLoaded(dataLoaded);
      }
    };

    loadData();
  }, [isSignedIn, userId]);

  /* ================= SAVE USER DATA ================= */
  useEffect(() => {
    if (!isSignedIn || !userId || loading || !dataLoaded) return;

    const saveData = async () => {
      // Always save to localStorage first
      saveToLocalStorage({ players, teams, sport, history });

      try {
        await fetch('http://localhost:5000/api/auction/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId
          },
          body: JSON.stringify({ players, teams, sport, history })
        });

        // Notify all devices for live update
        socketRef.current?.emit('dataChanged', { userId });
      } catch (error) {
        console.error("Error saving data to server:", error);
        // Data is still saved to localStorage, so it's not lost
      }
    };

    saveData();
  }, [players, teams, sport, history, isSignedIn, userId, loading, dataLoaded]);

  /* ================= HANDLE AUCTION COMPLETION ================= */
  useEffect(() => {
    if (isAuctionCompleted && !auctionCompletedHandled) {
      const newEntry: HistoryEntry = {
        sport,
        date: new Date().toISOString(),
        playersCount: players.length,
        teamsCount: teams.length,
        players: [...players],
        teams: [...teams],
        auctionData: JSON.stringify({ players, teams, sport }),
      };
      setHistory(prev => [...prev, newEntry]);
      setAuctionCompletedHandled(true);
    }
  }, [isAuctionCompleted, auctionCompletedHandled, sport, players, teams]);

  /* ================= REMOVE PLAYER ================= */
  const removePlayer = (playerIndex: number) => {
    setPlayers(prev => prev.filter((_, i) => i !== playerIndex));
  };

  /* ================= REMOVE TEAM ================= */
  const removeTeam = (teamIndex: number) => {
    setTeams(prev => prev.filter((_, i) => i !== teamIndex));
  };

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

    const updatedPlayers = players.map((p, i) =>
      i === playerIndex ? { ...p, sold: true } : p
    );

    const updatedTeams = teams.map((t, i) =>
      i === teamIndex
        ? {
            ...t,
            purse: t.purse - bid,
            squad: [
              ...t.squad,
              {
                name: player.name,
                year: player.year,
                gender: player.gender,
                bid: bid,
              },
            ],
          }
        : t
    );

    setPlayers(updatedPlayers);
    setTeams(updatedTeams);

    // Data will be saved via useEffect, which will trigger socket emit from server
  };

  /* ================= EXPORT PLAYERS EXCEL ================= */
  const exportPlayersExcel = () => {
    const data = players.map(p => {
      let soldTo = "";
      if (p.sold) {
        for (const team of teams) {
          const found = team.squad.find(
            s => s.name === p.name && s.year === p.year
          );
          if (found) {
            soldTo = team.name;
            break;
          }
        }
      }

      return {
        Name: p.name,
        "Registration No": p.reg,
        Year: p.year,
        Gender: p.gender,
        "Base Price": p.basePrice,
        Status: p.sold ? "Sold" : "Unsold",
        "Sold To": soldTo,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!autofilter"] = { ref: "A1:G1" };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Players");

    XLSX.writeFile(workbook, "player-list.xlsx");
  };

  /* ================= CLEAR DATA ================= */
  const clearAllData = async () => {
    if (
      !window.confirm(
        "⚠️ This will delete auction data (players & teams). Continue?"
      )
    )
      return;

    setPlayers([]);
    setTeams([]);
    setAuctionCompletedHandled(false);

    // Clear localStorage
    if (userId) {
      localStorage.removeItem(`auctionData_${userId}`);
    }

    if (userId) {
      try {
        await fetch('http://localhost:5000/api/auction/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId
          },
          body: JSON.stringify({ players: [], teams: [], sport, history })
        });
      } catch (error) {
        console.error("Error clearing server data:", error);
      }
    }
  };

  /* ================= EXPORT HISTORY TO EXCEL ================= */
  const exportHistoryToExcel = () => {
    const data = history.map(h => ({
      Sport: h.sport,
      Date: new Date(h.date).toLocaleDateString(),
      'Players Count': h.playersCount,
      'Teams Count': h.teamsCount,
      'Auction Data': h.auctionData,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!autofilter"] = { ref: "A1:E1" };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "History");

  XLSX.writeFile(workbook, "auction-history.xlsx");
  };

  /* ================= EXPORT TEAM SQUAD PDF ================= */
  const exportTeamSquadPDF = (team: Team) => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text(`${team.name} Squad`, 105, 20, { align: 'center' });

      // Captain info
      doc.setFontSize(12);
      doc.text(`Captain: ${team.captain}`, 20, 40);
      doc.text(`Remaining Purse: ${team.purse} Cr`, 20, 50);

      // Squad list
      doc.setFontSize(14);
      doc.text('Squad Players:', 20, 70);

      let yPosition = 80;
      team.squad.forEach((player, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${player.name} - Year: ${player.year} - Gender: ${player.gender} - Sold Price: ${player.bid} Cr`, 20, yPosition);
        yPosition += 10;
      });

      doc.save(`${team.name}_Squad.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
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
          <h1>Players Bidding & Squad Builder</h1>
          <p>Manage live bids and build powerful squads.</p>

          <select
            value={sport}
            onChange={e => setSport(e.target.value)}
          >
            <option value="Cricket">Cricket</option>
            <option value="Football">Football</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Badminton">Badminton</option>
            <option value="Table Tennis">Table Tennis</option>
            <option value="E-Sports">E-Sports</option>
            <option value="Kabaddi">Kabaddi</option>
            <option value="Chess">Chess</option>
          </select>

          <UserButton />
        </header>

        <main>
                      <section className="add-section">
              <div className="card-grid">
                <div className="card">
                  <AddPlayer setPlayers={setPlayers} players={players} />
                </div>

                <div className="card">
                  <AddTeam setTeams={setTeams} teams={teams} />
                </div>

                <div className="card">
                  <AddPlayerExcel setPlayers={setPlayers} />
                </div>

                <div className="card">
                  <AddTeamExcel setTeams={setTeams} />
                </div>
              </div>
            </section>


          <div style={{ marginBottom: "20px", display: "flex" }}>
            <button
              onClick={() => setGenderFilter('All')}
              style={{
                marginRight: "10px",
                backgroundColor: genderFilter === 'All' ? '#007bff' : '#f8f9fa',
                color: genderFilter === 'All' ? 'white' : 'black',
                border: '1px solid #ccc',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              All
            </button>
            <button
              onClick={() => setGenderFilter('Male')}
              style={{
                marginRight: "10px",
                backgroundColor: genderFilter === 'Male' ? '#007bff' : '#f8f9fa',
                color: genderFilter === 'Male' ? 'white' : 'black',
                border: '1px solid #ccc',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Male
            </button>
            <button
              onClick={() => setGenderFilter('Female')}
              style={{
                backgroundColor: genderFilter === 'Female' ? '#007bff' : '#f8f9fa',
                color: genderFilter === 'Female' ? 'white' : 'black',
                border: '1px solid #ccc',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Female
            </button>
          </div>

          <PlayerList
            players={players}
            teams={teams}
            buyPlayer={buyPlayer}
            removePlayer={removePlayer}
            genderFilter={genderFilter}
          />

          <TeamList teams={teams} removeTeam={removeTeam} genderFilter={genderFilter} exportTeamSquadPDF={exportTeamSquadPDF} />

          {/* <SquadList teams={teams} /> */}

          <AuctionHistory
            history={history}
            setHistory={setHistory}
            exportHistoryToExcel={exportHistoryToExcel}
          />

          {isAuctionCompleted && (
            <div className="card">
              <h2>🏆 Auction Completed!</h2>
            </div>
          )}

          <button onClick={exportPlayersExcel}>
            📊 Export Players Status
          </button>

          <button onClick={clearAllData}>
            🗑️ Clear Data
          </button>
        </main>
      </SignedIn>
    </div>
  );
}
