from pathlib import Path
import os
import json
import satisfactory_save as s
import re
from . import db
from .logging_util import setup_logger
from .build_connection_graph import build_factory_graph
from .models import Machine, Recipe_Mapping, Resource_Node, User_Save, User_Save_Conveyors, User_Save_Connections, Recipe, Part, Conveyor_Level, Conveyor_Supply, User_Save_Pipes, User_Connection_Data, User_Pipe_Data

logger = setup_logger("read_save_file")

def extract_connection_info(connection_obj):
    """
    Extract connectivity information from an FGFactoryConnectionComponent instance.
    
    Returns a dictionary with:
      - instanceName: Identifier of the connection component (obtained from BaseHeader).
      - mConnectedComponent: The pathName the component is connected to.
      - mConnectionInventory: (Optional) The inventory reference if available.
      - mDirection: (Optional) The direction of the connection (converted to string).
    """

    outer_path_name = getattr(connection_obj.Header, "OuterPathName", None)
    outer_path_name = str(outer_path_name) if outer_path_name is not None else None

    connection_data = {
        "OuterPathName": outer_path_name,
        "mConnectedComponent": None,
        "mConnectionInventory": None,
        "mDirection": None,
    }
    
    for prop in connection_obj.Object.Properties:
        prop_name = prop.Name.toString()
        
        if prop_name == "mConnectedComponent" and isinstance(prop, s.ObjectProperty):
            full_path = prop.Value.PathName
            connection_data["mConnectedComponent"] = clean_path_name(full_path)
            if "." in full_path:  # Extract direction
                connection_data["mDirection"] = full_path.split(".")[-1]

        elif prop_name == "mConnectionInventory" and isinstance(prop, s.ObjectProperty):
            connection_data["mConnectionInventory"] = clean_path_name(prop.Value.PathName)  

            
    return connection_data

def process_connection_components(save_file_path):
    """
    Process a .sav file to extract all FGFactoryConnectionComponent instances and
    output a JSON file with their connectivity information.
    """
    #logger.info(f"PROCESSING connections from save file: {save_file_path}")
    
    try:
        # Load the save file using the satisfactory_save library
        save = s.SaveGame(save_file_path)
        connection_components = []
        
        # Retrieve all objects of type FGFactoryConnectionComponent.
        try:
            connection_objects = save.getObjectsByClass("/Script/FactoryGame.FGFactoryConnectionComponent")
            #logger.info(f"******************************Found {len(connection_objects)} FGFactoryConnectionComponent objects.")
        except Exception as e:
            #logger.error(f"Error extracting connection info: {e}")
            return connection_components
        
        
        # Process each connection component
        for obj in connection_objects:
            try:
                conn_info = extract_connection_info(obj)
                connection_components.append(conn_info)
            except Exception as e:
                logger.error(f"❌ Error extracting connection info: {e}")
                continue

        # Write the extracted connection data to a JSON file for reference.
        output_dir = Path("output")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file_path = output_dir / f"{os.path.basename(save_file_path)}_connections.json"
        
        try:
            with open(output_file_path, 'w') as outfile:
                json.dump(connection_components, outfile, indent=4)
            logger.info(f"✅ Connection data JSON saved to {output_file_path}")
        except Exception as e:
            logger.error(f"❌ Error saving connection JSON output: {e}")
        
        return connection_components
        
    except Exception as e:
        logger.error(f"❌ Error processing save file for connection components: {e}")
        return []
    
def extract_conveyor_chain_info(chain_obj):
    """
    Extract connectivity information from an FGConveyorChainActor instance.
    
    Returns a dictionary with:
        - first_belt: The pathName of the first conveyor belt in the chain.
        - last_belt: The pathName of the last conveyor belt in the chain.
    """

    output_data = {
        "first_belt": None,
        "last_belt": None,
    }        
    
    try:
        output_data["first_belt"] = chain_obj.Object.mFirstConveyor.PathName
        output_data["last_belt"] = chain_obj.Object.mLastConveyor.PathName
        
        return output_data
    except Exception as e:
        logger.error(f"❌ Error extracting conveyor chain info: Error {e}")
        return None

