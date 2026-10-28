<template>
  <section class="footer-activity" aria-labelledby="footer-activity-title">
    <h2 id="footer-activity-title" class="activity-title">{{ activity.title || "下一站" }}</h2>
    <ul v-if="items.length" class="activity-list">
      <li v-for="(item, index) in items" :key="index">
        <a v-if="safeLink(item.link)" :href="safeLink(item.link)" class="activity-text">{{
          item.text
        }}</a>
        <span v-else class="activity-text">{{ item.text }}</span>
      </li>
    </ul>
    <p v-else class="activity-empty">暂无公开事项</p>
  </section>
</template>

<script setup>
const props = defineProps({ activity: { type: Object, default: () => ({}) } });
const items = computed(() =>
  Array.isArray(props.activity.items)
    ? props.activity.items.filter(
        (item) => item && typeof item.text === "string" && item.text.trim(),
      )
    : [],
);
// 允许站内地址与 HTTPS；配置中的其他协议不生成可点击链接。
const safeLink = (link) =>
  typeof link === "string" && /^(\/(?![/\\])|https:\/\/)/.test(link) ? link : null;
</script>

<style lang="scss" scoped>
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
</style>
