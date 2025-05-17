document.addEventListener("DOMContentLoaded", () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks'))

    if (storedTasks) {
        storedTasks.forEach(task => tasks.push(task))
        updateTasksList()
        updateStatus()
    }

})

const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}


let tasks = []
let editIndex = null;
let isDeleting = false;

const addTask = () => {
    const taskInput = document.getElementById('taskInput');
    const text = taskInput.value.trim();
    const priority = document.getElementById('priorityInput').value;

    if (text) {
        if (editIndex !== null) {
            tasks[editIndex].text = text;
            tasks[editIndex].priority = priority;
            editIndex = null;
            showToast("Task updated", "update");
        } else {
            tasks.push({
                text: text,
                completed: false,
                priority: priority
            });
            showToast("Task added", "add");
        }
        taskInput.value = "";
        document.getElementById('priorityInput').value = "low";
        updateTasksList();
        updateStatus();
        saveTasks();
    }
}

const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed
    updateTasksList()
    updateStatus()
    saveTasks()
}

const deleteTask = (index) => {
    isDeleting = true
    tasks.splice(index, 1)
    updateTasksList()
    updateStatus()
    saveTasks()
    showToast("Task deleted", "delete")
    setTimeout(() => isDeleting = false, 100); // reset after 1ms
}

const editTask = (index) => {
    const taskInput = document.getElementById('taskInput');
    taskInput.value = tasks[index].text;
    document.getElementById('priorityInput').value = tasks[index].priority;
    editIndex = index;
}

const updateStatus = () => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progress = (completedTasks / totalTasks) * 100;
    const progressBar = document.getElementById('progress');

    progressBar.style.width = `${progress}%`;
    document.getElementById("numbers").innerText = `${completedTasks} / ${totalTasks}`;

    const statusContainer = document.getElementById("status-message");
    statusContainer.innerHTML = "";

    if (!isDeleting && completedTasks === totalTasks && totalTasks > 0) {
        triggerConfetti();
        showToast("🎉 Congratulations! All tasks completed.", "update", 10000, true);
    }
}
 
const updateTasksList = () => {
    const taskList = document.getElementById("task-list")
    taskList.innerHTML = ""   // clear the previous tasks so they don't repeat

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li')

        // add a class "completed" if task.completed is true and add priority class
        listItem.innerHTML = `
        <div class="taskItem">
            <div class="task ${task.completed ? "completed" : ""} ${task.priority}">
                <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}/>
                <p>${task.text}</p>
            </div>
            <div class="icons">
                <span class="badge ${task.priority}">${task.priority}</span>
                <img src="./img/edit.png" onClick="editTask(${index})">
                <img src="./img/bin.png" onClick="deleteTask(${index})">
            </div>
        </div>
        `

        listItem.addEventListener('change', () => toggleTaskComplete(index))
        taskList.append(listItem);
    })
}

document.getElementById('newTask').addEventListener('click', (e) => {
    e.preventDefault();

    addTask();
})

const showToast = (message, type = "info", duration = 3000, showClearBtn = false) => {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";

    let bgColor = "#28a745";
    if (type === "update") bgColor = "#ffc107";
    if (type === "delete") bgColor = "#dc3545";

    toast.style.backgroundColor = bgColor;
    toast.style.color = type === "update" ? "#000" : "#fff";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "5px";
    toast.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
    toast.style.zIndex = "1000";
    toast.style.fontSize = "20px";
    toast.style.display = "flex";
    toast.style.flexDirection = "column";
    toast.style.alignItems = "center";
    toast.style.gap = "10px";

    if (showClearBtn) {
        const clearBtn = document.createElement("button");
        clearBtn.textContent = "Remove All Tasks";
        clearBtn.style.marginTop = "5px";
        clearBtn.style.fontWeight = "bold";
        clearBtn.style.fontSize = "20px";
        clearBtn.style.padding = "10px 12px";
        clearBtn.style.border = "none";
        clearBtn.style.borderRadius = "5px";
        clearBtn.style.backgroundColor = "#fff";
        clearBtn.style.color = "#000";
        clearBtn.style.cursor = "pointer";
        clearBtn.addEventListener("click", () => {
            tasks = tasks.filter(task => !task.completed);
            const progressBar = document.getElementById('progress');
            const numbers = document.getElementById('numbers');
            progressBar.style.width = `0%`;
            numbers.textContent = `0 / 0`;
            updateTasksList();
            updateStatus();
            saveTasks();
            toast.remove();
        });
        toast.appendChild(clearBtn);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, duration);
}

const triggerConfetti = () => {
    const count = 200,
        defaults = {
            origin: { y: 0.7 },
        };

    function fire(particleRatio, opts) {
        confetti(
            Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio),
            })
        );
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}


let timerDurations = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

let currentMode = "pomodoro";
let currentTime = timerDurations[currentMode];
let timerInterval = null;

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startTimer");
const pauseBtn = document.getElementById("pauseTimer");
const resetBtn = document.getElementById("resetTimer");
const modeButtons = document.querySelectorAll(".mode-btn");

const updateTimerDisplay = () => {
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = (currentTime % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
};

const switchMode = (mode) => {
    pauseTimer();
    currentMode = mode;
    currentTime = timerDurations[mode];

    // Sync input fields with the newly selected mode's durations
    const pomodoroInput = document.getElementById("pomodoroInput");
    const shortInput = document.getElementById("shortInput");
    const longInput = document.getElementById("longInput");
    if (pomodoroInput && shortInput && longInput) {
        pomodoroInput.value = timerDurations.pomodoro / 60;
        shortInput.value = timerDurations.short / 60;
        longInput.value = timerDurations.long / 60;
    }

    updateTimerDisplay();
    modeButtons.forEach(btn => btn.classList.remove("active"));
    document.querySelector(`.mode-btn[data-mode="${mode}"]`).classList.add("active");
};

const startTimer = () => {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            if (currentTime > 0) {
                currentTime--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                showToast("Time's up!", "update");
            }
        }, 1000);
    }
};

const pauseTimer = () => {
    clearInterval(timerInterval);
    timerInterval = null;
};

const resetTimer = () => {
    pauseTimer();
    currentTime = timerDurations[currentMode];
    updateTimerDisplay();
};

if (startBtn && pauseBtn && resetBtn && timerDisplay) {
    updateTimerDisplay();
    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);
    modeButtons.forEach(btn => {
        btn.addEventListener("click", () => switchMode(btn.dataset.mode));
    });
}

// Timer Settings Logic
const applyBtn = document.getElementById("applyTimers");

const applyCustomTimes = () => {
    const pomo = parseInt(document.getElementById("pomodoroInput").value);
    const short = parseInt(document.getElementById("shortInput").value);
    const long = parseInt(document.getElementById("longInput").value);

    if (pomo < 15 || short < 1 || long < 5) {
        showToast("Timer values are too low.", "delete");
        return;
    }

    timerDurations.pomodoro = pomo * 60;
    timerDurations.short = short * 60;
    timerDurations.long = long * 60;

    currentTime = timerDurations[currentMode];
    updateTimerDisplay();
    showToast("Custom timers applied!", "update");
};

if (applyBtn) {
    applyBtn.addEventListener("click", applyCustomTimes);
}

