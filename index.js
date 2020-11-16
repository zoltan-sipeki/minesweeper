import { Game } from "./minesweeper.js";

document.addEventListener("DOMContentLoaded", fetchUsername);
document.querySelector("#difficulty-buttons").onclick = selectDifficulty;
document.querySelector("#menu").onclick = selectMenuItem;

let game = null;
let score = null;
let leaderboard = null;
let current = null;

function selectDifficulty(event)
{
    if (!("difficulty" in event.target.dataset))
        return;

    const difficulty = event.target.dataset.difficulty;

    if (current != null)
        current.hide();

    if (game == null) 
    {
        game = new Game(difficulty);
    }
    else if (!(difficulty in Game.instances))
    {
        game.stopTimer();
        game = new Game(difficulty);
    }
    else
    {
        game.stopTimer();
        game = Game.instances[difficulty];
        game.reset();
    }

    current = game;
    current.show();
}

function fetchUsername()
{
    console.log("username");
}

function selectMenuItem(event)
{
    if (!("type" in event.target.dataset))
        return;

    switch (event.target.dataset.type)
    {
    case "score":
        fetchMyScores();
        break;

    case "leaderboard":
        fetchLeaderboard();
        break;

    case "sign-out":
        signOut();
        break;
    }
    
}

function fetchMyScores()
{
    console.log("my score");
}

function fetchLeaderboard()
{
    console.log("leaderboard");
}

function signOut()
{
    console.log("signing out");
}