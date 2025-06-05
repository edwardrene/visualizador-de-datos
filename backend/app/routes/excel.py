from fastapi import APIRouter, UploadFile, File, Query, Form, Body, HTTPException
from typing import List, Optional
from backend.app.services.excel_reader import read_excel_file
import pandas as pd
import numpy as np
import os
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "uploaded_files"

@router.post("/upload-excel", tags=["Excel"])
async def upload_excel(
    area: str = Form(...),
    file: UploadFile = File(...),
    x_column: str | None = Query(default=None, title="Columna para el eje X"),
    y_column: str | None = Query(default=None, title="Columna para el eje Y"),
    min_y: float | None = Query(default=None, title="Valor mínimo Y"),
    max_y: float | None = Query(default=None, title="Valor máximo Y"),
    min_x: float | None = Query(default=None, title="Valor mínimo X"),
    max_x: float | None = Query(default=None, title="Valor máximo X"),
    categoria: str | None = Query(default=None, title="Categoría"),
    categoria_y: str | None = Query(default=None, title="Categoría Y"),
    fecha_inicio: str | None = Query(default=None, title="Fecha inicio"),
    fecha_fin: str | None = Query(default=None, title="Fecha fin"),
    contiene_x: str | None = Query(default=None, title="Contiene en X"),
    contiene_y: str | None = Query(default=None, title="Contiene en Y")
):
    try:
        contents = await file.read()
        data = read_excel_file(
            file.filename, 
            contents,
            x_column, 
            y_column,
            min_y, 
            max_y,
            min_x, 
            max_x,
            categoria, 
            categoria_y, 
            fecha_inicio, 
            fecha_fin, 
            contiene_x, 
            contiene_y
        )
        return data
        
    except Exception as e:
        print(f"Error en el servidor: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/filter-data", tags=["Excel"])
async def filter_data(
    area: str = Body(...),
    data: List[dict] = Body(...),
    x_column: str | None = Query(None),
    y_column: str | None = Query(None),
    min_y: float | None = Query(None),
    max_y: float | None = Query(None),
    min_x: float | None = Query(None),
    max_x: float | None = Query(None),
    categoria: str | None = Query(None),
    categoria_y: str | None = Query(None),
    fecha_inicio: str | None = Query(None),
    fecha_fin: str | None = Query(None),
    contiene_x: str | None = Query(None),
    contiene_y: str | None = Query(None)
):
    try:
        # Convertir los datos a DataFrame
        df = pd.DataFrame(data)
        filtered_df = df.copy()

        # Identificar columnas numéricas
        numeric_columns = df.select_dtypes(include=[np.number]).columns

        # Asegurar que las columnas X e Y sean numéricas si se van a filtrar
        if (min_x is not None or max_x is not None) and x_column in df.columns:
            filtered_df[x_column] = pd.to_numeric(filtered_df[x_column], errors='coerce')
            numeric_columns = numeric_columns.append(pd.Index([x_column]))
            
        if (min_y is not None or max_y is not None) and y_column in df.columns:
            filtered_df[y_column] = pd.to_numeric(filtered_df[y_column], errors='coerce')
            numeric_columns = numeric_columns.append(pd.Index([y_column]))

        # Aplicar filtros numéricos
        if min_x is not None and x_column in df.columns:
            filtered_df = filtered_df[filtered_df[x_column] >= float(min_x)]
        if max_x is not None and x_column in df.columns:
            filtered_df = filtered_df[filtered_df[x_column] <= float(max_x)]
        if min_y is not None and y_column in df.columns:
            filtered_df = filtered_df[filtered_df[y_column] >= float(min_y)]
        if max_y is not None and y_column in df.columns:
            filtered_df = filtered_df[filtered_df[y_column] <= float(max_y)]
        
        # Filtros numéricos para X e Y (solo para columnas numéricas)
        if min_x is not None and x_column in numeric_columns:
            filtered_df = filtered_df[filtered_df[x_column] >= float(min_x)]
        if max_x is not None and x_column in numeric_columns:
            filtered_df = filtered_df[filtered_df[x_column] <= float(max_x)]
        if min_y is not None and y_column in numeric_columns:
            filtered_df = filtered_df[filtered_df[y_column] >= float(min_y)]
        if max_y is not None and y_column in numeric_columns:
            filtered_df = filtered_df[filtered_df[y_column] <= float(max_y)]
            
        # Filtros de categoría (mantener como strings)
        if categoria and x_column in df.columns:
            filtered_df = filtered_df[filtered_df[x_column].astype(str) == str(categoria)]
        if categoria_y and y_column in df.columns:
            filtered_df = filtered_df[filtered_df[y_column].astype(str) == str(categoria_y)]
            
        # Filtros de fecha
        try:
            if fecha_inicio and x_column in df.columns:
                fecha_inicio = pd.to_datetime(fecha_inicio)
                filtered_df[x_column] = pd.to_datetime(filtered_df[x_column])
                filtered_df = filtered_df[filtered_df[x_column] >= fecha_inicio]
            if fecha_fin and x_column in df.columns:
                fecha_fin = pd.to_datetime(fecha_fin)
                if not pd.api.types.is_datetime64_any_dtype(filtered_df[x_column]):
                    filtered_df[x_column] = pd.to_datetime(filtered_df[x_column])
                filtered_df = filtered_df[filtered_df[x_column] <= fecha_fin]
        except Exception as e:
            print(f"Error al procesar fechas: {str(e)}")
            
        # Filtros de contenido
        if contiene_x and x_column in df.columns:
            filtered_df = filtered_df[filtered_df[x_column].astype(str).str.contains(str(contiene_x), case=False, na=False)]
        if contiene_y and y_column in df.columns:
            filtered_df = filtered_df[filtered_df[y_column].astype(str).str.contains(str(contiene_y), case=False, na=False)]

        # Reemplazar valores NaN, inf y -inf antes de convertir a diccionario
        for column in filtered_df.columns:
            if pd.api.types.is_numeric_dtype(filtered_df[column]) and column in numeric_columns:
                filtered_df[column] = filtered_df[column].replace([np.inf, -np.inf], np.nan)
                filtered_df[column] = filtered_df[column].fillna(0)
            else:
                filtered_df[column] = filtered_df[column].fillna('')
        
        # Convertir el DataFrame filtrado a diccionario
        result = {
            "data": filtered_df.to_dict('records'),
            "columns": filtered_df.columns.tolist()
        }
        
        return result
        
    except Exception as e:
        print(f"Error al filtrar los datos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))