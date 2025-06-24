<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">Revenue Statistics</h1>

    <!-- Controls for selecting stat type and date range -->
    <div class="flex flex-wrap items-end gap-4 mb-6 p-4 border rounded-lg">
      <div>
        <label for="statType" class="block text-sm font-medium text-gray-700"
          >Statistic Type</label
        >
        <select
          v-model="statType"
          id="statType"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="vendor-revenue">Vendor Revenue</option>
          <option value="product-revenue">Product Revenue</option>
          <option value="category-revenue">Category Revenue</option>
        </select>
      </div>
      <div>
        <label for="fromDate" class="block text-sm font-medium text-gray-700"
          >From</label
        >
        <input
          type="date"
          v-model="fromDate"
          id="fromDate"
          class="mt-1 p-2 border rounded-md w-full"
        />
      </div>
      <div>
        <label for="toDate" class="block text-sm font-medium text-gray-700"
          >To</label
        >
        <input
          type="date"
          v-model="toDate"
          id="toDate"
          class="mt-1 p-2 border rounded-md w-full"
        />
      </div>
      <button
        @click="fetchStats"
        :disabled="loading"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {{ loading ? "Loading..." : "Generate Report" }}
      </button>
    </div>

    <!-- Loading and Error States -->
    <div v-if="loading" class="text-center text-gray-500">
      Loading statistics...
    </div>
    <div v-if="error" class="text-red-500 mb-4 p-3 bg-red-100 rounded-md">
      {{ error }}
    </div>

    <!-- Results Container -->
    <div v-if="stats.length > 0 && !loading">
      <h2 class="text-xl font-semibold mb-2 capitalize">
        {{ statType.replace("-", " ") }} Report
      </h2>

      <!-- Table for Product Revenue (detailed) -->
      <table v-if="statType === 'product-revenue'" class="min-w-full bg-white">
        <thead class="bg-gray-50">
          <tr>
            <th class="th-cell">Product Name</th>
            <th class="th-cell">Vendor</th>
            <th class="th-cell">Category</th>
            <th class="th-cell">Amount Sold</th>
            <th class="th-cell">Total Revenue</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="stat in (stats as ProductRevenueStat[])" :key="stat.id">
            <td class="td-cell">{{ stat.name }}</td>
            <td class="td-cell">{{ stat.vendorName }}</td>
            <td class="td-cell">{{ stat.categoryName }}</td>
            <td class="td-cell">{{ stat.amount }}</td>
            <td class="td-cell">${{ stat.totalRevenue.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Table for Vendor and Category Revenue (simple) -->
      <table v-else class="min-w-full bg-white">
        <thead class="bg-gray-50">
          <tr>
            <th class="th-cell capitalize">
              {{ statType.split("-")[0] }} Name
            </th>
            <th class="th-cell">Total Revenue</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="stat in (stats as (VendorRevenueStat[] | CategoryRevenueStat[]))"
            :key="stat.name"
          >
            <td class="td-cell">{{ stat.name }}</td>
            <td class="td-cell">${{ stat.totalRevenue.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No data message -->
    <div
      v-else-if="!loading && hasFetched"
      class="text-gray-500 p-4 border rounded-md"
    >
      No data available for the selected criteria.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import apiClient from "../services/api";
import {
  CategoryRevenueStat,
  ProductRevenueStat,
  VendorRevenueStat,
} from "@/types";

// Union type for the stats array
type StatResult = CategoryRevenueStat | VendorRevenueStat | ProductRevenueStat;
type StatType = "vendor-revenue" | "product-revenue" | "category-revenue";

// Reactive state
const statType = ref<StatType>("vendor-revenue");
const fromDate = ref("");
const toDate = ref("");
const stats = ref<StatResult[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const hasFetched = ref(false);

const fetchStats = async () => {
  // Validate date inputs
  if (!fromDate.value || !toDate.value) {
    error.value = "Please select both a 'From' and 'To' date.";
    return;
  }

  // Reset state before fetching
  loading.value = true;
  error.value = null;
  hasFetched.value = false;
  stats.value = [];

  try {
    // Make API call with date parameters
    const response = await apiClient.get<any>(`/stats/${statType.value}`, {
      params: { startDate: fromDate.value, endDate: toDate.value },
    });
    stats.value = response.data.data.items;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Failed to fetch statistics.";
    console.error(err);
  } finally {
    loading.value = false;
    hasFetched.value = true; // Mark that a fetch attempt has completed
  }
};
</script>

<style scoped>
/* A bit of utility styling for table cells for consistency */
.th-cell {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.td-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-700;
}
</style>
