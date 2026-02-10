import { useState } from "react";
import type { Player, Team } from "../types";

interface FilteredPlayer extends Player {
  originalIndex: number;
}

interface PlayerListProps {
  players: Player[];
  teams: Team[];
  buyPlayer: (playerIndex: number, teamIndex: number, bid: number) => void;
}

export default function PlayerList({ players, teams, buyPlayer }: PlayerListProps) {
  const [bids, setBids] = useState<{ [key: number]: number }>({});
  const [selectedTeams, setSelectedTeams] = useState<{ [key: number]: string }>({});
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredPlayers: FilteredPlayer[] = players
    .map((p, index) => ({ ...p, originalIndex: index }))
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reg.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div>
      <h2>Players List</h2>
      <input
        type="text"
        placeholder="Search by name or registration number"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
      />
      <div className="grid">
        {filteredPlayers.map((p) =>
          !p.sold && (
            <div className="card" key={p.originalIndex}>
              <b>Player Name: {p.name}</b>
              <p>Reg. No.: {p.reg} | Year: {p.year}</p>
              <p>Base Price: {p.basePrice} Cr</p>

              <input
                type="number"
                placeholder="Bid"
                value={bids[p.originalIndex] || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBids({ ...bids, [p.originalIndex]: Number(e.target.value) })
                }
                style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
              />

              <select
                value={selectedTeams[p.originalIndex] ?? ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedTeams({ ...selectedTeams, [p.originalIndex]: e.target.value })
                }
              >
                <option value="">Select Team</option>
                {teams.map((t, idx) => (
                  <option value={idx.toString()} key={idx}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (!bids[p.originalIndex] || selectedTeams[p.originalIndex] === "") {
                    alert("Enter bid & select team");
                    return;
                  }
                  buyPlayer(p.originalIndex, Number(selectedTeams[p.originalIndex]), bids[p.originalIndex]);
                }}
              >
                Sold
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
