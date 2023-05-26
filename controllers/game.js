const { v4: uuid } = require("uuid");
const { gameStatus } = require("./game-status");

const words = ["Banana", "Canine", "Unosquare", "Airport"];
const games = {};

const retrieveWord = () => words[Math.floor(Math.random(words.length - 1))];

const clearUnmaskedWord = (game) => {
    const withoutUnmasked = { 
        ...game,
    };
    delete withoutUnmasked.unmaskedWord;
    return withoutUnmasked;
}

function createGame(req, res) {
  const newGameWord = retrieveWord().toUpperCase();
  const newGameId = uuid();
  const newGame = {
    remainingGuesses: 6,
    unmaskedWord: newGameWord,
    word: newGameWord.replaceAll(/[a-zA-Z0-9]/g, "_"),
    status: gameStatus.IN_PROGRESS,
    incorrectGuesses: [],
  };

  games[newGameId] = newGame;

  res.send(newGameId);
}

function getGame(req, res) { 
    const { gameId } = req.params;
    if (!gameId) return res.sendStatus(404);

    var game = games[gameId];
    if (!game) {
        return res.sendStatus(404); 
    }

    res.status(200).json(clearUnmaskedWord(game));
}

function createGuess(req, res) { 
    const { gameId } = req.params;
    const { letter } = req.body;

    if (!gameId) return res.sendStatus(404);

    var game = games[gameId];
    if (!game) return res.sendStatus(404); 

    if (!letter || letter.length != 1) {
        return res.status(400).json({
            Message: "Guess must be supplied with 1 letter"
        })
    }

    // todo: add logic for making a guess, modifying the game and updating the status
    const letterUpperCase = letter.toUpperCase();

    // Check if game is in progress
    if (game.status != gameStatus.IN_PROGRESS) {
        return res.status(400).json({
            Message: "Game already ended."
        })
    }

    // Throw error when user attempts to reuse a letter
    if (game.incorrectGuesses.includes(letterUpperCase)) {
        return res.status(400).json({
            Message: "You have guessed this letter. Please attempt another letter."
        })
    }

    // Check if user made a correct guess
    if (game.unmaskedWord.includes(letterUpperCase)) {
        // user made a correct guess

        let wordCharArray = game.word.split("");
        // unmask letter
        for (let i = 0; i < game.unmaskedWord.length; i++) {
            if (game.unmaskedWord.charAt(i) === letterUpperCase) {
                wordCharArray[i] = letterUpperCase;
            }
        }
        game.word = wordCharArray.join("");

        // check game status
        if (!game.word.includes("_")) {
            game.status = gameStatus.WON;
        }

    } else {
        // user made a wrong guess

        game.remainingGuesses--;
        game.incorrectGuesses.push(letterUpperCase);

        // check game status
        if (game.remainingGuesses === 0) {
            game.status = gameStatus.LOST;
        }
    }

    return res.status(200).json(clearUnmaskedWord(game));
}

function deleteGame(req, res) {
    const { gameId } = req.params;
    if (!gameId) return res.sendStatus(404);

    var game = games[gameId];
    if (!game) {
        return res.sendStatus(404); 
    }

    delete games[gameId];

    return res.sendStatus(204);
}

module.exports = {
    createGame,
    getGame,
    createGuess,
    deleteGame
  };