import { h } from "vue";
import { createPinia } from "pinia";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import LazyLoader from "@/components/LazyLoader.vue";

// 根组件
import App from "@/App.vue";
// 全局样式
import "@/style/main.scss";

// pinia
const pinia = createPinia();

// Theme
const Theme = {
  // extends: Theme,
  Layout: () => {
    return h(App);
  },
  enhanceApp({ app, router }) {
    // 挂载
    app.use(pinia);
    app.component("LazyLoader", LazyLoader);
    // 插件
    enhanceAppWithTabs(app);
    // 保留路由完成通知给需要更新数据的组件，不再遮挡页面。
    router.onAfterRouteChanged = () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("vitepress-route-change"));
      }
    };
  },
};

export default Theme;
