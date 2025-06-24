<script setup>
import { ref, onMounted } from "vue";
import { motion, useScroll, useTransform } from "motion-v";
import Annotation from "./components/Annotation.vue";

import { scaleLinear, scaleThreshold } from "d3-scale";
import { csv } from "d3-fetch";
import { timeParse } from "d3-time-format";

const data = ref([]);
const container = ref(null); // <- Needed for DOM access

const { scrollYProgress } = useScroll({ target: container });

const yRange = useTransform(scrollYProgress, [0, 1], [0, 1]);

const colors = [
  "#397BA8",
  "#579EB9",
  "#89C1C4",
  "#BBE2CF",
  "#FAD4AC",
  "#F0A882",
  "#E47961",
  "#C65154",
];

const thresholds = [11, 13, 15, 17, 19, 21, 23];

const colorScale = scaleThreshold().domain(thresholds).range(colors);

let widthScale;

// const startAnimations = async () => {
//   for (let i = 0; i < data.value.length; i++) {
//     const el = container.value.querySelectorAll('.bar')[i];
//     const targetWidth = widthScale(data.value[i].mean_abfluss);

//     await animate(el, { width: `${targetWidth}px` }, { duration: 0.3 }).finished;
//   }
// };

onMounted(async () => {
  const fetchedData = await csv("/rhein_tmp.csv");
  const parseDate = timeParse("%Y-%m-%d");
  fetchedData.forEach((d) => {
    d.date = parseDate(d.date);
  });

  data.value = fetchedData;

  widthScale = scaleLinear()
    .domain([0, Math.max(...data.value.map((d) => +d.mean_abfluss))])
    .range([0, 600]);

  // await nextTick();
  // startAnimations();
});
</script>

<template>
  <div
    style="
      width: 100%;
      height: 100vh;
      background-color: grey;
      margin: 200px auto;
    "
  ></div>
  <div class="container" ref="container">
    <div class="xaxis"></div>
    <Annotation
      :positionX="300"
      :positionY="500"
      :yRange="yRange"
      :threshold="[0, 0.05]"
      >Saisoneröffnung Buvetten</Annotation
    >
    <motion.div
      v-for="(bar, i) in data"
      class="bar"
      :key="bar.date"
      :initial="{ width: 0 }"
      :whileInView="{ width: widthScale(bar.mean_abfluss) + 'px' }"
      :inViewOptions="{ once: true, amount: 0.3 }"
      :transition="{ ease: 'easeOut', duration: 1, delay: scrollYProgress * 2 }"
      :style="{ backgroundColor: colorScale(bar.mean_temperature) }"
    ></motion.div>

    <!-- <div
      v-for="(bar, i) in data"
      :key="bar.date"
      class="bar"
      :style="{
        width: '0px',
        backgroundColor: colorScale(bar.mean_temperature),
        height: '10px',
        margin: '1px 0',
      }"
    ></div> -->
  </div>
</template>

<style>
.container {
  font-family: "Inter", "Helvetica Neue", "Helvetica", "Arial", "sans-serif";
  position: relative;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.bar {
  margin-top: 1px;
  height: 10px;
}

.xaxis {
  position: sticky;
  top: 0;
  height: 20px;
  width: 100%;
  background: red;
  z-index: 2;
  padding: 20px 0;
  margin-bottom: 10px;
  opacity: 0.5;
}
</style>