def process_conveyor_chain_components(save_file_path):
    """
    Process a .sav file to extract all FGConveyorChainActor instances and
    output a JSON file with their connectivity information.
    """
    #logger.info(f"PROCESSING conveyor chains from save file: {save_file_path}")
    
    try:
        
        save = s.SaveGame(save_file_path)
        conveyor_chains = []
        
        try:
            chain_objects = save.getObjectsByClass("/Script/FactoryGame.FGConveyorChainActor")
        except Exception as e:
            logger.error(f"❌ Error extracting conveyor chain info: {e}")
            return conveyor_chains


        for obj in chain_objects:
            try:
                #logger.info(f"Processing conveyor chain: {obj}")
                chain_info = extract_conveyor_chain_info(obj)
                if chain_info is not None:
                    conveyor_chains.append(chain_info)
            except Exception as e:
                logger.error(f"❌ Error extracting conveyor chain info: {e}")
                continue

        output_dir = Path("output")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file_path = output_dir / f"{os.path.basename(save_file_path)}_conveyor_chains.json"
        
        try:
            with open(output_file_path, 'w') as outfile:
                json.dump(conveyor_chains, outfile, indent=4)
            logger.info(f"✅ Conveyor chain data JSON saved to {output_file_path}")
        except Exception as e:
            logger.error(f"❌ Error saving conveyor chain JSON output: {e}")
        
        return conveyor_chains
        
    except Exception as e:
        logger.error(f"❌ Error processing save file for conveyor chains: {e}")
        return []

def extract_machine_info(machine_obj, machines, recipe_mappings, resource_nodes):
    """
    Extract machine-specific information from the parsed save object and return it as a dictionary.
    Includes new properties: manufacturing progress, inventories, production timings, and productivity flags.
    """
    class_name = machine_obj.BaseHeader.ClassName

    machine_data = {
        "ClassName": class_name,
        "Machine_ID": machines.get(class_name),  # Fetch machine_id from DB
        "CurrentRecipe": None,
        "Recipe_ID": None,
        "CurrentPotential": None,
        "ExtractableResource": None,
        "Resource_Node_ID": None,
        "CurrentManufacturingProgress": None,
        "InputInventory": None,
        "OutputInventory": None,
        "TimeSinceStartStopProducing": None,
        "CurrentProductivityMeasurementProduceDuration": None,
        "CurrentProductivityMeasurementDuration": None,
        "ProductivityMonitorEnabled": None,
        "IsProducing": None,
    }

    for prop in machine_obj.Object.Properties:
        prop_name = prop.Name.toString()

        if prop_name == 'mCurrentRecipe' and isinstance(prop, s.ObjectProperty):
            machine_data["CurrentRecipe"] = prop.Value.PathName
            machine_data["Recipe_ID"] = recipe_mappings.get(prop.Value.PathName)
        elif prop_name == 'mCurrentPotential' and isinstance(prop, s.FloatProperty):
            machine_data["CurrentPotential"] = prop.Value
        elif prop_name == 'mExtractableResource' and isinstance(prop, s.ObjectProperty):
            machine_data["ExtractableResource"] = prop.Value.PathName
            machine_data["Resource_Node_ID"] = resource_nodes.get(prop.Value.PathName)
        elif prop_name == 'mCurrentManufacturingProgress' and isinstance(prop, s.FloatProperty):
            machine_data["CurrentManufacturingProgress"] = prop.Value
        elif prop_name == 'mInputInventory' and isinstance(prop, s.ObjectProperty):
            machine_data["InputInventory"] = prop.Value.PathName
        elif prop_name == 'mOutputInventory' and isinstance(prop, s.ObjectProperty):
            machine_data["OutputInventory"] = clean_path_name(prop.Value.PathName)
        elif prop_name == 'mTimeSinceStartStopProducing' and isinstance(prop, s.FloatProperty):
            machine_data["TimeSinceStartStopProducing"] = prop.Value
        elif prop_name == 'mCurrentProductivityMeasurementProduceDuration' and isinstance(prop, s.FloatProperty):
            machine_data["CurrentProductivityMeasurementProduceDuration"] = prop.Value
        elif prop_name == 'mCurrentProductivityMeasurementDuration' and isinstance(prop, s.FloatProperty):
            machine_data["CurrentProductivityMeasurementDuration"] = prop.Value
        elif prop_name == 'mProductivityMonitorEnabled' and isinstance(prop, s.BoolProperty):
            machine_data["ProductivityMonitorEnabled"] = prop.Value
        elif prop_name == 'mIsProducing' and isinstance(prop, s.BoolProperty):
            machine_data["IsProducing"] = prop.Value

    return machine_data

