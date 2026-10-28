<template>
  <div class="footer-link">
    <div v-if="showBar" class="footer-bar">
      <span class="site-title">{{ site.title }}</span>
      <span class="site-desc">{{ site.description }}</span>
      <a href="/" class="to-home">了解更多</a>
    </div>
    <div class="footer-sitemap">
      <div v-for="(item, index) in footer.sitemap" :key="index" class="sitemap-item">
        <span class="title">{{ item.text }}</span>
        <div class="links">
          <template v-for="(link, linkIndex) in item.items" :key="linkIndex">
            <button
              v-if="link.action === 'contact'"
              type="button"
              class="link-text link-button"
              @click="contactShow = true"
            >
              {{ link.text }}
            </button>
            <a
              v-else
              :href="link.link"
              :target="link.newTab ? '_blank' : null"
              :rel="link.newTab ? 'noopener noreferrer' : null"
              class="link-text"
            >
              {{ link.text }}
            </a>
          </template>
        </div>
      </div>
      <section
        v-if="footer.activity"
        class="footer-activity"
        aria-labelledby="footer-activity-title"
      >
        <h2 id="footer-activity-title" class="activity-title">
          {{ footer.activity.title || "下一站" }}
        </h2>
        <ul v-if="activityItems.length" class="activity-list">
          <li v-for="(item, index) in activityItems" :key="index">
            <a
              v-if="safeActivityLink(item.link)"
              :href="safeActivityLink(item.link)"
              class="activity-text"
            >
              {{ item.text }}
            </a>
            <span v-else class="activity-text">{{ item.text }}</span>
          </li>
        </ul>
        <p v-else class="activity-empty">暂无公开事项</p>
      </section>
    </div>
    <Modal
      :show="contactShow"
      title="联系我们"
      title-icon="email"
      :max-width="520"
      @modal-close="contactShow = false"
      @mask-click="contactShow = false"
    >
      <p class="contact-content">
        联系邮箱:
        <a href="mailto:wangshiyu@qingluanx.com">wangshiyu@qingluanx.com</a>
      </p>
    </Modal>
  </div>
  <footer id="main-footer" class="main-footer">
    <div class="footer-content">
      <div class="copyright">
        <span class="time">@ {{ sinceYear }} - {{ thisYear }} By </span>
        <a
          :href="theme.siteMeta.author.link"
          class="author link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ theme.siteMeta.author.name }}
        </a>
      </div>
      <div class="meta">
        <a
          class="power link"
          href="https://vitepress.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="by">Powered by</span>
          <span class="name">VitePress</span>
        </a>
        <a
          class="rss link"
          href="https://qingluanx.com/rss.xml"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="iconfont icon-rss" />
          <span class="name">订阅</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import { useClientDate } from "@/utils/useClientDate.mjs";

const store = mainStore();
const { theme, site } = useData();
const { footerIsShow } = storeToRefs(store);

// 视窗监听器
const observer = ref(null);

// 实时年份
const { currentYear: thisYear } = useClientDate();
const sinceYear = computed(() => new Date(theme.value.since).getFullYear());

// 监听页脚视窗
const isShowFooter = () => {
  const footerDom = document.getElementById("main-footer");
  if (!footerDom || !("IntersectionObserver" in window)) return false;
  if (observer.value) observer.value?.disconnect();
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      footerIsShow.value = entry.isIntersecting ? true : false;
    });
  });
  // 添加监视器
  observer.value?.observe(footerDom);
};

onMounted(() => {
  isShowFooter();
});

onBeforeUnmount(() => {
  if (observer.value) observer.value?.disconnect();
});

// 页脚导航、联系弹窗与“下一站”在本文件集中维护。
defineProps({
  showBar: { type: Boolean, default: true },
});
const footer = computed(() => theme.value.footer);
const contactShow = ref(false);
const activityItems = computed(() =>
  Array.isArray(footer.value.activity?.items)
    ? footer.value.activity.items.filter(
        (item) => item && typeof item.text === "string" && item.text.trim(),
      )
    : [],
);
// 仅允许站内地址与 HTTPS，保留原有链接约束。
const safeActivityLink = (link) =>
  typeof link === "string" && /^(\/(?![/\\])|https:\/\/)/.test(link) ? link : null;
</script>

