# Crop Recommendation System - Notebook Workflow & Explanation

## How You Did This Work (Step-by-Step)

1. **Import Libraries**
   - Imported essential libraries: numpy, pandas, scikit-learn.

2. **Load Data**
   - Loaded crop recommendation data from `Crop_recommendation.csv` into aa pandas DataFrame.
   - Explored the data using `.head()`, `.shape`, `.info()`, `.isnull().sum()`, `.duplicated().sum()`, `.describe()`, and value counts for the label column.

3. **Data Preprocessing**
   - Created a dictionary to map crop names to integer labels.
   - Added a new column `crop_num` to the DataFrame using this mapping.
   - Dropped the original `label` column.

4. **Train-Test Split**
   - Split the data into features (`X`) and target (`y`).
   - Used `train_test_split` to create training and test sets (80/20 split).

5. **Feature Scaling**
   - Applied `MinMaxScaler` to scale the features for both training and test sets.

6. **Model Training & Evaluation**
   - Imported multiple classifiers: Logistic Regression, Naive Bayes, SVM, KNN, Decision Tree, Extra Trees, Random Forest, Bagging, AdaBoost, Gradient Boosting.
   - Created a dictionary of model instances.
   - Trained each model on the training data and evaluated on the test data.
   - Printed accuracy and confusion matrix for each model to compare performance.

7. **Model Selection**
   - Selected Random Forest as the final model based on performance.
   - Also trained and evaluated GaussianNB for comparison.

8. **Predictive System**
   - Defined a function `recommendation()` to take user input features, scale them, and predict the best crop using the trained model.
   - Tested the function with different sets of input values and mapped predictions back to crop names.

9. **Model Serialization**
   - Saved the trained Random Forest model and MinMaxScaler to disk using pickle (`model.pkl`, `minmaxscaler.pkl`).

---

## Workflow Summary (for Interview/Documentation)

- **Data Loading**: Loaded and explored crop recommendation data from CSV.
- **Preprocessing**: Encoded crop labels, cleaned data, and split into features/target.
- **Splitting**: Divided data into training and test sets.
- **Scaling**: Normalized features using MinMaxScaler.
- **Model Training**: Trained and compared multiple ML classifiers using scikit-learn.
- **Evaluation**: Assessed models using accuracy and confusion matrix.
- **Selection**: Chose the best-performing model (Random Forest).
- **Prediction System**: Built a function for real-time crop recommendation based on user input.
- **Export**: Saved the trained model and scaler for deployment in a web app.

This workflow demonstrates a complete ML pipeline: data analysis, preprocessing, model selection, evaluation, and deployment preparation.
