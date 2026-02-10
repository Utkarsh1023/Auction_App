import type { Team } from "../types";

interface TeamListProps {
  teams: Team[];
  removeTeam: (teamIndex: number) => void;
}

export default function TeamList({ teams }: TeamListProps) {
  return (
    <div>
      <h2>Team List</h2>
      <div className="grid">
        {teams.map((t, i) => (
          <div className="card" key={i}>
            <div className="team-header">
              <div>
                <h3>{t.name}</h3>
                <p><b>Captain Name:</b> {t.captain}</p>
                <p>Remaining Purse: {t.purse} Cr</p>
              </div>
            </div>
            <div className="squad-list">
              <h4>Squad:</h4>
              {t.squad.length > 0 ? (
                <ol>
                  {t.squad.map((player, idx) => (
                    <li key={idx} className="squad-item">
                      <div>
                        <span className="player-name">Name: {player.name}</span>
                        <span className="player-year"> | Year: {player.year}</span>
                        <span className="player-bid"> | Sold Price: {player.bid} Cr</span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No players yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
