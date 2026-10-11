import glob
import re

def main():
    routes_list = []
    
    # Auth is separate
    with open('app/core/auth.py', 'r', encoding='utf-8') as f:
        content = f.read()
        routes = re.findall(r'@router\.(get|post|put|delete|patch)\([\"\']([^\"]+)[\"\']', content)
        for method, path in routes:
            routes_list.append((method.upper(), f'/api/v1/auth{path}', 'TODO'))

    for file in glob.glob('app/*/router.py'):
        module = file.replace('\\', '/').split('app/')[1].split('/')[0]
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        routes = re.findall(r'@router\.(get|post|put|delete|patch)\([\"\']([^\"]+)[\"\']', content)
        for method, path in routes:
            routes_list.append((method.upper(), f'/api/v1/{module}{path}', 'TODO'))
            
    with open('../ROUTES.md', 'w', encoding='utf-8') as f:
        f.write('| Method | Path | Required Role |\n')
        f.write('|--------|------|---------------|\n')
        for method, path, role in routes_list:
            f.write(f'| {method} | {path} | {role} |\n')

if __name__ == '__main__':
    main()
