<!-- 侧边栏 - 站点数据 -->
<template>
  <div class="site-data s-card">
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
</template>

<script setup>
import { loadScript } from "@/utils/commonTools";
import { daysFromNow } from "@/utils/helper";

const COUNTER_SCRIPT = "https://events.vercount.one/js";
const { theme } = useData();

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
  if (disposed || pendingPath) return;
  const path = getCurrentPath();
  if (path === loadedPath) return;
  pendingPath = path;
  try {
    // The provider counts SPA page views by executing its script for each route.
    await loadScript(COUNTER_SCRIPT, { async: true, reload: true });
    if (!disposed) loadedPath = path;
  } catch (error) {
    if (!disposed) console.error("网站访问统计加载失败：", error);
  } finally {
    pendingPath = "";
    if (!disposed && getCurrentPath() !== path) scheduleCounter();
  }
};
const scheduleCounter = () => {
  if (disposed) return;
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
</script>

<style lang="scss" scoped>
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