<style lang="scss" scoped>
// 导航列表与下一站
.footer-link {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  flex-direction: row;
  margin: 1rem auto;
  margin-bottom: 3rem;
  padding: 0 1rem;
  animation: show 0.3s backwards;
  .footer-bar {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
    .site-title {
      font-weight: bold;
      font-size: 22px;
    }
    .site-desc {
      margin: 0.6rem 0;
      font-weight: bold;
      font-size: 18px;
      color: var(--main-font-second-color);
    }
    .to-home {
      padding: 8px 16px;
      border-radius: 25px;
      margin-top: 8px;
      font-size: 14px;
      color: var(--main-font-color);
      background-color: var(--main-card-second-background);
      border: 1px solid var(--main-card-border);
      transition:
        color 0.3s,
        transform 0.3s,
        border-color 0.3s,
        background-color 0.3s;
      cursor: pointer;
      &:hover {
        color: var(--main-on-accent-color);
        background-color: var(--main-color);
        transform: scale(1.1);
        border-color: var(--main-color);
      }
    }
  }
  .footer-sitemap {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 24px;
    margin: 1rem 0;
    .sitemap-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 120px;
      .title {
        display: inline-block;
        margin: 1rem 0;
        font-size: 16px;
        font-weight: bold;
        color: var(--main-font-second-color);
      }
      .links {
        display: flex;
        flex-direction: column;
        align-items: center;
        .link-text {
          color: var(--main-font-color);
          display: inline-block;
          max-width: 120px;
          width: max-content;
          margin: 4px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow-wrap: break-word;
          padding: 8px;
          border-radius: 12px;
          transition:
            color 0.3s,
            background-color 0.3s;
          cursor: pointer;
          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);
          }
        }
        .link-button {
          appearance: none;
          border: 0;
          background: transparent;
          font: inherit;
          text-align: center;
        }
      }
    }
    @media (max-width: 768px) {
      // 按 DOM 顺序排列：博客、项目在首行，页面、下一站在第二行。
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
      .sitemap-item {
        min-width: 0;
      }
      .sitemap-item .title,
      .footer-activity .activity-title {
        margin: 1rem 0;
        line-height: 1.5;
      }
    }
  }
}

.footer-activity {
  min-width: 0;
  width: min(100%, 240px);
  justify-self: center;
  padding: 0 12px;
  text-align: center;
  .activity-title {
    margin: 1rem 0 20px;
    padding: 0;
    border: 0;
    color: var(--main-font-second-color);
    font-size: 16px;
    font-weight: bold;
    line-height: inherit;
  }
  .activity-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .activity-list li + li {
    margin-top: 8px;
  }
  .activity-text {
    display: block;
    font-size: 14px;
    line-height: 1.8;
    color: var(--main-font-color);
    overflow-wrap: anywhere;
  }
  a.activity-text:hover {
    color: var(--main-color);
  }
  a.activity-text:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 3px;
    border-radius: 3px;
  }
  .activity-empty {
    margin: 0;
    font-size: 13px;
    color: var(--main-font-second-color);
    line-height: 1.8;
  }
}

// 版权底栏
.main-footer {
  display: flex;
  margin-top: 1rem;
  padding: 1rem 0;
  background-color: var(--main-card-background);
  border-top: 1px solid var(--main-card-border);
  overflow: hidden;
  animation: show 0.3s backwards;
  transition:
    color 0.3s,
    border 0.3s,
    background-color 0.3s;
  .footer-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
    color: var(--main-font-color);
    line-height: 1;
    min-height: 32px;
    .copyright {
      display: inline-flex;
      align-items: center;
    }
    .meta {
      display: flex;
      flex-direction: row;
      align-items: center;
      .power {
        margin-right: 4px;
        .by {
          font-weight: normal;
          opacity: 0.8;
          margin-right: 6px;
        }
      }
      .rss {
        margin-right: 4px;
        .iconfont {
          font-weight: normal;
          margin-right: 6px;
        }
      }
    }
    .link {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      font-weight: bold;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      padding: 8px;
      margin: 0 2px;
      height: 38px;
      border-radius: 12px;
      transition:
        color 0.3s,
        background-color 0.3s;
      cursor: pointer;
      .iconfont {
        font-size: 22px;
        margin-right: 4px;
        transition: color 0.3s;
      }
      &:hover {
        color: var(--main-color);
        background-color: var(--main-color-bg);
        .iconfont {
          color: var(--main-color);
        }
      }
    }
    @media (max-width: 768px) {
      font-size: 14px;
      .meta {
        display: none;
      }
    }
  }
}
</style>
