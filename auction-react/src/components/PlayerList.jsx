import { useState } from "react";

export default function PlayerList({ players, teams, buyPlayer }) {
  const [bids, setBids] = useState({});
  const [selectedTeams, setSelectedTeams] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlayers = players.map((p, index) => ({ ...p, originalIndex: index })).filter(p =>
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
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
      />
      <div className="grid">
        {filteredPlayers.map((p) =>
          !p.sold && (
            <div className="card" key={p.originalIndex}>
              <b>Player Name: {p.name}</b>
              <p>Reg. No.: {p.reg} | Year: {p.year}</p>
              <p>Base Price ₹{p.basePrice}</p>

              <input
                type="number"
                placeholder="Bid"
                value={bids[p.originalIndex] || ""}
                onChange={e =>
                  setBids({ ...bids, [p.originalIndex]: Number(e.target.value) })
                }
                style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
              />

              <select
                value={selectedTeams[p.originalIndex] ?? ""}
                onChange={e =>
                  setSelectedTeams({ ...selectedTeams, [p.originalIndex]: e.target.value })
                }
              >
                <option value="">Select Team</option>
                {teams.map((t, idx) => (
                  <option value={idx} key={idx}>
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
