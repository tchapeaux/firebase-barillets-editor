import type { Barillet, Theme } from '../types/barillet';
import type jsPDF from 'jspdf';

/**
 * Composable for exporting barillets to multiple formats (PDF, JSON, CSV, Excel)
 */
export function useBarilletExport() {
  /**
   * Helper function to download a file
   */
  const downloadFile = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Sanitize filename to remove invalid characters
   */
  const sanitizeFilename = (filename: string): string => {
    return (
      filename
        .replace(/[^a-z0-9_\-\s]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase() || 'barillet'
    );
  };

  /**
   * Export a barillet to PDF with A4 landscape format, 9 themes per page
   */
  const exportToPdf = async (barillet: Barillet): Promise<void> => {
    // Dynamic import of jsPDF to reduce initial bundle size
    const { default: jsPDF } = await import('jspdf');
    // A4 landscape dimensions in mm
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 10;

    // Calculate grid dimensions for 3x3 layout
    const cols = 3;
    const rows = 3;
    const cardWidth = (pageWidth - (cols + 1) * margin) / cols;
    const cardHeight = (pageHeight - (rows + 1) * margin) / rows;

    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Draw each theme
    barillet.themes.forEach((theme, index) => {
      // Add new page after every 9 themes
      if (index > 0 && index % 9 === 0) {
        doc.addPage();
      }

      const indexInPage = index % 9;
      const row = Math.floor(indexInPage / cols);
      const col = indexInPage % cols;

      const x = margin + col * (cardWidth + margin);
      const y = margin + row * (cardHeight + margin);

      drawThemeCardForPdf(doc, theme, x, y, cardWidth, cardHeight);
    });

    // Save the PDF
    const filename = `${sanitizeFilename(barillet.title)}.pdf`;
    doc.save(filename);
  };

  /**
   * Draw a single theme card for PDF
   */
  const drawThemeCardForPdf = (
    doc: jsPDF,
    theme: Theme,
    x: number,
    y: number,
    width: number,
    height: number
  ): void => {
    const padding = 3;

    // Card border
    doc.setLineWidth(0.4);
    doc.setDrawColor(220, 220, 220);
    doc.rect(x, y, width, height);

    // Type badge background
    const badgeHeight = 10;
    if (theme.type === 'Mixte') {
      doc.setFillColor(219, 234, 254); // blue-100
    } else {
      doc.setFillColor(233, 213, 255); // purple-100
    }
    doc.rect(x, y, width, badgeHeight, 'F');

    // Type text
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    if (theme.type === 'Mixte') {
      doc.setTextColor(29, 78, 216); // blue-700
    } else {
      doc.setTextColor(107, 33, 168); // purple-700
    }
    doc.text(theme.type, x + padding, y + 6.5);

    // Theme title or number - use larger font for short titles, smaller for long ones
    const titleText =
      theme.title && theme.title.trim() !== '' ? theme.title : `(pas de titre)`;

    const maxTitleWidth = width - padding * 2;

    // Calculate appropriate font size based on text length
    let titleFontSize = 16;
    if (titleText.length > 25) {
      titleFontSize = 13;
    } else if (titleText.length > 33) {
      titleFontSize = 11;
    }

    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    // Split text if needed
    const titleLines = doc.splitTextToSize(titleText, maxTitleWidth);
    const titleY = y + badgeHeight + 8;

    // Draw up to 2 lines of title
    if (titleLines.length === 1) {
      doc.text(titleLines[0], x + padding, titleY);
    } else {
      doc.text(titleLines[0], x + padding, titleY);
      if (titleLines[1]) {
        doc.text(titleLines[1], x + padding, titleY + 5);
      }
    }

    // Participation and Category on the same row
    const categoryParticipationY = titleY + (titleLines.length > 1 ? 16 : 12);

    // Participation (left side)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const participationText = theme.participation || '-';
    doc.text(participationText, x + padding, categoryParticipationY);

    // Category (right side)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    if (theme.category !== 'Libre') {
      doc.setTextColor(21, 128, 61); // green-700
    } else {
      doc.setTextColor(0, 0, 0);
    }
    const categoryText = theme.category || '-';
    // Right-align category
    const categoryWidth = doc.getTextWidth(categoryText);
    doc.text(
      categoryText,
      x + width - padding - categoryWidth,
      categoryParticipationY
    );

    // Duration and Notes (bottom)
    const bottomY = y + height - 8;

    // Duration (left-aligned)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    const prefix =
      theme.type === 'Comparée' && theme.duration.type === 'fixed' ? '2x ' : '';

    const durationText = theme.duration.value || '-';
    doc.text(prefix + durationText, x + padding, bottomY);

    // Notes (right-aligned, multiline if needed)
    if (theme.notes && theme.notes.trim() !== '') {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100); // Gray color for notes

      const maxNotesWidth =
        width - padding * 2 - doc.getTextWidth(durationText) - 5; // Leave space between duration and notes
      const notesLines = doc.splitTextToSize(theme.notes, maxNotesWidth);

      // Calculate starting Y position for notes (bottom-aligned)
      const lineHeight = 3;
      const notesStartY = bottomY - (notesLines.length - 1) * lineHeight;

      // Draw notes lines (right-aligned)
      notesLines.forEach((line: string, lineIndex: number) => {
        const lineWidth = doc.getTextWidth(line);
        const lineY = notesStartY + lineIndex * lineHeight;
        doc.text(line, x + width - padding - lineWidth, lineY);
      });
    }
  };

  /**
   * Export a barillet to JSON format (clean data for duplication)
   * Excludes Firestore metadata (userId, id, timestamps)
   */
  const exportToJson = async (barillet: Barillet): Promise<void> => {
    const cleanData = {
      title: barillet.title,
      date: barillet.date ? barillet.date.toISOString().split('T')[0] : null,
      location: barillet.location,
      themes: barillet.themes.map((theme) => ({
        type: theme.type,
        title: theme.title,
        participation: theme.participation,
        category: theme.category,
        duration: theme.duration,
        notes: theme.notes || '',
      })),
    };

    const jsonString = JSON.stringify(cleanData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = `${sanitizeFilename(barillet.title)}.json`;
    downloadFile(blob, filename);
  };

  /**
   * Export a barillet to CSV format
   */
  const exportToCsv = async (barillet: Barillet): Promise<void> => {
    // Header row
    const headers = [
      'Theme #',
      'Type',
      'Title',
      'Participation',
      'Category',
      'Duration',
      'Duration Type',
      'Notes',
    ];

    // Data rows
    const rows = barillet.themes.map((theme, index) => [
      String(index + 1),
      theme.type,
      theme.title || '',
      theme.participation,
      theme.category,
      theme.duration.value,
      theme.duration.type,
      theme.notes || '',
    ]);

    // Combine headers and rows
    const csv = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `${sanitizeFilename(barillet.title)}.csv`;
    downloadFile(blob, filename);
  };

  /**
   * Export a barillet to Excel format
   */
  const exportToExcel = async (barillet: Barillet): Promise<void> => {
    // Dynamic import of xlsx to reduce initial bundle size
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const XLSX: any = await import('xlsx');

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create metadata sheet
    const metadataData = [
      ['Title', barillet.title],
      ['Date', barillet.date ? barillet.date.toLocaleDateString('fr-FR') : ''],
      ['Location', barillet.location],
      ['Total Themes', barillet.themes.length],
    ];

    const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData);
    XLSX.utils.book_append_sheet(wb, metadataSheet, 'Metadata');

    // Create themes sheet
    const themeHeaders = [
      'Theme #',
      'Type',
      'Title',
      'Participation',
      'Category',
      'Duration',
      'Duration Type',
      'Notes',
    ];

    const themeData = [
      themeHeaders,
      ...barillet.themes.map((theme, index) => [
        index + 1,
        theme.type,
        theme.title || '',
        theme.participation,
        theme.category,
        theme.duration.value,
        theme.duration.type,
        theme.notes || '',
      ]),
    ];

    const themesSheet = XLSX.utils.aoa_to_sheet(themeData);

    // Set column widths
    const colWidths = [10, 10, 25, 15, 15, 12, 12, 20];
    themesSheet['!cols'] = colWidths.map((width) => ({ wch: width }));

    // Style header row (bold)
    for (let i = 0; i < themeHeaders.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!themesSheet[cellRef]) continue;
      themesSheet[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'FFF3CD' } },
      };
    }

    XLSX.utils.book_append_sheet(wb, themesSheet, 'Themes');

    // Save the workbook
    const filename = `${sanitizeFilename(barillet.title)}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return {
    exportToPdf,
    exportToJson,
    exportToCsv,
    exportToExcel,
  };
}
