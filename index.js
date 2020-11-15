import { Game } from "./minesweeper.js";

document.addEventListener("DOMContentLoaded", fetchUsername);
document.querySelector("#difficulty-buttons").onclick = selectDifficulty;
document.querySelector("#menu").onclick = selectMenuItem;

let game = null;

function selectDifficulty(event)
{
    if (!("difficulty" in event.target.dataset))
        return;

    game = new Game(event.target.dataset.difficulty);
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