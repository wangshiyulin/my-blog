<!-- 顶部玻璃胶囊提示，沿用全局 $message API 与自动关闭回调。 -->
<template>
  <Teleport to="body">
    <div class="message-host" role="status" aria-live="polite" aria-atomic="true">
      <Transition name="message-island" mode="out-in">
        <div
          v-if="messageShow"
          :class="['message', messageType]"
          :style="{ '--duration': messageDuration + 'ms' }"
          @click="closeMessage"
        >
          <span class="message-symbol" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path v-if="messageType === 'success'" d="m6 12 4 4 8-8" />
              <template v-else-if="messageType === 'warning'">
                <path d="m12 3 10 18H2L12 3Z" />
                <path d="M12 9v4m0 4h.01" />
              </template>
              <template v-else-if="messageType === 'error'">
                <circle cx="12" cy="12" r="9" />
                <path d="m9 9 6 6m0-6-6 6" />
              </template>
              <template v-else>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v6m0-10h.01" />
              </template>
            </svg>
          </span>
          <span class="message-text">{{ messageContent || "默认消息内容" }}</span>
          <button
            v-if="messageClose || messageAlways"
            type="button"
            class="message-close"
            aria-label="关闭提示"
            title="关闭提示"
            @click.stop="closeMessage"
          >
            <svg
              viewBox="0 0 20 20"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="m5 5 10 10m0-10L5 15" />
            </svg>
          </button>
          <span
            v-if="!messageAlways && messageDuration > 0"
            class="message-countdown"
            aria-hidden="true"
          />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
// 消息数据
const messageType = ref("info");
const messageShow = ref(false);
const messageClose = ref(false);
const messageContent = ref(null);
const messageAlways = ref(false);
const messageDuration = ref(0);
const messageTimeOut = ref(null);
let disposed = false;
let sequence = 0;

// 消息处理
const showMessage = (text, type = "info", options = {}, func = null) => {
  if (disposed) return;
  const current = ++sequence;
  // 解构配置
  const { close = false, always = false, duration = 3000 } = options;
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 3000;
  // 先隐藏
  messageShow.value = false;
  clearTimeout(messageTimeOut.value);
  // 显示弹窗
  nextTick().then(() => {
    if (disposed || current !== sequence) return;
    // 更改默认配置
    messageClose.value = close;
    messageContent.value = text;
    messageType.value = type;
    messageShow.value = true;
    messageAlways.value = always;
    messageDuration.value = safeDuration;
    // 自动关闭消息
    if (!always) {
      messageTimeOut.value = setTimeout(() => {
        messageShow.value = false;
        // 执行函数
        if (typeof func === "function") func();
      }, safeDuration);
    }
  });
};

// 弹出消息
const message = {
  // 信息
  info: (text, options, func) => {
    showMessage(text, "info", options, func);
  },
  // 成功
  success: (text, options, func) => {
    showMessage(text, "success", options, func);
  },
  // 警告
  warning: (text, options, func) => {
    showMessage(text, "warning", options, func);
  },
  // 错误
  error: (text, options, func) => {
    showMessage(text, "error", options, func);
  },
};

// 关闭消息
const closeMessage = () => {
  sequence++;
  messageShow.value = false;
  clearTimeout(messageTimeOut.value);
};

onMounted(() => {
  // 挂载全局
  window.$message = message;
});
onBeforeUnmount(() => {
  disposed = true;
  sequence++;
  clearTimeout(messageTimeOut.value);
  if (window.$message === message) delete window.$message;
});
</script>

<style lang="scss" scoped>
.message-host {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  left: 0;
  right: 0;
  z-index: 3000;
  display: flex;
  justify-content: center;
  padding: 0 12px;
  pointer-events: none;
}
.message {
  --message-accent: var(--main-info-color);
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: max-content;
  max-width: min(640px, 100%);
  min-height: 52px;
  padding: 10px 16px 10px 12px;
  overflow: hidden;
  color: var(--main-font-color);
  background:
    linear-gradient(120deg, var(--main-glass-highlight), transparent 75%),
    var(--main-surface-overlay);
  border: 1px solid var(--main-card-border);
  border-radius: 28px;
  box-shadow:
    inset 0 1px 0 var(--main-glass-highlight),
    0 8px 28px var(--main-glass-shadow);
  pointer-events: auto;
  transform-origin: top center;
  &.success {
    --message-accent: var(--main-success-color);
  }
  &.warning {
    --message-accent: var(--main-warning-color);
  }
  &.error {
    --message-accent: var(--main-error-color);
  }
}
.message-symbol {
  display: grid;
  flex: 0 0 32px;
  place-items: center;
  width: 32px;
  height: 32px;
  color: var(--message-accent);
  border: 1px solid var(--main-card-border);
  border-radius: 50%;
  background: var(--main-card-second-background);
}
.message-text {
  min-width: 0;
  max-height: min(35vh, 220px);
  overflow: auto;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 500;
}
.message-close {
  display: grid;
  flex: 0 0 32px;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--main-card-second-background);
  color: var(--main-font-color);
  cursor: pointer;
  &:hover {
    background: var(--main-color-bg);
  }
  &:focus-visible {
    outline: 2px solid var(--message-accent);
    outline-offset: 2px;
  }
}
.message-countdown {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: var(--message-accent);
  opacity: 0.65;
  transform-origin: left center;
  animation: island-countdown var(--duration) linear forwards;
}
@keyframes island-countdown {
  to {
    transform: scaleX(0);
  }
}
.message-island-enter-active {
  transition:
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 200ms ease-out;
}
.message-island-leave-active {
  transition:
    transform 260ms cubic-bezier(0.4, 0, 1, 1),
    opacity 180ms ease-in;
}
.message-island-enter-from {
  transform: translateY(-140%) scale(0.7, 0.45);
  opacity: 0;
}
.message-island-leave-to {
  transform: translateY(-140%) scale(0.45, 0.35);
  opacity: 0;
}
@supports ((backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px))) {
  .message {
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
  }
}
@media (max-width: 480px) {
  .message-host {
    top: max(8px, env(safe-area-inset-top));
    padding: 0 10px;
  }
  .message {
    gap: 8px;
    padding: 9px 10px;
    border-radius: 24px;
  }
  .message-text {
    font-size: 13px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .message-island-enter-active,
  .message-island-leave-active {
    transition: opacity 80ms linear;
  }
  .message-island-enter-from,
  .message-island-leave-to {
    transform: none;
  }
  .message-countdown {
    display: none;
  }
}
@media (prefers-reduced-transparency: reduce) {
  .message {
    background: var(--main-surface-solid);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
</style>
