import jsPDF from 'jspdf';
import type { ProductDailyEntry, UserProfile } from '../types';

export interface PdfReportMetadata {
  fileName: string;
  fileSizeKb: number;
  reportName: string;
  createdTime: string;
}

export function generatePdfDoc(entry: ProductDailyEntry, profile: UserProfile | null): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // Colors
  const primaryColor = [30, 64, 175]; // #1E40AF (Deep Navy)
  const secondaryColor = [14, 165, 233]; // #0EA5E9 (Sky)
  const textColor = [30, 41, 59]; // #1E293B
  const mutedTextColor = [100, 116, 139]; // #64748B
  const successColor = [16, 185, 129]; // #10B981
  const dangerColor = [239, 68, 68]; // #EF4444

  // Top Accent Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Header Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FUEL GAIN TRACKER', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('Automated Dip to Volume & Meter Gain/Shortage Audit System', margin, y + 5);

  // Date / Time badge on top right
  const now = new Date();
  const createdTimeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  doc.setFontSize(8);
  doc.text(`Generated: ${createdTimeString}`, pageWidth - margin, y, { align: 'right' });
  doc.text(`Doc ID: AUD-${entry.id.substring(0, 10).toUpperCase()}`, pageWidth - margin, y + 4.5, { align: 'right' });

  y += 14;

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Report Title Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`DAILY FUEL TANK AUDIT REPORT — ${entry.productName.toUpperCase()}`, margin + 6, y + 9);
  
  y += 20;

  // Station & Owner Info Grid (2 Columns)
  doc.setFontSize(9);
  
  // Left Column: Station Details
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('STATION DETAILS', margin, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Station Name: ${profile?.pumpName || 'Shree Ganesh Filling Station'}`, margin, y + 6);
  doc.text(`OMC Company: ${profile?.pumpCompany || 'HPCL'}`, margin, y + 11);
  doc.text(`Address: ${profile?.pumpAddress || 'NH-48, Sector 14, Gurugram'}`, margin, y + 16);

  // Right Column: Owner & Audit Date
  const col2X = margin + contentWidth / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AUDIT PARAMETERS', col2X, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Station Manager: ${profile?.fullName || 'Rajesh Sharma'}`, col2X, y + 6);
  doc.text(`Audit Date: ${entry.date}`, col2X, y + 11);
  doc.text(`Fuel Product: ${entry.productName}`, col2X, y + 16);

  y += 24;

  // Summary Key Metrics Cards
  const cardWidth = (contentWidth - 6) / 3;
  const cardHeight = 18;

  // Card 1: Total Meter Sale
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('TOTAL METER SALE', margin + 4, y + 5);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${entry.totalMeterSale.toFixed(1)} Litres`, margin + 4, y + 13);

  // Card 2: Total Dip Sale
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(margin + cardWidth + 3, y, cardWidth, cardHeight, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('TOTAL DIP SALE', margin + cardWidth + 7, y + 5);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`${entry.dipSale.toFixed(1)} Litres`, margin + cardWidth + 7, y + 13);

  // Card 3: Difference & Status
  const isGain = entry.difference > 0;
  const isShortage = entry.difference < 0;
  const statusBg = isGain ? [236, 253, 245] : isShortage ? [254, 242, 242] : [241, 245, 249];
  const statusFg = isGain ? successColor : isShortage ? dangerColor : primaryColor;

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.roundedRect(margin + (cardWidth + 3) * 2, y, cardWidth, cardHeight, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text(`VARIANCE STATUS: ${entry.status.toUpperCase()}`, margin + (cardWidth + 3) * 2 + 4, y + 5);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusFg[0], statusFg[1], statusFg[2]);
  const diffSign = entry.difference > 0 ? '+' : '';
  doc.text(`${diffSign}${entry.difference.toFixed(1)} Litres`, margin + (cardWidth + 3) * 2 + 4, y + 13);

  y += 24;

  // Table 1: Nozzle Meter Readings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. NOZZLE METER READINGS BREAKDOWN', margin, y);
  y += 4;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Nozzle Name', margin + 4, y + 5);
  doc.text('Opening Reading (L)', margin + 45, y + 5);
  doc.text('Closing Reading (L)', margin + 95, y + 5);
  doc.text('Nozzle Sale (L)', margin + 145, y + 5);
  y += 7;

  // Table Rows
  entry.nozzleReadings.forEach((nozzle, index) => {
    const rowBg = index % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(nozzle.nozzleName, margin + 4, y + 4.5);
    doc.text(nozzle.openingReading.toFixed(2), margin + 45, y + 4.5);
    doc.text(nozzle.closingReading.toFixed(2), margin + 95, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(nozzle.sale.toFixed(2), margin + 145, y + 4.5);
    y += 6;
  });

  // Total Meter Sale Footer Row
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('TOTAL METER SALE (Sum of Nozzles)', margin + 4, y + 5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${entry.totalMeterSale.toFixed(2)} Litres`, margin + 145, y + 5);
  y += 12;

  // Table 2: Stock Receipt & Dip Volume Audit
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('2. STOCK RECEIPT & TANK DIP CONVERSION AUDIT', margin, y);
  y += 4;

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Parameter Item', margin + 4, y + 5);
  doc.text('Dip Level (cm)', margin + 85, y + 5);
  doc.text('Calculated Stock Volume (Litres)', margin + 130, y + 5);
  y += 7;

  const dipItems = [
    { name: 'Opening Tank Stock', dip: `${entry.openingDip} cm`, vol: `${entry.openingStock.toLocaleString()} L` },
    { name: 'Closing Tank Stock', dip: `${entry.closingDip} cm`, vol: `${entry.closingStock.toLocaleString()} L` },
    { name: 'Tanker Stock Receipt Inflow', dip: entry.wasReceiptReceived ? 'Stock Received' : 'No Inflow', vol: `${entry.receiptQuantity.toLocaleString()} L` },
    { name: 'Calculated Dip Sale (Opening - Closing + Receipt)', dip: 'Formula Calculated', vol: `${entry.dipSale.toLocaleString()} L` },
  ];

  dipItems.forEach((item, index) => {
    const rowBg = index % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', index === 3 ? 'bold' : 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(item.name, margin + 4, y + 4.5);
    doc.text(item.dip, margin + 85, y + 4.5);
    doc.text(item.vol, margin + 130, y + 4.5);
    y += 6.5;
  });

  y += 10;

  // Final Audit Variance Formula Box
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AUDIT SUMMARY & FORMULA RECONCILIATION', margin + 6, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Meter Sale: ${entry.totalMeterSale.toFixed(1)} L   |   Dip Sale: ${entry.dipSale.toFixed(1)} L   |   Receipt: ${entry.receiptQuantity.toFixed(0)} L`, margin + 6, y + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusFg[0], statusFg[1], statusFg[2]);
  doc.text(`Net Difference (Meter Sale - Dip Sale): ${diffSign}${entry.difference.toFixed(2)} Litres  —  Status: ${entry.status.toUpperCase()}`, margin + 6, y + 17.5);

  // Footer Signature Block at bottom
  const footerY = 275;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 10, margin + 55, footerY - 10);
  doc.line(pageWidth - margin - 55, footerY - 10, pageWidth - margin, footerY - 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('Station Manager Signature', margin, footerY - 6);
  doc.text('Authorized Auditor Signature', pageWidth - margin, footerY - 6, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(7.5);
  doc.text('Generated by Fuel Gain Tracker App • Official Station Variance Audit Record', margin, footerY + 4);
  doc.text('Page 1 of 1', pageWidth - margin, footerY + 4, { align: 'right' });

  return doc;
}

// Download PDF helper
export function downloadPdfReport(entry: ProductDailyEntry, profile: UserProfile | null) {
  const doc = generatePdfDoc(entry, profile);
  const fileName = `FuelGain_Report_${entry.date}_${entry.productId}.pdf`;
  doc.save(fileName);
}

// Get Data URI string for PDF modal preview
export function getPdfDataUrl(entry: ProductDailyEntry, profile: UserProfile | null): string {
  const doc = generatePdfDoc(entry, profile);
  return doc.output('datauristring');
}

// Get estimated file size in KB
export function getEstimatedPdfSizeKb(entry: ProductDailyEntry): number {
  // Estimated size based on nozzle counts and content complexity (~120KB - 160KB)
  return Math.round(120 + entry.nozzleReadings.length * 5);
}

// Share PDF helper
export async function sharePdfReport(entry: ProductDailyEntry, profile: UserProfile | null): Promise<boolean> {
  const summaryText = `⛽ Fuel Gain Audit Report\nStation: ${profile?.pumpName || 'Filling Station'}\nDate: ${entry.date}\nProduct: ${entry.productName}\nMeter Sale: ${entry.totalMeterSale.toFixed(1)} L\nDip Sale: ${entry.dipSale.toFixed(1)} L\nVariance: ${entry.difference > 0 ? '+' : ''}${entry.difference.toFixed(1)} L (${entry.status})`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Fuel Gain Audit - ${entry.date}`,
        text: summaryText,
      });
      return true;
    } catch {
      // Fallback to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(summaryText);
    return true;
  } catch {
    return false;
  }
}
