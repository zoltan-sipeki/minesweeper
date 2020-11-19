import { Timer } from "./timer.js";

export class Game
{
    static DIFFICULTY = {
        easy: {
            name: "easy",
            rows: 9,
            cols: 9,
            mines: 10
        },
        medium: {
            name: "medium",
            rows: 16,
            cols: 16,
            mines: 40
        },
        hard: {
            name: "hard",
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

    static instances = {};
    
    constructor(difficulty)
    {
        this.state = [];
        this.diff = Game.DIFFICULTY[difficulty];
        this.finished = false;
        this.started = false;
        this.minesLeft = this.diff.mines;
        this.revealedCells = 0;
        this.board = null;
        this.mineCounter = null;
        this.timer = null;
        
        this.createBoard(difficulty);
        this.placeMines();
        this.fillWithNumbers();

        Game.instances[difficulty] = this;
    }

    reset()
    {
        this.finished = false;
        this.started = false;
        this.minesLeft = this.diff.mines;
        this.revealedCells = 0;

        for (let data of this.state)
        {
            data.value = 0;
            data.elem.className = "cell cell-default";
            data.elem.innerText = "";
            data.flagged = false;
            data.revealed = false;
        }

        this.mineCounter.innerText = this.minesLeft;

        this.placeMines();
        this.fillWithNumbers();
        this.timer.reset();
    }

    stopTimer()
    {
        this.timer.stop();
    }

    show()
    {
        document.querySelector("#container").appendChild(this.board);
    }

    hide()
    {
        this.board.remove();
    }

    createBoard(difficulty)
    {            
        this.board = document.createElement("div");
        this.board.id = "board";
        this.board.className = `board-${difficulty}`;

        let panel = document.createElement("div");
        panel.id = "board-panel";
        
        let grid = document.createElement("div");
        grid.id = "board-grid";
        grid.className = `board-grid-${difficulty}`;
        grid.onclick= this.reveal.bind(this);
        grid.oncontextmenu =  this.toggleFlag.bind(this);
        this.populateGrid(grid);

        this.mineCounter = document.createElement("div");
        this.mineCounter.id = "mine-counter";
        this.mineCounter.className = "panel-component";
        this.mineCounter.innerText = this.minesLeft;

        let reset = document.createElement("div");
        reset.id = "game-reset";
        reset.className = "panel-component";
        reset.innerHTML = Game.RESET_BUTTON;
        reset.onclick= this.reset.bind(this);

        let timer = document.createElement("div");
        timer.id = "timer";
        timer.className = "panel-component";
        this.timer = new Timer(timer);

        this.board.appendChild(panel);
        panel.appendChild(this.mineCounter);
        panel.appendChild(reset);
        panel.appendChild(timer);
        this.board.appendChild(grid);
    }

    populateGrid(grid)
    {
        const size = this.diff.rows * this.diff.cols;

        for (let i = 0; i < size; ++i)
        {
            const cell = this.createCell(i);
            grid.appendChild(cell);
            this.state.push({
                value: 0,
                elem: cell,
                revealed: false,
                flagged: false
            });
        }
    }

    createCell(index)
    {
        let cell = document.createElement("div");
        cell.className = "cell cell-default";
        cell.dataset.index = index;

        return cell;
    }

    placeMines()
    {
        let counter = 0;
        while (counter < this.diff.mines)
        {
            const candidate = Math.floor(Math.random() * this.state.length);
            if (this.isMine(candidate))
                continue;

            this.placeMine(candidate);
            ++counter;
        }
    }

    isMine(index)
    {
        return this.state[index].value == -1;
    }

    placeMine(index)
    {
        this.state[index].value = -1;
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

                this.state[this.index(i, j)].value = sum;
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

        if (i < 0 || j < 0 || i >= this.diff.rows|| j >= this.diff.cols|| this.state[index].revealed || this.state[index].flagged)
            return;
        
        if (this.isMine(index))
        {
            this.onLose(index);
            return;
        }
        
        ++this.revealedCells;
        this.state[index].revealed = true;
        this.state[index].elem.className = "cell cell-revealed";
        
        if (!this.isEmpty(index))
        {
            const value = this.state[index].value;
            this.state[index].elem.innerText = value;
            this.state[index].elem.style.color = Game.TEXT_COLORS[value - 1];
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
        return this.revealedCells == this.state.length - this.diff.mines && this.minesLeft == 0;
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
        this.state[index].elem.className = "cell cell-mine";
        this.revealMines(index);
    }

    gameOver()
    {
        this.timer.stop();
        this.finished = true;
    }

    isEmpty(index)
    {
        return !this.isMine(index) && this.state[index].value == 0;
    }

    revealMines(index)
    {
        for (let i = 0; i < this.state.length; ++i)
        {
            if (this.isMine(i))
            {
                if (this.state[i].flagged)
                    continue;

                this.state[i].elem.innerHTML = Game.MINE;
                if (i == index)
                    continue;
                
                this.state[i].elem.className = "cell cell-revealed";
            }
            else if (this.state[i].flagged)
                this.state[i].elem.innerHTML = Game.WRONG_FLAG;
        }
    }

    toggleFlag(event)
    {
        event.preventDefault();

        if (this.finished || !event.target.classList.contains("cell"))
            return;

        const index = event.target.dataset.index;
        if (this.state[index].revealed)
            return;

        this.state[index].flagged = !this.state[index].flagged;

        if (this.state[index].flagged)
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