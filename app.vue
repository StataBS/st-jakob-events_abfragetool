<script setup>
import InfoBox from "./components/InfoBox.vue";
import { ref, watch, computed, onMounted } from "vue";
import { useRoute } from "#app";

// Access the route to get query params
const route = useRoute();
const router = useRouter();

// Get date from query param or default to today
const targetDate = ref(
  route.query.date || new Date().toISOString().split("T")[0]
);

// Normalize date for comparison
function normalizeDate(dateString) {
  return new Date(dateString).toISOString().split("T")[0];
}

const API_KEY = "2aa275695edce50cc5a5fdc264fa347cf13ab304876621bfe1a3273f";

// API URLs
const EVENTS_API_URL =
  "https://data.bs.ch/api/explore/v2.1/catalog/datasets/100419/exports/json";
const ANREISE_API_URL =
  "https://data.bs.ch/api/explore/v2.1/catalog/datasets/100429/exports/json";

// Reactive state
const eventsData = ref([]);
const eventsError = ref(null);
const anreiseData = ref([]);
const anreiseError = ref(null);

// Computed: filtered events
const filteredEvents = computed(() => {
  if (!targetDate.value) return eventsData.value;
  return eventsData.value.filter((event) => {
    const eventDate = normalizeDate(event.datum);
    return eventDate === targetDate.value;
  });
});

// Watch for changes to targetDate and update the URL
watch(targetDate, (newDate) => {
  router.push({
    query: {
      ...route.query,
      date: newDate,
    },
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
    <div class="my-5">
      <label>
        Datum auswählen:
        <input type="date" v-model="targetDate" />
      </label>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
    <h1 class="font-bold md:text-5xl text-3xl text-primary-500 pb-10">
      Anlässe am {{ targetDate }}
    </h1>
    <div v-if="error">{{ error }}</div>
    <ul v-else>
      <li
        class="event-item text-xl bg-gray-200 mb-10 p-5 rounded-md"
        v-for="(event, index) in filteredEvents"
        :key="index"
      >
        <span class="font-bold">{{
          (event.name, event.ort, event.info_text || "kein Name")
        }}</span>
        <span>{{ event.ort || "kein Ort" }}</span>
        <span>{{ event.info_text || "kein Info-Text" }}</span>
      </li>
    </ul>
    <InfoBox text="Hallo Welt" infoBoxType="info" />
    <InfoBox text="Hallo Welt" infoBoxType="warning" />
  </div>
</template>

<style>
.event-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
