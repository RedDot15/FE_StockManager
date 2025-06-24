<template>
  <div>
    <div class="mb-6 p-4 bg-white rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-2">Upload Invoices</h2>
      <p class="mb-4 text-gray-600">
        Upload a CSV file of invoices. Ensure it has the correct headers.
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

    <div v-if="loading">Loading invoices...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <div v-if="!loading" class="bg-white p-4 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">All Invoices</h2>
      <table class="min-w-full">
        <thead class="bg-gray-200">
          <tr>
            <th class="py-2 px-4">Invoice #</th>
            <th class="py-2 px-4">Vendor</th>
            <th class="py-2 px-4">Amount</th>
            <th class="py-2 px-4">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.id" class="border-b">
            <td class="py-2 px-4">{{ invoice.invoiceNumber }}</td>
            <td class="py-2 px-4">{{ invoice.vendor.name }}</td>
            <td class="py-2 px-4">${{ invoice.amount.toFixed(2) }}</td>
            <td class="py-2 px-4">
              {{ new Date(invoice.invoiceDate).toLocaleDateString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import apiClient from "../services/api";
import { Invoice } from "../types";

const invoices = ref<Invoice[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const selectedFile = ref<File | null>(null);
const uploadStatus = ref({
  uploading: false,
  message: "",
  isError: false,
});

const fetchInvoices = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get("/invoices");
    invoices.value = response.data;
  } catch (err: any) {
    error.value = "Failed to fetch invoices.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

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
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    uploadStatus.value = {
      uploading: false,
      message: "File uploaded successfully!",
      isError: false,
    };
    await fetchInvoices(); // Refresh the list
  } catch (err: any) {
    uploadStatus.value = {
      uploading: false,
      message: err.response?.data?.message || "Upload failed.",
      isError: true,
    };
    console.error(err);
  }
};

onMounted(fetchInvoices);
</script>

<!-- TODO: Invoice detail-->
