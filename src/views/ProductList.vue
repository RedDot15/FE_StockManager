<template>
  <div>
    <!-- SECTION: CSV UPLOAD -->
    <div class="mb-6 p-4 bg-white rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-2">Upload Products</h2>
      <p class="mb-4 text-gray-600">
        Upload a CSV file of products. This will importing products.
      </p>
      <input
        type="file"
        @change="handleFileSelect"
        accept=".csv"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />
      <button
        @click="uploadFile"
        :disabled="!selectedFile || uploadStatus.uploading"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
      >
        {{ uploadStatus.uploading ? "Uploading..." : "Upload" }}
      </button>
      <div
        v-if="uploadStatus.message"
        :class="uploadStatus.isError ? 'text-red-500' : 'text-green-500'"
        class="mt-2"
      >
        {{ uploadStatus.message }}
      </div>
    </div>
    <!-- SECTION: ACTION BUTTONS & HEADER -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">Products</h1>
      <button
        v-if="isAdmin"
        @click="openModal()"
        class="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition"
      >
        Add Product
      </button>
    </div>

    <!-- SECTION: SEARCH FILTERS -->
    <div
      class="mb-4 p-4 bg-white rounded-lg shadow flex flex-wrap gap-4 items-end"
    >
      <div class="flex-1 min-w-[200px]">
        <label for="keyword" class="label">Search by Keyword</label>
        <input
          id="keyword"
          v-model="searchParams.keyword"
          type="text"
          class="input"
          placeholder="Product name, ID, etc."
          @keyup.enter="applySearch"
        />
      </div>
      <div class="flex-1 min-w-[200px]">
        <label for="categoryName" class="label">Filter by Category</label>
        <select
          id="categoryName"
          v-model="searchParams.categoryName"
          class="input"
          @change="applySearch"
        >
          <option value="">All Categories</option>
          <option
            v-for="category in productCategories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>

      <div class="flex-1 min-w-[150px]">
        <label for="minPrice" class="label">Min Price</label>
        <input
          id="minPrice"
          v-model.number="searchParams.minPrice"
          type="number"
          step="0.01"
          class="input"
          placeholder="e.g., 10.00"
          @keyup.enter="applySearch"
        />
      </div>
      <div class="flex-1 min-w-[150px]">
        <label for="maxPrice" class="label">Max Price</label>
        <input
          id="maxPrice"
          v-model.number="searchParams.maxPrice"
          type="number"
          step="0.01"
          class="input"
          placeholder="e.g., 100.00"
          @keyup.enter="applySearch"
        />
      </div>

      <div class="flex-shrink-0 flex items-center gap-2">
        <button
          @click="applySearch"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
        >
          Search
        </button>
        <button
          @click="clearSearch"
          class="ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition"
        >
          Clear
        </button>
        <button
          @click="downloadExcel"
          class="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50 transition"
        >
          Download Excel
        </button>
      </div>
    </div>

    <!-- SECTION: LOADING & ERROR STATES -->
    <div
      v-if="initialLoading && products.length === 0"
      class="text-center p-8 text-gray-500"
    >
      Loading products...
    </div>
    <div
      v-if="error"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
      role="alert"
    >
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>

    <!-- SECTION: PRODUCT TABLE -->
    <div
      v-if="products.length > 0"
      class="bg-white rounded-lg shadow overflow-hidden"
    >
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="th-cell">ID</th>
            <th class="th-cell">Name</th>
            <th class="th-cell">Vendor ID</th>
            <th class="th-cell">Category</th>
            <th class="th-cell">Import Price</th>
            <th class="th-cell">Sale Price</th>
            <th class="th-cell">Amount</th>
            <th class="th-cell">Earliest Expiry</th>
            <th v-if="isAdmin" class="th-cell">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="product in products"
            :key="product.entityId"
            class="hover:bg-gray-50"
          >
            <td class="td-cell">{{ product.entityId }}</td>
            <td class="td-cell font-medium">{{ product.name }}</td>
            <td class="td-cell">{{ product.vendorId }}</td>
            <td class="td-cell">{{ product.categoryName }}</td>
            <td class="td-cell">${{ product.importPrice.toFixed(2) }}</td>
            <td class="td-cell">${{ product.salePrice.toFixed(2) }}</td>
            <td class="td-cell">{{ product.amount }}</td>
            <td class="td-cell">{{ product.earliestExpiry }}</td>
            <td v-if="isAdmin" class="td-cell whitespace-nowrap">
              <button
                @click="openModal(product)"
                class="text-blue-600 hover:text-blue-900 font-medium"
              >
                Edit
              </button>
              <button
                @click="promptDelete(product.entityId)"
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
          @click="loadMoreProducts"
          :disabled="loadingMore"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg shadow disabled:bg-blue-300 hover:bg-blue-600 transition"
        >
          {{ loadingMore ? "Loading..." : "Load More" }}
        </button>
        <p
          v-if="!nextPageToken && !initialLoading && products.length > 0"
          class="text-gray-500"
        >
          End of results.
        </p>
      </div>
    </div>
    <div
      v-if="!initialLoading && products.length === 0 && !error"
      class="text-center p-8 text-gray-500"
    >
      No products found.
    </div>

    <!-- SECTION: ADD/EDIT MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl mb-6">{{ isEditing ? "Edit" : "Add" }} Product</h2>
        <form @submit.prevent="saveProduct">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="mb-4">
              <label class="label">ID</label>
              <input
                v-model="currentProduct.entityId"
                type="text"
                class="input"
                required
                :disabled="isEditing"
              />
              <button
                v-if="!isEditing"
                type="button"
                @click="generateProductId"
                class="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
              >
                Generate ID
              </button>
            </div>
            <div class="mb-4">
              <label class="label">Name</label>
              <input
                v-model="currentProduct.name"
                type="text"
                class="input"
                required
              />
            </div>
            <div class="mb-4">
              <label class="label">Vendor ID</label>
              <input
                v-model="currentProduct.vendorId"
                type="text"
                class="input"
                required
              />
            </div>
            <div class="mb-4">
              <label class="label">Category</label>
              <input
                v-model="currentProduct.categoryName"
                type="text"
                class="input"
                required
              />
            </div>
            <div class="mb-4">
              <label class="label">Import Price</label>
              <input
                v-model.number="currentProduct.importPrice"
                type="number"
                step="0.01"
                class="input"
                required
              />
            </div>
            <div class="mb-4">
              <label class="label">Sale Price</label>
              <input
                v-model.number="currentProduct.salePrice"
                type="number"
                step="0.01"
                class="input"
                required
              />
            </div>
            <div class="mb-4">
              <label class="label">VAT</label>
              <input
                v-model.number="currentProduct.vat"
                type="number"
                step="0.01"
                class="input"
                required
              />
            </div>
            <div class="mb-4">
              <label class="label">Amount</label>
              <input
                v-model.number="currentProduct.amount"
                type="number"
                step="1"
                class="input"
                required
              />
            </div>
          </div>
          <div class="mb-4">
            <label class="label">Earliest Expiry</label>
            <input
              v-model="currentProduct.earliestExpiry"
              type="text"
              class="input"
              placeholder="e.g., YYYY-MM-DD"
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
          Are you sure you want to delete this product? This action cannot be
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
import { Product } from "../types";
import { useAuthStore } from "../stores/auth.store";
import { v4 as uuidv4 } from "uuid";

