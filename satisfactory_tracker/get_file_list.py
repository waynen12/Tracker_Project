import os
import sys

def list_files(startpath, output_file, output_type='both'):
    with open(output_file, 'w') as f:
        for root, dirs, files in os.walk(startpath):
            # ignore node_modules, .git, __pycache__ and venv directories
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            if 'venv' in dirs:
                dirs.remove('venv')
            if '.git' in dirs:
                dirs.remove('.git')
            if '__pycache__' in dirs:
                dirs.remove('__pycache__')
            level = root.replace(startpath, '').count(os.sep)
            indent = ' ' * 4 * (level)
            
            if output_type in ('both', 'directories'):
                f.write(f'{indent}{os.path.basename(root)}/\n')
            
            if output_type in ('both', 'files'):
                subindent = ' ' * 4 * (level + 1)
                for file in files:
                    f.write(f'{subindent}{file}\n')

# Example usage
if __name__ == "__main__":
    startpath = os.path.join(os.getcwd())
    # name the output file based on the output type
    if len(sys.argv) > 1:
        if sys.argv[1] == 'both':
            output_file = 'file_list.txt'
        else:
            output_file = f'{sys.argv[1]}.txt'
    #output_file = 'file_list.txt'
    
    # Get the output type from command line arguments
    output_type = sys.argv[1] if len(sys.argv) > 1 else 'both'
    
    list_files(startpath, output_file, output_type)

# Usage:
    # python get_file_list.py both   # Output both directories and files
    # python get_file_list.py directories   # Output only directories
    # python get_file_list.py files   # Output only files