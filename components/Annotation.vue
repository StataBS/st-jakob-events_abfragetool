<script setup>
import { motion, useTransform } from "motion-v";

const props = defineProps({
  positionX: Number,
  positionY: Number,
  yRange: Object,
  threshold: Array,
});

const opacity = useTransform(props.yRange, props.threshold, [0, 1], {
  clamp: true,
});
</script>

<template>
  <motion.div
    class="annotation text-sm"
    :style="{ left: positionX + 'px', top: positionY + 'px', opacity: opacity }"
  >
    <slot></slot>
  </motion.div>
</template>

<style scoped>
.annotation {
  padding: 20px;
  position: absolute;
  width: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
