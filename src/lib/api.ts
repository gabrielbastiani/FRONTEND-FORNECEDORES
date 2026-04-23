import axios from 'axios';
import {
  ApiResponse, Catalog, Supplier,
  UploadResponse, Product, ProductImage,
  PaginatedProductsResponse, Store,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      'Erro desconhecido';
    return Promise.reject(new Error(message));
  }
);

// ── Catálogos ─────────────────────────────────────────────────
export const catalogsApi = {
  list: async () => {
    const r = await api.get<ApiResponse<Catalog[]>>('/catalogs');
    return r.data;
  },
  getById: async (id: string, page = 1, limit = 20) => {
    const r = await api.get<ApiResponse<Catalog>>(`/catalogs/${id}`, {
      params: { page, limit },
    });
    return r.data;
  },
  linkSupplier: async (catalogId: string, supplierId: string) => {
    const r = await api.patch<ApiResponse<Catalog>>(
      `/catalogs/${catalogId}/supplier`,
      { supplierId }
    );
    return r.data;
  },
  delete: async (id: string) => {
    const r = await api.delete<ApiResponse<null>>(`/catalogs/${id}`);
    return r.data;
  },
};

// ── Upload ────────────────────────────────────────────────────
export const uploadApi = {
  uploadPDF: async (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    const r = await api.post<ApiResponse<UploadResponse>>(
      '/upload/pdf', form, {
        headers:  { 'Content-Type': 'multipart/form-data' },
        timeout:  600000,
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      }
    );
    return r.data;
  },
};

// ── Fornecedores ──────────────────────────────────────────────
export const suppliersApi = {
  list: async () => {
    const r = await api.get<ApiResponse<Supplier[]>>('/suppliers');
    return r.data;
  },
  getById: async (id: string) => {
    const r = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return r.data;
  },
  create: async (data: Partial<Supplier>) => {
    const r = await api.post<ApiResponse<Supplier>>('/suppliers', data);
    return r.data;
  },
  update: async (id: string, data: Partial<Supplier>) => {
    const r = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    return r.data;
  },
  delete: async (id: string) => {
    const r = await api.delete<ApiResponse<null>>(`/suppliers/${id}`);
    return r.data;
  },
};

// ── Produtos ──────────────────────────────────────────────────
export const productsApi = {
  list: async (params: {
    catalogId?: string;
    page?:      number;
    limit?:     number;
    search?:    string;
    category?:  string;
  }) => {
    const r = await api.get<PaginatedProductsResponse>(
      '/products', { params }
    );
    return r.data;
  },
  update: async (id: string, data: Partial<Product>) => {
    const r = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return r.data;
  },
  delete: async (id: string) => {
    const r = await api.delete<ApiResponse<null>>(`/products/${id}`);
    return r.data;
  },
  bulkDelete: async (ids: string[]) => {
    const r = await api.delete<ApiResponse<{ deletedCount: number }>>(
      '/products/bulk', { data: { ids } }
    );
    return r.data;
  },
  addImage: async (productId: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    const r = await api.post<ApiResponse<ProductImage>>(
      `/products/${productId}/images`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return r.data;
  },
  updateImage: async (imageId: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    const r = await api.put<ApiResponse<ProductImage>>(
      `/products/images/${imageId}`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return r.data;
  },
  deleteImage: async (imageId: string) => {
    const r = await api.delete<ApiResponse<null>>(
      `/products/images/${imageId}`
    );
    return r.data;
  },
};

// ── Loja ──────────────────────────────────────────────────────
export const storeApi = {
  get: async () => {
    const r = await api.get<ApiResponse<Store>>('/store');
    return r.data;
  },
  update: async (data: Partial<Store>) => {
    const r = await api.put<ApiResponse<Store>>('/store', data);
    return r.data;
  },
  uploadLogo: async (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    const r = await api.post<ApiResponse<Store>>('/store/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return r.data;
  },
};

export default api;