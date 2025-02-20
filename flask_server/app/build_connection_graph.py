from flask import jsonify
from collections import defaultdict
from .logging_util import setup_logger
from . import db
from .models import User_Save_Pipes
from sqlalchemy import text
import json
import re

logger = setup_logger("build_connection_graph")
progress = ""  # Debugging variable

def build_connection_graph(connection_data):
    """
    Processes the connection data into a machine graph.
    
    Returns:
      - graph: Dictionary mapping machines to their connected machines.
      - machine_types: Dictionary categorizing machines.
    """
    graph = defaultdict(list)  # Maps machines to outputs
    machine_types = {}  # Classify machines

    # Step 1: Build connection lookup table
    conveyor_to_machine = {}  # Maps conveyors to the machine they connect to
    machine_to_conveyor = {}  # Maps machines to their conveyor output

    for row in connection_data:
        machine = row["connection_inventory"]  # Machine that is outputting
        conveyor = row["connected_component"]  # Conveyor belt receiving the output
        target = row["outer_path_name"]  # The next machine in the path

        # Store mappings
        if conveyor:
            conveyor_to_machine[conveyor] = target  # Map conveyor to destination
        if machine:
            machine_to_conveyor[machine] = conveyor  # Map machine to its output conveyor

    logger.info(f"✅ Step 1: Successfully completed Step 1: Build connection lookup table")

    # Step 2: Link Machines Together
    for machine, conveyor in machine_to_conveyor.items():
        if conveyor in conveyor_to_machine:  # Conveyor leads to another machine
            destination = conveyor_to_machine[conveyor]
            graph[machine].append(destination)
    logger.info(f"✅ Step 2: Successfully completed Step 2: Link Machines Together")
    return graph

def detect_cycles(graph):
    """Detects cycles in the graph."""
    visited = set()
    stack = set()

    def visit(node):
        if node in stack:
            return True  # Cycle detected
        if node in visited:
            return False
        
        visited.add(node)
        stack.add(node)
        for neighbor in graph.get(node, []):
            if visit(neighbor):
                return True
        stack.remove(node)
        return False

    return any(visit(node) for node in graph)

def build_factory_graph(user_id):
    """Builds a factory graph by navigating the machine connections step by step."""
    try:
        graph = {}
        metadata_map = {}

        # 🔹 Step 1: Get all starting points (machines with no input)
        start_query = text("""
            SELECT output_inventory FROM user_save
            WHERE input_inventory IS NULL AND user_id = :user_id
        """)
        start_points = db.session.execute(start_query, {"user_id": user_id}).fetchall()
        
        # 🔹 Step 2: Fetch machine metadata
        metadata_query = text("""
            SELECT us.output_inventory, m.machine_name, p.part_name AS produced_item, 
                   r.base_supply_pm, cs.supply_pm AS conveyor_speed, i.icon_path AS icon_path
            FROM user_save us
            JOIN machine m ON us.machine_id = m.id
            JOIN recipe r ON us.recipe_id = r.id
            JOIN part p ON r.part_id = p.id
            LEFT JOIN user_save_connections usc ON us.output_inventory = usc.connection_inventory
            LEFT JOIN conveyor_supply cs ON usc.conveyor_speed = cs.supply_pm
            LEFT JOIN icon i ON m.icon_id = i.id
            WHERE us.user_id = :user_id
        """)

        metadata_results = db.session.execute(metadata_query, {"user_id": user_id}).fetchall()
        for row in metadata_results:
            metadata_map[row.output_inventory] = {
                "machine_name": row.machine_name,
                "produced_item": row.produced_item,
                "conveyor_speed": row.conveyor_speed,
                "icon_path": row.icon_path,
            }
        
        # 🔹 Step 3: Build the factory graph
        for start in start_points:
            machine = start.output_inventory
            graph[machine] = []
            
            # 🔹 Steps 4 & 5 Connect the sources and targets until you find the last machine
            traverse_factory_graph(machine, graph, user_id)  # Recursively build graph
        logger.info(f"✅ Successfully built factory graph")
        
        

        # 🔹 Step 5: Integrate pipes into the graph
        pipes = User_Save_Pipes.query.filter_by(user_id=user_id).all()
        logger.debug(f"🔍 Total pipes: {len(pipes)}")
        for pipe in pipes:
            pipe_id = pipe.instance_name
            fluid_type = pipe.fluid_type
            connected_components = json.loads(pipe.connection_points)
            
            # ✅ Add pipe as a node
            if pipe_id not in graph:
                graph[pipe_id] = []

            # ✅ Create links to all connected machines/pipes
            for conn in connected_components:
                if conn not in graph:
                    graph[conn] = []  # Initialize node if missing
                graph[pipe_id].append(conn)  # Link pipe to component
                graph[pipe_id].append(fluid_type)  # Add fluid type as a label

        logger.debug(f"🔍 Total links: {len(graph)}")
        logger.info(f"✅ Successfully built full factory graph with metadata.")
        return graph, metadata_map

    except Exception as e:
        logger.error(f"❌ Error building full factory graph: {e}")
        return jsonify({"error": "Failed to build factory graph"}), 500

