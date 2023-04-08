import { number as verifyNum } from '@/verify';



const getCurrentTime = () => performance.now() || Date.now();



class AudioTimer
{
    constructor(speed = 1)
    {
        this.startTime = NaN;
        this.pausedTime = NaN;
        this.status = 3;

        this._speed = verifyNum(speed);
        this._lastSpeedChangedProgress = 0;
    }

    start()
    {
        if (this.status === 2)
        {
            this.startTime = getCurrentTime() - (this.pausedTime - this.startTime);
        }
        else
        {
            this.startTime = getCurrentTime();
        }
        
        this.status = 1;
        this.pausedTime = NaN;
    }

    pause()
    {
        if (this.status === 1)
        {
            this.pausedTime = getCurrentTime();
            this.status = 2;
        }
        else if (this.status === 2)
        {
            this.startTime = getCurrentTime() - (this.pausedTime - this.startTime);
            this.pausedTime = NaN;
            this.status = 1;
        }
    }

    stop()
    {
        if (this.status === 3) return;

        this.startTime = NaN;
        this.pausedTime = NaN;
        this._lastSpeedChangedProgress = 0;

        this.status = 3;
    }

    seek(duration)
    {
        if (this.status === 3) return;
        this.startTime -= duration * 1000;
        if (isNaN(this.pausedTime) && getCurrentTime() - (this.startTime - this._lastSpeedChangedProgress) < 0) this.startTime = getCurrentTime();
        else if (!isNaN(this.pausedTime) && this.startTime > this.pausedTime) this.startTime = this.pausedTime;
    }

    get speed()
    {
        return this._speed;
    }

    set speed(value)
    {
        if (this.status !== 3) this._lastSpeedChangedProgress += ((this.status === 1 ? getCurrentTime() : this.pausedTime) - this.startTime) * this._speed;
        this.startTime = getCurrentTime();
        if (this.status === 2) this.pausedTime = getCurrentTime();
        this._speed = verifyNum(value);
    }

    get time()
    {
        return ((isNaN(this.pausedTime) ? getCurrentTime() - this.startTime : this.pausedTime - this.startTime) * this._speed + this._lastSpeedChangedProgress) / 1000;
    }
}


export default AudioTimer;