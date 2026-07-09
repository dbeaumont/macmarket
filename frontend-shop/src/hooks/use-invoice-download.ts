import { useMutation } from '@tanstack/react-query';
import { fetchInvoiceBlob } from '@/lib/api';

export function useInvoiceDownload() {
  return useMutation({
    mutationFn: (orderId: string) => fetchInvoiceBlob(orderId),
    onSuccess: (blob: Blob, orderId: string) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `facture-${orderId.substring(0, 8)}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });
}
