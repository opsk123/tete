const STORAGE_KEY = "simple-todo-items-v1";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyMessage = document.querySelector("#empty-message");
const taskCount = document.querySelector("#task-count");
const progressBar = document.querySelector("#progress-bar");
const progressLabel = document.querySelector("#progress-label");
const clearCompletedButton = document.querySelector("#clear-completed");
const filters = [...document.querySelectorAll("[data-filter]")];

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved)
      ? saved.filter((task) => task && typeof task.id === "string" && typeof task.text === "string" && typeof task.completed === "boolean")
      : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    taskCount.textContent = "저장 공간을 사용할 수 없어요";
  }
}

function render() {
  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });
  const completedCount = tasks.filter((task) => task.completed).length;
  const remainingCount = tasks.length - completedCount;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  list.replaceChildren(...visibleTasks.map(createTaskElement));
  emptyState.classList.toggle("is-visible", visibleTasks.length === 0);
  emptyMessage.textContent = tasks.length === 0
    ? "아직 할 일이 없어요.\n위에서 새로운 일을 추가해 보세요."
    : currentFilter === "active"
      ? "진행 중인 할 일이 없어요.\n모두 해냈어요!"
      : "완료한 할 일이 아직 없어요.";
  taskCount.textContent = tasks.length === 0
    ? "할 일을 추가해 보세요"
    : remainingCount === 0
      ? "모든 할 일을 완료했어요"
      : `남은 할 일 ${remainingCount}개`;
  progressBar.style.width = `${progress}%`;
  progressLabel.textContent = `${progress}% 완료`;
  clearCompletedButton.hidden = completedCount === 0;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-complete" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.className = "task-check";
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `${task.text} 완료`);
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    saveTasks();
    render();
  });

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const removeButton = document.createElement("button");
  removeButton.className = "delete-button";
  removeButton.type = "button";
  removeButton.textContent = "삭제";
  removeButton.setAttribute("aria-label", `${task.text} 삭제`);
  removeButton.addEventListener("click", () => {
    tasks = tasks.filter((itemTask) => itemTask.id !== task.id);
    saveTasks();
    render();
  });

  item.append(checkbox, text, removeButton);
  return item;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false,
  });
  currentFilter = "all";
  filters.forEach((button) => {
    const selected = button.dataset.filter === currentFilter;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  input.value = "";
  saveTasks();
  render();
  input.focus();
});

filters.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filters.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle("is-selected", selected);
      filterButton.setAttribute("aria-pressed", String(selected));
    });
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

document.querySelector("#today-date").textContent = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(new Date());

render();
