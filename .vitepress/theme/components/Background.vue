<!-- 静态图片背景；关闭后移除图片，底色跟随亮暗主题。 -->
<template>
  <Teleport to="body">
    <div v-if="store.hasBackground" class="background" aria-hidden="true">
      <img
        v-if="!failed"
        :src="source"
        class="cover"
        alt=""
        decoding="async"
        @error="failed = true"
      />
    </div>
  </Teleport>
</template>

<script setup>
import { mainStore } from "@/store";
const store = mainStore();
const { theme } = useData();
const source = computed(() => theme.value.display.backgroundImage || "");
const failed = ref(false);
watch(source, () => {
  failed.value = false;
});
watch(
  () => store.hasBackground,
  () => {
    failed.value = false;
  },
);
</script>

<style lang="scss" scoped>
.background {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: #000;
}
.cover {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
}
</style>
