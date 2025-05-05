import pandas as pd
from io import BytesIO

def read_excel_file(filename: str, file_bytes: bytes) -> pd.DataFrame:
    if filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(file_bytes))
    elif filename.endswith((".xls", ".xlsx")):
        df = pd.read_excel(BytesIO(file_bytes))
    else:
        raise ValueError("Formato de archivo no soportado")

    if df.columns.isnull().any() or any(str(col).strip() == "" for col in df.columns):
        raise ValueError("El archivo contiene columnas vacías, lo cual no está permitido.")

    df = df.where(pd.notnull(df), None)

    return df
