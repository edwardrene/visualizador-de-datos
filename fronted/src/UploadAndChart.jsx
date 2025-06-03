import { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function UploadAndChart() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload-excel", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Error al procesar el archivo");

      const data = await res.json();
      setColumns(data.columns);
      setRows(data.rows);
      generateChartData(data.rows);
      setError(null);
    } catch (err) {
      setError(err.message);
      setRows([]);
      setChartData(null);
    }
  };

  const generateChartData = (rows) => {
    const grouped = {};

    rows.forEach((row) => {
      const categoria = row["Categoría"];
      const cantidad = parseInt(row["Cantidad"]) || 0;

      if (grouped[categoria]) {
        grouped[categoria] += cantidad;
      } else {
        grouped[categoria] = cantidad;
      }
    });

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    setChartData({
      labels,
      datasets: [
        {
          label: "Cantidad por categoría",
          data: values,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
          borderWidth: 1
        }
      ]
    });
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Visualizador de Inventario</h2>

      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Subir y visualizar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {chartData && (
        <div style={{ width: "400px", margin: "2rem auto" }}>
          <Pie data={chartData} />
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ overflowX: "auto", marginTop: "2rem" }}>
          <table border="1" cellPadding="8" style={{ margin: "0 auto" }}>
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td key={col}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UploadAndChart;
