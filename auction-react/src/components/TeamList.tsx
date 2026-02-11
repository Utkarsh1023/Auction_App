import type { Team } from "../types";

interface TeamListProps {
  teams: Team[];
  removeTeam: (teamIndex: number) => void;
  genderFilter: 'All' | 'Male' | 'Female';
}

export default function TeamList({ teams, removeTeam, genderFilter }: TeamListProps) {
  const boysTeams = teams.filter(t => t.gender === 'Male');
  const girlsTeams = teams.filter(t => t.gender === 'Female');

  const renderTeamCard = (t: Team, i: number) => (
    <div className="card" key={i}>
      <div className="team-header">
        <div>
          <h3>{t.name} </h3>
          <p><b>Captain Name:</b> {t.captain}</p>
          <p>Remaining Purse: {t.purse} Cr</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to remove this team?")) {
              removeTeam(i);
            }
          }}
          style={{ backgroundColor: "#dc3545", color: "white", marginTop: "10px" }}
        >
          Remove Team
        </button>
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
                  <span className="player-gender"> | Gender: {player.gender}</span>
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
  );

  return (
    <div>
      <h2>Team List</h2>

      <div style={{ display: 'flex', gap: '20px' }}>
        {(genderFilter === 'All' || genderFilter === 'Male') && (
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2>Male Team</h2>
            <div className="grid">
              {boysTeams.map((t) => renderTeamCard(t, teams.indexOf(t)))}
            </div>
          </div>
        )}

        {(genderFilter === 'All' || genderFilter === 'Female') && (
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2>Female Team</h2>
            <div className="grid">
              {girlsTeams.map((t) => renderTeamCard(t, teams.indexOf(t)))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
