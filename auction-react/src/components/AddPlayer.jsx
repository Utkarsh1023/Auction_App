export default function AddPlayer({ setPlayers, players }) {
  const addPlayer = e => {
    e.preventDefault();
    const f = e.target;

    const newPlayer = {
      name: f.name.value.trim(),
      reg: f.reg.value.trim(),
      year: f.year.value.trim(),
      basePrice: Number(f.base.value),
      sold: false
    };

    // Check for duplicates
    if (players.some(p => p.name.toLowerCase() === newPlayer.name.toLowerCase() || p.reg === newPlayer.reg)) {
      alert("Player with registration number already exists!");
      return;
    }

    setPlayers(prev => [...prev, newPlayer]);
    f.reset();
  };

  return (
    <form className="card" onSubmit={addPlayer}>
      <h3>Add Player</h3>
      <input name="name" placeholder="Player Name" required />
      <input name="reg" placeholder="Reg No" required />
      <input name="year" placeholder="Year" required />
      <input name="base" type="number" placeholder="Base Price" required />
      <button>Add Player</button>
    </form>
  );
}
