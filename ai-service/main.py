import os
import sys

# Ensure the ai-service root is on the path so `models`, `services`, `routes`, `utils`
# can be imported as top-level packages regardless of the working directory used to launch.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from dotenv import load_dotenv

from app.app import create_app

load_dotenv()

app = create_app()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)
