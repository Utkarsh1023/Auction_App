import * as XLSX from "xlsx";

export default function AddPlayerExcel({ setPlayers }) {
  const handleFile = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = evt => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      // Log column headers from the first row
      if (json.length > 0) {
        console.log('Column headers in Excel:', Object.keys(json[0]));
      }

      const formatted = json.map(p => {
        const basePriceStr = p.basePrice || p['Base Price'] || p.BasePrice || p['base price'] || p['basePrice '] || '0';
        const basePrice = parseFloat(basePriceStr.toString().replace(/[^\d.]/g, '')) || 0;

        // Log original basePriceStr and parsed basePrice for each player
        console.log(`Player: ${p.name || p.Name || p['Player Name'] || 'Unknown'}, Original basePriceStr: "${basePriceStr}", Parsed basePrice: ${basePrice}`);

        return {
          name: p.name || p.Name || p['Player Name'] || '',
          reg: p.reg || p.Reg || p['Registration No'] || '',
          year: p.year || p.Year || '',
          basePrice: basePrice,
          sold: false
        };
      });

      setPlayers(prev => [...prev, ...formatted]);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <h3>Upload Players File</h3>
      <input type="file" accept=".xlsx,.csv" onChange={handleFile} />
    </>
  );
}
