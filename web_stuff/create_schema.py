import sqlite3

# Connect to the database
conn = sqlite3.connect("satisfactory_parts.db")
cursor = conn.cursor()

# Create the schema
cursor.execute("""
CREATE TABLE parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    source_level INTEGER
);
""")

cursor.execute("""
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER NOT NULL,
    recipe_name TEXT NOT NULL,
    produced_in TEXT,
    base_input TEXT,
    base_demand REAL,
    base_supply REAL,
    power_shard_efficiency REAL,
    FOREIGN KEY(part_id) REFERENCES parts(id)
);
""")

cursor.execute("""
CREATE TABLE miner_supplies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER NOT NULL,
    supply_rate REAL,
    FOREIGN KEY(part_id) REFERENCES parts(id)
);
""")

cursor.execute("""
CREATE TABLE power_shards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    efficiency_modifier REAL,
    FOREIGN KEY(recipe_id) REFERENCES recipes(id)
);
""")

cursor.execute("""
CREATE TABLE dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_part_id INTEGER NOT NULL,
    child_part_id INTEGER NOT NULL,
    required_quantity REAL,
    recipe_id INTEGER,
    FOREIGN KEY(parent_part_id) REFERENCES parts(id),
    FOREIGN KEY(child_part_id) REFERENCES parts(id),
    FOREIGN KEY(recipe_id) REFERENCES recipes(id)
);
""")

print("Tables created successfully!")

# Close the connection
conn.commit()
conn.close()
