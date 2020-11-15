import { Timer } from "./timer.js";

export class Game
{
    static DIFFICULTY = {
        easy: {
            rows: 9,
            cols: 9,
            mines: 10
        },
        medium: {
            rows: 16,
            cols: 16,
            mines: 40
        },
        hard: {
            rows: 16,
            cols: 30,
            mines: 99
        }
    };

    static TEXT_COLORS = ["#0000ff", "#008000", "#ff0000", "#000040", "#004000", "#400000", "#000020", "#002000", "#200020"];
    static MINE = "&#x1F4A3;";
    static FLAG = "&#x1F6A9;";
    static WRONG_FLAG = "&#x26D4;";
    static RESET_BUTTON = "&#x1F600;";
    
    constructor(difficulty)
    {
        this.initGame(difficulty);
    }

    initGame(difficulty)
    {
        let prevTimer = document.querySelector("#timer");
        if (prevTimer != null)
            clearInterval(prevTimer.dataset.id);
        
        this.board = [];
        this.diff = Game.DIFFICULTY[difficulty];
        this.finished = false;
        this.started = false;
        this.minesLeft = this.diff.mines;
        this.revealedCells = 0;
        
        this.createBoard(difficulty);
        this.placeMines();
        this.fillWithNumbers();
        
        this.timer = new Timer();
    }

    createBoard(difficulty)
    {            
        let container = document.querySelector("#container");
        if (container.childElementCount > 0)
        {
            for (let i = container.childElementCount - 1; i >= 0 ; --i)
                container.children[i].remove();
        }

        let panel = document.createElement("div");
        panel.id = "board-panel";
        panel.className = `board-panel-${difficulty}`;
        
        let board = document.createElement("div");
        board.id = "board";
        board.className = `board-${difficulty}`;
        board.onclick= this.reveal.bind(this);
        board.oncontextmenu =  this.toggleFlag.bind(this);
        this.populateBoard(board);

        this.mineCounter = document.createElement("div");
        this.mineCounter.id = "mine-counter";
        this.mineCounter.className = "panel-component";
        this.mineCounter.innerText = this.minesLeft;

        let reset = document.createElement("div");
        reset.id = "game-reset";
        reset.className = "panel-component";
        reset.innerHTML = Game.RESET_BUTTON;
        reset.onclick= this.initGame.bind(this, difficulty);

        let timer = document.createElement("div");
        timer.id = "timer";
        timer.className = "panel-component";

        container.appendChild(board);
        board.appendChild(panel);
        panel.appendChild(this.mineCounter);
        panel.appendChild(reset);
        panel.appendChild(timer);
    }

    populateBoard(boardDiv)
    {
        const size = this.diff.rows * this.diff.cols;

        for (let i = 0; i < size; ++i)
        {
            const cell = this.createCell(i);
            boardDiv.appendChild(cell);
            this.board.push({
                value: null,
                elem: cell,
                revealed: false,
                flagged: false
            });
        }
    }

    createCell(index)
    {
        let cell = document.createElement("div");
        cell.className = "cell default-cell";
        cell.dataset.index = index;

        return cell;
    }

    placeMines()
    {
        let counter = 0;
        while (counter < this.diff.mines)
        {
            const candidate = Math.floor(Math.random() * this.board.length);
            if (this.isMine(candidate))
                continue;

            this.placeMine(candidate);
            ++counter;
        }
    }

    isMine(index)
    {
        return this.board[index].value == Game.MINE;
    }

    placeMine(index)
    {
        this.board[index].value = Game.MINE;
    }

