<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from '#app';

// Access the route to get query params
const route = useRoute();
const targetDate = ref(route.query.date || null); // fallback to null if not set

const API_KEY = "2aa275695edce50cc5a5fdc264fa347cf13ab304876621bfe1a3273f"

// API URLs
const EVENTS_API_URL = "https://data.bs.ch/api/explore/v2.1/catalog/datasets/100419/exports/json";
const ANREISE_API_URL = "https://data.bs.ch/api/explore/v2.1/catalog/datasets/100429/exports/json";

// Reactive state
const eventsData = ref([]);
const eventsError = ref(null);
const anreiseData = ref([]);
const anreiseError = ref(null);

const filteredEvents = computed(() => {
  return eventsData.value.filter(event => {
    return event.datum === targetDate.value;
  });
});

// Function to fetch events
async function fetchEventsData() {
  try {
    const response = await fetch(`${EVENTS_API_URL}?apikey=${API_KEY}`);
    const data = await response.json();
    eventsData.value = data;
  } catch (err) {
    console.error("Error fetching events data:", err);
    eventsError.value = "Failed to fetch events data";
  }
}

// Function to fetch anreise
async function fetchAnreiseData() {
  try {

    const response = await fetch(`${ANREISE_API_URL}?apikey=${API_KEY}`);
    const data = await response.json();
    anreiseData.value = data;
  } catch (err) {
    console.error("Error fetching anreise data:", err);
    anreiseError.value = "Failed to fetch anreise data";
  }
}

// Fetch on component mount
onMounted(() => {
  fetchEventsData();
  fetchAnreiseData();
});
</script>

<template>
 <div class="m-10 w-[900px]">
    <h1 class="font-bold md:text-5xl text-3xl text-primary-500 pb-10">Events on {{ targetDate }}</h1>
    <div v-if="error">{{ error }}</div>
    <ul v-else>
      <li class="text-xl event-item bg-blue-200 mb-10 p-5 rounded-md" v-for="(event, index) in filteredEvents" :key="index">
        <span class="font-bold">{{ event.name, event.ort, event.info_text || 'kein Name' }}</span>
        <span>{{ event.ort || 'kein Ort' }}</span>
        <span>{{ event.info_text || 'kein Info-Text' }}</span>
      </li>
    </ul>
  </div>
</template>

<style>
.event-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

</style>
