<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">Revenue Statistics</h1>

    <div class="flex items-end space-x-4 mb-6 p-4 border rounded-lg">
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
          class="mt-1 p-2 border rounded-md"
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
          class="mt-1 p-2 border rounded-md"
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

    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <div v-if="stats.length > 0">
      <h2 class="text-xl font-semibold mb-2 capitalize">
        {{ statType.replace("-", " ") }}
      </h2>
      <table class="min-w-full bg-white">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider capitalize"
            >
              {{ statType.split("-")[0] }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Total Revenue
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="stat in stats" :key="stat.name">
            <td class="px-6 py-4 whitespace-nowrap">{{ stat.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              ${{ stat.revenue.toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="!loading && hasFetched" class="text-gray-500">
      No data available for the selected criteria.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import apiClient from "../services/api";
import { RevenueStat } from "../types";

type StatType = "vendor-revenue" | "product-revenue" | "category-revenue";

const statType = ref<StatType>("vendor-revenue");
const fromDate = ref("");
const toDate = ref("");
const stats = ref<RevenueStat[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const hasFetched = ref(false);

const fetchStats = async () => {
  if (!fromDate.value || !toDate.value) {
    error.value = "Please select both a 'From' and 'To' date.";
    return;
  }
  loading.value = true;
  error.value = null;
  hasFetched.value = false;
  stats.value = [];
  try {
    const response = await apiClient.get(`/stats/${statType.value}`, {
      params: { from: fromDate.value, to: toDate.value },
    });
    stats.value = response.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Failed to fetch statistics.";
    console.error(err);
  } finally {
    loading.value = false;
    hasFetched.value = true;
  }
};
</script>
