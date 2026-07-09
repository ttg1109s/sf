/* Quản lý tập hợp các Loop (tác vụ định kỳ) ======================================================= */

class TaskManager {
    constructor(plan = {}, delayEnd = 120) {
        this.plan = plan;
        this.tasks = {};
        this.running = {};
        this.delay = 0;
        this.delayEnd = delayEnd;

    }

    #check(task, time, exe, mode, count = 0) {
        const checklist = [time, exe, mode];
        if (fb.check.includes(checklist, undefined).result ||
            fb.check.includes(checklist, null).result ||
            fb.check.includes(checklist, '').result) {
            throw new Error(`Invalid task configuration for task: ${task}`);
        }

        if (fb.check.type([time, count], 'number', true) === false) {
            throw new Error(`Task time and count must be numbers greater than 0 for task: ${task}`);
        }
        if (time <= 0) {
            throw new Error(`Task time must be greater than 0 for task: ${task}`);
        }
        if (count < 0) {
            throw new Error(`Task count must be 0 or greater for task: ${task}`);
        }
        if (fb.check.type(exe, 'function') === false) {
            throw new Error(`Task exe must be a function for task: ${task}`);
        }
        if (fb.check.includes(['interval', 'timeout'], mode).result === false) {
            throw new Error(`Task mode must be 'interval' or 'timeout' for task: ${task}`);
        }
        if (this.tasks[task] !== undefined) {
            throw new Error(`Task already exists: ${task}`);
        }
        return true;
    }

    #task(taskName) {
        if (this.tasks[taskName] === undefined) {
            throw new Error(`Task not found: ${taskName}`);
        }
        this.running[taskName] = false;
    }

    operator(task, mode) {
        if (this.tasks[task] === undefined) {
            throw new Error(`Task not found: ${task}`);
        }
        const validModes = ['enabled', 'disabled'];
        if (!fb.check.includes(validModes, mode).result) {
            throw new Error(`Invalid mode: ${mode}`);
        }
        
        const isRunning = mode === 'enabled' ? true : false;
        if (this.running[task] === isRunning) return;
        this.running[task] = isRunning;
        this.tasks[task][mode]();
    }

    multiTask(tasks = [], mode = '') {
        for(const t of tasks) {
            this.operator(t, mode);
        }
    }

    addNew(taskName, plan) {
        if (this.#check(taskName, plan.time, plan.exe, plan.mode, plan.count ?? 0) === false) {
            throw new Error(`Invalid task configuration for task: ${taskName}`);
        }
        this.plan[taskName] = new Loop(plan.time, plan.exe, plan.mode, plan.count ?? 0);
        this.#task(taskName);
    }

    kill(taskName) {
        if (this.tasks[taskName] === undefined) {
            throw new Error(`Task not found: ${taskName}`);
        }
        let stopped = false;
        this.operator(taskName, 'disabled');
        if (this.tasks[taskName].stopped === true) {
            delete this.tasks[taskName];
            delete this.running[taskName];
            delete this.plan[taskName];
            stopped = true;
        }
        setTimeout(() => {
            if (stopped) return;
            if (this.tasks[taskName] !== undefined) {
                this.delay++;
                if (this.delay >= this.delayEnd) {
                    console.warn(`Force kill task: ${taskName} failed after 2 minutes`);
                    console.warn(`Please check the task function for any blocking code`);
                    return;
                }
                this.kill(taskName);
            }
        }, 1000);
    }

    killAll() {
        for (const task in this.tasks) {
            this.kill(task);
        }
    }

    registry() {

        for (const task in this.plan) {
            if (
                this.#check(task,
                this.plan[task].time,
                this.plan[task].exe,
                this.plan[task].mode,
                this.plan[task].count ?? 0
            ) === false) {
                this.plan = null;
                throw new Error(`Invalid task configuration for task: ${task}`);
            }
            this.tasks[task] = new Loop(
                this.plan[task].time,
                this.plan[task].exe,
                this.plan[task].mode,
                this.plan[task].count ?? 0
            );
        }

    }

};

