let items = [];
let updateTimer;
let itemToUpdate;
let data = function(){return false};

document.getElementsByTagName("body")[0].innerHTML += '<button onclick="clearItems()" style="margin-Top: 10px;">Clear Items?</button>';
document.getElementsByTagName("body")[0].innerHTML += '<button onclick="sortItems()" style="margin-Top: 10px; margin-left: 5px;">Sort</button>';

function sendData(task, action, id){
    let fetchUrl = "http://localhost:3000/tasks";
    let config = {
        headers:{
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(task),
        keepalive: true};
    if (action === "new"){ //new task
        items.push(task);
        config.method = "POST";
    }
    else {
        fetchUrl = `${fetchUrl}/${id}`;
        if (action === "update"){
        config.method = "PATCH";
        config.body = JSON.stringify(task);
        }
        else{
        config.method = "DELETE";
        //config.body = JSON.stringify({task});
        }
    }
    console.log(fetchUrl, config)
    return fetch(fetchUrl, config)
        .then(r => r.json())
        .then(obj => console.log("POST successful: ", obj.id))
        .catch(err => console.log("POST FAIL: ", JSON.stringify(err.message)));
}
function loadList(){
    return fetch("http://localhost:3000/tasks")
    .then(resp => resp.json())
    .then(json => {
        for (const task of json) {
            addItem(task);
            items.push(task);
        }
    sortItems();
    })
}

function addItem(task) {
    if (items.some((item) => task.name === item.name && item.completed === false)) {
        throw new Error('Duplicate entry, entry ignored')
    }
    const listNode = document.getElementsByTagName('ul')[0];
    const node = document.createElement('li'); // === <li></li>
    node.id = task.id;
    node.innerHTML = `<input type="number" id="p${node.id}" dir="rtl" style="position:absolute; width:30px; left: 8px;" value="${task.priority}" min="1">&bull; ${task.name}`
    //the above line creates a child number input, positioned over the bullet point.  It then adds a new bullet point and the desired text.
    if (task.completed === true){
        node.style.textDecoration = 'line-through';
    }
    node.addEventListener('click', markAsCompleted);
    node.addEventListener('dblclick', deleteSingle);
    listNode.appendChild(node);
    document.getElementById(`p${node.id}`).addEventListener('change', updatePrio);
}

function onEnter(event) {
    if (event.keyCode === 13) {
        getItem();
    }
}

function getItem() {
    const input = document.getElementById('task-name');
    const trimmed = {name: input.value.trim(),
                    id: Date.now(),
                    completed: false,
                    priority: 1}
    if (trimmed.name === '') {
        throw new Error('Write something')
    }
    input.value = '';
    addItem(trimmed);
    sendData(trimmed, "new");
}

function markAsCompleted(event) { //triggered with single click on any li
    if (event.target.id.charAt(0) === "p") return; //ignores click event on numberbox child
    const completedItem = items.find(item => parseInt(event.target.id) === item.id); //finds items element who's id matches the li that was clicked - this line appears in the next function as well

    if (completedItem.completed === false){ //if it's not completed, complete it
    sendData({completed: true}, "update", completedItem.id)
    completedItem.completed = true;
    event.target.style['text-decoration'] = 'line-through';
    }
    else{ //if it IS completed, reverse the above.
        sendData({completed: false}, "update", completedItem.id)
        completedItem.completed = false;
        event.target.style['text-decoration'] = "none";
    }
}

function deleteSingle(event){ //triggered with double click on any li
    if (event.target.id.charAt(0) === "p") return; //ignores click event on numberbox child
    const itemToDelete = items.find(item => parseInt(event.target.id) === item.id); 
    if(confirm("Do you want to delete this item?") === true) {
        sendData({}, "delete", itemToDelete.id)
        items = items.filter(a => a !== itemToDelete) //clears item from items array
        event.target.remove(); //deletes li
    }
}

function updatePrio(event){
    const priorityItem = items.find(item => parseInt(event.target.id.substring(1)) === item.id); //the id of the number boxes match the id of the parent li and matching items array element, with "p" in front, this trims the "p" to find the matching items element
    priorityItem.priority = event.target.value; //sets array item priority to the value of the matching number box
    let newData = function(){sendData({priority:event.target.value}, "update", priorityItem.id); return true;};
    clearTimeout(updateTimer);
    if (itemToUpdate !== event.target && data){
        data();
        data = function(){return false};
    }
    updateTimer = setTimeout(a => newData(), 2000);
    itemToUpdate = event.target;
    data = newData;
}

function clearItems(){
    if(confirm("Are you sure you want to clear deleted items?") === true){ 
        for (const task of items) { //iterate through items
            if (task.completed === true){ 
                document.getElementById(task.id).remove(); //delete li elements who's tag matches items tag
                sendData({}, "delete", task.id)
            }
        }
        items = items.filter(a => a.completed === false) //clear the deleted items from items array
    }
}

function sortItems(){
    items.sort((a, b) => { //sorts alphabetically (sorry numbers)
        let sortA = a.name.toLowerCase(),
            sortB = b.name.toLowerCase();
        if (sortA < sortB) return -1;
        if (sortA > sortB) return 1;
        return
    });
    items.sort((a,b) => b.priority - a.priority) //then sorts by priority, this way items with same priority end up sorted alphabetically
    for (const task of items) { //iterate through items
        let listItem = document.getElementById(task.id) //get li who's id matches the id of the sorted items element
        document.querySelector('ul').appendChild(listItem); //then just re-add every item into the ul in the same order as items
    }        
}

document.addEventListener('DOMContentLoaded', function() {
    loadList();
    });

window.addEventListener('beforeunload', () => {
    clearTimeout(updateTimer);
    if (data) data();
})