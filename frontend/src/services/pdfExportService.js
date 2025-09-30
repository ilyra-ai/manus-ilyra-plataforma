import { apiService } from './api';

export const pdfExportService = {
  exportMetricsPdf: async () => {
    try {
      const response = await apiService.get('/api/user/export-metrics-pdf', {
        responseType: 'blob', // Importante para receber o PDF como blob
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar PDF de métricas:', error);
      throw error;
    }
  },
  exportUserData: async (userData, filename) => {
    console.log(`Exportando dados do usuário para ${filename}:`, userData);
    // Simulação de exportação de PDF
    const blob = new Blob([`Dados do Usuário:\n${JSON.stringify(userData, null, 2)}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  }
};

