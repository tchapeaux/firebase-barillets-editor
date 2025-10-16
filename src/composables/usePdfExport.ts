import jsPDF from 'jspdf';
import type { Barillet, Theme } from '../types/barillet';

/**
 * Composable for exporting barillets to PDF
 */
export function usePdfExport() {
  /**
   * Export a barillet to PDF with A4 landscape format, 9 themes per page
   */
  const exportBarilletToPdf = (barillet: Barillet): void => {
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
      if (index % 9 === 0) {
        doc.addPage();
      }

      const indexInPage = index % 9;
      const row = Math.floor(indexInPage / cols);
      const col = indexInPage % cols;

      const x = margin + col * (cardWidth + margin);
      const y = margin + row * (cardHeight + margin);

      drawThemeCard(doc, theme, x, y, cardWidth, cardHeight);
    });

    // Save the PDF
    const filename = `${barillet.title || 'barillet'}.pdf`;
    doc.save(filename);
  };

  /**
   * Draw a single theme card
   */
  const drawThemeCard = (
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
    if (titleText.length > 20) {
      titleFontSize = 13;
    } else if (titleText.length > 30) {
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
    if (theme.category === 'Libre') {
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

    // Duration (bottom)
    const durationY = y + height - 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    const durationText = theme.duration.value || '-';

    // Center the duration text
    const durationWidth = doc.getTextWidth(durationText);
    doc.text(durationText, x + (width - durationWidth) / 2, durationY);
  };

  return {
    exportBarilletToPdf,
  };
}
