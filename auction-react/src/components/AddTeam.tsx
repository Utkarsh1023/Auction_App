interface Team {
  name: string;
  captain: string;
  purse: number;
  squad: { name: string; year: string; bid: number }[];
}

interface AddTeamProps {
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  teams: Team[];
}

export default function AddTeam({ setTeams, teams }: AddTeamProps) {
  const addTeam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;

    const newTeam: Team = {
      name: (f.elements.namedItem('name') as HTMLInputElement).value.trim(),
      captain: (f.elements.namedItem('captain') as HTMLInputElement).value.trim(),
      purse: Number((f.elements.namedItem('purse') as HTMLInputElement).value),
      squad: []
    };

    // Check for duplicates
    if (teams.some(t => t.name.toLowerCase() === newTeam.name.toLowerCase())) {
      alert("Team name already exists!");
      return;
    }

    setTeams(prev => [...prev, newTeam]);
    f.reset();
  };

  return (
    <form className="card" onSubmit={addTeam}>
      <h3>Add Team</h3>
      <input name="name" placeholder="Team Name" required />
      <input name="captain" placeholder="Captain Name" required />
      <input name="purse" type="number" placeholder="Purse Amount" required />
      <button>Add Team</button>
    </form>
  );
}
