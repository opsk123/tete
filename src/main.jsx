import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";

const STORAGE_KEY = "simple-todo-items-v1";
const filterOptions = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행 중" },
  { key: "completed", label: "완료" },
];

function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored)
      ? stored.filter(
          (task) =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean",
        )
      : [];
  } catch {
    return [];
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState("all");
  const [newTask, setNewTask] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Keep the checklist usable if browser storage is unavailable.
    }
  }, [tasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const remainingCount = tasks.length - completedCount;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === "active") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
      }),
    [filter, tasks],
  );
  const today = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  function addTask(event) {
    event.preventDefault();
    const text = newTask.trim();
    if (!text) return;

    setTasks((current) => [
      {
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        completed: false,
      },
      ...current,
    ]);
    setNewTask("");
    setFilter("all");
    inputRef.current?.focus();
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function clearCompleted() {
    setTasks((current) => current.filter((task) => !task.completed));
  }

  const emptyMessage =
    tasks.length === 0
      ? "아직 적어둔 일이 없어요.\n첫 번째 할 일을 추가해 볼까요?"
      : filter === "active"
        ? "진행 중인 일이 없어요.\n오늘 할 일을 모두 해냈어요!"
        : "완료한 일이 여기에 모여요.";

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <div className="app-frame">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="모먼트 홈">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>moment<span className="brand-period">.</span></span>
          </a>
          <div className="topbar-date"><span className="date-dot" />{today}</div>
        </header>

        <div className="workspace" id="top">
          <aside className="welcome-panel">
            <div className="welcome-copy">
              <span className="eyebrow"><span className="eyebrow-line" /> TODAY, YOUR WAY</span>
              <h1>작은 체크가<br />멋진 하루를<br /><span>만들어요.</span></h1>
              <p>한 번에 하나씩, 내 페이스대로.<br />오늘의 할 일을 가볍게 시작해요.</p>
            </div>

            <div className="progress-card">
              <div className="progress-copy">
                <span className="progress-caption">오늘의 진행률</span>
                <strong>{remainingCount === 0 && tasks.length > 0 ? "다 해냈어요!" : "차근차근 좋아요"}</strong>
                <span className="progress-detail">{tasks.length === 0 ? "첫 체크를 기다리는 중" : `남은 할 일 ${remainingCount}개`}</span>
              </div>
              <div
                className="progress-ring"
                style={{ "--progress": `${progress}%` }}
                role="img"
                aria-label={`전체 ${tasks.length}개 중 ${completedCount}개 완료, ${progress}%`}
              >
                <span>{progress}<small>%</small></span>
              </div>
            </div>

            <div className="welcome-footer">
              <span className="footer-spark" aria-hidden="true">✳</span>
              <span>완벽하게보다, 완료하기</span>
              <span className="footer-arrow" aria-hidden="true">↗</span>
            </div>
            <span className="orbit orbit-one" aria-hidden="true" />
            <span className="orbit orbit-two" aria-hidden="true" />
          </aside>

          <section className="checklist-panel" aria-labelledby="checklist-title">
            <div className="section-topline">
              <span className="section-kicker">YOUR DAILY LIST</span>
              <span className="task-total"><span>{tasks.length}</span>개</span>
            </div>
            <div className="list-title-row">
              <div>
                <h2 id="checklist-title">오늘의 체크리스트</h2>
                <p aria-live="polite">
                  {tasks.length === 0
                    ? "생각나는 일을 하나씩 적어보세요"
                    : remainingCount === 0
                      ? "모든 할 일을 완료했어요. 최고예요!"
                      : `좋아요, ${remainingCount}개 남았어요. 계속 이어가 봐요!`}
                </p>
              </div>
              <span className="title-spark" aria-hidden="true">✳</span>
            </div>

            <form className="add-form" onSubmit={addTask}>
              <span className="input-plus" aria-hidden="true">＋</span>
              <label className="visually-hidden" htmlFor="new-task">새로운 할 일</label>
              <input
                ref={inputRef}
                id="new-task"
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="새로운 할 일을 적어보세요"
                maxLength={120}
                autoComplete="off"
              />
              <button className="add-button" type="submit">추가하기 <span aria-hidden="true">↗</span></button>
            </form>

            <div className="list-toolbar">
              <div className="filters" role="group" aria-label="할 일 필터">
                {filterOptions.map((option) => (
                  <button
                    key={option.key}
                    className={`filter-button${filter === option.key ? " is-selected" : ""}`}
                    type="button"
                    aria-pressed={filter === option.key}
                    onClick={() => setFilter(option.key)}
                  >
                    {option.label}
                    {option.key === "active" && remainingCount > 0 && (
                      <span className="filter-count">{remainingCount}</span>
                    )}
                  </button>
                ))}
              </div>
              <span className="list-hint">{completedCount}개 완료</span>
            </div>

            {visibleTasks.length > 0 ? (
              <ul className="task-list" aria-label="할 일 목록">
                {visibleTasks.map((task, index) => (
                  <li className={`task-item${task.completed ? " is-complete" : ""}`} key={task.id}>
                    <label className="task-main">
                      <input
                        className="task-check"
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        aria-label={`${task.text} 완료`}
                      />
                      <span className="custom-check" aria-hidden="true">✓</span>
                      <span className="task-text">{task.text}</span>
                    </label>
                    <span className="task-index">{String(index + 1).padStart(2, "0")}</span>
                    <button
                      className="delete-button"
                      type="button"
                      aria-label={`${task.text} 삭제`}
                      onClick={() => deleteTask(task.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <div className="empty-illustration" aria-hidden="true">
                  <span className="empty-check">✓</span>
                  <span className="empty-star">✳</span>
                  <span className="empty-dot" />
                </div>
                <p>{emptyMessage}</p>
                {tasks.length === 0 && (
                  <button className="empty-cta" type="button" onClick={() => inputRef.current?.focus()}>
                    첫 할 일 적기 <span aria-hidden="true">↗</span>
                  </button>
                )}
              </div>
            )}

            <footer className="list-footer">
              <span className="storage-note"><span className="storage-check">✓</span> 이 브라우저에 자동 저장돼요</span>
              {completedCount > 0 && (
                <button className="clear-button" type="button" onClick={clearCompleted}>완료 항목 지우기</button>
              )}
            </footer>
          </section>
        </div>
        <footer className="page-footer"><span>MAKE SPACE FOR WHAT MATTERS</span><span>오늘도 좋은 하루가 되길.</span></footer>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
