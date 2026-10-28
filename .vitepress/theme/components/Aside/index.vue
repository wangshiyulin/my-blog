<template>
  <aside class="main-aside">
    <div v-if="theme.aside.hello.enable" class="hello s-card weidgets" @mouseleave="resetHello">
      <span class="tip" @click="changeHello">{{ helloText }}</span>
      <div class="content">
        <div class="site-logo">
          <img
            class="author-avatar"
            :src="theme.siteMeta.author.cover"
            :alt="`${theme.siteMeta.author.name}的头像`"
            width="160"
            height="160"
            loading="lazy"
            decoding="async"
          />
        </div>
        <span class="site-desc" v-html="theme.aside.hello.text" />
      </div>
      <div class="info">
        <div class="name">
          <span class="author">{{ theme.siteMeta.author.name }}</span>
          <span class="desc">{{ theme.siteMeta.description }}</span>
        </div>
        <SocialLinks :links="theme.aside.hello.social" />
      </div>
    </div>
    <div class="sticky">
      <Toc v-if="theme.aside.toc.enable && showToc" class="weidgets" />
      <div v-if="theme.aside.tags.enable" class="tags-cloud s-card weidgets">
        <div class="title">
          <i class="iconfont icon-hashtag"></i>
          <span class="title-name">热门标签</span>
        </div>
        <div class="all-tags">
          <a
            v-for="tag in popularTags"
            :key="tag.name"
            :href="taxonomyHref('tags', tag.name)"
            class="tags"
          >
            <span class="name">{{ tag.name }}</span>
            <sup class="num">{{ tag.count }}</sup>
          </a>
        </div>
        <a href="/pages/tags" class="more-tags">查看全部</a>
      </div>
      <div v-if="theme.aside.siteData.enable" class="site-data s-card weidgets">
        <div class="title">
          <i class="iconfont icon-chart"></i>
          <span class="title-name">站点数据</span>
        </div>
        <div class="all-data">
          <div class="data-item">
            <span class="name">
              <i class="iconfont icon-article"></i>
              文章总数
            </span>
            <span class="num">{{ theme.postData?.length || 0 }} 篇</span>
          </div>
          <div class="data-item">
            <span class="name">
              <i class="iconfont icon-date"></i>
              建站天数
            </span>
            <span class="num">{{ daysFromNow(theme.since) }} 天</span>
          </div>
          <div class="data-item">
            <span class="name">
              <i class="iconfont icon-visibility"></i>
              总访问量
            </span>
            <span class="num" id="busuanzi_value_site_pv">0</span>
          </div>
          <div class="data-item">
            <span class="name">
              <i class="iconfont icon-account"></i>
              总访客数
            </span>
            <span class="num" id="busuanzi_value_site_uv">0</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { getGreetings } from "@/utils/helper";
import { useClientDate } from "@/utils/useClientDate.mjs";
const { daysFromNow } = useClientDate();
import { loadScript } from "@/utils/commonTools";
import { taxonomyHref } from "@/utils/taxonomyPaths.mjs";
import SocialLinks from "./Widgets/SocialLinks.vue";

const { theme } = useData();
defineProps({
  // 显示目录
  showToc: {
    type: Boolean,
    default: false,
  },
});

// 简介卡片
// 问候数据
const helloClick = ref(0);
const helloTimeOut = ref(null);
const helloText = ref("你好，欢迎来到" + theme.value.siteMeta.title);

// 恢复问候语
const resetHello = () => {
  helloClick.value = 0;
  if (isHasUser()) return false;
  helloText.value = getGreetings();
};

// 更改问候语
const changeHello = () => {
  clearTimeout(helloTimeOut.value);
  helloClick.value++;
  if (helloClick.value === 1) {
    helloText.value = "点这里干什么？";
  } else if (helloClick.value === 2) {
    helloText.value = "怎么还点？";
  } else if (helloClick.value === 3) {
    helloText.value = "那你点吧！";
  } else if (helloClick.value === 20) {
    helloText.value = "这么坚持？";
  } else if (helloClick.value === 50) {
    helloText.value = "让我们去看看文章？";
  } else if (helloClick.value === 100) {
    helloText.value = "怎么还在点？？？";
  } else if (helloClick.value === 120) {
    helloText.value = "随你了";
  } else {
    helloText.value = `x ${helloClick.value - 3}`;
  }
  // 恢复默认
  helloTimeOut.value = setTimeout(() => {
    resetHello();
  }, 3000);
};

// 是否具有用户
const isHasUser = () => {
  let nick;
  try {
    const saved = JSON.parse(window.localStorage.getItem("twikoo-user") || "null");
    if (typeof saved?.nick !== "string" || !saved.nick.trim()) return false;
    nick = saved.nick;
  } catch {
    return false;
  }
  const hello = ["很高兴见到你", "好久不见", "欢迎回来"];
  // 随机问候语
  helloText.value = hello[Math.floor(Math.random() * hello.length)] + "，" + nick;
  return true;
};

onMounted(() => {
  if (theme.value.aside.hello.enable) {
    helloText.value = getGreetings();
    isHasUser();
  }
});

onBeforeUnmount(() => {
  clearTimeout(helloTimeOut.value);
});
watch(() => theme.value.aside.hello.enable, (enabled) => {
  clearTimeout(helloTimeOut.value);
  helloClick.value = 0;
  if (enabled) resetHello();
});

// 热门标签
// 侧栏只展示文章数大于 2 的标签，最多 40 项；完整标签仍可从「查看全部」进入。
const popularTags = computed(() =>
  Object.entries(theme.value.tagsData || {})
    .filter(([, entry]) => entry.count > 2)
    .sort(([nameA, a], [nameB, b]) => b.count - a.count || nameA.localeCompare(nameB, "zh-CN"))
    .slice(0, 40)
    .map(([name, entry]) => ({ name, count: entry.count })),
);

