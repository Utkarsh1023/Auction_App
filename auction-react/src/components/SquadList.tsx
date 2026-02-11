import type { Team } from "../types";

interface SquadListProps {
  teams: Team[];
}

export default function SquadList({ teams }: SquadListProps) {
  const renderTeamSquad = (team: Team) => {
    const sortedSquad = [...team.squad].sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div key={team.name}>
        <h3>{team.name} Squad (Captain: {team.captain})</h3>
        {sortedSquad.length > 0 ? (
          <div className="grid">
            {sortedSquad.map((player, idx) => (
              <div className="card" key={idx}>
                <b>Player: {player.name}</b>
                <p>Year: {player.year} | Gender: {player.gender}</p>
                <p>Sold Price: {player.bid} Cr</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No players in squad yet.</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2>Squad List</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {teams.map(renderTeamSquad)}
      </div>
    </div>
  );
}
