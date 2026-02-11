import * as XLSX from "xlsx";
import type { Team } from "../types";

interface AddTeamExcelProps {
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
}

export default function AddTeamExcel({ setTeams }: AddTeamExcelProps) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        // Log column headers from the first row
        if (json.length > 0) {
          console.log('Column headers in Excel:', Object.keys(json[0] as object));
        }

        const formatted: Team[] = json.map((t: any) => {
          try {
            const purseStr = t.purse || t.Purse || t['Purse Amount'] || t['purse'] || '0';
            const purse = parseFloat(purseStr.toString().replace(/[^\d.]/g, '')) || 0;

            // Log original purseStr and parsed purse for each team
            console.log(`Team: ${t.name || t.Name || t['Team Name'] || 'Unknown'}, Original purseStr: "${purseStr}", Parsed purse: ${purse}`);

            const genderStr = t.gender || t.Gender || t['Gender'] || 'Male';
            const genderLower = genderStr.toString().toLowerCase();
            const gender = (genderLower === 'female' || genderLower === 'girl' || genderLower === 'f') ? 'Female' : 'Male';

            return {
              name: t.name || t.Name || t['Team Name'] || '',
              captain: t.captain || t.Captain || t['Captain Name'] || '',
              gender: gender,
              purse: purse,
              squad: []
            };
          } catch (error) {
            console.error('Error parsing team row:', t, error);
            return null; // Skip invalid rows
          }
        }).filter(team => team !== null) as Team[];

        setTeams(prev => [...prev, ...formatted]);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Error processing the uploaded file. Please check the file format and try again.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <h3>Upload Captain's File</h3>
      <input type="file" accept=".xlsx,.csv" onChange={handleFile} />
    </>
  );
}
