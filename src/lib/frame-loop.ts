type FrameStep = (time: number) => boolean;

const tasks = new Set<FrameStep>();
let frame = 0;
let observingVisibility = false;

const requestNextFrame = () => {
  if (
    frame ||
    tasks.size === 0 ||
    typeof window === "undefined" ||
    document.hidden
  ) {
    return;
  }

  frame = window.requestAnimationFrame(runFrame);
};

const stopObservingVisibilityWhenIdle = () => {
  if (tasks.size !== 0 || !observingVisibility || typeof document === "undefined") {
    return;
  }

  document.removeEventListener("visibilitychange", requestNextFrame);
  observingVisibility = false;
};

const runFrame = (time: number) => {
  frame = 0;
  if (document.hidden) return;

  for (const task of tasks) {
    if (!task(time)) tasks.delete(task);
  }

  stopObservingVisibilityWhenIdle();
  requestNextFrame();
};

const enqueue = (task: FrameStep) => {
  tasks.add(task);

  if (!observingVisibility && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", requestNextFrame);
    observingVisibility = true;
  }

  requestNextFrame();
};

export function createFrameLoop(
  step: FrameStep,
  getFrameRate: () => number = () => 60,
) {
  let active = false;
  let lastFrameAt = 0;

  const task: FrameStep = (time) => {
    if (!active) return false;

    const frameRate = Math.max(1, getFrameRate());
    const minimumFrameTime = 1000 / frameRate;
    if (lastFrameAt && time - lastFrameAt < minimumFrameTime) return true;

    lastFrameAt = time;
    active = step(time);
    if (!active) lastFrameAt = 0;
    return active;
  };

  return {
    wake() {
      active = true;
      enqueue(task);
    },
    stop() {
      active = false;
      lastFrameAt = 0;
      tasks.delete(task);
      stopObservingVisibilityWhenIdle();
    },
  };
}
