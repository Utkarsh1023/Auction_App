import { useEffect, useState } from "react";
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
import type { Player, Team, HistoryEntry } from "./types";

export default function App() {
  const { isSignedIn, user } = useUser();
  const userId = user?.id;

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem("players");
    return saved ? JSON.parse(saved) as Player[] : [];
  });
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem("teams");
    return saved ? JSON.parse(saved) as Team[] : [];
  });
  const [sport, setSport] = useState<string>("Cricket");

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
  }, [teams]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [auctionCompletedHandled, setAuctionCompletedHandled] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [socket, setSocket] = useState<Socket | null>(null);

  const isAuctionCompleted =
    players.length > 0 && players.every(p => p.sold);

  /* ================= SOCKET CONNECTION ================= */
  useEffect(() => {
    if (isSignedIn && userId) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('join', userId);

      newSocket.on('dataUpdated', (updatedData) => {
        setPlayers(updatedData.players || []);
        setTeams(updatedData.teams || []);
        setSport(updatedData.sport || "Cricket");
        setHistory(updatedData.history || []);
      });

      return () => {
        newSocket.disconnect();
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
      try {
        const response = await fetch('/api/auction/data', {
          headers: {
            'user-id': userId
          }
        });
        const data = await response.json();

        setPlayers(data.players || []);
        setTeams(data.teams || []);
        setSport(data.sport || "Cricket");
        setHistory(data.history || []);

        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isSignedIn, userId]);

  /* ================= SAVE USER DATA ================= */
  useEffect(() => {
    if (!isSignedIn || !userId || loading || !dataLoaded) return;

    const saveData = async () => {
      try {
        await fetch('/api/auction/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId
          },
          body: JSON.stringify({ players, teams, sport, history })
        });
      } catch (error) {
        console.error("Error saving data:", error);
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

    if (userId) {
      await fetch('/api/auction/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify({ players: [], teams: [], sport, history })
      });
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

          <TeamList teams={teams} removeTeam={removeTeam} genderFilter={genderFilter} />

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
