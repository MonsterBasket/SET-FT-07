// * Prevent duplicate entries
// * Mark as complete
// * Add a button that removes all completed tasks


let items = [];

function addItem(task) {

    if (items.some((item) => task === item.name && item.completed === false)) {
        throw new Error('Duplicate entry, get creative!')
    }

    const listNode = document.getElementsByTagName('ul')[0];

    const node = document.createElement('li'); // === <li></li>

    node.innerText = task;

    node.id = items.length;

    node.addEventListener('click', markAsCompleted);

    listNode.appendChild(node);
    
    items.push({ name: task, completed: false });
}

function getItem() {
    const input = document.getElementById('task-name');
    const trimmed = input.value.trim();
    if (trimmed === '') {
        throw new Error('Write something')
    }

    addItem(trimmed);

    input.value = '';
}

function markAsCompleted(event) {
    //const itemIndex = items.findIndex(item => item.name === event.target.innerText);
    const itemIndex = event.target.id;
    if (items[itemIndex].completed === false){
    items[itemIndex].completed = true;
    event.target.style['text-decoration'] = 'line-through';
    }
    else{
        if(confirm("Do you want to delete this item?") === true) {
            event.target.style.display = "none";
        }
        else{
            if(confirm("Do you want to un-complete this item?") === true){
                items[itemIndex].completed = false;
                event.target.style['text-decoration'] = "none";
            }
        }

    }

}
/*const newButton = document.getElementsByTagName("body")[0].insertAdjacentElement('beforeend', document.createElement("button"));
newButton.innerText = "Clear items?";
newButton.style.marginTop = "10px"; //why does this work?
newButton.addEventListener('click', clearItems);*/
//just wanted to see if I could do this with javascript only.
//but I like the below one-liner better.  Which is fine as long as I want to add it to the start or end.
document.getElementsByTagName("body")[0].innerHTML += '<button onclick="clearItems()" style="margin-Top: 10px;">Clear Items?</button>';

function clearItems(){
    if(confirm("Are you sure you want to reset the list?") === true){
        for(element of document.querySelectorAll('li')){
            element.remove();
        }
        items = [];
    }
}