const PAGE_LIMIT = 10;

// --- Authentication and Authorization ---
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

// --- State for Data, Pagination, and Loading ---
const products = ref<Product[]>([]);
const initialLoading = ref(false);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const nextPageToken = ref<string | null>(null);

// --- Search Parameters ---
const searchParams = reactive({
  keyword: "",
  categoryName: "", // Will be controlled by the dropdown
  minPrice: null,
  maxPrice: null,
});

// --- Hardcoded Product Categories ---
const productCategories = [
  "Home Appliances",
  "Groceries",
  "Electronics",
  "Apparel",
  "Accessories",
  "Kitchenware",
];

// --- State for Modals ---
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const productToDeleteId = ref<string | null>(null);
const isEditing = ref(false);

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

// State for handling CSV file upload
const selectedFile = ref<File | null>(null);
const uploadStatus = ref({
  uploading: false,
  message: "",
  isError: false,
});

// --- Data Fetching Logic ---
const fetchProducts = async (token: string | null = null, refresh = false) => {
  if (refresh) {
    initialLoading.value = true;
    products.value = []; // Clear for a full refresh
  } else if (token) {
    loadingMore.value = true;
  } else {
    initialLoading.value = true;
  }
  error.value = null;

  try {
    const params: {
      limit: number;
      nextPageToken?: string;
      keyword?: string;
      categoryName?: string;
      minPrice?: number;
      maxPrice?: number;
    } = {
      limit: PAGE_LIMIT,
    };
    if (token) {
      params.nextPageToken = token;
    }
    // Add search parameters if they exist
    if (searchParams.keyword) {
      params.keyword = searchParams.keyword;
    }
    // Only include categoryName if it's not empty
    if (searchParams.categoryName) {
      params.categoryName = searchParams.categoryName;
    }
    // Add minPrice and maxPrice if they have values
    if (searchParams.minPrice !== null && searchParams.minPrice !== "") {
      params.minPrice = Number(searchParams.minPrice);
    }
    if (searchParams.maxPrice !== null && searchParams.maxPrice !== "") {
      params.maxPrice = Number(searchParams.maxPrice);
    }

    const response = await apiClient.get("/products", { params });
    if (response.data.data && response.data.data.items) {
      products.value.push(...response.data.data.items);
      nextPageToken.value = response.data.data.nextPageToken || null;
    }
  } catch (err: any) {
    error.value =
      "Failed to fetch products. " +
      (err.response?.data?.message || err.message);
  } finally {
    initialLoading.value = false;
    loadingMore.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});

