<template>
  <Teleport to="body">
    <Transition name="fade" mode="out-in">
      <div
        v-if="rightMenuShow"
        class="right-menu"
        @click="rightMenuShow = false"
        @contextmenu.stop="closeRightMenu"
      >
        <div
          ref="rightMenuRef"
          :style="{ left: `${rightMenuX}px`, top: `${rightMenuY}px` }"
          class="menu-content s-card hover"
          @contextmenu.stop="closeRightMenu"
        >
          <div class="tools">
            <div class="btn" title="后退" @click="rightMenuFunc('back')">
              <i class="iconfont icon-left" />
            </div>
            <div class="btn" title="前进" @click="rightMenuFunc('forward')">
              <i class="iconfont icon-right" />
            </div>
            <div class="btn" title="刷新" @click="rightMenuFunc('reload')">
              <i class="iconfont icon-refresh" />
            </div>
            <div class="btn" title="返回顶部" @click="smoothScrolling">
              <i class="iconfont icon-arrow-up" />
            </div>
          </div>

          <div class="all-menu">
            <div
              v-if="clickedType === 'normal'"
              class="btn"
              @click="router.go(shufflePost(theme.postData))"
            >
              <i class="iconfont icon-shuffle" />
              <span class="name">随便逛逛</span>
            </div>
            <div
              v-if="clickedType === 'normal'"
              class="btn"
              @click="router.go('/pages/categories')"
            >
              <i class="iconfont icon-folder" />
              <span class="name">全部分类</span>
            </div>
            <div
              v-if="clickedType === 'normal'"
              class="btn"
              @click="router.go('/pages/tags')"
            >
              <i class="iconfont icon-hashtag" />
              <span class="name">全部标签</span>
            </div>

            <div v-if="clickedType === 'link'" class="btn" @click="rightMenuFunc('open-link')">
              <i class="iconfont icon-window" />
              <span class="name">新标签页打开</span>
            </div>
            <div v-if="clickedType === 'link'" class="btn" @click="copyText(clickedTypeData?.getAttribute?.('original-href') || clickedTypeData?.href)">
              <i class="iconfont icon-link" />
              <span class="name">复制链接地址</span>
            </div>

            <div v-if="clickedType === 'image'" class="btn" @click="copyImage(clickedTypeData?.src)">
              <i class="iconfont icon-image-copy" />
              <span class="name">复制此图片</span>
            </div>
            <div v-if="clickedType === 'image'" class="btn" @click="downloadImage(clickedTypeData?.src)">
              <i class="iconfont icon-download" />
              <span class="name">下载此图片</span>
            </div>

            <div
              v-if="clickedType === 'input' && !clickedTypeData?.readOnly && !clickedTypeData?.disabled"
              class="btn"
              @click="rightMenuFunc('input-paste')"
            >
              <i class="iconfont icon-paste" />
              <span class="name">粘贴文本</span>
            </div>

            <a
              v-if="(clickedType === 'text' || clickedType === 'input') && isLink(selectedText)"
              :href="isLink(selectedText)"
              class="btn right-menu-link"
              target="_blank" rel="noopener noreferrer"
            >
              <i class="iconfont icon-link" />
              <span class="name">在新标签页打开</span>
            </a>
            <a
              v-if="(clickedType === 'text' || clickedType === 'input') && selectedText"
              :href="`https://cn.bing.com/search?q=${encodeURIComponent(selectedText)}`"
              class="btn right-menu-link"
              target="_blank" rel="noopener noreferrer"
            >
              <i class="iconfont icon-bing" />
              <span class="name">使用必应搜索</span>
            </a>
            <div
              v-if="(clickedType === 'text' || clickedType === 'input') && selectedText"
              class="btn"
              @click="copyText(selectedText)"
            >
              <i class="iconfont icon-copy" />
              <span class="name">复制选中文本</span>
            </div>
            <div
              v-if="clickedType === 'text' && !commentCopyShow && theme.comment.type === 'twikoo'"
              class="btn"
              @click="commentCopy(selectedText)"
            >
              <i class="iconfont icon-chat" />
              <span class="name">评论选中内容</span>
            </div>
          </div>

          <div class="all-menu general">
            <div class="btn" @click="rightMenuFunc('copy-link')">
              <i class="iconfont icon-copy" />
              <span class="name">复制本页地址</span>
            </div>
            <button type="button" class="btn theme-switch" :disabled="store.hasBackground"
              :title="store.hasBackground ? '请先在中控台关闭背景图片' : '切换亮暗模式'"
              @click.stop="store.changeThemeType">
              <i :class="`iconfont icon-${themeType === 'dark' ? 'light' : 'dark'}`" />
              <span class="name">{{ store.hasBackground ? '背景模式已锁定深色' : themeType === 'dark' ? '浅色模式' : '深色模式' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Modal
      :show="commentCopyShow"
      title="快速评论"
      titleIcon="chat"
      @mask-click="commentCopyClose"
      @modal-close="commentCopyClose"
    >
      <span class="modal-tip">您无需删除现有的输入框内容，直接在下方评论即可</span>
      <Twikoo v-if="commentCopyShow" :fill="commentCopyData" />
    </Modal>
  </Teleport>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import { smoothScrolling, shufflePost, copyText, copyImage, downloadImage } from "@/utils/helper";

const router = useRouter();
const store = mainStore();
const { theme } = useData();
const { useRightMenu, themeType } = storeToRefs(store);

// 右键菜单数据
const rightMenuX = ref(0);
const rightMenuY = ref(0);
const clickedType = ref("normal");
const clickedTypeData = ref(null);
const selectedText = ref("");
const rightMenuRef = ref(null);
const rightMenuShow = ref(false);

// 快速评论
const commentCopyShow = ref(false);
const commentCopyData = ref(null);

// 开启右键菜单
const openRightMenu = (e) => {
  // 检测是否可开启
  if (e.ctrlKey || !useRightMenu.value) return true;
  if (window.innerWidth < 768) return true;
  e.preventDefault();
  rightMenuShow.value = false;
  // 获取点击类型
  checkClickType(e?.target);
  nextTick().then(() => {
    // 处理菜单位置
    const calculateMenuPosition = () => {
      // 获取菜单的宽度和高度
      const menuWidth = rightMenuRef.value?.offsetWidth;
      const menuHeight = rightMenuRef.value?.offsetHeight;
      // 获取屏幕的宽度和高度
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      // 计算正确的坐标值
      let correctX = e.clientX;
      let correctY = e.clientY;
      // 保留边距
      const marginWidth = 20;
      if (correctX + menuWidth > screenWidth - marginWidth) {
        correctX = screenWidth - menuWidth - marginWidth;
      }
      if (correctY + menuHeight > screenHeight - marginWidth) {
        correctY = screenHeight - menuHeight - marginWidth;
      }
      if (correctX < marginWidth) {
        correctX = marginWidth;
      }
      if (correctY < marginWidth) {
        correctY = marginWidth;
      }
      rightMenuX.value = correctX;
      rightMenuY.value = correctY;
    };
    // 显示菜单
    rightMenuShow.value = true;
    // DOM 更新
    nextTick().then(() => calculateMenuPosition());
  });
};

// 关闭右键菜单
const closeRightMenu = (e) => {
  e?.preventDefault();
  rightMenuShow.value = false;
  rightMenuX.value = 0;
  rightMenuY.value = 0;
  clickedType.value = "normal";
  clickedTypeData.value = null;
  selectedText.value = "";
  commentCopyData.value = null;
};

// 判断点击元素类型
const checkClickType = (target) => {
  clickedType.value = "normal";
  clickedTypeData.value = null;
  selectedText.value = window.getSelection()?.toString() || "";
  if (!target?.tagName) return;
  // DOM targets and selected text have distinct types and must not share storage.
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    clickedType.value = "input";
    clickedTypeData.value = target;
    if (typeof target.selectionStart === "number" && typeof target.selectionEnd === "number") {
      selectedText.value = target.value.slice(target.selectionStart, target.selectionEnd);
    }
  } else if (target.tagName === "IMG") {
    clickedType.value = "image";
    clickedTypeData.value = target;
  } else {
    const anchor = target.closest?.("a[href]");
    if (anchor) {
      clickedType.value = "link";
      clickedTypeData.value = anchor;
    } else if (selectedText.value) {
      clickedType.value = "text";
    }
  }
};

// 右键菜单点击事件
const rightMenuFunc = async (type) => {
  try {
    if (!type) return false;
    switch (type) {
      case "back":
        window.history.back();
        break;
      case "forward":
        window.history.forward();
        break;
      case "reload":
        window.location.reload();
        break;
      case "open-link":
        window.open(clickedTypeData.value?.href, "_blank", "noopener,noreferrer");
        break;
      case "copy-link": {
        const pageLink = theme.value.siteMeta.site + router.route.path;
        if (pageLink) copyText(pageLink);
        break;
      }
      case "input-paste": {
        const inputElement = clickedTypeData.value;
        if (!inputElement?.isConnected || inputElement.readOnly || inputElement.disabled) return;
        const text = await navigator.clipboard.readText();
        if (!inputElement.isConnected) return;
        const value = inputElement.value;
        const canSelect = typeof inputElement.selectionStart === "number" && typeof inputElement.selectionEnd === "number";
        const start = canSelect ? inputElement.selectionStart : value.length;
        const end = canSelect ? inputElement.selectionEnd : value.length;
        inputElement.value = value.slice(0, start) + text + value.slice(end);
        inputElement.dispatchEvent(new Event("input", { bubbles: true }));
        if (canSelect) inputElement.setSelectionRange(start + text.length, start + text.length);
        break;
      }
      default:
        return false;
    }
  } catch (error) {
    if (typeof $message !== "undefined") $message.error("右键菜单发生错误，请重试");
    console.error("右键菜单出错：", error);
  }
};


// 选中内容是否为链接
const isLink = (data) => {
  if (!data) return false;
  const hasProtocol = /^(http|https):\/\//i.test(data);
  const urlData = hasProtocol ? data : `http://${data}`;
  try {
    new URL(urlData);
    return urlData;
  } catch (_error) {
    return false;
  }
};

// 评论选中内容
const commentCopy = (data) => {
  if (!data) return false;
  let commentData = "> " + data.trim().replace(/\s+/g, " ");
  if (commentData.length >= 200) {
    commentData = commentData.substring(0, 200) + "...";
  }
  commentCopyData.value = commentData;
  commentCopyShow.value = true;
};

// 关闭快速评论
const commentCopyClose = () => {
  commentCopyShow.value = false;
};

defineExpose({ openRightMenu });
</script>

<style lang="scss" scoped>
.theme-switch { width: 100%; font: inherit; text-align: left; color: inherit; background: transparent; border: 0; }
.theme-switch:disabled { opacity: .5; cursor: not-allowed; }

.right-menu {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100dvh;
  min-height: 100svh;
  z-index: 9999;
  transition: opacity 0.2s;
  .menu-content {
    position: absolute;
    width: 180px;
    background-color: var(--main-card-background);
    animation: fade-up 0.2s forwards;
    transition:
      opacity 0.3s,
      border-color 0.3s,
      box-shadow 0.3s,
      background-color 0.3s;
    .tools {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--main-card-border);
      .btn {
        width: 34px;
        height: 34px;
        min-width: 34px;
      }
    }
    .all-menu {
      margin-top: 12px;
      .btn {
        justify-content: flex-start;
        margin-bottom: 6px;
        .iconfont {
          font-size: 20px;
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
      &.general {
        padding-top: 12px;
        border-top: 1px solid var(--main-card-border);
      }
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      padding: 8px;
      transition:
        color 0.3s,
        background-color 0.3s;
      .iconfont {
        font-size: 20px;
        transition: color 0.3s;
      }
      .name {
        margin-left: 12px;
      }
      &:hover {
        color: var(--main-on-accent-color);
        background-color: var(--main-color);
        .iconfont {
          color: var(--main-on-accent-color);
        }
      }
    }
  }
}
.modal-tip {
  font-size: 15px;
  margin-top: -4px;
  margin-bottom: 1rem;
  display: block;
  color: var(--main-font-second-color);
  border-left: 4px solid var(--main-card-border);
  border-radius: 4px;
  padding: 8px 0 8px 12px;
  background-color: var(--main-card-second-background);
}
</style>
