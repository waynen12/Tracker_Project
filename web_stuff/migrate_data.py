import pandas as pd
import sqlite3

# Load Excel data
excel_path = "path_to_your_excel_file.xlsm"
parts_df = pd.read_excel(excel_path, sheet_name="Part_Data")
recipes_df = pd.read_excel(excel_path, sheet_name="Alt_Recipe_Selection")

# Connect to the SQLite database
conn = sqlite3.connect("satisfactory_parts.db")

# Insert data into parts table
parts_df.to_sql("parts", conn, if_exists="append", index=False)
recipes_df.to_sql("recipes", conn, if_exists="append", index=False)

print("Data migrated successfully!")
conn.close()
