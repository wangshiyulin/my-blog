import { computed, onMounted, ref } from "vue";
import { daysFromNow, formatTimestamp } from "./helper.mjs";

// 静态 HTML 可能跨日使用；接管前使用固定日期，挂载后再显示相对时间。
export const useClientDate = () => {
  const now = ref(null);
  onMounted(() => { now.value = Date.now(); });
  return {
    currentYear: computed(() => now.value === null ? "-" : new Date(now.value).getFullYear()),
    formatTimestamp: (timestamp) => {
      if (now.value !== null) return formatTimestamp(timestamp, now.value);
      const date = new Date(timestamp);
      return Number.isNaN(date.getTime()) ? "-" : date.toISOString().slice(0, 10);
    },
    daysFromNow: (date) => now.value === null ? "-" : daysFromNow(date, now.value),
  };
};
