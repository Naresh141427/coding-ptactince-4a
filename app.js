const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersDetailsQuery = `SELECT
        *
        FROM
            cricket_team
        ORDER BY
            player_id;`;

  const playersArray = await db.all(getPlayersDetailsQuery);
  response.send(playersArray);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO
        cricket_team(playerName,jerseyNumber,role)
        VALUES
          (
              ${playerName},
              ${jerseyNumber},
              ${role}
          );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getDetails = `SELECT
        *
        FROM
            cricket_team
        WHERE
            player_id = ${playerId};`;
  const playerDetails = await db.get(getDetails);
  response.send(playerDetails);
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE
        cricket_team
        SET
            playerName = ${playerName},
            jerseyNumber = ${jerseyNumber},
            role = ${role}
        WHERE
            player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteplayerQuery = `SELECT
        *
        FROM
            cricket_team
        WHERE
            player_id = ${playerId};`;
  await db.get(deleteplayerQuery);
  response.send("Player Removed");
});

module.exports = app;
