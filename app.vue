<script setup>
import { ref, onMounted } from 'vue';

const API_KEY = "2aa275695edce50cc5a5fdc264fa347cf13ab304876621bfe1a3273f"

// API URLs
const EVENTS_API_URL = "https://data.bs.ch/api/explore/v2.1/catalog/datasets/100419/exports/json";
const ANREISE_API_URL = "https://data.bs.ch/api/explore/v2.1/catalog/datasets/100429/exports/json";

// Reactive state
const eventsData = ref([]);
const error = ref(null);

// Function to fetch events
async function fetchEventsData() {
  try {

    const response = await fetch(`${EVENTS_API_URL}?apikey=${API_KEY}`);
    const data = await response.json();
    eventsData.value = data;
  } catch (err) {
    console.error("Error fetching events data:", err);
    error.value = "Failed to fetch events data";
  }
}

// Fetch on component mount
onMounted(() => {
  fetchEventsData();
});
</script>

<template>
  <div>
    <h1>Events</h1>
    <div v-if="error">{{ error }}</div>
    <ul v-else>
      <li v-for="(event, index) in eventsData" :key="index">
        {{ event.name || 'Untitled Event' }}
      </li>
    </ul>
  </div>
</template>
