<template>
  <div>
    <!-- SECTION: ACTION BUTTONS & HEADER -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">Vendors</h1>
      <button
        v-if="isAdmin"
        @click="openModal()"
        class="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition"
      >
        Add Vendor
      </button>
    </div>

    <!-- SECTION: LOADING & ERROR STATES -->
    <div
      v-if="initialLoading && vendors.length === 0"
      class="text-center p-8 text-gray-500"
    >
      Loading vendors...
    </div>
    <div
      v-if="error"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
      role="alert"
    >
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>

    <!-- SECTION: VENDOR TABLE -->
    <div
      v-if="vendors.length > 0"
      class="bg-white rounded-lg shadow overflow-hidden"
    >
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="th-cell">ID</th>
            <th class="th-cell">Name</th>
            <th v-if="isAdmin" class="th-cell">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="vendor in vendors"
            :key="vendor.entityId"
            class="hover:bg-gray-50"
          >
            <td class="td-cell w-1/3">{{ vendor.entityId }}</td>
            <td class="td-cell font-medium">{{ vendor.name }}</td>
            <td v-if="isAdmin" class="td-cell whitespace-nowrap w-1/4">
              <button
                @click="openModal(vendor)"
                class="text-blue-600 hover:text-blue-900 font-medium"
              >
                Edit
              </button>
              <button
                @click="promptDelete(vendor.entityId)"
                class="ml-4 text-red-600 hover:text-red-900 font-medium"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION: PAGINATION CONTROLS -->
      <div class="p-4 flex justify-center items-center">
        <button
          v-if="nextPageToken"
          @click="loadMoreVendors"
          :disabled="loadingMore"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg shadow disabled:bg-blue-300 hover:bg-blue-600 transition"
        >
          {{ loadingMore ? "Loading..." : "Load More" }}
        </button>
        <p
          v-if="!nextPageToken && !initialLoading && vendors.length > 0"
          class="text-gray-500"
        >
          End of results.
        </p>
      </div>
    </div>
    <div
      v-if="!initialLoading && vendors.length === 0 && !error"
      class="text-center p-8 text-gray-500"
    >
      No vendors found.
    </div>

    <!-- SECTION: ADD/EDIT MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-2xl mb-6">{{ isEditing ? "Edit" : "Add" }} Vendor</h2>
        <form @submit.prevent="saveVendor">
          <div class="mb-4">
            <label class="label">ID</label>
            <input
              v-model="currentVendor.entityId"
              type="text"
              class="input"
              required
              :disabled="isEditing"
            />
          </div>
          <div class="mb-4">
            <label class="label">Name</label>
            <input
              v-model="currentVendor.name"
              type="text"
              class="input"
              required
            />
          </div>
          <div class="flex justify-end mt-6">
            <button
              type="button"
              @click="closeModal"
              class="btn-secondary mr-2"
            >
              Cancel
            </button>
            <button type="submit" class="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- SECTION: DELETE CONFIRMATION MODAL -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl text-center">
        <h2 class="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p class="mb-6">
          Are you sure you want to delete this vendor? This action cannot be
          undone.
        </p>
        <div class="flex justify-center">
          <button @click="showDeleteConfirm = false" class="btn-secondary mr-4">
            Cancel
          </button>
          <button @click="executeDelete" class="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from "vue";
import apiClient from "../services/api";
import { Vendor } from "../types";
import { useAuthStore } from "../stores/auth.store";

const PAGE_LIMIT = 15;

// --- Authentication and Authorization ---
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

// --- State for Data, Pagination, and Loading ---
const vendors = ref<Vendor[]>([]);
const initialLoading = ref(false);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const nextPageToken = ref<string | null>(null);

// --- State for Modals ---
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const vendorToDeleteId = ref<string | null>(null);
const isEditing = ref(false);

const emptyVendor: Vendor = { entityId: "", name: "" };
let currentVendor = reactive<Vendor>({ ...emptyVendor });

// --- Data Fetching Logic ---
const fetchVendors = async (token: string | null = null, refresh = false) => {
  if (refresh) {
    initialLoading.value = true;
    vendors.value = []; // Clear for a full refresh
  } else if (token) {
    loadingMore.value = true;
  } else {
    initialLoading.value = true;
  }
  error.value = null;

  try {
    const params: { limit: number; nextPageToken?: string } = {
      limit: PAGE_LIMIT,
    };
    if (token) {
      params.nextPageToken = token;
    }

    const response = await apiClient.get("/vendors", { params });
    if (response.data.data && response.data.data.items) {
      vendors.value.push(...response.data.data.items);
      nextPageToken.value = response.data.data.nextPageToken || null;
    }
  } catch (err: any) {
    error.value =
      "Failed to fetch vendors. " +
      (err.response?.data?.message || err.message);
  } finally {
    initialLoading.value = false;
    loadingMore.value = false;
  }
};

onMounted(() => {
  fetchVendors();
});

const loadMoreVendors = () => {
  if (nextPageToken.value) {
    fetchVendors(nextPageToken.value);
  }
};

// --- Modal Handling ---
const openModal = (vendor: Vendor | null = null) => {
  if (vendor) {
    Object.assign(currentVendor, vendor);
    isEditing.value = true;
  } else {
    Object.assign(currentVendor, emptyVendor);
    isEditing.value = false;
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

// --- CRUD Operations ---
const saveVendor = async () => {
  try {
    if (isEditing.value) {
      await apiClient.put(`/vendors/${currentVendor.entityId}`, currentVendor);
    } else {
      await apiClient.post("/vendors", currentVendor);
    }
    closeModal();
    await fetchVendors(null, true); // Refresh list from the start
  } catch (err: any) {
    console.error("Failed to save vendor:", err);
    error.value = `Failed to save vendor: ${
      err.response?.data?.message || err.message
    }`;
  }
};

const promptDelete = (id: string) => {
  vendorToDeleteId.value = id;
  showDeleteConfirm.value = true;
};

const executeDelete = async () => {
  if (!vendorToDeleteId.value) return;
  try {
    await apiClient.delete(`/vendors/${vendorToDeleteId.value}`);
    await fetchVendors(null, true); // Refresh list
  } catch (err: any) {
    console.error("Failed to delete vendor:", err);
    error.value = `Failed to delete vendor: ${
      err.response?.data?.message || err.message
    }`;
  } finally {
    showDeleteConfirm.value = false;
    vendorToDeleteId.value = null;
  }
};
</script>

<style scoped>
.th-cell {
  @apply px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}
.td-cell {
  @apply px-4 py-4 text-sm text-gray-700;
}
.label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.input {
  @apply block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
}
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500;
}
.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500;
}
</style>
