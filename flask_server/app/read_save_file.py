from pathlib import Path
import os
import json
import satisfactory_save as s
from . import db
from .logging_util import setup_logger
from .models import Machine, Recipe_Mapping, Resource_Node, User_Save


logger = setup_logger("read_save_file")

def extract_machine_info(machine_obj, machines, recipe_mappings, resource_nodes):
    #logger.info(f"EXTRACTING {machine_obj}") #, machines: {machines}, recipe_mappings: {recipe_mappings}, resource_nodes: {resource_nodes}")
    """Extract machine-specific information and return it as a dictionary."""
    class_name = machine_obj.BaseHeader.ClassName

    machine_data = {
        "ClassName": class_name,
        "Machine_ID": machines.get(class_name),  # Fetch machine_id from DB
        "CurrentRecipe": None,
        "Recipe_ID": None,
        "CurrentPotential": None,
        "ExtractableResource": None,
        "Resource_Node_ID": None,
    }

    for prop in machine_obj.Object.Properties:
        if prop.Name.toString() == 'mCurrentRecipe' and isinstance(prop, s.ObjectProperty):
            machine_data["CurrentRecipe"] = prop.Value.PathName
            machine_data["Recipe_ID"] = recipe_mappings.get(prop.Value.PathName)  # Fetch recipe_id from DB
        elif prop.Name.toString() == 'mCurrentPotential' and isinstance(prop, s.FloatProperty):
            machine_data["CurrentPotential"] = prop.Value
        elif prop.Name.toString() == 'mExtractableResource' and isinstance(prop, s.ObjectProperty):
            machine_data["ExtractableResource"] = prop.Value.PathName
            machine_data["Resource_Node_ID"] = resource_nodes.get(prop.Value.PathName)  # Fetch resource node ID

    #logger.info(f"EXTRACTED machine data: {machine_data}")
    return machine_data


def process_save_file(save_file_path, current_user):
    """Process a .sav file, extract machine data, and insert into user_save."""
    #logger.info(f"PROCESSING save file: {save_file_path}")
    logger.info(f"PROCESSING save file: {save_file_path}")

    try:
        user_id = current_user
        logger.info(f"👤 Processing save file for user {user_id}")
        if user_id is None:
            logger.error("❌ ERROR: `current_user` is None or missing `id` attribute!")
            return  # Stop execution

        # ✅ DELETE OLD RECORDS FIRST
        db.session.query(User_Save).filter(User_Save.user_id == user_id).delete()
        db.session.commit()
        logger.info(f"🗑️ Deleted old records for user {user_id}")
                
        # Fetch all machine class names from the database
        machines = {m.save_file_class_name: m.id for m in Machine.query.all()}

        # Fetch all recipe mappings from `recipe_mapping`
        recipe_mappings = {rm.save_file_recipe: rm.recipe_id for rm in Recipe_Mapping.query.all()}

        # Fetch all resource node mappings
        resource_nodes = {rn.save_file_path_name: rn.id for rn in Resource_Node.query.all()}

        # Load the save file
        save = s.SaveGame(save_file_path)
        output_data = []

        # Iterate through all machine class names and extract data
        for class_name in machines.keys():
            try:
                #logger.info(f"LOOKING FOR objects in class {class_name}")
                objects = save.getObjectsByClass(class_name)
                for obj in objects:
                    machine_info = extract_machine_info(obj, machines, recipe_mappings, resource_nodes)
                    output_data.append(machine_info)

                    #logger.info(f"EXTRACTED DATA - machine_info: {machine_info}")
                    # Look up the correct `recipe_mapping.id`
                    recipe_id = machine_info["Recipe_ID"] if machine_info["Recipe_ID"] else None  # If missing, set to None
                    #logger.info(f"RECIPE ID: {recipe_id}")
                    # Log a warning if the recipe mapping isn't found
                    # if recipe_id is None and save_file_recipe:
                    #     logger.warning(f"⚠️ No recipe_mapping found for {save_file_recipe}. Setting to NULL.")


                    # Insert data into `user_save` table
                    new_entry = User_Save(
                        user_id=current_user,
                        machine_id=machine_info["Machine_ID"],
                        recipe_id=recipe_id,
                        resource_node_id=machine_info["Resource_Node_ID"],
                        machine_power_modifier=machine_info["CurrentPotential"],
                        sav_file_name=os.path.basename(save_file_path),
                    )

                    db.session.add(new_entry)
                    #logger.info(f"NEW ENTRY before commit: {new_entry}")
            except Exception as e:
                print(f"ERROR - Error extracting objects for class {class_name}: {e}")
                logger.error(f"Error extracting objects for class: {class_name}: {e}")
                continue

        try:
            #logger.info("Attempting to commit to database...")  
            db.session.commit()
            logger.info("✅ Database commit successful!")  
        except Exception as e:
            logger.error(f"❌ ERROR DURING COMMIT: {e}") 

        # # Save extracted data to JSON for reference
        # output_file_path = Path(f"output/{save_file_path}.json")
        # with open(output_file_path, 'w') as outfile:
        #     json.dump(output_data, outfile, indent=4)
        
        # logger.info(f"✅ Output JSON saved to {output_file_path}")

    except Exception as e:
        logger.error(f"❌ Error processing file {save_file_path}: {e}")


# # Iterate through all `.sav` files in the input directory
# input_directory = Path('./savs')
# for save_file_path in input_directory.glob("*.sav"):
#     process_save_file(save_file_path, user_id=1)  # Adjust user_id dynamically as needed
