interface AnimationConfig {
    /** Expected animation duration */
    duration?: number;
    /** Animation speed multiplier */
    playbackRate?: number;
}

/** Callback called on each animation tick */
interface OnTick {
    (progress: number, additionalInfo: {
        runTick: number;
        throttleIndex?: number;
    }): void;
}

const ANIMATION_DEFAULT_CFG: Required<AnimationConfig> = {
    duration: 40_000,
    playbackRate: 1,
};

enum AnimationState {
    Pause,
    Running,
}

export class Animation {
    private cfg: Required<AnimationConfig>;
    constructor(cfg?: AnimationConfig) {
        this.cfg = {
            ...ANIMATION_DEFAULT_CFG,
            ...cfg,
        };
        this.loop(performance.now());
    }
    /** animation state: running, pause */
    playState: AnimationState = AnimationState.Pause;
    /** animation state: running, pause */
    progress = 0;
    runTick = 0;

    static availableTimer = self.requestAnimationFrame ?? ((cb) => {
        return new Promise(res => {
            setTimeout(() => {
                res(cb(performance.now()));
            }, 1e3 / 60);
        });
    });

    private lastTick = 0;
    private loop(currentTick: number) {
        switch (this.playState) {
            case AnimationState.Running: {
                const diff = currentTick - this.lastTick;
                this.runTick += diff;
                const diffProgress = diff / this.cfg.duration * this.cfg.playbackRate;
                this.progress += diffProgress;
                break;
            }
            case AnimationState.Pause:
                break;
        }
        const shouldPause = !this.validateProgress();
        if (this.playState === AnimationState.Running) this._onTick();
        if (shouldPause) this.pause();
        this.lastTick = currentTick;
        Animation.availableTimer(this.loop.bind(this));
    }

    private validateProgress() {
        if (this.cfg.duration === Infinity) return true;
        if (this.progress <= 0) {
            this.progress = 0;
            return false;
        } else if (this.progress >= 1) {
            this.progress = 1;
            return false;
        }
        return true;
    }

    private callbacks = new Map<OnTick, {
        throttledBy: number;
        lastIndex: number;
    }>();
    private _onTick() {
        this.callbacks.forEach((record, callback) => {
            const { progress, runTick } = this;
            const { lastIndex, throttledBy } = record;
            let currentIndex: number;
            if (throttledBy === Infinity) {
                currentIndex = progress;
            } else {
                currentIndex = Math.ceil(progress * throttledBy) - 1;
            }
            record.lastIndex = currentIndex;
            if (lastIndex !== currentIndex) {
                callback(progress, { runTick, throttleIndex: currentIndex });
            }
        });
    }

    /**
     * @param callback Callback called on each animation tick
     * @param throttledBy A factor that {@link OnTick} callback will be throttled. The animation progress will be considered as `x` slices, and the callback will only call once as the progress run over each slice.
     */
    public onTick(callback: OnTick, throttledBy = Infinity) {
        this.callbacks.set(callback, {
            throttledBy,
            lastIndex: -1,
        });
        return this;
    }

    public play() {
        this.playState = AnimationState.Running;
        return this;
    }
    public pause() {
        this.playState = AnimationState.Pause;
        return this;
    }
    public setSpeed(spd: number) {
        this.cfg.playbackRate = spd;
        return this;
    }
    public jumpTo(progress: number) {
        if (progress < 0 || progress > 1) {
            throw Error("Invalid param `progress` provided, valid value range: 0-1 ");
        }
        this.progress = progress;
        return this;
    }
    public reset() {
        this.pause();
        return this.jumpTo(0);
    }
}
