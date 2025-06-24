<template>
  <div>
    <!-- SECTION: CSV UPLOAD -->
    <div class="mb-6 p-4 bg-white rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-2">Upload Invoices</h2>
      <p class="mb-4 text-gray-600">
        Upload a CSV file of invoices. This will create vendor sales records.
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

    <!-- SECTION: INVOICE LIST -->
    <div v-if="loading">Loading records...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <div v-if="!loading" class="bg-white rounded-lg shadow overflow-hidden">
      <h2 class="text-xl font-semibold mb-4 p-4">All Invoices</h2>
      <table class="min-w-full">
        <thead class="bg-gray-200">
          <tr>
            <th class="th-cell w-12"></th>
            <!-- Column for expand icon -->
            <th class="th-cell">Vendor ID</th>
            <th class="th-cell">Created At</th>
            <th class="th-cell">Updated At</th>
            <th class="th-cell">Total Revenue</th>
            <th class="th-cell">Total Tax (VAT)</th>
          </tr>
        </thead>
        <!-- Use <template> to loop over invoices, allowing for multiple root <tr> per item -->
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-for="invoice in invoices" :key="invoice.entityId">
            <!-- Main row for the invoice -->
            <tr
              @click="toggleDetails(invoice.entityId)"
              class="cursor-pointer hover:bg-gray-50"
            >
              <td class="td-cell text-center">
                <!-- Chevron icon indicates expandable and current state -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mx-auto transition-transform duration-300"
                  :class="{
                    'rotate-90': expandedInvoiceId === invoice.entityId,
                  }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </td>
              <td class="td-cell font-medium">{{ invoice.entityId }}</td>
              <td class="td-cell">
                {{ new Date(invoice.createdAt).toLocaleDateString("en-GB") }}
              </td>
              <td class="td-cell">
                {{ new Date(invoice.updatedAt).toLocaleDateString("en-GB") }}
              </td>
              <td class="td-cell">${{ invoice.total }}</td>
              <td class="td-cell">${{ invoice.tax }}</td>
            </tr>
            <!-- Dropdown row with sale item details -->
            <tr v-if="expandedInvoiceId === invoice.entityId">
              <!-- Colspan makes this cell span the entire width of the table -->
              <td :colspan="6" class="p-0">
                <div class="p-4 bg-gray-50">
                  <h4 class="font-semibold text-lg mb-2">Sale Details</h4>
                  <table class="min-w-full bg-white border rounded">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="th-cell-inner">Product ID</th>
                        <th class="th-cell-inner">Vendor ID</th>
                        <th class="th-cell-inner">Category</th>
                        <th class="th-cell-inner">Amount</th>
                        <th class="th-cell-inner">Price per Item</th>
                        <th class="th-cell-inner">VAT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(item, index) in invoice.sales"
                        :key="index"
                        class="border-t"
                      >
                        <td class="td-cell-inner">{{ item.productId }}</td>
                        <td class="td-cell-inner">{{ item.vendorId }}</td>
                        <td class="td-cell-inner">{{ item.categoryName }}</td>
                        <td class="td-cell-inner">{{ item.amount }}</td>
                        <td class="td-cell-inner">
                          ${{ item.price.toFixed(2) }}
                        </td>
                        <td class="td-cell-inner">
                          ${{ item.vat.toFixed(2) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import apiClient from "../services/api";
import { useCrud } from "@/services/crud.service";
import { Invoice } from "@/types";

// Using the generic CRUD service to fetch vendor data from the /invoices endpoint
const {
  items: invoices,
  loading,
  error,
  fetchAll,
} = useCrud<Invoice>("/invoices");

// State for handling CSV file upload
const selectedFile = ref<File | null>(null);
const uploadStatus = ref({
  uploading: false,
  message: "",
  isError: false,
});

// State to track which vendor's details are currently expanded
const expandedInvoiceId = ref<string | null>(null);

// Fetch data when the component is mounted
onMounted(fetchAll);

// Toggles the visibility of the sale item details for a invoice.
const toggleDetails = (vendorId: string) => {
  if (expandedInvoiceId.value === vendorId) {
    expandedInvoiceId.value = null; // Collapse if already open
  } else {
    expandedInvoiceId.value = vendorId; // Expand the new one
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
    await apiClient.post("/invoices", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    uploadStatus.value = {
      uploading: false,
      message: "File uploaded successfully!",
      isError: false,
    };
    await fetchAll(); // Refresh the list to show new data
  } catch (err: any) {
    uploadStatus.value = {
      uploading: false,
      message: err.response?.data?.message || "Upload failed.",
      isError: true,
    };
    console.error(err);
  }
};
</script>

<style scoped>
/* Utility classes for main table cells for consistency */
.th-cell {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.td-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-700;
}

/* Scoped styles for the nested details table */
.th-cell-inner {
  @apply px-4 py-2 text-left text-xs font-medium text-gray-600 bg-gray-100;
}

.td-cell-inner {
  @apply px-4 py-2 text-sm;
}
</style>

<!-- TODO: Invoice detail-->
<!-- TODO: Implement pagination-->
