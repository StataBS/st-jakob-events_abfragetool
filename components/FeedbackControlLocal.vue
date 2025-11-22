<script lang="ts" setup>
import {
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "reka-ui";
import { ref } from "vue";

import IconMail from '@kanton-basel-stadt/designsystem/icons/symbol/mail'
import IconSendMail from '@kanton-basel-stadt/designsystem/icons/symbol/send-mail'

interface InputProps {
  defaultMail?: string;
}

const props = withDefaults(defineProps<InputProps>(), {
  defaultMail: "",
});

const feedbackText = ref("");
const selectedRating = ref("");
const emailAddress = ref(props.defaultMail);
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const errorMessage = ref("");

const ratings = [
  { emoji: "😕", label: "Schlecht", value: "poor" },
  { emoji: "😐", label: "Okay", value: "okay" },
  { emoji: "🙂", label: "Gut", value: "good" },
  { emoji: "😀", label: "Sehr gut", value: "great" },
  { emoji: "🤩", label: "Ausgezeichnet", value: "excellent" },
];

const submitFeedback = async () => {
  // Clear any previous error
  errorMessage.value = "";

  if (!feedbackText.value.trim() || !emailAddress.value.trim()) {
    errorMessage.value = "Bitte fülle Sie Textfeld und Mailadresse aus.";
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch("/api/feedback", {
      method: "POST",
      body: {
        rating: selectedRating.value,
        message: feedbackText.value.trim(),
        email: emailAddress.value.trim(),
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    isSubmitting.value = false;
    isSubmitted.value = true;

    // Reset after a few seconds
    setTimeout(() => {
      feedbackText.value = "";
      selectedRating.value = "";
      emailAddress.value = "";
      isSubmitted.value = false;
    }, 3000);
  } catch (error) {
    isSubmitting.value = false;
    errorMessage.value =
        "Feedback konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.";
    console.error("Failed to submit feedback:", error);
  }
};

const resetForm = () => {
  feedbackText.value = "";
  selectedRating.value = "";
  emailAddress.value = "";
  isSubmitted.value = false;
  errorMessage.value = "";
};
</script>

<template>
  <div class="feedback-wrapper">
    <PopoverRoot>
      <PopoverTrigger
        class="button is-action has-icon !px-10"
        aria-label="Feedback geben"
    >
        <span class="feedback-icon-wrapper">
          <component :is="IconMail" data-symbol="mail" class="feedback-mail-icon" />
        </span>
        <span>Feedback</span>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
            class="feedback-content"
            side="top"
            align="end"
            :side-offset="8"
            :align-offset="-250"
        >
          <PopoverClose class="feedback-close" aria-label="Schliessen" @click="resetForm">
            <span>×</span>
          </PopoverClose>

          <div v-if="!isSubmitted" class="feedback-container">
            <h3 class="feedback-title">Teilen Sie Ihre Gedanken</h3>
            <div class="feedback-rating">
              <p class="text-sm font-medium text-gray-800">
                Wie würden Sie Ihre Erfahrung bewerten?
              </p>

              <div class="tabs-container !my-0">
                <button
                    v-for="rating in ratings"
                    :key="rating.value"
                    type="button"
                    class="button is-tab"
                    :class="{ 'is-active': selectedRating === rating.value }"
                    @click="selectedRating = rating.value"
                    :aria-label="rating.label"
                >
                  <span class="mr-5 text-base">{{ rating.emoji }}</span>
                  <span class="text-sm">{{ rating.label }}</span>
                </button>
              </div>
            </div>
            <div class="feedback-input-group">
              <label for="feedback-text">Ist Ihnen etwas aufgefallen? Fehlt etwas?</label>
              <textarea
                  id="feedback-text"
                  v-model="feedbackText"
                  class="input w-full min-h-[100px]"
                  placeholder="Ihr Feedback hilft uns, besser zu werden..."
              ></textarea>
            </div>

            <div class="feedback-input-group">
              <label for="feedback-email">E-Mail</label>
              <input
                  type="email"
                  id="feedback-email"
                  v-model="emailAddress"
                  class="input w-full"
                  placeholder="Ihre@email.ch"
              />
              <small class="feedback-input-help">Damit wir Sie erreichen können.</small>
            </div>

            <div v-if="errorMessage" class="feedback-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>

            <button
                class="button is-action has-icon !px-10 max-w-[170px]"
                @click="submitFeedback"
                :disabled="isSubmitting"
            >
              <template v-if="isSubmitting">
                <svg class="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor"
                          stroke-dasharray="30 60" />
                </svg>
                <span>Wird gesendet...</span>
              </template>
              <template v-else>
                <span class="feedback-icon-wrapper">
                  <component
                      :is="IconSendMail"
                      data-symbol="send-mail"
                      class="feedback-send-icon"
                  />
                </span>
                <span>Feedback senden</span>
              </template>
            </button>
          </div>

          <div v-else class="feedback-success">
            <div class="success-icon">✓</div>
            <h3>Vielen Dank für Ihr Feedback!</h3>
            <p>Wir schätzen Ihre Eingabe und werden sie nutzen, um unseren Service zu verbessern.</p>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </div>
</template>

<style>
:root {
  --feedback-bg: white;
  --feedback-shadow: rgba(0, 0, 0, 0.15);
  --feedback-success: #10b981;
  --feedback-error: #ef4444;
}

.feedback-content {
  padding: 1.5rem;
  background-color: var(--feedback-bg);
  border-radius: 12px;
  box-shadow: 0 10px 25px var(--feedback-shadow);
  border: none;
  width: 360px;
  animation: popup 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.feedback-container {
  flex-direction: column;
  display: flex;
  gap: 1.25rem;
}

.feedback-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
}

.feedback-rating {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feedback-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feedback-input-group label {
  font-size: 0.875rem;
  font-weight: 500;
}

.feedback-input-help {
  font-size: 0.75rem;
  display: inline-block;
}

.feedback-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--feedback-error);
  border-radius: 6px;
  color: var(--feedback-error);
  font-size: 0.875rem;
  animation: shake 0.5s ease-in-out;
}

.feedback-error svg {
  flex-shrink: 0;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-4px);
  }

  75% {
    transform: translateX(4px);
  }
}

.spinner {
  animation: spin 1s linear infinite;
  width: 16px;
  height: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.feedback-close {
  height: 28px;
  width: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.feedback-close:hover {
  @apply text-blue-700;
}

.feedback-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 200px;
  gap: 1rem;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--feedback-success);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  animation: success-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.feedback-success h3 {
  font-size: 1.125rem;
  margin: 0;
}

.feedback-success p {
  font-size: 0.875rem;
  margin: 0;
}

@keyframes popup {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes success-bounce {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>