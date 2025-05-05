# backend/app/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Backend funcionando correctamente"}


from backend.app.routes import excel

app.include_router(excel.router)