const loadMoreProducts = () => {
  if (nextPageToken.value) {
    fetchProducts(nextPageToken.value);
  }
};

// --- Search Functionality ---
const applySearch = () => {
  nextPageToken.value = null; // Reset pagination for new search
  fetchProducts(null, true); // Fetch products with search parameters, refreshing the list
};
const clearSearch = () => {
  searchParams.keyword = "";
  searchParams.categoryName = ""; // Reset dropdown to "All Categories"
  searchParams.minPrice = null; // Reset minPrice
  searchParams.maxPrice = null; // Reset maxPrice
  nextPageToken.value = null; // Reset pagination
  fetchProducts(null, true); // Fetch all products again
};

// --- Download Excel Functionality ---
const downloadExcel = async () => {
  try {
    const params = new URLSearchParams();
    if (searchParams.keyword) {
      params.append("keyword", searchParams.keyword);
    }
    if (searchParams.categoryName) {
      params.append("categoryName", searchParams.categoryName);
    }
    // Add minPrice and maxPrice if they have values
    if (searchParams.minPrice !== null && searchParams.minPrice !== "") {
      params.append("minPrice", String(searchParams.minPrice));
    }
    if (searchParams.maxPrice !== null && searchParams.maxPrice !== "") {
      params.append("maxPrice", String(searchParams.maxPrice));
    }

    // Make an authenticated API request to get the blob
    const response = await apiClient.get(
      "http://localhost:8080/api/products/download-excel",
      {
        params,
        responseType: "blob", // Important for downloading files
      }
    );

    // Extract filename from Content-Disposition header if available
    let filename = "products.xlsx";
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Clean up the URL
  } catch (err: any) {
    console.error("Failed to download Excel file:", err);
    error.value = `Failed to download Excel: ${
      err.response?.data?.message || err.message || "An unknown error occurred."
    }`;
  }
};

// --- Modal Handling ---
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

const closeModal = () => {
  showModal.value = false;
};

// --- CRUD Operations ---
const saveProduct = async () => {
  try {
    if (isEditing.value) {
      await apiClient.put(
        `/products/${currentProduct.entityId}`,
        currentProduct
      );
    } else {
      await apiClient.post("/products", currentProduct);
    }
    closeModal();
    await fetchProducts(null, true); // Refresh list from the start
  } catch (err: any) {
    console.error("Failed to save product:", err);
    error.value = `Failed to save product: ${
      err.response?.data?.message || err.message
    }`;
  }
};

const promptDelete = (id: string) => {
  productToDeleteId.value = id;
  showDeleteConfirm.value = true;
};

const executeDelete = async () => {
  if (!productToDeleteId.value) return;
  try {
    await apiClient.delete(`/products/${productToDeleteId.value}`);
    await fetchProducts(null, true); // Refresh list
  } catch (err: any) {
    console.error("Failed to delete product:", err);
    error.value = `Failed to delete product: ${
      err.response?.data?.message || err.message
    }`;
  } finally {
    showDeleteConfirm.value = false;
    productToDeleteId.value = null;
  }
};

// --- File Upload Logic ---
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    uploadStatus.value = { uploading: false, message: "", isError: false };
  }
};

const uploadFile = async () => {
  if (!selectedFile.value) return;
  const formData = new FormData();
  formData.append("file", selectedFile.value);
  uploadStatus.value = { uploading: true, message: "", isError: false };

  try {
    await apiClient.post("/products/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    uploadStatus.value = {
      uploading: false,
      message: "File uploaded successfully! Refreshing list...",
      isError: false,
    };
    // After upload, refresh the list from the beginning
    await fetchProducts(null, true);
  } catch (err: any) {
    uploadStatus.value = {
      uploading: false,
      message: err.response?.data?.message || "Upload failed.",
      isError: true,
    };
    console.error(err);
  }
};

// --- UUID Generation Logic ---
const generateProductId = () => {
  currentProduct.entityId = uuidv4();
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
