import axios from 'axios';
import { ApiResponse, Catalog, Supplier, UploadResponse } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Erro desconhecido';
    return Promise.reject(new Error(message));
  }
);

// ── Catálogos ─────────────────────────────────────────────────
export const catalogsApi = {
  list: () =>
    api.get<ApiResponse<Catalog[]>>('/catalogs').then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Catalog>>(`/catalogs/${id}`).then((r) => r.data),

  linkSupplier: (catalogId: string, supplierId: string) =>
    api
      .patch<ApiResponse<Catalog>>(`/catalogs/${catalogId}/supplier`, {
        supplierId,
      })
      .then((r) => r.data),
};

// ── Upload ────────────────────────────────────────────────────
export const uploadApi = {
  uploadPDF: (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<ApiResponse<UploadResponse>>('/upload/pdf', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 min
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then((r) => r.data);
  },
};

// ── Fornecedores ──────────────────────────────────────────────
export const suppliersApi = {
  list: () =>
    api.get<ApiResponse<Supplier[]>>('/suppliers').then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Supplier>>(`/suppliers/${id}`).then((r) => r.data),

  create: (data: Partial<Supplier>) =>
    api.post<ApiResponse<Supplier>>('/suppliers', data).then((r) => r.data),

  update: (id: string, data: Partial<Supplier>) =>
    api
      .put<ApiResponse<Supplier>>(`/suppliers/${id}`, data)
      .then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/suppliers/${id}`).then((r) => r.data),
};

export default api;