def process_save_file(save_file_path, current_user):
    """
    Process a .sav file, extract machine data (including additional properties),
    insert into the user_save table, and save a JSON output for reference.
    """
  
    logger.info(f"📝 PROCESSING save file: {save_file_path}")
    progress = "Starting"
    try:
        user_id = current_user
        logger.info(f"👤 Processing save file for user {user_id}")
        if user_id is None:
            logger.error("❌ ERROR: `current_user` is None or missing `id` attribute!")
            return  # Stop execution

        # ✅ DELETE OLD RECORDS FIRST
        db.session.query(User_Save_Conveyors).filter(User_Save_Conveyors.user_id == user_id).delete()
        db.session.commit()
        logger.info(f"🗑️ Deleted old User_Save_Conveyors records for user {user_id}")

        db.session.query(User_Save_Connections).filter(User_Save_Connections.user_id == user_id).delete()
        db.session.commit()
        logger.info(f"🗑️ Deleted old User_Save_Connections records for user {user_id}")
                
        db.session.query(User_Save).filter(User_Save.user_id == user_id).delete()
        db.session.commit()
        logger.info(f"🗑️ Deleted old User_Save for user {user_id}")
        
        db.session.query(User_Connection_Data).filter(User_Connection_Data.user_id == user_id).delete()
        db.session.commit()
        logger.info(f"🗑️ Deleted old User_Connection_Data records for user {user_id}")

        db.session.query(User_Save_Pipes).filter(User_Save_Pipes.user_id == user_id).delete()
        db.session.commit()
        logger.info(f"🗑️ Deleted old User_Save_Pipes records for user {user_id}")

        db.session.query(User_Pipe_Data).filter(User_Pipe_Data.user_id == user_id).delete()
        db.session.commit()
        logger.info(f"🗑️ Deleted old User_Pipe_Data records for user {user_id}")

        progress = "Deleted old records"
        
        # Fetch all machine class names from the database
        machines = {m.save_file_class_name: m.id for m in Machine.query.all()}
        progress = "Fetched machine class names"

        # Fetch all recipe mappings from `recipe_mapping`
        recipe_mappings = {rm.save_file_recipe: rm.recipe_id for rm in Recipe_Mapping.query.all()}
        progress = "Fetched recipe mappings"

        # Fetch all resource node mappings
        resource_nodes = {rn.save_file_path_name: rn.id for rn in Resource_Node.query.all()}
        progress = "Fetched resource node mappings"

        # Fetch all the parts id's from the Resource_Node table based on resource_node_id
        raw_parts = {p.id: p.part_id for p in Resource_Node.query.all()}
        progress = "Fetched raw parts"

        # Fetch all the recipe id's from the Recipe table based on the part id's from raw_parts and where the recipe_name = '_Standard'
        raw_recipes = {r.part_id: r.id for r in Recipe.query.filter(Recipe.part_id.in_(raw_parts.values())).filter(Recipe.recipe_name == '_Standard').all()}
        progress = "Fetched raw recipes"
        # logger.debug(f"🔍 Raw Recipes: {raw_recipes}")

        # Load the save file using the satisfactory_save library
        save = s.SaveGame(save_file_path)
        output_data = []
        progress = "Loaded save file"

        # Iterate through each machine class and extract data
        for class_name in machines.keys():
            progress = f"Extracting objects for class {class_name}"
            try:
                objects = save.getObjectsByClass(class_name)
                for obj in objects:
                    progress = f"Extracting object {obj}"
                    machine_info = extract_machine_info(obj, machines, recipe_mappings, resource_nodes)
                    output_data.append(machine_info)

                    # Use the recipe_id from the machine_info unless it is blank then look up the recipe_id from the raw_recipes based on the part_id from raw_parts where the part_id = machine_info["Resource_Node_ID"]
                    recipe_id = machine_info["Recipe_ID"] if machine_info["Recipe_ID"] else raw_recipes.get(raw_parts.get(machine_info["Resource_Node_ID"])) if raw_parts.get(machine_info["Resource_Node_ID"]) else None
                    progress = f"Got the recipe_id {recipe_id}"

                    # logger.debug(f"🔍 Recipe ID: {recipe_id}")
                    
                    new_entry = User_Save(
                        user_id=current_user,
                        machine_id=machine_info["Machine_ID"],
                        recipe_id=recipe_id,
                        resource_node_id=machine_info["Resource_Node_ID"],
                        machine_power_modifier=machine_info["CurrentPotential"],
                        sav_file_name=os.path.basename(save_file_path),
                        current_progress=machine_info["CurrentManufacturingProgress"],
                        input_inventory=machine_info["InputInventory"],
                        output_inventory=machine_info["OutputInventory"],
                        time_since_last_change=machine_info["TimeSinceStartStopProducing"],
                        production_duration=machine_info["CurrentProductivityMeasurementProduceDuration"],
                        productivity_measurement_duration=machine_info["CurrentProductivityMeasurementDuration"],
                        productivity_monitor_enabled=machine_info["ProductivityMonitorEnabled"],
                        is_producing=machine_info["IsProducing"]
                    )
                    db.session.add(new_entry)
                progress = f"Inserted objects for class {class_name}"
                    # logger.debug(f"✅ New entry {new_entry}")
            except Exception as e:
                if str(e) == "invalid unordered_map<K, T> key":
                    continue  # Skip this class if the key is invalid
                else:
                    logger.error(f"❌ Error extracting objects for class {class_name}, Progress {progress}: {e}")
                
       
        try:
            db.session.commit()
            logger.info("✅ Database commit successful for user save data!")
            progress = "Database commit successful"
        except Exception as e:
            logger.error(f"❌ ERROR DURING COMMIT: {e}")

        # Save extracted data to JSON for reference
        logger.info("📝 Saving output data to JSON...")
        output_dir = Path("output")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file_path = output_dir / f"{os.path.basename(save_file_path)}.json"
        try:
            with open(output_file_path, 'w') as outfile:
                json.dump(output_data, outfile, indent=4)
            logger.info(f"✅ Output JSON saved to {output_file_path}")
            progress = "Saved output JSON"
        except Exception as e:
            logger.error(f"❌ Error saving JSON output: {e}")

        # Extract connection and conveyor data
        progress = "Extracting connection and conveyor data"
        connection_data = process_connection_components(save_file_path)
        conveyor_data = process_conveyor_chain_components(save_file_path)

        # Fetch conveyor supply rates
        progress = "Fetching conveyor levels and speeds"
        conveyor_levels = {cl.id: cl.conveyor_level for cl in Conveyor_Level.query.all()}
        conveyor_speeds = {cs.conveyor_level_id: cs.supply_pm for cs in Conveyor_Supply.query.all()}
        # logger.debug(f"Conveyor Levels: {conveyor_levels} | Conveyor Speeds: {conveyor_speeds}")
                    
        # Insert connection data into the database
        progress = "Inserting Connections data"
        for conn in connection_data:
            if conn["mConnectedComponent"] and "ConveyorBelt" in conn["mConnectedComponent"]:
                conveyor_mk = get_conveyor_mk_level(conn["mConnectedComponent"])
                conveyor_speed = conveyor_speeds.get(conveyor_mk, 60)  # Default to MK1 speed
                # logger.debug(f"Conveyor MK Level: {conveyor_mk}, Speed: {conveyor_speed}")
            else:
                conveyor_mk = None
                conveyor_speed = None  # No conveyor, no speed
            # logger.debug(f"Conveyor MK Level: {conveyor_mk}, Speed: {conveyor_speed}")
            
            progress = "Inserting Connections data {conn}, {current_user}, {conveyor_speed}"
            new_connection = User_Save_Connections(
                user_id=current_user,
                outer_path_name=conn["OuterPathName"],
                connected_component=conn["mConnectedComponent"],
                connection_inventory=conn["mConnectionInventory"],
                direction=conn["mDirection"],
                conveyor_speed=conveyor_speed
            )
            db.session.add(new_connection)
        progress = "Inserted Connections data"

        # Insert conveyor chain data into the database
        progress = "Inserting Conveyors data"
        for conveyor in conveyor_data:
            progress= "Inserting Conveyors data {conveyor}"
            new_conveyor = User_Save_Conveyors(
                user_id=current_user,
                conveyor_first_belt=conveyor["first_belt"],
                conveyor_last_belt=conveyor["last_belt"]
            )
            db.session.add(new_conveyor)
        progress = "Inserted Conveyors data"

        # Commit changes
        db.session.commit()
        logger.info("✅ Database commit successful for connections and conveyors!")
        progress = "Database commit successful for connections and conveyors"

        # Extract all pipe networks
        try:
            pipe_networks = []
            save = s.SaveGame(save_file_path)
            pipe_objects = save.getObjectsByClass("/Script/FactoryGame.FGPipeNetwork")

        
            if not pipe_objects:
                logger.info("🚫 No pipe networks found."
                            "Skipping pipe network extraction.")
            else:
                logger.info(f"🔍 Found {len(pipe_objects)} pipe networks.")
                for obj in pipe_objects:
                    pipe_data = extract_pipe_network_data(obj)
                    if pipe_data["instance_name"]:  # Ensure valid data
                        pipe_networks.append(pipe_data)

            # Save extracted pipe data to a JSON file for debugging
            output_dir = Path("output")
            output_dir.mkdir(parents=True, exist_ok=True)
            output_file_path = output_dir / f"{os.path.basename(save_file_path)}_pipes.json"
            with open(output_file_path, 'w') as outfile:
                json.dump(pipe_networks, outfile, indent=4)

            logger.info(f"✅ Pipe network data saved to {output_file_path}")

        except Exception as e:
            if str(e) == "invalid unordered_map<K, T> key":
                logger.debug("Skipping pipe network extraction due to invalid key.")
                pass
            else: 
                logger.error(f"❌ Error extracting pipe network data: {e}")

        # Insert pipe networks into the database
        try:
            db.session.query(User_Save_Pipes).filter(User_Save_Pipes.user_id == current_user).delete()
            db.session.commit()

            for pipe in pipe_networks:
                new_pipe = User_Save_Pipes(
                    user_id=current_user,
                    instance_name=pipe["instance_name"],
                    fluid_type=pipe["fluid_type"],
                    connection_points=json.dumps(pipe["connections"]),  # Store as JSON
                )
                db.session.add(new_pipe)

            db.session.commit()
            logger.info(f"✅ Pipe network data saved to database.")

        except Exception as e:
            logger.error(f"❌ Error saving pipe network data: {e}")

        try:
            # Build the factory graph and store it in the user_connection_data table
            build_factory_graph(current_user)
            logger.info("✅ Stored processed connections in user_connection_data")
        except Exception as e:
            logger.error(f"❌ Error building and saving factory graph: {e}")

    except Exception as e:
        logger.error(f"❌ Error processing file {save_file_path}, Progress: {progress}: {e}")

