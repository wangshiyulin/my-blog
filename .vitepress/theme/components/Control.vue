<template>
  <Teleport to="body">
    <Transition name="fade" mode="out-in" @before-enter="changeCloseStyle">
      <div v-if="store.controlShow" class="control" @click="closeControl">
        <button
          ref="closeControlRef"
          type="button"
          class="close-control"
          aria-label="关闭中控台"
          @click.stop="closeControl"
        >
          <i class="iconfont icon-close" aria-hidden="true" />
        </button>
        <div class="control-mask" />
        <div class="control-content" @click.stop>
          <div class="menu">
            <button
              type="button"
              class="menu-item"
              aria-label="切换亮暗模式"
              :title="store.hasBackground ? '请先关闭背景图片，再切换亮暗模式' : '切换亮暗模式'"
              :disabled="store.hasBackground"
              @click="store.changeThemeType"
            >
              <i :class="`iconfont icon-${store.effectiveTheme}`" aria-hidden="true" />
            </button>
            <button
              type="button"
              :class="['menu-item', { open: store.hasBackground }]"
              aria-label="背景图片"
              :aria-pressed="store.hasBackground"
              title="背景图片开关"
              @click="store.toggleBackground"
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8" cy="8" r="1.5" />
                <path d="m3 17 5-5 4 4 4-6 5 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { lockBodyScroll, unlockBodyScroll } from "@/utils/scrollLock.mjs";
import { mainStore } from "@/store";
const store = mainStore();
const closeControlRef = ref(null);
const closeControl = () => {
  store.controlShow = false;
};
const changeCloseStyle = () => {
  nextTick(() => {
    const opener = document.querySelector("#open-control");
    if (opener && closeControlRef.value) {
      const { top, left } = opener.getBoundingClientRect();
      Object.assign(closeControlRef.value.style, {
        top: `${top}px`,
        left: `${left}px`,
        opacity: "1",
      });
    }
  });
};
const onKeydown = (event) => {
  if (event.key === "Escape" && store.controlShow) closeControl();
};
let locked = false;
watch(
  () => store.controlShow,
  (show) => {
    if (show && !locked) {
      lockBodyScroll();
      locked = true;
    } else if (!show && locked) {
      unlockBodyScroll();
      locked = false;
    }
  },
  { immediate: true },
);
onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (locked) unlockBodyScroll();
});
</script>

<style lang="scss" scoped>
.control {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100dvh;
  min-height: 100svh;
  z-index: 1109;
}
.close-control {
  position: absolute;
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  padding: 0;
  opacity: 0;
  border: 0;
  border-radius: 50%;
  color: var(--main-font-color);
  background: var(--main-surface-overlay);
  cursor: pointer;
}
.close-control:hover {
  background: var(--main-color-bg);
}
.control-mask {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--main-overlay-background);
}
.control-content {
  max-width: calc(100% - 24px);
  padding: 20px;
  border: 1px solid var(--main-card-border);
  border-radius: 24px;
  background: var(--main-surface-overlay);
  animation: fade-up 160ms ease-out forwards;
}
.menu {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 76px;
  height: 76px;
  padding: 8px;
  border-radius: 20px;
  border: 1px solid var(--main-card-border);
  background: var(--main-card-background);
  color: var(--main-font-color);
  cursor: pointer;
}
.menu-item .iconfont {
  font-size: 24px;
  color: inherit;
}
.menu-item.open {
  background: var(--main-color);
  color: var(--main-on-accent-color);
}
.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.menu-item:not(:disabled):hover {
  transform: translateY(-2px);
}
</style>
