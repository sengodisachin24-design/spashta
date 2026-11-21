import { jsPDF } from 'jspdf';
import { MoodRecord, UserProfile } from '../types';

interface ExportPdfOptions {
  user: UserProfile;
  moods: MoodRecord[];
  timeframe: string;
  summaryText: string;
  gentleSuggestions: string[];
  totalBricksEarned: number;
  completedHousesCount: number;
}

export const generateMoodHistoryPdf = ({
  user,
  moods,
  timeframe,
  summaryText,
  gentleSuggestions,
  totalBricksEarned,
  completedHousesCount,
}: ExportPdfOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // Header Banner
  doc.setFillColor(41, 43, 66); // Deep midnight navy #292B42
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Brand Name
  doc.setTextColor(255, 227, 154); // Warm golden yellow #FFE39A
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SPASHTA', 20, 20);

  doc.setTextColor(169, 216, 245); // Sky blue
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('A little clarity. A world of possibilities.', 20, 27);

  // Document Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('MOOD HISTORY & PERSONAL CLARITY REPORT', pageWidth - 20, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Period: ${timeframe}`, pageWidth - 20, 29, { align: 'right' });

  currentY = 52;

  // Participant Metadata Box
  doc.setFillColor(255, 240, 217); // Warm ivory #FFF0D9
  doc.roundedRect(20, currentY, pageWidth - 40, 24, 3, 3, 'F');
  doc.setDrawColor(255, 227, 154);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, currentY, pageWidth - 40, 24, 3, 3, 'S');

  doc.setTextColor(41, 43, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Companion Member: ${user.fullName}`, 26, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Email: ${user.email}`, 26, currentY + 15);

  doc.setFont('helvetica', 'bold');
  doc.text(`Total Clarity Bricks: ${totalBricksEarned}`, pageWidth - 70, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Houses in City: ${completedHousesCount}`, pageWidth - 70, currentY + 15);

  currentY += 34;

  // Section 1: Executive Summary & Observations
  doc.setTextColor(41, 43, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('1. Journey Overview & Emotional Clarity', 20, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(70, 75, 95);

  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 40);
  doc.text(splitSummary, 20, currentY);
  currentY += splitSummary.length * 5 + 6;

  // Section 2: Mood Distribution Analysis
  doc.setTextColor(41, 43, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('2. Mood Breakdown & Frequency', 20, currentY);
  currentY += 8;

  // Compute distribution
  const counts: Record<string, number> = {};
  moods.forEach(m => {
    counts[m.mood] = (counts[m.mood] || 0) + 1;
  });

  const moodsList = Object.entries(counts);
  if (moodsList.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.text('No mood check-ins recorded during this timeframe.', 20, currentY);
    currentY += 8;
  } else {
    let cardX = 20;
    moodsList.slice(0, 4).forEach(([mName, count]) => {
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(cardX, currentY, 38, 18, 2, 2, 'F');
      doc.setTextColor(41, 43, 66);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${count}x`, cardX + 19, currentY + 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 105, 125);
      doc.text(mName.toUpperCase(), cardX + 19, currentY + 14, { align: 'center' });
      cardX += 42;
    });
    currentY += 26;
  }

  // Section 3: Check-in Log Table
  doc.setTextColor(41, 43, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('3. Recorded Check-In Entries', 20, currentY);
  currentY += 6;

  // Table header
  doc.setFillColor(201, 184, 242); // Dreamy lavender
  doc.rect(20, currentY, pageWidth - 40, 7, 'F');
  doc.setTextColor(41, 43, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DATE', 24, currentY + 5);
  doc.text('REPORTED MOOD', 60, currentY + 5);
  doc.text('INTENSITY', 105, currentY + 5);
  doc.text('SOURCE & NOTES', 135, currentY + 5);
  currentY += 9;

  // Rows
  const recentRecords = moods.slice(-8).reverse();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  recentRecords.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 253);
      doc.rect(20, currentY - 3, pageWidth - 40, 6, 'F');
    }
    doc.setTextColor(50, 55, 75);
    doc.text(new Date(item.timestamp).toLocaleDateString(), 24, currentY + 1);
    doc.text(item.mood, 60, currentY + 1);
    doc.text(`${item.intensity}/5`, 105, currentY + 1);
    const notePreview = (item.note || item.source === 'chat_reflection' ? 'Conversation Reflection' : 'Daily Check-in').substring(0, 32);
    doc.text(notePreview, 135, currentY + 1);
    currentY += 6;
  });

  currentY += 8;

  // Section 4: Gentle Non-Diagnostic Suggestions
  doc.setTextColor(41, 43, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('4. Mindful Suggestions & Gentle Habits', 20, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 75, 95);

  gentleSuggestions.forEach(sug => {
    doc.text(`• ${sug}`, 22, currentY);
    currentY += 5;
  });

  currentY += 6;

  // Footer / Disclaimer Box
  doc.setFillColor(245, 246, 250);
  doc.roundedRect(20, currentY, pageWidth - 40, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 70, 70);
  doc.text('IMPORTANT WELLBEING & DATA LIMITATIONS DISCLAIMER:', 24, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 95, 110);
  const disclaimer = 'SPASHTA is an AI companion designed to support reflection and everyday conversations. It does NOT replace human connection, professional mental health care or emergency services. This report is derived from self-reported check-ins and conversational reflections, not clinical diagnostic tests.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 48);
  doc.text(splitDisclaimer, 24, currentY + 11);

  // Save the document
  doc.save(`SPASHTA_Mood_Report_${user.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