// 站点统计及路由清理
const COUNTER_SCRIPT = "https://events.vercount.one/js";


let loadedPath = "";
let pendingPath = "";
let scheduled = null;
let idleScheduled = false;
let disposed = false;
const getCurrentPath = () => `${window.location.pathname}${window.location.search}`;
const cancelScheduled = () => {
  if (scheduled === null) return;
  if (idleScheduled) window.cancelIdleCallback(scheduled);
  else window.clearTimeout(scheduled);
  scheduled = null;
};
const loadCounter = async () => {
  scheduled = null;
  if (disposed || !theme.value.aside.siteData.enable || pendingPath) return;
  const path = getCurrentPath();
  if (path === loadedPath) return;
  pendingPath = path;
  try {
    // The provider counts SPA page views by executing its script for each route.
    await loadScript(COUNTER_SCRIPT, { async: true, reload: true });
    if (!disposed && theme.value.aside.siteData.enable) loadedPath = path;
  } catch (error) {
    if (!disposed) console.error("网站访问统计加载失败：", error);
  } finally {
    pendingPath = "";
    if (!disposed && getCurrentPath() !== path) scheduleCounter();
  }
};
const scheduleCounter = () => {
  if (disposed || !theme.value.aside.siteData.enable) return;
  cancelScheduled();
  idleScheduled = "requestIdleCallback" in window && "cancelIdleCallback" in window;
  scheduled = idleScheduled
    ? window.requestIdleCallback(() => { void loadCounter(); }, { timeout: 1000 })
    : window.setTimeout(() => { void loadCounter(); }, 160);
};
onMounted(() => {
  scheduleCounter();
  window.addEventListener("vitepress-route-change", scheduleCounter);
});
onBeforeUnmount(() => {
  disposed = true;
  cancelScheduled();
  window.removeEventListener("vitepress-route-change", scheduleCounter);
});
watch(() => theme.value.aside.siteData.enable, (enabled) => {
  cancelScheduled();
  loadedPath = "";
  if (enabled) scheduleCounter();
}, { flush: "post" });
</script>

<style lang="scss" scoped>
.main-aside {
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  animation: fade-up 160ms ease-out backwards;
  .weidgets {
    padding: 18px;
    margin-bottom: 1rem;
    :deep(.title) {
      margin-bottom: 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      opacity: 0.75;
      .iconfont {
        opacity: 0.6;
        margin-right: 6px;
      }
      .title-name {
        opacity: 0.8;
      }
    }
  }
  .sticky {
    position: sticky;
    top: calc(60px + 1rem);
    .weidgets {
      animation: fade-up 160ms ease-out backwards;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.hello {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--main-color);
  color: var(--main-on-accent-color);
  border: none;
  .tip {
    display: inline-block;
    min-width: 140px;
    text-align: center;
    padding: 6px 12px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
    background-color: var(--main-color-opacity);
    margin-bottom: 12px;
    transition:
      color 0.3s,
      transform 0.3s,
      background-color 0.3s;
    &:hover {
      transform: scale(1.1);
      color: var(--main-font-color);
      background-color: var(--main-card-background);
    }
    &:active {
      transform: scale(1);
    }
  }
  .content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    .site-logo {
      position: absolute;
      width: 160px;
      height: 160px;
      transition:
        transform cubic-bezier(0.69, 0.39, 0, 1.21) 0.3s,
        opacity cubic-bezier(0.69, 0.39, 0, 1.21) 0.3s;
      transform-origin: bottom;
      .author-avatar {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
    }
    .site-desc {
      display: block;
      height: 100%;
      margin-top: 20px;
      font-size: 1.1rem;
      line-height: 1.5;
      opacity: 0;
      transition: opacity 0.3s;
    }
  }
  .info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 20px;
    .name {
      display: flex;
      flex: 1 1 auto;
      min-width: 0;
      flex-direction: column;
      .author {
        font-weight: bold;
        font-size: 20px;
      }
      .desc {
        font-size: 12px;
        opacity: 0.6;
      }
    }

  }
  &:hover {
    .content {
      .site-logo {
        opacity: 0;
        transform: scale(0);
      }
      .site-desc {
        opacity: 1;
      }
    }
  }
}

.tags-cloud {
  .all-tags {
    position: relative;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .tags {
      display: inline-block;
      padding: 4px 8px;
      margin: 2px;
      border-radius: 8px;
      .num {
        margin-left: 2px;
        opacity: 0.6;
      }
      &:hover {
        color: var(--main-color);
        background-color: var(--main-color-bg);
      }
    }

  }
  .more-tags {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 40px;
    border-radius: 8px;
    font-size: 14px;
    border: 1px solid var(--main-card-border);
    background-color: var(--main-card-second-background);
    &:hover {
      color: var(--main-color);
      border-color: var(--main-color-bg);
      background-color: var(--main-color-bg);
    }
  }
}

.site-data {
  .all-data {
    .data-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.2rem;
      .name {
        display: flex;
        flex-direction: row;
        align-items: center;
        .iconfont {
          margin-right: 8px;
          opacity: 0.6;
          font-size: 18px;
        }
      }
      .num {
        opacity: 0.8;
        font-size: 15px;
      }
      #busuanzi_value_site_pv {
        &::after {
          content: " 次";
        }
      }
      #busuanzi_value_site_uv {
        &::after {
          content: " 人";
        }
      }
      &:last-child {
        padding-bottom: 0;
      }
    }
  }
}
</style>
