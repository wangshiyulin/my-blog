<!-- 作者社交入口，独立于页脚和其他侧栏组件。 -->
<template>
  <nav v-if="validLinks.length" class="author-social" aria-label="作者社交链接">
    <a
      v-for="item in validLinks"
      :key="item.icon"
      :href="item.link"
      :aria-label="item.label"
      :title="item.label"
      :target="item.link.startsWith('mailto:') ? undefined : '_blank'"
      :rel="item.link.startsWith('mailto:') ? undefined : 'noopener noreferrer'"
      class="social-link"
    >
      <svg v-if="item.icon === 'reddit'" class="social-icon" viewBox="0 0 24 24" aria-hidden="true"
        fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="m12 9 1.4-6 4.4 1" />
        <circle cx="19.4" cy="4.5" r="1.8" />
        <path d="M4.4 10.2a2.4 2.4 0 0 0-2.8 3.8m18-3.8a2.4 2.4 0 0 1 2.8 3.8" />
        <ellipse cx="12" cy="14.5" rx="8.6" ry="5.5" />
        <circle cx="8.4" cy="13.8" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="15.6" cy="13.8" r="0.9" fill="currentColor" stroke="none" />
        <path d="M8.8 17c1.8 1.3 4.6 1.3 6.4 0" />
      </svg>
      <i v-else :class="`iconfont icon-${item.icon}`" aria-hidden="true" />
    </a>
  </nav>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  links: { type: Array, default: () => [] },
});
// 配置意外缺字段时仅忽略该入口，不牵连整张作者卡片。
const validLinks = computed(() => props.links.filter(item =>
  item && typeof item.icon === "string" && typeof item.label === "string" &&
  typeof item.link === "string" && /^(https:\/\/|mailto:)/.test(item.link),
));
</script>

<style lang="scss" scoped>
.author-social {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
  align-items: center;
  margin-left: 8px;
  .social-link {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--main-color-opacity);
    transition: background-color 0.2s, transform 0.2s;
    .social-icon {
      width: 18px;
      height: 18px;
      color: var(--main-font-color);
    }
    .iconfont {
      font-size: 18px;
      color: var(--main-font-color);
    }
    &:hover {
      transform: scale(1.07);
      background-color: var(--main-card-background);
      .social-icon { color: var(--main-color); }
      .iconfont { color: var(--main-font-color); }
    }
    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 2px; }
  }
}
</style>
