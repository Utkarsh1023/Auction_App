export default function AddTeam({ setTeams, teams }) {
  const addTeam = e => {
    e.preventDefault();
    const form = e.target;

    const newTeam = {
      name: form.team.value.trim(),
      captain: form.captain.value.trim(),
      purse: Number(form.purse.value),
      squad: []
    };

    // Check for duplicates
    if (teams.some(t => t.name.toLowerCase() === newTeam.name.toLowerCase())) {
      alert("Team with this name already exists!");
      return;
    }

    setTeams([...teams, newTeam]);
    form.reset();
  };

  return (
    <form className="card" onSubmit={addTeam}>
      <h3>Add Team</h3>
      <input name="team" placeholder="Team Name" required />
      <input name="captain" placeholder="Captain Name" required />
      <input name="purse" type="number" placeholder="Purse" required />
      <button>Add Team</button>
    </form>
  );
}
