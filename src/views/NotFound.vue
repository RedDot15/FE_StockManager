<template>
  <div
    class="flex items-center justify-center h-screen bg-gray-100 text-center"
  >
    <div>
      <h1 class="text-6xl font-bold text-indigo-600">404</h1>
      <p class="text-2xl mt-4 text-gray-800">Page Not Found</p>
      <p class="text-gray-600 mt-2">
        The page you are looking for does not exist.
      </p>
      <router-link
        to="/dashboard"
        class="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Go to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
