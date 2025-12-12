import pandas as pd

try:
    df = pd.read_excel("d:/ADANI/Data analysis/BLA Master file.xlsx")
    print("Columns:", df.columns.tolist())
    print("\nFirst 3 rows:")
    print(df.head(3))
    print("\nData Types:")
    print(df.dtypes)
except Exception as e:
    print(e)
