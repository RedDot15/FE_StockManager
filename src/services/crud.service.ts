import apiClient from "./api";
import { Ref, ref } from "vue";

export function useCrud<T>(endpoint: string) {
  const items: Ref<T[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAll = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<any>(endpoint);
      items.value = response.data.data.items;
    } catch (e: any) {
      error.value = e.message || `Failed to fetch from ${endpoint}`;
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const create = async (newItem: Omit<T, "id">) => {
    loading.value = true;
    try {
      const response = await apiClient.post<T>(endpoint, newItem);
      return response.data;
    } catch (e: any) {
      error.value = e.message || `Failed to create item at ${endpoint}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id: string, updatedItem: Partial<T>) => {
    loading.value = true;
    try {
      await apiClient.put(`${endpoint}/${id}`, updatedItem); // Assuming PUT is /endpoint/:id
      const index = items.value.findIndex((item: any) => item.entityId === id);
      if (index !== -1) {
        items.value[index] = { ...items.value[index], ...updatedItem };
      }
    } catch (e: any) {
      error.value = e.message || `Failed to update item at ${endpoint}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const remove = async (id: string) => {
    loading.value = true;
    try {
      await apiClient.delete(`${endpoint}/${id}`); // Assuming DELETE is /endpoint/:id
    } catch (e: any) {
      error.value = e.message || `Failed to delete item at ${endpoint}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
  };
}