def traverse_factory_graph(current_machine, graph, user_id):
    """Recursively finds machines linked through conveyors."""
    try:
        # 🔹 Step 4: Get the first conveyor connected to this machine
        conveyor_query = text("""
            SELECT connected_component FROM user_save_connections
            WHERE connection_inventory = :machine AND user_id = :user_id
        """)
        conveyors = db.session.execute(conveyor_query, {"machine": current_machine, "user_id": user_id}).fetchall()
        
        progress = f"Step 4 Conveyors: {conveyor_query}, {conveyors} for machine: {current_machine}"
        
        if not conveyors:
            return graph  # If no conveyors, stop recursion

        for conveyor in conveyors:
            conveyor_belt = conveyor.connected_component
            progress = f"Step 4 iterating through conveyor belts: {conveyor_belt}"
            
            if conveyor_belt not in graph:
                graph[conveyor_belt] = []  # Initialize if not present
            graph[current_machine].append(conveyor_belt)  # Add conveyor to graph
            progress = f"Step 4 Finished adding conveyors to graph: {graph}"

            # 🔹 Step 5: Find the next machine (destination of the conveyor)
            next_machine_query = text("""
                SELECT connected_component FROM user_save_connections
                WHERE outer_path_name = :conveyor AND direction LIKE 'input%' AND user_id = :user_id
            """)
            progress = f"Step 5 Query: {next_machine_query}, Conveyor: {conveyor_belt}, User: {user_id}"
            
            next_machines = db.session.execute(next_machine_query, {"conveyor": conveyor_belt, "user_id": user_id}).fetchall()
            
            if not next_machines:
                #logger.warning(f"⚠️ Conveyor {conveyor_belt} does not lead to another machine.")
                continue  # Skip if no next machines
            progress = f"Step 5 Query Result: {next_machines}"
            
            for next_machine in next_machines:
                progress = f"Step 5 iterating through next machines: {next_machine}"
                machine_target = next_machine.connected_component
                if not machine_target:
                    logger.error(f"❌ Unexpected NULL target for {conveyor_belt}")
                    continue  # Skip broken connections

                if machine_target not in graph:
                    graph[machine_target] = []  # Initialize node
                graph[conveyor_belt].append(machine_target)  # Add link
                
                traverse_factory_graph(machine_target, graph, user_id)  # Continue traversing        
        return graph
    except Exception as e:
        logger.error(f"❌ Error traversing factory graph: e: {e}, Progress: {progress}, Current Machine: {current_machine}")
        return graph  # Return whatever was built so far

def format_graph_for_frontend(graph, metadata):
    """Converts the Python dictionary graph into an array-based format for React with metadata."""

    nodes = []
    links = []

    for node_id in graph.keys():
        if node_id:
            clean_component, clean_level, clean_ref_id = clean_name(node_id)
            node_data = {
                "id": node_id,
                "label": metadata.get(node_id, {}).get("machine_name", node_id),  # Machine name if available
                "produced_item": metadata.get(node_id, {}).get("produced_item", metadata.get(node_id, {}).get("fluid_type", "Unknown")),
                "icon_path": metadata.get(node_id, {}).get("icon_path", None),
                "component": clean_component,
                "level": clean_level,
                "reference_id": clean_ref_id,
            }
            nodes.append(node_data)
    
    for src, targets in graph.items():
        for tgt in targets:
            if tgt:
                src_clean, src_level, src_ref = clean_name(src)
                tgt_clean, tgt_level, tgt_ref = clean_name(tgt)

                link_type = "pipe" if "Pipe" in src else "conveyor"
                links.append({
                    "source": src,
                    "source_component": src_clean,
                    "source_level": src_level,
                    "source_reference_id": src_ref,
                    "target": tgt,
                    "target_component": tgt_clean,
                    "target_level": tgt_level,
                    "target_reference_id": tgt_ref,
                    
                    "type": link_type,
                    "label": "Fluid" if link_type == "pipe" else "Conveyor",
                    "produced_item": metadata.get(src, {}).get("produced_item", None),
                    "conveyor_speed": metadata.get(src, {}).get("conveyor_speed", None),
                })

    return {"nodes": nodes, "links": links}

def clean_name(raw_name):
    """
    Cleans and extracts key components from a machine name.
    Example: 'Persistent_Level:PersistentLevel.Build_MinerMk1_C_2147443909'
    Returns: ('Miner', 'Mk1', '2147443909')
    """
    # Remove everything before the second underscore
    match = re.search(r"([A-Za-z]+)(Mk\d*)?_C_(\d+)", raw_name)

    if match:
        component = match.group(1)  # Machine/Conveyor Type
        level = match.group(2) if match.group(2) else "N/A"  # Mk level or 'N/A' if missing
        reference_id = match.group(3)  # Reference number at the end
        return component, level, reference_id

    return raw_name, "N/A", "N/A"  # Default values if no match is found