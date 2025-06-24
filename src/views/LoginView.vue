<template>
  <div class="text-center">
    <h2 class="text-3xl font-bold text-gray-900">Sign in to your account</h2>
  </div>
  <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
    <div
      v-if="authStore.status.error"
      class="p-3 bg-red-100 text-red-700 rounded-md"
    >
      {{ authStore.status.error }}
    </div>
    <div class="rounded-md shadow-sm -space-y-px">
      <div>
        <label for="username" class="sr-only">Username</label>
        <input
          v-model="username"
          id="username"
          name="username"
          type="text"
          required
          class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Username"
        />
      </div>
      <div>
        <label for="password" class="sr-only">Password</label>
        <input
          v-model="password"
          id="password"
          name="password"
          type="password"
          required
          class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Password"
        />
      </div>
    </div>
    <div>
      <button
        type="submit"
        :disabled="authStore.status.loggingIn"
        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
      >
        <span v-if="authStore.status.loggingIn">Signing in...</span>
        <span v-else>Sign in</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/auth.store";

const authStore = useAuthStore();
const username = ref("");
const password = ref("");

const handleLogin = async () => {
  if (username.value && password.value) {
    try {
      await authStore.login({
        email: username.value,
        password: password.value,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  }
};
</script>
