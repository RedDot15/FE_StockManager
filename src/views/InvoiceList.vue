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
            <th class="py-2 px-4">ID:</th>
            <th class="py-2 px-4">Created At:</th>
            <th class="py-2 px-4">Updated At:</th>
            <th class="py-2 px-4">Total:</th>
            <th class="py-2 px-4">Tax:</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in invoices"
            :key="invoice.entityId"
            class="border-b"
          >
            <td class="py-2 px-4">{{ invoice.entityId }}</td>
            <td class="py-2 px-4">
              {{ new Date(invoice.createdAt).toLocaleDateString("en-GB") }}
            </td>
            <td class="py-2 px-4">
              {{ new Date(invoice.updatedAt).toLocaleDateString("en-GB") }}
            </td>
            <td class="py-2 px-4">${{ invoice.total }}</td>
            <td class="py-2 px-4">${{ invoice.tax }}</td>
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
import { useCrud } from "@/services/crud.service";

const {
  items: invoices,
  loading,
  error,
  fetchAll,
} = useCrud<Invoice>("/invoices");

const selectedFile = ref<File | null>(null);
const uploadStatus = ref({
  uploading: false,
  message: "",
  isError: false,
});

onMounted(fetchAll);

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
    // Refresh the list
    await fetchAll();
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

<!-- TODO: Invoice detail-->
