import api from './api';

export interface VendorUpload {
  id: string;
  vendorId: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  processedAt?: string;
}

export interface UploadResponse {
  message: string;
  productsCreated: number;
  upload: VendorUpload;
}

export const vendorService = {
  uploadCSV: async (fileUri: string, fileName: string, fileType: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any);

    const response = await api.post('/vendors/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProducts: async (): Promise<any[]> => {
    const response = await api.get('/vendors/products');
    return response.data;
  },

  getUploads: async (): Promise<VendorUpload[]> => {
    const response = await api.get('/vendors/uploads');
    return response.data;
  },
};

