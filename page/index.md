---
title: 正在重定向
sitemap: false
head:
  - - meta
    - name: robots
      content: noindex,follow
---

<script setup>
import { onMounted } from "vue"
import { useRouter } from "vitepress"
    
const router = useRouter();

onMounted(() => router.go("/"));
</script>