def process_multiple_save_files(save_file_path, current_user):
    """
    Process multiple .sav files in a directory, extract machine data (including additional properties),
    insert into the user_save table, and save a JSON output for reference.
    """
    # Iterate through all `.sav` files in the input directory
    input_directory = Path(save_file_path)
    for save_file_path in input_directory.glob("*.sav"):
        process_save_file(save_file_path, current_user)  # Adjust user_id dynamically as needed

def clean_path_name(path):
    """Removes text after the last period in a PathName."""
    if path and "." in path:
        return path.rsplit(".", 1)[0]
    return path

def get_attributes(obj):

    """
    Get all attributes of an object and return as a dictionary.
    """

    return {attr: getattr(obj, attr) for attr in dir(obj) if not attr.startswith("__")}

def get_conveyor_mk_level(connected_component):
    """Extract MK level from conveyor belt name."""
    if not connected_component:
        return None  # ✅ Return None if the value is missing

    match = re.search(r'Mk(\d+)', connected_component)
    return int(match.group(1)) if match else None

def extract_pipe_network_data(pipe_obj):
    """
    Extracts relevant data from an FGPipeNetwork object.
    """
    try:
        # Get the instance name from BaseHeader
        instance_name = getattr(pipe_obj.BaseHeader.Reference, "PathName", None)

        fluid_type = None
        connections = []

        # Iterate through properties to find mFluidDescriptor & mFluidIntegrantScriptInterfaces
        for prop in pipe_obj.Object.Properties:
            if prop.Name.Name == "mFluidDescriptor":
                # Extract fluid type
                fluid_type = getattr(prop.Value, "PathName", None)

            elif prop.Name.Name == "mFluidIntegrantScriptInterfaces":
                # Extract connected components
                if hasattr(prop.Value, "Values"):
                    for item in prop.Value.Values:
                        path_name = getattr(item, "PathName", None)
                        if path_name:
                            connections.append(path_name)

        return {
            "instance_name": instance_name,
            "fluid_type": fluid_type,
            "connections": connections,
        }

    except Exception as e:
        print(f"❌ Error extracting pipe network data: {e}")
        return {
            "instance_name": None,
            "fluid_type": None,
            "connections": [],
        }

