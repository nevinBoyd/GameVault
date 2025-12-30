from backend import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)

@app.get("/")
def index():
    return {"status": "ok", "message": "GameVault backend running"}
