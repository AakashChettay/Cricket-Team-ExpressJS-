const express = require('express')
const myapp = express()
myapp.use(express.json())

const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    myapp.listen(3000, () => {
      console.log(
        'Server started on https://chettayaakashqhyvpnjscpxtwms.drops.nxtwave.tech',
      )
    })
  } catch (e) {
    console.log(`Database error: ${e.message}`)
    process.exit(1)
  }
}

initializeDatabaseAndServer()

// Get Players API
myapp.get('/players/', async (req, res) => {
  try {
    const getPlayersQuery = `
      SELECT player_id AS playerId, player_name AS playerName, jersey_number AS jerseyNumber, role
      FROM cricket_team;`
    const dbResponse = await db.all(getPlayersQuery)
    res.send(dbResponse)
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error')
  }
})
//Add Player API
myapp.post('/players', async (req, res) => {
  const bookDetails = req.body
  const {playerId, playerName, jerseyNumber, role} = bookDetails

  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_id, player_name, jersey_number, role)
    VALUES
      (
        $1,
        $2,
        $3,
        $4
      );`

  const dbResponse = await db.run(addPlayerQuery, [
    playerId,
    playerName,
    jerseyNumber,
    role,
  ])

  const player_Id = dbResponse.lastID
  console.log(player_Id)
  res.send('Player Added to Team')
})

// Get Player by Id API
myapp.get('/players/:playerId', async (req, res) => {
  const {playerId} = req.params

  try {
    const getPlayerByIdQuery = `
      SELECT player_id AS playerId, player_name AS playerName, jersey_number AS jerseyNumber, role
      FROM cricket_team
      WHERE player_id = ?;`
    const dbResponse = await db.get(getPlayerByIdQuery, playerId)
    if (dbResponse) {
      res.send(dbResponse)
    } else {
      res.status(404).send('Player not found')
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// Update Player API
myapp.put('/players/:playerId', async (req, res) => {
  const {playerId} = req.params
  const bookDetails = req.body
  const {playerName, jerseyNumber, role} = bookDetails

  // Use parameterized queries to prevent SQL injection
  const updatePlayerByIdQuery = `
    UPDATE cricket_team
    SET 
      player_name = ?,
      jersey_number = ?,
      role = ?
    WHERE player_id = ?`

  // Pass parameters as an array to db.run()
  await db.run(updatePlayerByIdQuery, [
    playerName,
    jerseyNumber,
    role,
    playerId,
  ])

  console.log(`Player with Id ${playerId} updated successfully.`)
  // Send response with appropriate status code
  res.status(200).send('Player Details Updated') // Corrected the typo and added missing closing quote
})

//Delete Player API
myapp.delete('/players/:playerId', async (req, res) => {
  const {playerId} = req.params
  const deletePlayerQuery = `
  DELETE FROM cricket_team
  WHERE player_id = ${playerId};
  `
  await db.run(deletePlayerQuery)
  console.log(`Player with Id ${playerId} deleted.`)
  res.send('Player Removed')
})

module.exports = myapp
