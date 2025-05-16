
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


const addTask = () => {
    const taskInput = document.getElementById('taskInput');
    const text = taskInput.value.trim();

    if (text) {
        if (editIndex !== null) {
            tasks[editIndex].text = text;
            editIndex = null;
            showToast("Task updated", "update");
        } else {
            tasks.push({
                text: text,
                completed: false,
            });
            showToast("Task added", "add");
        }
        taskInput.value = "";
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
    tasks.splice(index, 1)
    updateTasksList()
    updateStatus()
    saveTasks()
    showToast("Task deleted", "delete");

}

const editTask = (index) => {
    const taskInput = document.getElementById('taskInput');
    taskInput.value = tasks[index].text;
    editIndex = index;
}

const updateStatus = () => {
    const completedTasks = tasks.filter(task => task.completed).length
    const totalTasks = tasks.length
    const progress = (completedTasks / totalTasks) * 100
    const progressBar = document.getElementById('progress')

    progressBar.style.width = `${progress}%`

    document.getElementById("numbers").innerText = `${completedTasks} / ${totalTasks}`

    if (completedTasks === totalTasks && totalTasks > 0) {
        triggerConfetti()
    }
}

const updateTasksList = () => {
    const taskList = document.getElementById("task-list")
    taskList.innerHTML = ""   // clear the previous tasks so they don't repeat

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li')

        // add a class "completed" if task.completed is true
        listItem.innerHTML = `
        <div class="taskItem">
            <div class="task ${task.completed ? "completed" : ""}">
                <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}/>
                <p>${task.text}</p>
            </div>
            <div class="icons">
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

const showToast = (message, type = "info", duration = 3000) => {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";

    // Set background color based on type
    let bgColor = "#28a745"; // default green
    if (type === "update") bgColor = "#ffc107"; // yellow
    if (type === "delete") bgColor = "#dc3545"; // red

    toast.style.backgroundColor = bgColor;
    toast.style.color = type === "update" ? "#000" : "#fff";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "5px";
    toast.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
    toast.style.zIndex = "1000";
    toast.style.fontSize = "14px";

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
