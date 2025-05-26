// export-csv.js
// Utility to export quotes to CSV from EJS-rendered lists
function exportQuotesToCSV(quotes, filename) {
  const csvRows = [
    'Quote,Answer,Reason',
    ...quotes.map(q => `"${q.quote.replace(/"/g, '""')}","${q.answer.replace(/"/g, '""')}","${q.reason.replace(/"/g, '""')}`)
  ];
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportFavoritesToCSV(favorites, filename) {
  const csvRows = [
    'Quote,Character,Movie',
    ...favorites.map(f => `"${f.quote.replace(/"/g, '""')}","${f.characterName.replace(/"/g, '""')}","${f.movieName.replace(/"/g, '""')}`)
  ];
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
