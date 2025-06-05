import pandas as pd
from io import BytesIO
import logging
import numpy as np

logger = logging.getLogger(__name__)

def read_excel_file(
    filename: str,
    file_bytes: bytes,
    x_column: str = None,
    y_column: str = None,
    min_y: float = None,
    max_y: float = None,
    min_x: float = None,
    max_x: float = None,
    categoria: str = None,
    categoria_y: str = None,
    fecha_inicio: str = None,
    fecha_fin: str = None,
    contiene_x: str = None,
    contiene_y: str = None
) -> dict:
    logger.info(f"Leyendo archivo {filename} con x_column={x_column} y_column={y_column}")
    if filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(file_bytes))
    elif filename.endswith((".xls", ".xlsx")):
        df = pd.read_excel(BytesIO(file_bytes))
    else:
        raise ValueError("Formato de archivo no soportado")
    

    # Reemplazar nulos y espacios en blanco por 0 (número)
    df = df.fillna(0)
    df = df.replace(r'^\s*$', 0, regex=True)

    if x_column and y_column:
        if x_column not in df.columns or y_column not in df.columns:
            raise ValueError("Las columnas especificadas no existen en el archivo.")

        # Filtro por categoría exacta en X
        if categoria is not None and categoria != "":
            df = df[df[x_column].astype(str) == str(categoria)]

        # Filtro por categoría exacta en Y
        if categoria_y is not None and categoria_y != "":
            df = df[df[y_column].astype(str) == str(categoria_y)]

        # Filtro contiene en X
        if contiene_x is not None and contiene_x != "":
            df = df[df[x_column].astype(str).str.contains(contiene_x, case=False, na=False)]

        # Filtro contiene en Y
        if contiene_y is not None and contiene_y != "":
            df = df[df[y_column].astype(str).str.contains(contiene_y, case=False, na=False)]

        # Filtro por fechas (si x_column es fecha)
        if fecha_inicio or fecha_fin:
            try:
                df[x_column] = pd.to_datetime(df[x_column])
                if fecha_inicio:
                    df = df[df[x_column] >= pd.to_datetime(fecha_inicio)]
                if fecha_fin:
                    df = df[df[x_column] <= pd.to_datetime(fecha_fin)]
            except ValueError as e:
                logger.warning(f"No se pudo convertir {x_column} a fecha: {e}")
                raise ValueError(f"Formato de fecha incorrecto en la columna {x_column}")

        # Filtro por min_x y max_x (si x_column es numérico)
        if min_x is not None or max_x is not None:
            try:
                df[x_column] = pd.to_numeric(df[x_column])
                if min_x is not None:
                    df = df[df[x_column] >= min_x]
                if max_x is not None:
                    df = df[df[x_column] <= max_x]
            except ValueError as e:
                logger.warning(f"No se pudo convertir {x_column} a número: {e}")
                raise ValueError(f"La columna {x_column} debe contener valores numéricos")

        # Filtro por min_y y max_y (si y_column es numérico)
        if min_y is not None or max_y is not None:
            try:
                df[y_column] = pd.to_numeric(df[y_column])
                if min_y is not None:
                    df = df[df[y_column] >= min_y]
                if max_y is not None:
                    df = df[df[y_column] <= max_y]
            except ValueError as e:
                logger.warning(f"No se pudo convertir {y_column} a número: {e}")
                raise ValueError(f"La columna {y_column} debe contener valores numéricos")

        # Convertir las columnas a numérico antes de crear el gráfico
        df[x_column] = pd.to_numeric(df[x_column], errors='coerce')
        df[y_column] = pd.to_numeric(df[y_column], errors='coerce')

        # Reemplazar NaN, inf, -inf por 0 antes de devolver
        df[x_column] = df[x_column].replace([np.nan, np.inf, -np.inf], 0)
        df[y_column] = df[y_column].replace([np.nan, np.inf, -np.inf], 0)

        # Preparar los datos para el gráfico de líneas
        labels = df[x_column].tolist()
        data = df[y_column].tolist()

        # Asegurar que no haya valores no serializables en las listas
        labels = [0 if (pd.isna(x) or x in [np.inf, -np.inf]) else x for x in labels]
        data = [0 if (pd.isna(y) or y in [np.inf, -np.inf]) else y for y in data]

        # Datos para la tabla SIEMPRE
        table_data = df.astype(str).replace(r'^\s*$', "0", regex=True).replace("nan", "0").to_dict(orient='records')

        return {
            "labels": labels,
            "datasets": [
                {
                    "label": y_column,
                    "data": data,
                    "borderColor": "rgba(75,192,192,1)",
                    "backgroundColor": "rgba(75,192,192,0.2)",
                }
            ],
            "data": table_data
        }
    elif x_column:
        if x_column not in df.columns:
            raise ValueError("La columna X especificada no existe en el archivo.")
        
        # Filtro por min_x y max_x (si x_column es numérico)
        if min_x is not None or max_x is not None:
            df[x_column] = pd.to_numeric(df[x_column], errors='coerce')
            if min_x is not None:
                df = df[df[x_column] >= min_x]
            if max_x is not None:
                df = df[df[x_column] <= max_x]

        # Reemplazar NaN, inf, -inf por 0 antes de devolver
        df[x_column] = df[x_column].replace([np.nan, np.inf, -np.inf], 0)
        
        data = df[[x_column]].astype(str).replace(r'^\s*$', "0", regex=True).replace("nan", "0").to_dict(orient='records')
        return {
            "data": data
        }
    elif y_column:
        if y_column not in df.columns:
            raise ValueError("La columna Y especificada no existe en el archivo.")
            
        # Filtro por min_y y max_y (si y_column es numérico)
        if min_y is not None or max_y is not None:
            df[y_column] = pd.to_numeric(df[y_column], errors='coerce')
            if min_y is not None:
                df = df[df[y_column] >= min_y]
            if max_y is not None:
                df = df[df[y_column] <= max_y]

        # Reemplazar NaN, inf, -inf por 0 antes de devolver
        df[y_column] = df[y_column].replace([np.nan, np.inf, -np.inf], 0)
        
        data = df[[y_column]].astype(str).replace(r'^\s*$', "0", regex=True).replace("nan", "0").to_dict(orient='records')
        return {
            "data": data
        }
    else:
        # Si no se seleccionan columnas, devuelve todo el archivo
        df = df.replace([np.nan, np.inf, -np.inf], 0)
        data = df.astype(str).replace(r'^\s*$', "0", regex=True).replace("nan", "0").to_dict(orient='records')
        return {"data": data}