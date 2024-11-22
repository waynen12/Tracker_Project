import pandas as pd
import os

# Load the data from the Excel sheets
excel_data = pd.DataFrame(xl("Part_Data[#All]"))
excel_data.columns = excel_data.iloc[0]  # Set the first row as column headers
excel_data = excel_data[1:]  # Remove the first row from the data

alternate_data = pd.DataFrame(xl("Alt_Recipe_Selection[#All]"))
alternate_data.columns = alternate_data.iloc[0] # Set the first row as column headers
alternate_data = alternate_data[1:] # Remove the first row from the data

# Convert the 'Selection' column to boolean if necessary
alternate_data['Selection'] = alternate_data['Selection'].astype(bool)

def build_tree(data, part_name, recipe_type, target_quantity, visited=None):
    if visited is None:
        visited = set()

    # Check for circular dependency
    if (part_name, recipe_type) in visited:
        return {"Error": f"Circular dependency detected for part '{part_name}' with recipe '{recipe_type}'."}

    # Mark this part and recipe as visited
    visited.add((part_name, recipe_type))
    
    tree = {}
    
    # Determine the correct recipe type (default to _Standard if no alternate is selected)
    alternate_recipe_row = alternate_data[(alternate_data['Name'] == part_name) & (alternate_data['Selection'] == True)]
    alternate_recipe = alternate_recipe_row['Alternate_Recipe'].iloc[0] if not alternate_recipe_row.empty else recipe_type
    

    # Filter the dataset for the specified part and recipe type
    part_data = data[(data['Name'] == part_name) & (data['Recipe'] == alternate_recipe)]
    if part_data.empty:
        return {
             "Error": f"Part '{part_name}' with recipe '{alternate_recipe}' not found.",
            "Required Quantity": 0,
            "Produced In": "Unknown",
            "No. of Machines": 0,
            "Subtree": {}
        }
        
    # Iterate over base inputs for the given part
    for _, row in part_data.iterrows():
        base_input_name = row['Base Input']
        source_level = row['Source Level']
        base_demand = row['Base Demand p/m']
        base_supply = row['Base Supply p/m']
        produced_in = row['Produced In (Automated)']
        
       # Perform lookup for Produced In based on Base Input and Recipe
        produced_in_row = data[(data['Name'] == base_input_name) & (data['Recipe'] == alternate_recipe)]
        produced_in = produced_in_row['Produced In (Automated)'].iloc[0] if not produced_in_row.empty else "Unknown"

        #print(produced_in, base_input_name)
        
        # Skip parts with source_level == -2
        if source_level == -2 and base_input_name == 0:
            continue
        
        # Calculate required input quantity for the target output
        if pd.notna(base_demand) and pd.notna(base_supply) and base_supply > 0:
            required_quantity = (base_demand / base_supply) * target_quantity
        else:
            required_quantity = 0
        
        # Debugging print
        #print(f"Part: {base_input_name}, Base Demand: {base_demand}, Base Supply: {base_supply}, Required Quantity: {required_quantity}")
        
        # Calculate the number of machines needed to produce the required amount
        no_of_machines = required_quantity / base_supply if base_supply else 0
        
        # Debugging print
        #print(f"Node: {base_input_name}, Produced In: {produced_in}, No. of Machines: {no_of_machines}")
        #print(f"Tree Node: {tree[base_input_name]}")

        # Recursively build the tree for the base input
        subtree = build_tree(data, base_input_name, alternate_recipe, required_quantity, visited)
        tree[base_input_name] = {
            "Required Quantity": required_quantity,
            "Produced In": produced_in,
            "No. of Machines": no_of_machines,
            "Subtree": subtree
        }
    
    # Unmark this part and recipe after processing
    visited.remove((part_name, recipe_type))
    
    return tree
    


# Run the dependency tree function
result = build_tree(excel_data, part_name=xl("'Dependency Tree'!B1"), recipe_type="_Standard", target_quantity=xl("'Dependency Tree'!B2"))
#print(result)
    
def flatten_tree(tree, parent="", level=0):
    """
    Flatten a nested dictionary into a list of rows for easier visualization.
    """
    rows = []
    for key, value in tree.items():
        
        # Set the current parent node
        current_parent = parent
        
        # Handle errors or unexpected structures
        if not isinstance(value, dict):
            rows.append({
                "Parent": current_parent,  
                "Node": key,
                "Tree Level": level,
                "Required Quantity": "Error or Invalid Data",
                "Produced In": "Error or Invalid Data",
                "No of Machines": "Error or Invalid Data"
            })
            continue

        # Normal case
        rows.append({
            "Parent": current_parent,
            "Node": key,
            "Tree Level": level,
            "Required Quantity": value.get("Required Quantity", 0),
            "Produced In": value.get("Produced In", "Unknown"),
            "No. of Machines": value.get("No. of Machines", 0)
        })
        
        # Recursively process child nodes
        if isinstance(value.get("Subtree"), dict):
            rows.extend(flatten_tree(value["Subtree"], parent=key, level=level + 1))
    return rows
    
 # Flatten the tree
flat_tree = flatten_tree(result) 

# Convert to DataFrame
tree_df = pd.DataFrame(flat_tree)
tree_df