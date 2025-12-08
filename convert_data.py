import pandas as pd
import json
import os

# Define paths
excel_path = "d:/ADANI/Data analysis/BLA Master file.xlsx"
json_path = "d:/ADANI/Data analysis/react-dashboard/public/data.json"

# Create directory if it doesn't exist
os.makedirs(os.path.dirname(json_path), exist_ok=True)

try:
    df = pd.read_excel(excel_path)
    
    # --- Data Cleaning (Logic from dashboard.py) ---
    
    # 1. Clean Column Names
    df.columns = [c.strip() for c in df.columns]
    
    # 2. String Cleanup
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        
    # 3. Normalize Attendance
    if 'Attendance' in df.columns:
        df['Attendance'] = df['Attendance'].replace({
            'Longabsent': 'Long Absent',
            'Long absent': 'Long Absent',
            'long absent': 'Long Absent',
            'longabsent': 'Long Absent',
            'Na': 'NA',
            'nan': 'NA',
            'NAN': 'NA',
            'NaN': 'NA'
        })

    # 4. Normalize Medium
    if 'Medium' in df.columns:
        df['Medium'] = df['Medium'].astype(str).str.strip().str.title()
        
    # 5. Normalize School Name
    if 'School Name' in df.columns:
        df['School Name'] = df['School Name'].astype(str).str.strip().str.title()

    # 6. Normalize Learning Levels & Add Categories
    level_map = {
        'L0': 'Needs improvement', 'L1': 'Needs improvement',
        'L2': 'Developing stage', 'L3': 'Developing stage',
        'L4': 'Progressive', 'L5': 'Progressive'
    }
    
    for col in ['Reading', 'Writing', 'Numeracy']:
        if col in df.columns:
            # Uppercase and remove spaces (e.g., 'l 0' -> 'L0')
            df[col] = df[col].astype(str).str.upper().str.replace(' ', '')
            # Handle 'LEVEL' prefix
            df[col] = df[col].str.replace('LEVEL', 'L')
            
            # Map to Categories
            df[f'{col}_Category'] = df[col].map(level_map)

    # --- Export to JSON ---
    # Use 'records' orient to get a list of objects
    json_data = df.to_json(orient='records')
    
    with open(json_path, 'w') as f:
        f.write(json_data)
        
    print(f"Successfully converted {len(df)} records to {json_path}")

except Exception as e:
    print(f"Error converting data: {e}")
