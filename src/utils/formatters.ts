import { CurrencyConfig, Quote, Invoice, BusinessProfile } from '../types';

/**
 * Formats an integer amount in cents to a human-readable currency string.
 * Example: 150050 cents -> "$ 1.500,50" (or "$ 1.500" if no cents or rounded)
 */
export function formatMoney(cents: number, config?: CurrencyConfig): string {
  const symbol = config?.symbol || '$';
  const decimals = config?.decimals ?? 2;
  const units = cents / Math.pow(10, decimals);
  
  try {
    const formattedNumber = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: cents % 100 === 0 ? 0 : decimals,
      maximumFractionDigits: decimals,
    }).format(units);
    return `${symbol} ${formattedNumber}`;
  } catch {
    return `${symbol} ${units.toFixed(decimals)}`;
  }
}

/**
 * Formats date string YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

/**
 * Calculates remaining days until a due date
 */
export function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format duration in seconds to "Xh Ym" or "HH:MM:SS"
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

/**
 * Generates WhatsApp link and friendly pre-written message for Quotes in Argentina
 */
export function getQuoteWhatsAppUrl(quote: Quote, profile: BusinessProfile): string {
  const itemsText = quote.items
    .map((item, idx) => `• ${item.description} (x${item.quantity}): ${formatMoney(item.totalInCents)}`)
    .join('%0A');

  const text = `Hola *${quote.clientName}*, te envío el presupuesto *${quote.number}* de *${profile.businessName}*:%0A%0A` +
    `*Detalle de Trabajos:*%0A${itemsText}%0A%0A` +
    `*TOTAL:* ${formatMoney(quote.totalInCents)}%0A` +
    `*Validez:* ${quote.validDays} días.%0A` +
    `*Notas:* ${quote.notes || 'A disposición por cualquier consulta.'}%0A%0A` +
    `Quedo atento a tu confirmación. Saludos cordiales, ${profile.ownerName}.`;

  const cleanPhone = quote.clientId ? quote.clientId.replace(/[^0-9]/g, '') : '';
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

/**
 * Generates WhatsApp link for Invoice payment reminder with Alias CBU / Mercado Pago
 */
export function getInvoiceReminderWhatsAppUrl(invoice: Invoice, profile: BusinessProfile): string {
  const pendingCents = invoice.totalInCents - invoice.paidInCents;
  const text = `Hola *${invoice.clientName}*, te comparto el estado del comprobante *${invoice.docType} N° ${invoice.number}*:%0A%0A` +
    `*Saldo Pendiente:* ${formatMoney(pendingCents)}%0A` +
    `*Vencimiento:* ${formatDate(invoice.dueDate)}%0A%0A` +
    `*Datos de Cobro:*%0A` +
    `• Titular: ${profile.ownerName}%0A` +
    `• CUIT: ${profile.cuit}%0A` +
    `• Alias CBU/MP: *${profile.aliasCbuMp}*%0A%0A` +
    `Al abonar, por favor envíame el comprobante por este medio para asentar el pago. ¡Muchas gracias!`;

  return `https://wa.me/?text=${text}`;
}
