// Get task ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get('id');

// Get DOM elements
const taskNameInput = document.getElementById('taskName');
const taskContentInput = document.getElementById('taskContent');
const saveChangesBtn = document.getElementById('saveChangesBtn');
const editButton = document.getElementById('editButton');

// Track edit mode
let isEditMode = false;

// Get task details from localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];
const task = todos.find(todo => todo.id.toString() === taskId);

function toggleEditMode(enabled) {
    isEditMode = enabled;
    taskNameInput.readOnly = !enabled;
    taskContentInput.readOnly = !enabled;
    saveChangesBtn.style.display = enabled ? 'flex' : 'none';
    editButton.innerHTML = enabled ? '<i class="fas fa-times"></i>' : '<i class="fas fa-edit"></i>';
    editButton.classList.toggle('active', enabled);

    if (enabled) {
        taskNameInput.focus();
    }
}

if (task) {
    // Update page title and form fields
    document.title = `Task: ${task.name}`;
    taskNameInput.value = task.name;
    taskContentInput.value = task.content || '';

    // Auto-resize textarea as content changes
    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    taskContentInput.addEventListener('input', () => {
        autoResize(taskContentInput);
    });

    // Initial resize
    autoResize(taskContentInput);

    // Toggle edit mode
    editButton.addEventListener('click', () => {
        toggleEditMode(!isEditMode);
    });

    // Save changes
    saveChangesBtn.addEventListener('click', () => {
        const newName = taskNameInput.value.trim();
        const newContent = taskContentInput.value.trim();

        if (newName) {
            // Update task in todos array
            todos = todos.map(todo => {
                if (todo.id.toString() === taskId) {
                    return {
                        ...todo,
                        name: newName,
                        content: newContent
                    };
                }
                return todo;
            });

            // Save to localStorage
            localStorage.setItem('todos', JSON.stringify(todos));

            // Show success feedback
            const saveBtn = document.getElementById('saveChangesBtn');
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            saveBtn.classList.add('saved');

            // Reset button after 2 seconds
            setTimeout(() => {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                saveBtn.classList.remove('saved');
                toggleEditMode(false);
            }, 2000);

            // Update page title
            document.title = `Task: ${newName}`;
        }
    });

    // Save with Ctrl+S when in edit mode
    document.addEventListener('keydown', (e) => {
        if (isEditMode && e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveChangesBtn.click();
        }
    });
} else {
    // Handle case when task is not found
    taskNameInput.value = 'Task not found';
    taskContentInput.value = 'The requested task could not be found.';
    taskNameInput.disabled = true;
    taskContentInput.disabled = true;
    saveChangesBtn.disabled = true;
    editButton.disabled = true;
}
