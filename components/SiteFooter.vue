<!-- components/SiteFooter.vue -->
<script setup lang="ts"></script>

<template>
  <footer class="footer print:hidden">
    <h1 class="sr-only">Fusszeile</h1>
    <div class="footer-container container">
      <div>
        <FeedbackControlLocal />
      </div>
      <nav aria-label="Kontakt & Datenquellen">
        <ul class="links links--spaced">
          <li>
            <a
                class="link link--tall"
                href="https://www.bs.ch/jsd/polizei/fuer-ihre-sicherheit/im-verkehr/im-strassenverkehr/bikantonale-geschaeftsstelle-eventverkehr-st-jakob"
                target="_blank"
            >
              Bikantonale Geschäftsstelle Eventverkehr St. Jakob
            </a>
          </li>
          <li>
            <a
                class="link link--tall"
                href="https://data.bs.ch/explore/?refine.tags=eventverkehr-st.jakob"
                target="_blank"
            >
              Datenquelle: Kantonales Datenportal Basel-Stadt
            </a>
          </li>
        </ul>
      </nav>

      <div class="footer-copyright">
        © 2025 Basel-Stadt
      </div>
    </div>
  </footer>
</template>