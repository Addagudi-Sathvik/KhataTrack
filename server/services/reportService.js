import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export function createPdfReport(expenses, summary) {
  const doc = new PDFDocument({ margin: 40 });
  doc.fontSize(18).text('KhataTrack Financial Report');
  doc.moveDown().fontSize(11).text(`Income: INR ${summary.income}`);
  doc.text(`Expenses: INR ${summary.expenses}`);
  doc.text(`Savings: INR ${summary.savings}`);
  doc.moveDown();
  expenses.forEach((expense) => {
    doc.text(`${expense.date.toISOString().slice(0, 10)} | ${expense.category} | ${expense.description} | INR ${expense.amount}`);
  });
  return doc;
}

export async function createExcelReport(expenses) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Transactions');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Description', key: 'description', width: 32 },
    { header: 'Payment Method', key: 'paymentMethod', width: 16 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Notes', key: 'notes', width: 32 }
  ];
  expenses.forEach((expense) => {
    sheet.addRow({
      date: expense.date.toISOString().slice(0, 10),
      type: expense.type,
      category: expense.category,
      description: expense.description,
      paymentMethod: expense.paymentMethod,
      amount: expense.amount,
      notes: expense.notes || ''
    });
  });
  return workbook.xlsx.writeBuffer();
}

export function createCsvReport(expenses) {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Payment Method', 'Amount', 'Notes'];
  const rows = expenses.map((expense) => [
    expense.date.toISOString().slice(0, 10),
    expense.type,
    expense.category,
    expense.description,
    expense.paymentMethod,
    expense.amount,
    expense.notes || ''
  ]);

  return [headers, ...rows]
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? '');
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(',')
    )
    .join('\n');
}
