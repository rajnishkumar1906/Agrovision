# Crop Recommendation Service (FastAPI)

This is the canonical crop recommendation microservice used by the API gateway.

## API

- `GET /` - health check
- `POST /recommend` - predict best crop from soil/weather inputs

## Model assets

This service uses:

- `model.pkl`
- `standscaler.pkl`
- `minmaxscaler.pkl`

Optional:

- Set `MODEL_H5_PATH` to load a Keras `.h5` model for prediction.

## Migrated important assets from legacy `CropRecommendation-py`

To keep one clear source under `agri-microservice`, the following were copied here:

- `data/Crop_recommendation.csv`
- `notebooks/Crop_Classification_With_Recommendation_System.ipynb`
- `docs/ARCHITECTURE_SUMMARY.md`
- `docs/NOTEBOOK_WORKFLOW_SUMMARY.md`

`templates/` and old Flask UI files were intentionally not moved, because this project uses the React frontend.

