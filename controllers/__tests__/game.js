const gameController = require("../game");
const { gameStatus } = require("../game-status");

const mockId = 'fda56100-0ddb-4f06-9ea4-7c1919ff6d2f';
const mockGameData = {
  remainingGuesses: 5,
  unmaskedWord: "BANANA",
  word: "B_____",
  status: gameStatus.IN_PROGRESS,
  incorrectGuesses: ["M"]
}

jest.mock("uuid", () => ({ v4: () => mockId }));

describe("game controller", () => {
    describe("createGame", () => {
      it("Should return identifier when game created", () => {
        const req = {};
        const res = {
            send: jest.fn()
        };

        gameController.createGame(req, res);

        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(mockId);
      });
      afterEach(() => {
        gameController.games[mockId] = undefined;
      })
    });

    describe("getGame", () => {
      beforeEach(() => {
        gameController.games[mockId] = {...mockGameData}; 
      })

      afterEach(() => {
        gameController.games[mockId] = undefined;
      })

      it("Should return game data", () => {
        const req = {
          params: {
            gameId: mockId
          }
        }
        const res = {
          status: jest.fn(() => res),
          json: jest.fn()
        }

        gameController.getGame(req, res);

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith((() => {
          const withoutUnmasked = {
            ...mockGameData
          }
          delete withoutUnmasked.unmaskedWord
          return withoutUnmasked
        })());
      })
    });

    describe("createGuess", () => {
      beforeEach(() => {
        gameController.games[mockId] = {...mockGameData}; 
      })

      afterEach(() => {
        gameController.games[mockId] = undefined;
      })

      it("Make a correct guess", () => {
        const req = {
          params: {
            gameId: mockId
          },
          body: {
            letter: "a"
          }
        }
        const res = {
          status: jest.fn(() => res),
          json: jest.fn()
        }
        const expected = {
          ...mockGameData,
          word: "BA_A_A"
        }

        gameController.createGuess(req, res);

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith((() => {
          const withoutUnmasked = {
            ...expected
          }
          delete withoutUnmasked.unmaskedWord
          return withoutUnmasked
        })());
      });

      it("Make a wrong guess", () => {
        const req = {
          params: {
            gameId: mockId
          },
          body: {
            letter: "p"
          }
        }
        const res = {
          status: jest.fn(() => res),
          json: jest.fn()
        }
        const expected = {
          ...mockGameData,

        }
        expected.remainingGuesses--;
        expected.incorrectGuesses = [...mockGameData.incorrectGuesses, req.body.letter.toUpperCase()];

        gameController.createGuess(req, res);

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith((() => {
          const withoutUnmasked = {
            ...expected
          }
          delete withoutUnmasked.unmaskedWord
          return withoutUnmasked
        })());
      })
    })
});