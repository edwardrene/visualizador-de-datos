import React, { useState, useEffect, useRef } from "react";
import escudoLogo from "./assets/escudo.png";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartTypes = [
  { type: "line", name: "Gráfico de líneas" },
  { type: "bar", name: "Gráfico de barras" },
  { type: "pie", name: "Gráfico de pastel" },
  { type: "table", name: "Tabla" },
];

const areas = [
  { id: "compras", name: "Compras de almacén" },
  { id: "recursos", name: "Recursos físicos" },
  { id: "apoyo", name: "Apoyo académico" },
  { id: "gimnasio", name: "Gimnasio" },
];

function UploadAndChart() {
  // Estados por área
  const [almacenData, setAlmacenData] = useState(null);
  const [recursosData, setRecursosData] = useState(null);
  const [apoyoData, setApoyoData] = useState(null);
  const [gimnasioData, setGimnasioData] = useState(null);

  // Estado general
  const [activeArea, setActiveArea] = useState("compras");
  const [activeChart, setActiveChart] = useState("line");
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [columnNames, setColumnNames] = useState([]);
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [minY, setMinY] = useState("");
  const [maxY, setMaxY] = useState("");
  const [minX, setMinX] = useState("");
  const [maxX, setMaxX] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categoriaY, setCategoriaY] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [contieneX, setContieneX] = useState("");
  const [contieneY, setContieneY] = useState("");
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

    useEffect(() => {
    // Limpiar gráfico anterior cuando cambie el tipo de gráfico
    return () => {
      if (chartRef.current) {
        chartRef.current = null;
      }
    };
  }, [activeChart, xColumn, yColumn]);

  // Limpiar y cargar datos al cambiar de área
  useEffect(() => {
    let areaData = null;
    switch (activeArea) {
      case "compras":
        areaData = almacenData;
        break;
      case "recursos":
        areaData = recursosData;
        break;
      case "apoyo":
        areaData = apoyoData;
        break;
      case "gimnasio":
        areaData = gimnasioData;
        break;
      default:
        break;
    }

    if (areaData?.filters) {
      // Restaurar filtros guardados
      setXColumn(areaData.filters.xColumn || "");
      setYColumn(areaData.filters.yColumn || "");
      setMinY(areaData.filters.minY || "");
      setMaxY(areaData.filters.maxY || "");
      setMinX(areaData.filters.minX || "");
      setMaxX(areaData.filters.maxX || "");
      setCategoria(areaData.filters.categoria || "");
      setCategoriaY(areaData.filters.categoriaY || "");
      setFechaInicio(areaData.filters.fechaInicio || "");
      setFechaFin(areaData.filters.fechaFin || "");
      setContieneX(areaData.filters.contieneX || "");
      setContieneY(areaData.filters.contieneY || "");
    } else {
      // Limpiar filtros si no hay guardados
      setXColumn("");
      setYColumn("");
      setMinY("");
      setMaxY("");
      setMinX("");
      setMaxX("");
      setCategoria("");
      setCategoriaY("");
      setFechaInicio("");
      setFechaFin("");
      setContieneX("");
      setContieneY("");
    }

    // Actualizar tabla y columnas
    if (areaData && areaData.tableData && areaData.tableData.data && areaData.tableData.data.length > 0) {
      setColumnNames(Object.keys(areaData.tableData.data[0]));
      setTableData(areaData.tableData);
    } else {
      setColumnNames([]);
      setTableData(null);
    }
  }, [activeArea, almacenData, recursosData, apoyoData, gimnasioData]);

  // Manejar cambio de área
  const handleAreaClick = (areaId) => {
    setActiveArea(areaId);
    setActiveChart("line");
  };

  // Manejar cambio de tipo de gráfico
  const handleChartClick = (chartType) => {
    setActiveChart(chartType);
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  // Subir archivo al backend y guardar por área
  const handleUpload = async (areaId) => {
    if (!file) {
      setError("Por favor, selecciona un archivo.");
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    // Send area as a FormData field
    formData.append("area", areaId);

    try {
        const response = await fetch("http://127.0.0.1:8000/upload-excel", {
          method: "POST",
          body: formData,
          headers: {
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al subir el archivo: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        // Guardar datos por área incluyendo una copia de los datos originales
        switch (areaId) {
          case "compras":
            setAlmacenData({ 
              tableData: { ...data },  // Datos actuales
              originalData: { ...data },  // Copia de los datos originales
              ...data 
            });
            break;
          case "recursos":
            setRecursosData({ 
              tableData: { ...data },
              originalData: { ...data },
              ...data 
            });
            break;
          case "apoyo":
            setApoyoData({ 
              tableData: { ...data },
              originalData: { ...data },
              ...data 
            });
            break;
          case "gimnasio":
            setGimnasioData({ 
              tableData: { ...data },
              originalData: { ...data },
              ...data 
            });
            break;
          default:
            break;
        }
        
        setTableData(data);
        setFileData(data);
        if (data.data && data.data.length > 0) {
          setColumnNames(Object.keys(data.data[0]));
        }
        setError(null);
      } catch (err) {
        setError("Error al subir el archivo.");
      }
    };

  // Filtrar datos usando el backend, solo si hay archivo para el área
  const handleFilter = async (areaId) => {
    let areaData = null;
    switch (areaId) {
      case "compras":
        areaData = almacenData;
        break;
      case "recursos":
        areaData = recursosData;
        break;
      case "apoyo":
        areaData = apoyoData;
        break;
      case "gimnasio":
        areaData = gimnasioData;
        break;
      default:
        break;
    }
    
    if (!areaData || !areaData.tableData || !areaData.tableData.data) {
      setError("Por favor, sube un archivo para esta área primero.");
      return;
    }

    try {
      // Construir el objeto de parámetros de filtro
      const filterParams = {
        x_column: xColumn || null,
        y_column: yColumn || null,
        min_y: minY ? Number(minY) : null,
        max_y: maxY ? Number(maxY) : null,
        min_x: minX ? Number(minX) : null,
        max_x: maxX ? Number(maxX) : null,
        categoria: categoria || null,
        categoria_y: categoriaY || null,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        contiene_x: contieneX || null,
        contiene_y: contieneY || null
      };

      // Construir query string solo con parámetros definidos
      const queryParams = Object.entries(filterParams)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await fetch(
        `http://127.0.0.1:8000/filter-data?${queryParams}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            area: areaId,
            data: areaData.tableData.data
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al filtrar los datos: ${errorText}`);
      }

      const data = await response.json();

      // Actualizar datos del área actual
      const updatedData = {
        ...areaData,
        tableData: data,
        filters: {
          xColumn,
          yColumn,
          minY,
          maxY,
          minX,
          maxX,
          categoria,
          categoriaY,
          fechaInicio,
          fechaFin,
          contieneX,
          contieneY
        }
      };

      switch (areaId) {
        case "compras":
          setAlmacenData(updatedData); // Eliminar las llaves extras
          break;
        case "recursos":
          setRecursosData(updatedData); // Eliminar las llaves extras
          break;
        case "apoyo":
          setApoyoData(updatedData); // Eliminar las llaves extras
          break;
        case "gimnasio":
          setGimnasioData(updatedData); // Eliminar las llaves extras
          break;
        default:
          break;
      }

      setTableData(data);
      setError(null);
    } catch (err) {
      console.error("Error al filtrar:", err);
      setError(err.message || "Error al filtrar los datos.");
    }
  };

const handleResetFilters = (areaId) => {
  let areaData = null;
  switch (areaId) {
    case "compras":
      areaData = almacenData;
      if (areaData?.originalData) {
        setTableData({...areaData.originalData});
        setAlmacenData({
          ...areaData,
          tableData: {...areaData.originalData},
          filters: {}
        });
      }
      break;
    case "recursos":
      areaData = recursosData;
      if (areaData?.originalData) {
        setTableData({...areaData.originalData});
        setRecursosData({
          ...areaData,
          tableData: {...areaData.originalData},
          filters: {}
        });
      }
      break;
    case "apoyo":
      areaData = apoyoData;
      if (areaData?.originalData) {
        setTableData({...areaData.originalData});
        setApoyoData({
          ...areaData,
          tableData: {...areaData.originalData},
          filters: {}
        });
      }
      break;
    case "gimnasio":
      areaData = gimnasioData;
      if (areaData?.originalData) {
        setTableData({...areaData.originalData});
        setGimnasioData({
          ...areaData,
          tableData: {...areaData.originalData},
          filters: {}
        });
      }
      break;
    default:
      break;
  }

  // Limpiar todos los filtros
  setXColumn("");
  setYColumn("");
  setMinY("");
  setMaxY("");
  setMinX("");
  setMaxX("");
  setCategoria("");
  setCategoriaY("");
  setFechaInicio("");
  setFechaFin("");
  setContieneX("");
  setContieneY("");

  document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], select').forEach(input => {
    input.value = "";
  });
  
  setError(null);
};
  // Renderizar tabla
  const renderTable = () => {
    if (!tableData || !tableData.data) return <p>No hay datos para mostrar.</p>;
    const data = tableData.data;
    if (!data || data.length === 0) return <p>No hay datos para mostrar.</p>;
    const columns = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-2">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column} className="border px-4 py-2">
                    {row[column] === null || row[column] === undefined || row[column] === "" || row[column] === "nan" ? "0" : row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Opciones de gráficos (puedes personalizar)
  const lineOptions = { responsive: true, plugins: { legend: { position: "top" } } };
  const barOptions = { responsive: true, plugins: { legend: { position: "top" } } };
  const pieOptions = { responsive: true, plugins: { legend: { position: "top" } } };

  // Renderizar gráfico según área y tipo
const renderChart = () => {

  if (activeChart === 'table') {
    return renderTable();
  }

  let areaData;
  switch (activeArea) {
    case "compras":
      areaData = almacenData;
      break;
    case "recursos":
      areaData = recursosData;
      break;
    case "apoyo":
      areaData = apoyoData;
      break;
    case "gimnasio":
      areaData = gimnasioData;
      break;
    default:
      return null;
  }

  if (!areaData?.tableData?.data || !xColumn || !yColumn) return null;

  const data = areaData.tableData.data;
  
  // Preparar datos según el tipo de gráfico
  const chartData = {
    labels: data.map(row => row[xColumn]),
    datasets: [{
      label: yColumn,
      data: data.map(row => row[yColumn]),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: activeChart === 'pie' ?
        data.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`) :
        'rgba(75, 192, 192, 0.2)',
    }]
  };

  // Configuraciones específicas para cada tipo de gráfico
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: activeChart === 'pie' ? 'right' : 'top',
      },
      title: {
        display: true,
        text: `${yColumn} vs ${xColumn}`
      }
    },
    scales: activeChart === 'pie' ? undefined : {
      y: {
        beginAtZero: true,
      }
    }
  };

  // Renderizar el gráfico según el tipo seleccionado
  switch (activeChart) {
    case 'line':
      return (
        <div className="chart-container mb-6" style={{ position: 'relative', height: '400px', width: '100%' }}>
          <Line data={chartData} options={commonOptions} />
        </div>
      );
    case 'bar':
      return (
        <div className="chart-container mb-6" style={{ position: 'relative', height: '400px', width: '100%' }}>
          <Bar data={chartData} options={commonOptions} />
        </div>
      );
    case 'pie':
      return (
        <div className="chart-container mb-6" style={{ position: 'relative', height: '400px', width: '100%' }}>
          <Pie data={chartData} options={commonOptions} />
        </div>
      );
    case 'table':
      return renderTable();
    default:
      return null;
  }
};

  return (
    <div className="flex h-screen">
      <aside className="w-72 bg-green-800 text-white p-4 space-y-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Áreas</h2>
        <div className="space-y-2">
          {areas.map((area) => (
            <div key={area.id}>
              <button
                className="flex items-center justify-between w-full py-2 px-4 bg-green-700 hover:bg-green-600 rounded"
                onClick={() => handleAreaClick(area.id)}
              >
                {area.name}
                <span>{activeArea === area.id ? "-" : "+"}</span>
              </button>
              {activeArea === area.id && (
                <div className="ml-4 mt-2 space-y-2">
                  {chartTypes.map((chart) => (
                    <button
                      key={chart.type}
                      className={`block w-full py-2 px-4 rounded ${
                        activeChart === chart.type
                          ? "bg-green-300 text-green-900 font-bold"
                          : "bg-green-500 hover:bg-green-400"
                      }`}
                      onClick={() => handleChartClick(chart.type)}
                    >
                      {chart.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-4 bg-green-500 p-4 rounded">
          <img
            src={escudoLogo}
            alt="Logo UdeC"
            className="h-12"
          />
          <div className="flex gap-4 items-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="text-sm font-medium px-2 py-1.5 bg-green-700 text-white rounded hover:bg-green-800"
            />
            <button
              onClick={() => handleUpload(activeArea)}
              className="text-sm font-medium px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              Subir archivo
            </button>
          </div>
        </header>
        <div className="border-b pb-2 mb-4 bg-gray-100 p-4 rounded">
          <div className="flex justify-between items-center mb-2">
  <h2 className="font-semibold text-lg">Filtros</h2>
  <div className="flex gap-2">
    <button
      onClick={() => handleResetFilters(activeArea)}
      className="text-sm font-medium px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1"
      title="Resetear filtros"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
          clipRule="evenodd" 
        />
      </svg>
      Resetear
    </button>
    <button
      onClick={() => handleFilter(activeArea)}
      className="text-sm font-medium px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800 flex items-center gap-1"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" 
          clipRule="evenodd" 
        />
      </svg>
      Buscar
    </button>
  </div>
</div>
          <div className="grid grid-cols-4 gap-2 text-sm items-start">
            <select
              value={xColumn}
              onChange={(e) => setXColumn(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            >
              <option value="">Columna X</option>
              {columnNames.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <select
              value={yColumn}
              onChange={(e) => setYColumn(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            >
              <option value="">Columna Y</option>
              {columnNames.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Valor mínimo Y"
              value={minY}
              onChange={(e) => setMinY(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <input
              type="number"
              placeholder="valor máximo Y"
              value={maxY}
              onChange={(e) => setMaxY(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <input
              type="number"
              placeholder="Valor mínimo X"
              value={minX}
              onChange={(e) => setMinX(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <input
              type="number"
              placeholder="Valor máximo X"
              value={maxX}
              onChange={(e) => setMaxX(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <input
              type="text"
              placeholder="Categoría (valor exacto de X)"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <input
              type="text"
              placeholder="Categoría (valor exacto de Y)"
              value={categoriaY}
              onChange={(e) => setCategoriaY(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <input
              type="date"
              placeholder="Fecha inicio (X)"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <input
              type="date"
              placeholder="Fecha fin (X)"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <input
              type="text"
              placeholder="Contiene en X"
              value={contieneX}
              onChange={(e) => setContieneX(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <input
              type="text"
              placeholder="Contiene en Y"
              value={contieneY}
              onChange={(e) => setContieneY(e.target.value)}
              className="text-sm font-medium px-2 py-1.5 rounded"
            />
            <div className="grid grid-cols-4 gap-2 text-sm">
              {/* ...otros inputs si los agregas... */}
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <section
          id="reporte"
          className="w-full h-[500px] border bg-white overflow-auto p-4"
        >
          <div>
            {renderChart()}
          </div>
        </section>
      </main>
    </div>
  );
}

export default UploadAndChart;