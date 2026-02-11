import type { Team } from "../types";

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
      gender: (f.elements.namedItem('gender') as HTMLSelectElement).value as 'Male' | 'Female',
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
      <select name="gender" required>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <input name="purse" type="number" placeholder="Purse Amount" required />
      <button>Add Team</button>
    </form>
  );
}
