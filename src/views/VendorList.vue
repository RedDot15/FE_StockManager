<template>
  <div>
    <!-- Very similar structure to ProductList.vue. This demonstrates reusability of the CRUD composable. -->
    <div v-if="loading">Loading vendors...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <div v-if="!loading && !error">
      <div class="flex justify-end mb-4" v-if="isAdmin">
        <button
          @click="openModal()"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Vendor
        </button>
      </div>
      <table class="min-w-full bg-white rounded-lg shadow">
        <thead class="bg-gray-200">
          <tr>
            <th class="py-2 px-4">ID</th>
            <th class="py-2 px-4">Name</th>
            <th v-if="isAdmin" class="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vendor in vendors" :key="vendor.id" class="border-b">
            <td class="py-2 px-4">{{ vendor.entityId }}</td>
            <td class="py-2 px-4">{{ vendor.name }}</td>
            <td v-if="isAdmin" class="py-2 px-4">
              <button
                @click="openModal(vendor)"
                class="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                @click="deleteVendor(vendor.entityId)"
                class="ml-4 text-red-500 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vendor Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl w-1/3">
        <h2 class="text-2xl mb-4">{{ isEditing ? "Edit" : "Add" }} Vendor</h2>
        <form @submit.prevent="saveVendor">
          <div class="mb-4">
            <label>ID:</label>
            <input
              v-model="currentVendor.entityId"
              type="text"
              class="w-full p-2 border rounded"
              required
              :disabled="isEditing"
            />
          </div>
          <div class="mb-4">
            <label>Name:</label>
            <input
              v-model="currentVendor.name"
              type="text"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="flex justify-end">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 bg-gray-300 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed, watch } from "vue";
import { useCrud } from "../services/crud.service";
import { Vendor } from "../types";
import { useAuthStore } from "../stores/auth.store";

const {
  items: vendors,
  loading,
  error,
  fetchAll,
  create,
  update,
  remove,
} = useCrud<Vendor>("/vendors");
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const showModal = ref(false);
const emptyVendor: Vendor = { entityId: "", name: "" };
let currentVendor = reactive<Vendor>({ ...emptyVendor });
const isEditing = ref(false);

onMounted(fetchAll);

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

const saveVendor = async () => {
  try {
    if (isEditing.value) {
      await update(currentVendor.entityId, currentVendor);
    } else {
      await create(currentVendor);
      await fetchAll();
    }
    showModal.value = false;
  } catch (err) {
    console.error("Failed to save vendor:", err);
  }
};

const deleteVendor = async (id: string) => {
  if (confirm("Are you sure you want to delete this vendor?")) {
    try {
      await remove(id);
      await fetchAll();
    } catch (err) {
      console.error("Failed to delete vendor:", err);
    }
  }
};
</script>
