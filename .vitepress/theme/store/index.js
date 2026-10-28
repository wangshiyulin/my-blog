import { defineStore } from "pinia";
import { themeConfig } from "@/assets/themeConfig.mjs";

export const mainStore = defineStore("main", {
  state: () => {
    return {
      // 主题类别
      themeType: "dark",
      backgroundEnabled:
        themeConfig.display.backgroundEnabled && Boolean(themeConfig.display.backgroundImage),
      // 滚动高度
      scrollData: {
        // 滚动高度
        height: 0,
        // 滚动百分比
        percentage: 0,
        // 滚动方向
        direction: "down",
      },
      // 页脚可见性
      footerIsShow: false,
      // 中控台显示
      controlShow: false,
      // 搜索框显示
      searchShow: false,
      // 移动端菜单显示
      mobileMenuShow: false,
      // 上次滚动位置
      lastScrollY: 0,
    };
  },
  getters: {
    hasBackground: (state) =>
      state.backgroundEnabled && Boolean(themeConfig.display.backgroundImage),
    effectiveTheme() {
      return this.hasBackground ? "dark" : this.themeType;
    },
  },
  actions: {
    // 切换应用状态
    changeShowStatus(value) {
      if (["controlShow", "searchShow", "mobileMenuShow"].includes(value)) {
        this[value] = !this[value];
      }
    },
    toggleBackground() {
      this.backgroundEnabled =
        !this.backgroundEnabled && Boolean(themeConfig.display.backgroundImage);
    },
    // 背景模式必须深色；所有入口复用同一判断，不能绕过按钮禁用。
    changeThemeType() {
      if (this.hasBackground) return false;
      this.themeType = this.themeType === "dark" ? "light" : "dark";
      return true;
    },
  },
});
