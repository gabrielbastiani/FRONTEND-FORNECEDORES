export type CatalogStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Pagination {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

export interface ProductImage {
  id:         string;
  productId:  string;
  imagePath:  string;
  pageNumber: number | null;
  isPrimary:  boolean;
  width:      number | null;
  height:     number | null;
}

export interface Store {
  id:           string;
  name:         string;
  ownerName:    string | null;
  cnpj:         string | null;
  email:        string | null;
  phone:        string | null;
  whatsapp:     string | null;
  address:      string | null;
  city:         string | null;
  state:        string | null;
  zipCode:      string | null;
  website:      string | null;
  instagram:    string | null;
  facebook:     string | null;
  description:  string | null;
  primaryColor: string | null;
  logoPath:     string | null;
  createdAt:    string;
  updatedAt:    string;
}

export interface Product {
  id:          string;
  catalogId:   string;
  title:       string;
  description: string | null;
  dimensions:  string | null;
  eanCode:     string | null;
  sku:         string | null;
  brand:       string | null;
  category:    string | null;
  unit:        string | null;
  price:       number | null;
  priceType:   string | null;
  currency:    string;
  pageNumber:  number | null;
  createdAt:   string;
  updatedAt:   string;
  images:      ProductImage[];
}

export interface Supplier {
  id:        string;
  name:      string;
  cnpj:      string | null;
  email:     string | null;
  website:   string | null;
  phone:     string | null;
  address:   string | null;
  city:      string | null;
  state:     string | null;
  zipCode:   string | null;
  notes:     string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Catalog {
  id:                string;
  supplierId:        string | null;
  originalFilename:  string;
  storedFilename:    string;
  filePath:          string;
  fileSizeBytes:     number;
  pageCount:         number | null;
  status:            CatalogStatus;
  extractionMethod:  string | null;
  errorMessage:      string | null;
  processingTimeMs:  number | null;
  createdAt:         string;
  updatedAt:         string;
  supplier:          Supplier | null;
  products:          Product[];
  _stats?: {
    totalProducts:   number;
    withEan:         number;
    withPrice:       number;
    withDescription: number;
    withDimensions:  number;
    withImage:       number;
  };
  _count?: { products: number };
  _pagination?: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
  error?:  { message: string };
}

export interface PaginatedProductsResponse {
  success:     boolean;
  data:        Product[];
  _pagination: Pagination;
}

export interface UploadResponse {
  catalogId:      string;
  filename:       string;
  fileSizeBytes:  number;
  status:         CatalogStatus;
  statusCheckUrl: string;
}