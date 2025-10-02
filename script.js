
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyBUkABRfluCvc922-urghYi3zzjifyoUUA",
  authDomain: "todoappnadiia.firebaseapp.com",
  databaseURL: "https://todoappnadiia-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "todoappnadiia",
  storageBucket: "todoappnadiia.appspot.com",
  messagingSenderId: "427116641173",
  appId: "1:427116641173:web:babbf492d64238a337549c",
  measurementId: "G-R494CQMVKX"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const tasksRef = ref(db, "tasks");


const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addBtn = document.getElementById("add-btn");


let tasks = [];


addBtn.addEventListener("click", () => {
  if (inputBox.value.trim() === "") return;
  tasks.push({ text: inputBox.value.trim(), checked: false });
  inputBox.value = "";
  saveTasks();
  renderTasks();
});


function saveTasks() {
  set(tasksRef, tasks);
}


onValue(tasksRef, snapshot => {
  tasks = snapshot.val() || [];
  renderTasks();
});


function renderTasks() {
  const oldPositions = new Map();
  listContainer.querySelectorAll("li").forEach(li => {
    const rect = li.getBoundingClientRect();
    oldPositions.set(li.dataset.id, rect);
  });

  listContainer.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task.text;
    li.dataset.id = index; // уникальный ID для FLIP
    if (task.checked) li.classList.add("checked");

   
    const span = document.createElement("span");
    span.textContent = "\u00d7";
    li.appendChild(span);

    
    li.addEventListener("click", e => {
      if (e.target.tagName === "LI") {
        task.checked = !task.checked;
        saveTasks();
        renderTasks();
      }
    });

    
    span.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    listContainer.appendChild(li);
  });

  
  listContainer.querySelectorAll("li").forEach(li => {
    const oldRect = oldPositions.get(li.dataset.id);
    if (!oldRect) return;
    const newRect = li.getBoundingClientRect();
    const dx = oldRect.left - newRect.left;
    const dy = oldRect.top - newRect.top;

    li.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      li.style.transition = "transform 0.3s ease";
      li.style.transform = "";
    });
    li.addEventListener("transitionend", () => {
      li.style.transition = "";
    }, { once: true });
  });

  enableDragAndDrop();
}


function enableDragAndDrop() {
  const listItems = Array.from(listContainer.querySelectorAll("li"));
  let dragItem = null;

  listItems.forEach((item, index) => {
    item.setAttribute("draggable", true);

    item.addEventListener("dragstart", e => {
      dragItem = item;
      item.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "");
    });

    item.addEventListener("dragend", () => {
      dragItem.classList.remove("dragging");
      dragItem = null;
    });

    item.addEventListener("dragover", e => e.preventDefault());

    item.addEventListener("drop", () => {
      if (!dragItem || dragItem === item) return;
      const dragIndex = listItems.indexOf(dragItem);
      const dropIndex = listItems.indexOf(item);

    
      [tasks[dragIndex], tasks[dropIndex]] = [tasks[dropIndex], tasks[dragIndex]];
      saveTasks();
      renderTasks();
    });
  });
}
