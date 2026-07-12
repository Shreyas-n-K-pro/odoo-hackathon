// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Vehicle Documents API
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from './axiosInstance';

export const documentsApi = {
  /** List all docs, optionally filtered by vehicleId */
  list: (vehicleId?: number) =>
    axiosInstance.get('/documents', { params: vehicleId ? { vehicleId } : {} }),

  /** Docs expiring within N days (default 30) */
  expiring: (days = 30) =>
    axiosInstance.get('/documents/expiring', { params: { days } }),

  /** Add a document to a vehicle */
  create: (data: {
    vehicleId: number;
    docType: string;
    docNumber?: string;
    issuedAt?: string;
    expiresAt: string;
    notes?: string;
  }) => axiosInstance.post('/documents', data),

  /** Update a document */
  update: (id: number, data: Partial<{
    docType: string;
    docNumber: string;
    issuedAt: string;
    expiresAt: string;
    notes: string;
  }>) => axiosInstance.put(`/documents/${id}`, data),

  /** Delete a document */
  remove: (id: number) => axiosInstance.delete(`/documents/${id}`),
};
