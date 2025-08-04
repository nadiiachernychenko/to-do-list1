const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

function addTask() {
    if (inputBox.value === "") {
        alert("Please write something");
    } else {
        let li = document.createElement("li");
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);

        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);

        li.setAttribute("draggable", true); // сделать перетаскиваемым
    }

    inputBox.value = "";
    saveData();
    enableDragAndDrop();
}

listContainer.addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        saveData();
    } else if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        saveData();
    }
}, false);

function saveData() {
    localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
    listContainer.innerHTML = localStorage.getItem("data");
    enableDragAndDrop();
}

function enableDragAndDrop() {
    const listItems = listContainer.querySelectorAll("li");

    listItems.forEach(item => {
        item.setAttribute("draggable", true);

        item.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", null); // для Firefox
            e.target.classList.add("dragging");
        });

        item.addEventListener("dragend", (e) => {
            e.target.classList.remove("dragging");
            saveData();
        });
    });

    listContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(listContainer, e.clientY);
        const dragging = document.querySelector(".dragging");
        if (!dragging) return;
        if (afterElement == null) {
            listContainer.appendChild(dragging);
        } else {
            listContainer.insertBefore(dragging, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

showTask(); // запускаем при загрузке
