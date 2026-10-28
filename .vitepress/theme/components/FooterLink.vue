<!-- 页脚 - 链接 -->
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
      <FooterActivity v-if="footer.activity" :activity="footer.activity" />
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
</template>

<script setup>
import FooterActivity from "./FooterActivity.vue";

const { theme, site } = useData();
const { footer } = theme.value;
defineProps({
  // 显示底栏
  showBar: {
    type: Boolean,
    default: true,
  },
});

const contactShow = ref(false);
</script>

<style lang="scss" scoped>
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
    @media (max-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .sitemap-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 120px;
      @media (max-width: 768px) {
        min-width: 0;
      }
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
  }
}
</style>
