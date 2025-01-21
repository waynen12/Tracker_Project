import os
import logging
from sqlalchemy import text
from . import db
from flask_login import current_user
import traceback
#from logging_util import setup_logger
from .logging_util import setup_logger

logger = setup_logger("build_tree")

def build_tree(part_id, recipe_name="_Standard", target_quantity=1, visited=None):
    logger.debug(" --- 1 Entering build_tree for part_id %s with recipe_name %s and target_quantity %s, visited %s", part_id, recipe_name, target_quantity, visited)
    #recipe_type = recipe_type or "_Standard"
    # Check for user-selected recipe
    selected_recipe_query = """
        SELECT r.id, r.recipe_name
        FROM user_selected_recipe usr
        JOIN recipe r ON usr.recipe_id = r.id
        WHERE usr.user_id = :user_id AND usr.part_id = :part_id
    """
    selected_recipe = db.session.execute(
        text(selected_recipe_query), {"user_id": current_user.id, "part_id": part_id}
    ).fetchone()

    logger.info(f"1 Selected recipe for part_id {part_id}: {selected_recipe} with recipe_name {recipe_name} and user_id {current_user.id}")   

    recipe_type = selected_recipe.recipe_name if selected_recipe else recipe_name

    logger.info(f"2 Building tree for part_id {part_id} with recipe_name {recipe_type} and target_quantity {target_quantity}")

    if visited is None:
        visited = set()
    
    if (part_id, recipe_type) in visited:
        return {"Error": f"Circular dependency detected for part_id {part_id} with recipe_name {recipe_type}"}

    logger.debug(" --- 2.1 VISITED: About to add part_id %s with recipe_type %s to visited set", part_id, recipe_type)
    visited.add((part_id, recipe_type))
    logger.debug(" --- 2.2 VISITED: Added part_id %s with recipe_type %s to visited set", part_id, recipe_type)

    logger.debug(" --- 3 Recursion depth: %d, Visited: %s", len(visited), visited)
    
    tree = {}

    # Query part and recipe data
    part_data = db.session.execute(
        text("""
        SELECT p.part_name, r.base_input, r.source_level, r.base_demand_pm, r.base_supply_pm, r.recipe_name, r.produced_in_automated
        FROM part p
        JOIN recipe r ON p.id = r.part_id
        WHERE p.id = :part_id AND r.recipe_name = :recipe_name
        """),
        {"part_id": part_id, "recipe_name": recipe_type}
    ).fetchall()

    if not part_data:
        visited.remove((part_id, recipe_type))
        return {"Error": f"Part ID {part_id} with recipe type {recipe_type} not found."}
    
    # Iterate over ingredient inputs for the given part
    for row in part_data:
        ingredient_input = row.base_input
        source_level = row.source_level
        ingredient_demand = row.base_demand_pm
        ingredient_recipe = row.recipe_name
        
        # Calculate required input quantity for this ingredient input
        required_quantity = ingredient_demand * target_quantity

        # Look up the part_id for the ingredient_input and the machine it is produced in
        ingredient_input_id = db.session.execute(
            text("SELECT id FROM part WHERE part_name = :ingredient_input"),
            {"ingredient_input": ingredient_input}
        ).scalar()

        # Lookup the selected recipe for this ingredient from user_selected_recipe
        selected_recipe_query = """
            SELECT r.recipe_name
            FROM user_selected_recipe usr
            JOIN recipe r ON usr.recipe_id = r.id
            WHERE usr.user_id = :user_id AND usr.part_id = :part_id
        """
        selected_recipe = db.session.execute(
            text(selected_recipe_query),
            {"user_id": current_user.id, "part_id": ingredient_input_id}
        ).scalar()

        # Use the selected recipe or default to the ingredient_recipe (from part_data)
        final_recipe = selected_recipe if selected_recipe else ingredient_recipe
        logger.info(f"3) Final recipe for part_id {ingredient_input_id} is {final_recipe}")
        #logger.debug("Call stack:\n%s", "".join(traceback.format_stack()))


        #TODO TEST - # Lookup ingredient input data to get its supply rate and produced in machine
        ingredient_supply = db.session.execute(
            text("SELECT base_supply_pm FROM recipe WHERE part_id = :part_id AND recipe_name = :base_recipe"),
            {"part_id": ingredient_input_id, "base_recipe": final_recipe}
        ).scalar()
        
    

        ingredient_production_machine = db.session.execute(
            text("SELECT produced_in_automated FROM recipe WHERE part_id = :base_input_id AND recipe_name = :base_recipe"),
            {"base_input_id": ingredient_input_id, "base_recipe": final_recipe}
        ).scalar()
        
        #TODO - # Incorporate the Alternate_Recipe table and determine the correct recipe type for the ingredient input (default to _Standard if no alternate specified)
        
        

        # Skip parts with source_level == -2
        if source_level == -2:
            continue

        # Calculate the number of machines needed to produce the required amount
        no_of_machines = required_quantity / ingredient_supply if ingredient_supply else 0

        # Recursive call for subparts
        call_id = f"{part_id}-{recipe_name}-{len(visited)}"
        logger.debug(" --- 4.1 Recursive call ID: %s | Entering subtree for part_id %s with final_recipe %s, quantity %s, visited %s", call_id, ingredient_input_id, final_recipe, target_quantity, visited)
        #logger.debug("Entering subtree for part_id %s with final_recipe %s, quantity %s, visited %s", ingredient_input_id, final_recipe, target_quantity, visited)
        logger.debug(" --- 4.2 Before recursion: Visited: %s", visited)
        subtree = build_tree(ingredient_input_id, final_recipe, target_quantity, visited)
        logger.debug(" --- 4.3 Recursion: Visited: %s", visited)
        logger.debug(" --- 4.4 Recursive call ID: %s | Exiting subtree for part_id %s with final_recipe %s, quantity %s, visited %s", call_id, ingredient_input_id, final_recipe, target_quantity, visited)
        logger.debug(" --- 4.5 Adding to tree: %s -> %s", ingredient_input, subtree)
        tree[ingredient_input] = {
            "Required Quantity": required_quantity,
            "Produced In": ingredient_production_machine,
            "No. of Machines": no_of_machines,
            # "ingredient Demand": ingredient_demand,
            # "ingredient Supply": ingredient_supply,
            "Recipe": final_recipe,
            "Subtree": subtree,
        }

    logger.debug(" --- 5.1 VISITED: About to remove part_id %s with recipe_type %s from visited set", part_id, recipe_type)
    visited.remove((part_id, recipe_type))
    logger.debug(" --- 5.2 VISITED: Removed part_id %s with recipe_type %s from visited set", part_id, recipe_type)
    return tree