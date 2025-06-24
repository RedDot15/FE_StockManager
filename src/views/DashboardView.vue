<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h1 class="text-3xl font-bold text-gray-800">Welcome to the Dashboard</h1>
    <p class="mt-2 text-gray-600">
      This is your main hub. From here you can navigate to manage invoices,
      products, and vendors.
    </p>
    <div
      v-if="isAdmin"
      class="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700"
    >
      <p class="font-bold">Admin Privileges</p>
      <p>
        You have access to all management sections, including user
        administration and company-wide statistics.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "../stores/auth.store";

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);
</script>
