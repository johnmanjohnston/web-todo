var data = {
    "To Do": [
        "this is a test task",        
        "this is antoher task which needs to be done"        
    ],

    "Doing": [
        "this task is being done",
        "asdfasdfasdf",
        "finish physics homework"
    ],

    "Done": [
        "i am a task and i have endured great hardship to complete",
        "finish stupid computer science homework"
    ]
};

document.querySelector("#new-task-form").addEventListener(onsubmit, createNewTask);
function createNewTask(ev) {
    ev.preventDefault();
    
    var formEl = document.querySelector("#new-task-form");
    addTaskToGroup("To Do", formEl.elements.taskDesc.value, 0, Object.keys(data["To Do"]).length);
    data["To Do"].push(formEl.elements.taskDesc.value);

    saveData();
    updatePendingTasksLabel();
}

var currentDraggingElement = undefined;
// dragging
/**
 * @param {DragEvent} ev 
 */
function onDrag(ev) {
    currentDraggingElement = ev.target;
}

/**
 * @param {DragEvent} ev 
 */
function onDrop(ev) {
    if (ev.target.getAttribute("data-el-type") != "group") return; // don't let tasks drop into other tasks
    if (ev.target.getAttribute("data-index") == String(currentDraggingElement.id).split("-")[1]) return; // don't let tasks be dropped into the same groups

    var groupName = ev.target.getAttribute("data-name");
    var desc = currentDraggingElement.children[0].value;
    
    var indexes = currentDraggingElement.id.split("-");
    var oldGroupIndex = indexes[1];
    var taskIndex = indexes[2];

    data[currentDraggingElement.getAttribute("data-group")].splice(taskIndex, 1);
    removeTaskFromGroup(oldGroupIndex, taskIndex);

    addTaskToGroup(groupName, desc, ev.target.getAttribute("data-index"), Object.keys(data[groupName]).length);
    data[groupName].push(desc);

    currentDraggingElement = null;

    saveData();
    updatePendingTasksLabel();
}

function allowDrop(ev) { ev.preventDefault(); }

// visually creating groups and adding tasks to groups 
function createGroup(name, i) {
    document.body.innerHTML +=
    `
        <div id="${name}" data-name="${name}" data-el-type="group" data-index="${i}"   class="group" ondrop="onDrop(event)" ondragover="allowDrop(event)">
            <div class="group-name">${name}</div> <hr>
        </div>
    `;
}

function removeTaskFromGroup    (gi, ti) {
    document.body.querySelector(`#indexes-${gi}-${ti}`).remove();
}

                                        //  group index     task index
function addTaskToGroup(groupName, desc,    gi,             ti) {
    document.getElementById(groupName).innerHTML += 
    `
        <div class="task" data-el-type="task" data-group="${groupName}" id="indexes-${gi}-${ti}" draggable="true" ondragstart="onDrag(event)"> 
            <input value="${desc}" />
        </div>
    `;
}

// misc
function saveData() {
    localStorage.clear();
    localStorage.setItem("todo_data", JSON.stringify(data));
}

function loadData() {
    if (localStorage.getItem("todo_data")) {
        data = localStorage.getItem("todo_data");
        data = JSON.parse(data);
    }
}

function init() {
    for (var i = 0; i < Object.keys(data).length; i++) {
        var groupName = Object.keys(data)[i];

        createGroup(groupName, i);

        for (var j = 0; j < Object.keys(data[groupName]).length; j++) {
            addTaskToGroup(groupName, data[groupName][j], i, j);
        }
    }
}

function updatePendingTasksLabel() {
    var el = document.getElementById("pending-tasks-text");
    var pending = Object.keys(data["To Do"]).length;
    var inProgress = Object.keys(data["Doing"]).length;
    el.innerText = `${pending} task(s) pending; ${inProgress} task(s) in progress`;
}

loadData();
updatePendingTasksLabel();
init(); 