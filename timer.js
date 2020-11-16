export class Timer
{
    static HOUR_MS = 3600000;
    static MINUTE_MS = 60000;
    static SECOND_MS = 1000;

    constructor(view)
    {
        this.view = view;
        this.id = 0;
        this.elapsed = 0;
        this.lastTime = 0;

        this.view.innerText = "00:00:00";
    }

    start()
    {
        this.lastTime = new Date().getTime();
        this.id = setInterval(this.increment.bind(this), 1000);
    }

    stop()
    {
        clearInterval(this.id);
    }

    reset()
    {
        this.stop();
        this.id = 0;
        this.elapsed = 0;
        this.lastTime = 0;
        this.view.innerText = "00:00:00";
    }

    increment()
    {
        const now = new Date().getTime();
        this.elapsed += now - this.lastTime;
        this.lastTime = now;

        this.view.innerText = this.toString();
    }

    toString()
    {
        const hh = Math.floor(this.elapsed / Timer.HOUR_MS);
        const mm = Math.floor(this.elapsed % Timer.HOUR_MS / Timer.MINUTE_MS);
        const ss = Math.floor(this.elapsed % Timer.HOUR_MS % Timer.MINUTE_MS / Timer.SECOND_MS);

        return addLeadingZeros(hh) + ":" + addLeadingZeros(mm) + ":" + addLeadingZeros(ss);

        function addLeadingZeros(number)
        {
            if (number == 0)
                return "00";

            return number < 10 ? "0" + number : number.toString();
        }
    }
}