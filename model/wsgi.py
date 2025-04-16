import os
from gem_rag_new import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))  # Use Render's PORT or default to 5000
    app.run(host="0.0.0.0", port=port)
