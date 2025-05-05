from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.services.excel_reader import read_excel_file

router = APIRouter()

@router.post("/upload-excel", tags=["Excel"])
async def upload_excel(file: UploadFile = File(...)):
    allowed_extensions = (".xlsx", ".xls", ".csv")
    if not file.filename.endswith(allowed_extensions):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos .xlsx, .xls o .csv")
    
    content = await file.read()
    try:
        data = read_excel_file(file.filename, content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al procesar el archivo: {str(e)}")
    
    return {
        "columns": list(data.columns),
        "rows": data.to_dict(orient="records")
    }