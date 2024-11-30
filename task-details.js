document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('taskForm');
  const taskNameInput = document.getElementById('taskName');
  const taskContentInput = document.getElementById('taskContent');
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  const editButton = document.getElementById('editButton');

  // Get task ID from URL
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get('id');

  // Function to handle automatic dot insertion
  function handleDotInsertion(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const cursorPos = taskContentInput.selectionStart;
      const content = taskContentInput.value;
      const beforeCursor = content.substring(0, cursorPos);
      const afterCursor = content.substring(cursorPos);

      // Add new line with dot
      taskContentInput.value = beforeCursor + '\n• ' + afterCursor;
      
      // Move cursor after the dot
      taskContentInput.selectionStart = cursorPos + 3;
      taskContentInput.selectionEnd = cursorPos + 3;
    }
  }

  // Add dot to empty lines when content is set to editable
  function formatExistingContent() {
    if (!taskContentInput.value) {
      taskContentInput.value = '• ';
      taskContentInput.selectionStart = 2;
      taskContentInput.selectionEnd = 2;
      return;
    }

    // Format existing content with dots
    const lines = taskContentInput.value.split('\n');
    const formattedLines = lines.map(line => {
      line = line.trim();
      return line.startsWith('•') ? line : (line ? '• ' + line : line);
    });
    taskContentInput.value = formattedLines.join('\n');
  }

  // Handle paste event to add dots to pasted content
  taskContentInput.addEventListener('paste', (e) => {
    if (taskContentInput.readOnly) return;
    
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const lines = pastedText.split('\n');
    const formattedText = lines.map(line => line.trim()).map(line => {
      // Don't add dot if line already starts with one
      if (line.startsWith('•')) return line;
      return line ? '• ' + line : line;
    }).join('\n');

    const cursorPos = taskContentInput.selectionStart;
    const content = taskContentInput.value;
    const beforeCursor = content.substring(0, cursorPos);
    const afterCursor = content.substring(cursorPos);

    taskContentInput.value = beforeCursor + formattedText + afterCursor;
    
    // Move cursor to end of pasted text
    const newPosition = cursorPos + formattedText.length;
    taskContentInput.selectionStart = newPosition;
    taskContentInput.selectionEnd = newPosition;
  });

  // Load task data
  if (taskId) {
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const task = todos.find(t => t.id.toString() === taskId);
    
    if (task) {
      taskNameInput.value = task.name;
      taskContentInput.value = task.content;
      document.title = `Task: ${task.name}`;
    } else {
      window.location.href = 'do.html';
    }
  } else {
    window.location.href = 'do.html';
  }

  // Toggle edit mode
  let isEditing = false;
  
  function toggleEditMode() {
    isEditing = !isEditing;
    taskNameInput.readOnly = !isEditing;
    taskContentInput.readOnly = !isEditing;
    saveChangesBtn.style.display = isEditing ? 'flex' : 'none';
    
    if (isEditing) {
      formatExistingContent();
      taskContentInput.addEventListener('keydown', handleDotInsertion);
    } else {
      taskContentInput.removeEventListener('keydown', handleDotInsertion);
    }
  }

  editButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleEditMode();
    if (isEditing) {
      taskNameInput.focus();
    }
  });

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

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const taskName = taskNameInput.value.trim();
    const taskContent = taskContentInput.value.trim();

    if (!taskName) {
      taskNameInput.focus();
      return;
    }

    // Get existing todos
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const taskIndex = todos.findIndex(t => t.id.toString() === taskId);

    if (taskIndex !== -1) {
      // Update existing todo
      todos[taskIndex] = {
        ...todos[taskIndex],
        name: taskName,
        content: taskContent
      };

      // Save back to localStorage
      localStorage.setItem('todos', JSON.stringify(todos));

      // Exit edit mode
      toggleEditMode();

      // Show success feedback
      const saveBtn = document.getElementById('saveChangesBtn');
      saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
      saveBtn.classList.add('saved');

      // Reset button after 2 seconds
      setTimeout(() => {
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        saveBtn.classList.remove('saved');
      }, 2000);

      // Update page title
      document.title = `Task: ${taskName}`;
    }
  });

  // Save with Ctrl+S when in edit mode
  document.addEventListener('keydown', (e) => {
    if (isEditing && e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveChangesBtn.click();
    }
  });
});
