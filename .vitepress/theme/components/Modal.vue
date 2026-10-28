<!-- 弹窗组件 -->
<template>
  <Teleport to="body">
    <Transition name="fade" mode="out-in">
      <div v-if="show" class="modal">
        <div class="modal-mask" @click.stop="maskClick" />
        <div
          :style="{
            maxWidth: typeof maxWidth === 'string' ? maxWidth : `${maxWidth}px`,
          }"
          class="modal-main s-card"
          @click.stop
        >
          <!-- 标题 -->
          <div v-if="title || $slots.title" class="modal-header">
            <div class="title-left">
              <template v-if="$slots.title">
                <slot name="title" />
              </template>

              <template v-else>
                <i v-if="titleIcon" :class="`iconfont icon-${titleIcon}`"></i>

                <span class="title-text">{{ title }}</span>
              </template>
            </div>
            <!-- 关闭按钮 -->
            <button
              v-if="showClose"
              type="button"
              class="close"
              aria-label="关闭弹窗"
              @click="modalClose"
            >
              <i class="iconfont icon-close" aria-hidden="true" />
            </button>
          </div>
          <!-- 弹窗内容 -->
          <div class="modal-content" :style="{ '--height': maxHeight + 'vh' }">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { lockBodyScroll, unlockBodyScroll } from "@/utils/scrollLock.mjs";

const props = defineProps({
  // 是否显示
  show: {
    type: Boolean,
    default: false,
  },
  // 标题
  title: {
    type: String,
    default: "",
  },
  // 标题图标
  titleIcon: {
    type: String,
    default: "",
  },
  // 是否显示关闭按钮
  showClose: {
    type: Boolean,
    default: true,
  },
  // 最大宽度
  maxWidth: {
    type: [Number, String],
    default: 800,
  },
  // 最大高度
  maxHeight: {
    type: Number,
    default: 80,
  },
});

// 发射事件
const emit = defineEmits(["mask-click", "modal-close"]);

// 遮罩层事件
const maskClick = () => emit("mask-click");
const modalClose = () => emit("modal-close");

// 监听开启
let scrollLockAcquired = false;

const updateScrollLock = (show) => {
  if (show && !scrollLockAcquired) {
    lockBodyScroll();
    scrollLockAcquired = true;
  } else if (!show && scrollLockAcquired) {
    unlockBodyScroll();
    scrollLockAcquired = false;
  }
};

watch(() => props.show, updateScrollLock, { immediate: true });

onBeforeUnmount(() => {
  if (scrollLockAcquired) {
    unlockBodyScroll();
    scrollLockAcquired = false;
  }
});
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100dvh;
  min-height: 100svh;
  z-index: 2000;
  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-color: var(--main-overlay-background);
  }
  .modal-main {
    position: absolute;
    padding: 0;
    animation: fade-up 160ms ease-out forwards;
    width: calc(100% - 40px);
    overflow: hidden;
    .modal-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      font-size: 1.125rem;
      padding: 20px;
      height: 64px;
      background-color: var(--main-card-background);
      border-bottom: 1px solid var(--main-card-border);
      .title-left {
        flex: 1;
        min-width: 0;
        .iconfont {
          font-size: 1.25rem;
          margin-right: 8px;
        }
      }
      .close {
        flex: 0 0 36px;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border: none;
        background: transparent;
        color: var(--main-font-color);
        margin-right: 0;
        font-size: 1rem;
        border-radius: 8px;
        padding: 8px;
        transition: background-color 0.3s;
        cursor: pointer;
        &:focus-visible {
          outline: 2px solid var(--main-color);
          outline-offset: 2px;
        }
        &:hover {
          background-color: var(--main-card-border);
        }
      }
    }
    .modal-content {
      max-height: calc(var(--height) - 46px);
      padding: 20px;
      overflow: auto;
    }
  }
}
</style>
