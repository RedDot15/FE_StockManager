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
            <th class="py-2 px-4">Name</th>
            <th class="py-2 px-4">Category</th>
            <th class="py-2 px-4">Price</th>
            <th v-if="isAdmin" class="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in products.items.value"
            :key="product.id"
            class="border-b"
          >
            <td class="py-2 px-4">{{ product.name }}</td>
            <td class="py-2 px-4">{{ product.category }}</td>
            <td class="py-2 px-4">${{ product.price.toFixed(2) }}</td>
            <td v-if="isAdmin" class="py-2 px-4">
              <button
                @click="openModal(product)"
                class="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                @click="deleteProduct(product.id)"
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
        <h2 class="text-2xl mb-4">
          {{ currentProduct.id ? "Edit" : "Add" }} Product
        </h2>
        <form @submit.prevent="saveProduct">
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
            <label>Category:</label>
            <input
              v-model="currentProduct.category"
              type="text"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label>Description:</label>
            <textarea
              v-model="currentProduct.description"
              class="w-full p-2 border rounded"
            ></textarea>
          </div>
          <div class="mb-4">
            <label>Price:</label>
            <input
              v-model.number="currentProduct.price"
              type="number"
              step="0.01"
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
  id: "",
  name: "",
  description: "",
  price: 0,
  category: "",
};
let currentProduct = reactive<Product>({ ...emptyProduct });

onMounted(fetchAll);

const openModal = (product: Product | null = null) => {
  if (product) {
    Object.assign(currentProduct, product);
  } else {
    Object.assign(currentProduct, emptyProduct);
  }
  showModal.value = true;
};

const saveProduct = async () => {
  try {
    if (currentProduct.id) {
      await update(currentProduct.id, currentProduct);
    } else {
      const { id, ...newProductData } = currentProduct;
      await create(newProductData);
    }
    showModal.value = false;
    await fetchAll(); // Re-fetch to see changes
  } catch (err) {
    console.error("Failed to save product:", err);
  }
};

const deleteProduct = async (id: string) => {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await remove(id);
      await fetchAll(); // Re-fetch
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  }
};
</script>

<!-- TODO: Product import -->

<!-- TODO: Generate random ID -->
