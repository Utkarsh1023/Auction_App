const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  name: String,
  reg: String,
  year: String,
  gender: String,
  basePrice: Number,
  sold: Boolean,
});

module.exports = mongoose.model("Player", PlayerSchema);

const Player = require("./models/Player");

app.post("/add-player", async (req, res) => {
  const player = await Player.create(req.body);
  res.json(player);
});

app.get("/players", async (req, res) => {
  const players = await Player.find();
  res.json(players);
});
axios.post("http://localhost:5000/add-player", newPlayer);
useEffect(() => {
  axios.get("http://localhost:5000/players")
    .then(res => setPlayers(res.data));
}, []);
