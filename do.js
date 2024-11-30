// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
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
const installBtn = document.getElementById('installBtn');
let deferredPrompt;

// Show install button by default on supported platforms
const showInstallButton = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true || 
                      document.referrer.includes('android-app://');
  
  if (isMobile && !isStandalone) {
    installBtn.style.display = 'flex';
  } else {
    installBtn.style.display = 'none';
  }
};

// Show install button initially
showInstallButton();

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show the install button
  installBtn.style.display = 'flex';
  console.log('App is installable');
});

// Handle installation button click
installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    try {
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Installation ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('App was installed');
        installBtn.style.display = 'none';
      }
    } catch (error) {
      console.error('Installation error:', error);
    }
    
    // Clear the deferredPrompt
    deferredPrompt = null;
  } else {
    // Show installation instructions based on platform
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      alert('To install: tap the share button and select "Add to Home Screen"');
    } else if (/android/.test(userAgent)) {
      if (!userAgent.includes('chrome')) {
        alert('Please open this site in Chrome to install the app');
      } else {
        alert('Tap the menu and select "Install app" or "Add to Home screen"');
      }
    } else {
      alert('Installation is currently not available. Please make sure you\'re using a supported mobile browser.');
    }
  }
});

// Hide install button after successful installation
window.addEventListener('appinstalled', (event) => {
  console.log('App was installed');
  installBtn.style.display = 'none';
  deferredPrompt = null;
});

// Check if launched as standalone and update button visibility
window.addEventListener('DOMContentLoaded', () => {
  showInstallButton();
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App launched as standalone');
  }
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