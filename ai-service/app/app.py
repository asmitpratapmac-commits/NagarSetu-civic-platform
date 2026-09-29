from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.ai_routes import router as ai_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="NagarSetu AI Service",
        description="Modular AI microservice for civic complaint classification, "
        "severity/priority prediction, image-based issue detection, duplicate "
        "detection, and summarization.",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # internal service, called only by the trusted Node backend
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(ai_router)

    return app
