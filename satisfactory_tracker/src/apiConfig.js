import logToBackend from "./services/logService";

let flask_port = "";

if (process.env.RUN_MODE_LOCATION === 'prod') {
  flask_port = "http://192.168.50.33:5000";
  // logToBackend("apiConfig.js - Run Mode:" + process.env.RUN_MODE_LOCATION, "INFO");
} else {
  flask_port = "http://localhost:5000";
}

export const API_ENDPOINTS = {
  tables: `${flask_port}/api/tables`,  
  table_name: (tableName) => `${flask_port}/api/${tableName}`, // Dynamic endpoint
  part_names: `${flask_port}/api/part_names`,
  alternate_recipe: `${flask_port}/api/alternate_recipe`,
  selected_recipes: `${flask_port}/api/selected_recipes`,
  recipe: `${flask_port}/api/recipe`,
  get_recipe_id: (partId) => `${flask_port}/api/recipe_id/${partId}`,
  build_tree: `${flask_port}/api/build_tree`,
  part: `${flask_port}/api/part`,
  signup: `${flask_port}/signup`,
  login: `${flask_port}/login`,
  logout: `${flask_port}/logout`,
  check_login: `${flask_port}/check_login`,
  userinfo: `${flask_port}/api/user_info`,
  validation: `${flask_port}/api/validation`,
  tracker_data: `${flask_port}/api/tracker_data`,
  tracker_reports: `${flask_port}/api/tracker_reports`,
  add_to_tracker: `${flask_port}/api/tracker_add`,  
  log: `${flask_port}/api/log`,
  upload_sav: `${flask_port}/upload_sav`,
  user_save: `${flask_port}/user_save`,
  processing_status: `${flask_port}/processing_status`,
  user_settings: `${flask_port}/api/user_settings`,
  production_report: `${flask_port}/api/production_report`,
  machine_report: `${flask_port}/api/machine_usage_report`,
  machine_connections: `${flask_port}/api/machine_connections`,
  connection_graph: `${flask_port}/api/connection_graph`,
  machine_metadata: `${flask_port}/api/machine_metadata`,
  pipe_network: `${flask_port}/api/pipe_network`,
  user_connection_data : `${flask_port}/api/user_connection_data`,
  user_pipe_data : `${flask_port}/api/user_pipe_data`,
  tester_registration: `${flask_port}/api/tester_registration`,
  tester_count: `${flask_port}/api/tester_count`,
  tester_requests: `${flask_port}/api/tester_requests`,
  tester_approve: `${flask_port}/api/tester_approve`,
  tester_reject: `${flask_port}/api/tester_reject`,
  change_password: `${flask_port}/api/change_password`,
  github_issue: `${flask_port}/api/github_issue`,
  };
