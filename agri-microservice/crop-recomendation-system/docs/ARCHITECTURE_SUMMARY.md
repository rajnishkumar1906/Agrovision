# Crop Recommendation System - Architecture & Interview Summary

## Overall Architecture
This project is a machine learning-powered web application for crop recommendation. It consists of:
- **Frontend**: HTML (Bootstrap) rendered via Flask templates.
- **Backend**: Python Flask server handling requests, running ML inference, and serving predictions.
- **ML Workflow**: Jupyter Notebook for data analysis, model training, and exporting trained models.
- **Deployment**: Dockerized application with CI/CD pipeline for automated builds and pushes.

## Database Schemas & Models
- **No traditional database** is used. Data is loaded from a CSV file (`Crop_recommendation.csv`) for training.
- **ML Model**: Trained using scikit-learn (RandomForestClassifier, MinMaxScaler, etc.), serialized as `model.pkl` and `minmaxscaler.pkl`.
- **Input Features**: Nitrogen, Phosphorus, Potassium, Temperature, Humidity, pH, Rainfall.
- **Output**: Crop label (mapped to integer, then to crop name).

## Important APIs & Flows
- **`/` (GET)**: Renders the main form for user input.
- **`/predict` (POST)**: Receives form data, preprocesses inputs, runs them through the scaler and model, and returns the recommended crop.
  - Input: Form fields for soil and climate parameters.
  - Output: Crop recommendation displayed on the frontend.

## Frontend Structure
- **HTML Template**: `templates/index.html` uses Bootstrap for styling and layout.
- **Form**: Collects user inputs for all required features.
- **Result Display**: Shows the recommended crop and an image if available.

## Tech Stack Used
- **Languages**: Python (Flask, scikit-learn, numpy, pandas), HTML/CSS (Bootstrap)
- **ML Libraries**: scikit-learn
- **Web Framework**: Flask
- **Deployment**: Docker
- **CI/CD**: GitHub Actions for Docker build and push

## Deployment Workflow
- **Dockerfile**: Defines Python environment, installs dependencies, exposes Flask port, runs the app.
- **GitHub Actions**: On push to `main`, builds Docker image and pushes to Docker Hub using secrets for authentication.

---

## Interview Summary
This project is a full-stack machine learning web app for crop recommendation. The backend is built with Flask, serving a Bootstrap-powered frontend. The ML model is trained in a Jupyter Notebook using scikit-learn, with the trained model and scaler exported as pickle files. User inputs are collected via a web form, processed, and passed to the model for prediction. The app is containerized with Docker and uses GitHub Actions for CI/CD, automating builds and deployment to Docker Hub. No traditional database is used; all data is handled in-memory or via CSV for training. The architecture is modular, separating ML, web, and deployment concerns for maintainability and scalability.
