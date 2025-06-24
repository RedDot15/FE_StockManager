<template>
  <div>
    <div v-if="loading">Loading products...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <div v-if="!loading && !error">
      <div class="flex justify-end mb-4" v-if="isAdmin">
        <button
          @click="openModal()"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Product
        </button>
      </div>
      <!-- Table to display products -->
      <table class="min-w-full bg-white rounded-lg shadow">
        <thead class="bg-gray-200">
          <tr>
            <th class="py-2 px-4">ID</th>
            <th class="py-2 px-4">Name</th>
            <th class="py-2 px-4">Vendor ID</th>
            <th class="py-2 px-4">Category Name</th>
            <th class="py-2 px-4">Import Price</th>
            <th class="py-2 px-4">Sale Price</th>
            <th class="py-2 px-4">VAT</th>
            <th class="py-2 px-4">Amount</th>
            <th class="py-2 px-4">Earliest Expiry</th>
            <th v-if="isAdmin" class="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in products"
            :key="product.entityId"
            class="border-b"
          >
            <td class="py-2 px-4">{{ product.entityId }}</td>
            <td class="py-2 px-4">{{ product.name }}</td>
            <td class="py-2 px-4">{{ product.vendorId }}</td>
            <td class="py-2 px-4">{{ product.categoryName }}</td>
            <td class="py-2 px-4">{{ product.importPrice.toFixed(2) }}</td>
            <td class="py-2 px-4">{{ product.salePrice.toFixed(2) }}</td>
            <td class="py-2 px-4">{{ product.vat.toFixed(2) }}</td>
            <td class="py-2 px-4">{{ product.amount }}</td>
            <td class="py-2 px-4">{{ product.earliestExpiry }}</td>
            <td v-if="isAdmin" class="py-2 px-4">
              <button
                @click="openModal(product)"
                class="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                @click="deleteProduct(product.entityId)"
                class="ml-4 text-red-500 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- A simple modal for create/edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl w-1/3">
        <h2 class="text-2xl mb-4">{{ isEditing ? "Edit" : "Add" }} Product</h2>
        <form @submit.prevent="saveProduct">
          <div class="mb-4">
            <label>ID:</label>
            <input
              v-model="currentProduct.entityId"
              type="text"
              class="w-full p-2 border rounded"
              required
              :disabled="isEditing"
            />
          </div>
          <div class="mb-4">
            <label>Name:</label>
            <input
              v-model="currentProduct.name"
              type="text"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label>Vendor ID:</label>
            <input
              v-model="currentProduct.vendorId"
              type="text"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label>Category:</label>
            <textarea
              v-model="currentProduct.categoryName"
              type="text"
              class="w-full p-2 border rounded"
              required
            ></textarea>
          </div>
          <div class="mb-4">
            <label>Import Price:</label>
            <input
              v-model.number="currentProduct.importPrice"
              type="number"
              step="0.01"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label>Sale Price:</label>
            <input
              v-model.number="currentProduct.salePrice"
              type="number"
              step="0.01"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label>VAT:</label>
            <input
              v-model.number="currentProduct.vat"
              type="number"
              step="0.01"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label>Amount:</label>
            <input
              v-model.number="currentProduct.amount"
              type="number"
              step="1"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label>Earliest Expiry:</label>
            <textarea
              v-model="currentProduct.earliestExpiry"
              type="text"
              class="w-full p-2 border rounded"
              required
            ></textarea>
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
import { onMounted, reactive, ref, computed } from "vue";
import { useCrud } from "../services/crud.service";
import { Product } from "../types";
import { useAuthStore } from "../stores/auth.store";

const {
  items: products,
  loading,
  error,
  fetchAll,
  create,
  update,
  remove,
} = useCrud<Product>("/products");
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const showModal = ref(false);
const emptyProduct: Product = {
  entityId: "",
  name: "",
  vendorId: "",
  categoryName: "",
  importPrice: 0,
  salePrice: 0,
  vat: 0,
  amount: 0,
  earliestExpiry: "",
};
let currentProduct = reactive<Product>({ ...emptyProduct });
const isEditing = ref(false);

onMounted(fetchAll);

const openModal = (product: Product | null = null) => {
  if (product) {
    Object.assign(currentProduct, product);
    isEditing.value = true;
  } else {
    Object.assign(currentProduct, emptyProduct);
    isEditing.value = false;
  }
  showModal.value = true;
};

const saveProduct = async () => {
  try {
    if (isEditing.value) {
      await update(currentProduct.entityId, currentProduct);
    } else {
      await create(currentProduct);
      await fetchAll();
    }
    showModal.value = false;
  } catch (err) {
    console.error("Failed to save product:", err);
  }
};

const deleteProduct = async (id: string) => {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await remove(id);
      await fetchAll();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  }
};
</script>

<!-- TODO: Product import -->

<!-- TODO: Generate random ID -->
