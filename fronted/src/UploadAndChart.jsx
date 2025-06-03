import { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./index.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
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
        body: formData,
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
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4CAF50",
            "#9C27B0",
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-green-800 text-white p-4 space-y-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Áreas</h2>
        <ul className="space-y-2">
          <li>Inicio</li>
          <li>Reportes</li>
          <li>Configuración</li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-4 bg-green-500 p-4 rounded">
          <img src="images/IMAGOTIPO HORIZONTAL BLANCO.png" alt="Logo UdeC" className="h-12" />
          <div className="flex gap-4 items-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="text-sm font-medium px-2 py-1.5 bg-green-700 text-white rounded hover:bg-green-800"
            />
            <button
              onClick={handleUpload}
              className="text-sm font-medium px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              Subir archivo
            </button>
            <button className="text-sm font-medium px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800">
              Exportar datos
            </button>
          </div>
        </header>

        {/* Filtros */}
        <div className="border-b pb-2 mb-4 bg-gray-100 p-4 rounded">
          <h2 className="font-semibold text-lg mb-2">Filtros</h2>
          <div className="grid grid-cols-4 gap-2 text-sm">(pendiente de implementar)</div>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Reporte */}
        <section id="reporte" className="w-full h-[500px] border bg-white overflow-auto p-4">
          {chartData && (
            <div className="chart-container mb-6">
              <Pie data={chartData} />
            </div>
          )}

          {rows.length > 0 && (
            <div className="table-container overflow-auto">
              <table className="min-w-full border">
                <thead>
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} className="border p-2 bg-gray-200 text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((col) => (
                        <td key={col} className="border p-2">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
