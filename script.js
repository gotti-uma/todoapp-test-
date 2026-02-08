const STORAGE_KEY = "todoapp-items";

const form = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const prioritySelect = document.getElementById("todo-priority");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const remainingCount = document.getElementById("remaining-count");
const completedCount = document.getElementById("completed-count");
const totalCount = document.getElementById("total-count");
const progressBar = document.getElementById("progress-bar");
const clearCompletedButton = document.getElementById("clear-completed");
const tabs = Array.from(document.querySelectorAll(".tab"));
const template = document.getElementById("todo-item-template");

let todos = loadTodos();
let currentFilter = "all";

const priorityLabels = {
  low: "低",
  medium: "中",
  high: "高",
};

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = todoInput.value.trim();
  if (!title) {
    return;
  }

  const todo = {
    id: crypto.randomUUID(),
    title,
    priority: prioritySelect.value,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.unshift(todo);
  persistTodos();
  form.reset();
  prioritySelect.value = "medium";
  todoInput.focus();
  render();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    currentFilter = tab.dataset.filter;
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  persistTodos();
  render();
});

function render() {
  const filteredTodos = getFilteredTodos();
  list.innerHTML = "";

  if (filteredTodos.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  filteredTodos.forEach((todo) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input");
    const title = item.querySelector(".list__title");
    const meta = item.querySelector(".list__meta");
    const deleteButton = item.querySelector(".list__delete");

    checkbox.checked = todo.completed;
    title.textContent = todo.title;
    meta.textContent = `${formatDate(todo.createdAt)} · 優先度: ${priorityLabels[todo.priority]}`;

    if (todo.completed) {
      item.classList.add("is-complete");
    }

    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      persistTodos();
      render();
    });

    deleteButton.addEventListener("click", () => {
      todos = todos.filter((entry) => entry.id !== todo.id);
      persistTodos();
      render();
    });

    list.appendChild(item);
  });

  updateSummary();
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

function updateSummary() {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const remaining = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  remainingCount.textContent = remaining;
  completedCount.textContent = completed;
  totalCount.textContent = total;
  progressBar.style.width = `${progress}%`;
}

function persistTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((todo) => ({
      ...todo,
      completed: Boolean(todo.completed),
    }));
  } catch {
    return [];
  }
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
