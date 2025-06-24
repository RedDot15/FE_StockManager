<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 text-white flex-shrink-0">
      <div class="p-4 text-2xl font-bold border-b border-gray-700">
        InvoiceApp
      </div>
      <nav class="mt-6">
        <router-link :to="{ name: 'DashboardView' }" class="nav-link">
          Dashboard
        </router-link>
        <router-link :to="{ name: 'InvoiceList' }" class="nav-link">
          Invoices
        </router-link>
        <router-link :to="{ name: 'ProductList' }" class="nav-link">
          Products
        </router-link>
        <router-link :to="{ name: 'VendorList' }" class="nav-link">
          Vendors
        </router-link>
        <router-link
          v-if="isAdmin"
          :to="{ name: 'StatsView' }"
          class="nav-link"
        >
          Statistics
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex justify-between items-center p-4 bg-white border-b">
        <h1 class="text-2xl font-semibold text-gray-800">{{ $route.name }}</h1>
        <div>
          <span class="text-gray-600 mr-4">Welcome, {{ username }}!</span>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "../stores/auth.store";

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);
const username = computed(() => authStore.user?.username || "User");

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<style scoped>
.nav-link {
  @apply block px-4 py-3 text-lg text-gray-300 hover:bg-gray-700 hover:text-white;
}
.router-link-exact-active {
  @apply bg-gray-900 text-white;
}
</style>
