import pandas as pd
import os
import json

def build_tree(data, part_name, recipe_type="_Standard"):
    """
    Recursively build a dependency tree for the given part using its recipe.

    Parameters:
        data (DataFrame): The data containing part information.
        part_name (str): The name of the part to analyze.
        recipe_type (str): The type of recipe to use (default: "_Standard").

    Returns:
        dict: A nested dictionary representing the dependency tree.
    """
    tree = {}

    # Filter the dataset for the specified part and recipe type
    part_data = data[(data['Name'].str.upper() == part_name.upper()) & (data['Recipe'].str.upper() == recipe_type.upper())]
    if part_data.empty:
        return f"Part '{part_name}' with recipe '{recipe_type}' not found."

    # Iterate over base inputs for the given part
    for _, row in part_data.iterrows():
        base_input_name = row['Base Input']
        source_level = row['Source Level']

        # Check if the source level is 0 or undefined (leaf node)
        if pd.isna(source_level) or source_level == '-' or source_level == 0:
            tree[base_input_name] = None  # No further dependencies
        else:
            # Recursively build the tree for the base input
            tree[base_input_name] = build_tree(data, base_input_name, recipe_type)

    return tree

# Load the dataset (replace 'Part Recipes.xlsx' with the correct path)
file_name = 'Part Recipes.xlsx'
file_path = os.path.join(os.getcwd(), file_name)
# file_path = 'C:/Users/catst/OneDrive/Documents/Satisfactory/Dependency Finder/Part Recipes.xlsx'
data = pd.ExcelFile(file_path).parse('Sheet1')

# Example: Build the tree for "CABLE" using the "_Standard" recipe
dependency_tree = build_tree(data, "SINGULARITY CELL", "_Standard")
json_string = json.dumps(dependency_tree, indent=4)
print(json_string)
#print(dependency_tree)
with open('output.json', 'w') as json_file:
    json.dump(dependency_tree, json_file)