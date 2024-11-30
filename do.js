// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

const addButton = document.getElementById("addButton");
const modal = document.getElementById("todoModal");
const taskNameInput = document.getElementById("taskNameInput");
const taskContentInput = document.getElementById("taskContentInput");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const todoList = document.getElementById("todoList");
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    installBtn.style.display = 'flex';
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
        return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // We've used the prompt, and can't use it again, so clear it
    deferredPrompt = null;
    // Hide the install button
    installBtn.style.display = 'none';
});

// Hide the install button if app is already installed
window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    deferredPrompt = null;
});

// Load todos from localStorage
let todos = JSON.parse(localStorage.getItem("todos")) || [];
renderTodos();

addButton.addEventListener("click", () => {
  window.location.href = 'new-task.html';
});

cancelButton.addEventListener("click", () => {
  modal.style.display = "none";
  taskNameInput.value = "";
  taskContentInput.value = "";
});

taskNameInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    taskContentInput.focus();
  }
});

saveButton.addEventListener("click", saveTodo);

function saveTodo() {
  const name = taskNameInput.value.trim();
  const content = taskContentInput.value.trim();
  if (name) {
    todos.push({
      id: Date.now(),
      name,
      content,
      completed: false,
    });
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();
    taskNameInput.value = "";
    taskContentInput.value = "";
    modal.style.display = "none";
  }
}

function renderTodos() {
  todoList.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.innerHTML = `
              <input type="checkbox" ${todo.completed ? "checked" : ""}>
              <div class="todo-text">
                <div class="todo-header">
                  <span class="todo-name">${todo.name}</span>
                </div>
              </div>
              <button class="delete-btn">
                  <i class="fas fa-trash"></i>
              </button>
          `;

    const checkbox = li.querySelector("input");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent task opening when clicking delete
      deleteTodo(todo.id);
    });

    // Make the whole task item clickable
    li.addEventListener("click", (e) => {
      // Only navigate if we didn't click the checkbox or delete button
      if (!e.target.closest('input[type="checkbox"]') && !e.target.closest('.delete-btn')) {
        window.location.href = `task-details.html?id=${todo.id}`;
      }
    });

    todoList.appendChild(li);
  });
}

function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    taskNameInput.value = "";
    taskContentInput.value = "";
  }
});