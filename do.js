const addButton = document.getElementById("addButton");
const modal = document.getElementById("todoModal");
const todoInput = document.getElementById("todoInput");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const todoList = document.getElementById("todoList");

// Load todos from localStorage
let todos = JSON.parse(localStorage.getItem("todos")) || [];
renderTodos();

addButton.addEventListener("click", () => {
  modal.style.display = "flex";
  todoInput.focus();
});

cancelButton.addEventListener("click", () => {
  modal.style.display = "none";
  todoInput.value = "";
});

todoInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    saveTodo();
  }
});

saveButton.addEventListener("click", saveTodo);

function saveTodo() {
  const text = todoInput.value.trim();
  if (text) {
    todos.push({
      id: Date.now(),
      text,
      completed: false,
    });
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();
    todoInput.value = "";
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
              <span>${todo.text}</span>
              <button class="delete-btn">
                  <i class="fas fa-trash"></i>
              </button>
          `;

    const checkbox = li.querySelector("input");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

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
    todoInput.value = "";
  }
});