    fillWithNumbers()
    {
        for (let i = 0; i < this.diff.rows; ++i)
        {
            for (let j = 0; j < this.diff.cols; ++j)
            {
                if (this.isMine(this.index(i, j)))
                    continue;
                
                let sum = 0;
                sum += j > 0 && this.isMine(this.index(i, j - 1));
                sum += i < this.diff.rows - 1 && this.isMine(this.index(i + 1, j));
                sum += i > 0 && this.isMine(this.index(i - 1, j));
                sum += j < this.diff.cols - 1 && this.isMine(this.index(i, j + 1));
                sum += i > 0 && j > 0 && this.isMine(this.index(i - 1, j - 1));
                sum += i > 0 && j < this.diff.cols - 1 && this.isMine(this.index(i - 1, j + 1));
                sum += i < this.diff.rows - 1 && j > 0 && this.isMine(this.index(i + 1, j - 1));
                sum += i < this.diff.rows - 1 && j < this.diff.cols - 1 && this.isMine(this.index(i + 1, j + 1));

                this.board[this.index(i, j)].value = sum;
            }
        }
    }

    index(i, j)
    {
        return i * this.diff.cols + j;
    }

    reveal(event)
    {
        if (this.finished || !event.target.classList.contains("cell"))
            return;

        if (!this.started)
        {
            this.started = true;
            this.timer.start();
        }

        const index = event.target.dataset.index;
        this.revealHelper(Math.floor(index / this.diff.cols), index % this.diff.cols);
    }

    revealHelper(i, j)
    {
        const index = this.index(i, j);

        if (i < 0 || j < 0 || i >= this.diff.rows|| j >= this.diff.cols|| this.board[index].revealed || this.board[index].flagged)
            return;
        
        if (this.isMine(index))
        {
            this.onLose(index);
            return;
        }
        
        ++this.revealedCells;
        this.board[index].revealed = true;
        this.board[index].elem.className ="cell revealed-cell";
        
        if (!this.isEmpty(index))
        {
            const value = this.board[index].value;
            this.board[index].elem.innerText = this.board[index].value;
            this.board[index].elem.style.color = Game.TEXT_COLORS[value - 1];
        }
        else
        {
            this.revealHelper(i + 1, j);
            this.revealHelper(i - 1, j);
            this.revealHelper(i, j + 1);
            this.revealHelper(i, j - 1);
            this.revealHelper(i + 1, j - 1);
            this.revealHelper(i - 1, j - 1);
            this.revealHelper(i + 1, j + 1);
            this.revealHelper(i - 1, j + 1);
        }

        if (this.won())
            this.onWin();
    }

    won()
    {
        return this.revealedCells == this.board.length - this.diff.mines && this.minesLeft == 0;
    }

    onWin()
    {
        this.gameOver();
        // itt kell majd feltölteni az állást a szerverre.
        alert(this.timer.toString());
    }

    onLose(index)
    {
        this.gameOver();
        this.board[index].elem.className = "cell mine-cell";
        this.revealMines(index);
    }

    gameOver()
    {
        this.timer.stop();
        this.finished = true;
    }

    isEmpty(index)
    {
        return !this.isMine(index) && this.board[index].value == 0;
    }

    revealMines(index)
    {
        for (let i = 0; i < this.board.length; ++i)
        {
            if (this.isMine(i))
            {
                if (this.board[i].flagged)
                    continue;

                this.board[i].elem.innerHTML = this.board[i].value;
                if (i == index)
                    continue;
                
                this.board[i].elem.className = "cell revealed-cell";
            }
            else if (this.board[i].flagged)
                this.board[i].elem.innerHTML = Game.WRONG_FLAG;
        }
    }

    toggleFlag(event)
    {
        event.preventDefault();

        if (this.finished || !event.target.classList.contains("cell"))
            return;

        const index = event.target.dataset.index;
        if (this.board[index].revealed)
            return;

        this.board[index].flagged = !this.board[index].flagged;

        if (this.board[index].flagged)
        {
            --this.minesLeft;
            event.target.innerHTML = Game.FLAG;
        }
        else
        {
            ++this.minesLeft;
            event.target.innerHTML = "";
        }

        this.mineCounter.innerText = this.minesLeft;

        if (this.won())
            this.onWin();
    }
}