from . import db
from flask_login import UserMixin
from . import login_manager

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)

    def check_password(self, password):
        # Implement password checking logic here
        return self.password == password

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class Part(db.Model):
    __tablename__ = 'part'
    id = db.Column(db.Integer, primary_key=True)
    part_name = db.Column(db.String(200), nullable=False)
    level = db.Column(db.Integer)
    category = db.Column(db.String(100))
    

class Recipe(db.Model):
    __tablename__ = 'recipe'
    id = db.Column(db.Integer, primary_key=True)
    part_id = db.Column(db.Integer, db.ForeignKey('part.id'), nullable=False)
    recipe_name = db.Column(db.String(200), nullable=False)
    ingredient_count = db.Column(db.Integer)
    source_level = db.Column(db.Integer)
    base_production_type = db.Column(db.String(100))
    produced_in_automated = db.Column(db.String(100))
    produced_in_manual = db.Column(db.String(100))
    base_input = db.Column(db.String(100))
    base_demand_pm = db.Column(db.Float)
    base_supply_pm = db.Column(db.Float)
    byproduct = db.Column(db.String(100))
    byproduct_supply_pm = db.Column(db.Float)

class Alternate_Recipe(db.Model):
    __tablename__ = 'alternate_recipe'
    id = db.Column(db.Integer, primary_key=True)
    part_id = db.Column(db.Integer, db.ForeignKey('part.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    selected = db.Column(db.Boolean, default=False)

class Machine_Level(db.Model):
    __tablename__ = 'machine_level' 
    id = db.Column(db.Integer, primary_key=True)
    machine_level = db.Column(db.String(100), nullable=False)

class Node_Purity(db.Model):
    __tablename__ = 'node_purity'
    id = db.Column(db.Integer, primary_key=True)
    node_purity = db.Column(db.String(100), nullable=False)

class Power_Shards(db.Model):
    __tablename__ = 'power_shards'
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    output_increase = db.Column(db.Float)

class Miner_Supply(db.Model):
    __tablename__ = 'miner_supply' 
    id = db.Column(db.Integer, primary_key=True)
    node_purity_id = db.Column(db.Integer, db.ForeignKey('node_purity.id'), nullable=False)
    machine_level_id = db.Column(db.Integer, db.ForeignKey('machine_level.id'), nullable=False)
    base_supply_pm = db.Column(db.Float)                                                    

class Data_Validation(db.Model):
    __tablename__ = 'data_validation'
    id = db.Column(db.Integer, primary_key=True)
    table_name = db.Column(db.String(100), nullable=False)
    column_name = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(100), nullable=True)
    description = db.Column(db.String(200), nullable=True)

class Tracker(db.Model):
    __tablename__ = 'tracker'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    part_id = db.Column(db.Integer, db.ForeignKey('part.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    target_quantity = db.Column(db.Float, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    __table_args__ = (
        db.UniqueConstraint('user_id', 'part_id', 'recipe_id', name='unique_user_part_recipe'),
    )

class UserSelectedRecipe(db.Model):
    __tablename__ = 'user_selected_recipe'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    part_id = db.Column(db.Integer, db.ForeignKey('part.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    __table_args__ = (
        db.UniqueConstraint('user_id', 'part_id', 'recipe_id', name='unique_user_part_recipe'),
    )

class User_Save(db.Model):
    __tablename__ = 'user_save'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=True)
    resource_node_id = db.Column(db.Integer, db.ForeignKey('resource_node.id'), nullable=True)
    machine_id = db.Column(db.Integer, db.ForeignKey('machine.id'), nullable=False)
    machine_power_modifier = db.Column(db.Float, default=1.0)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    sav_file_name = db.Column(db.String(200), nullable=False)
	
class Machine(db.Model):
    __tablename__ = 'machine'
    id = db.Column(db.Integer, primary_key=True)
    machine_name = db.Column(db.String(200), nullable=False)
    machine_level_id = db.Column(db.Integer, db.ForeignKey('machine_level.id'), nullable=True)
    save_file_class_name = db.Column(db.String(200), nullable=False)
    __table_args__ = (
        db.Index('idx_save_file_class_name', 'save_file_class_name'),
    )
	
class Resource_Node(db.Model):
    __tablename__ = 'resource_node'
    id = db.Column(db.Integer, primary_key=True)
    part_id = db.Column(db.Integer, db.ForeignKey('part.id'), nullable=False)
    node_purity_id = db.Column(db.Integer, db.ForeignKey('node_purity.id'), nullable=False)
    save_file_path_name = db.Column(db.String(200), nullable=False, unique=True)
    __table_args__ = (
        db.Index('idx_save_file_path_name', 'save_file_path_name'),
    )
    
class Recipe_Mapping(db.Model):
    __tablename__ = 'recipe_mapping'
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    save_file_recipe = db.Column(db.String(200), nullable=False, unique=True)
	
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

