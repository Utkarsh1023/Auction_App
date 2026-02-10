import type { Player } from "../types";

interface AddPlayerProps {
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  players: Player[];
}

export default function AddPlayer({ setPlayers, players }: AddPlayerProps) {
  const addPlayer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;

    const newPlayer: Player = {
      name: (f.elements.namedItem('name') as HTMLInputElement).value.trim(),
      reg: (f.elements.namedItem('reg') as HTMLInputElement).value.trim(),
      year: (f.elements.namedItem('year') as HTMLInputElement).value.trim(),
      basePrice: Number((f.elements.namedItem('base') as HTMLInputElement).value),
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
