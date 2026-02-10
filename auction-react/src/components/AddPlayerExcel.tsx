import * as XLSX from "xlsx";
import type { Player } from "../types";

interface AddPlayerExcelProps {
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

export default function AddPlayerExcel({ setPlayers }: AddPlayerExcelProps) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      // Log column headers from the first row
      if (json.length > 0) {
        console.log('Column headers in Excel:', Object.keys(json[0] as object));
      }

      const formatted: Player[] = json.map((p: any) => {
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
      <h3>Upload Player's File</h3>
      <input type="file" accept=".xlsx,.csv" onChange={handleFile} />
    </>
  );
}
