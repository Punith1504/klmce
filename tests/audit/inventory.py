"""Reproducible repository inventory. Signals require human review, not verdicts."""
import ast
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
paths = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
records = []
for name in filter(None, paths):
    p = ROOT / name
    if not p.is_file():
        records.append({'path': name, 'kind': 'unavailable/submodule'}); continue
    data = p.read_bytes()
    row = {'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    if p.suffix == '.py':
        try:
            tree = ast.parse(data)
            row['syntax'] = 'valid'
            row['placeholder_functions'] = []
            row['routes'] = []
            row['missing_absolute_local_imports'] = []
            for n in ast.walk(tree):
                if isinstance(n, ast.ImportFrom) and n.module and n.module.startswith('app.'):
                    target = ROOT / 'backend' / n.module.replace('.', '/')
                    if not target.is_dir() and not target.with_suffix('.py').is_file():
                        row['missing_absolute_local_imports'].append({'module': n.module, 'line': n.lineno})
                if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    body = [x for x in n.body if not isinstance(x, ast.Expr) or not isinstance(x.value, ast.Constant)]
                    if body and all(isinstance(x, ast.Pass) or (isinstance(x, ast.Raise) and 'NotImplementedError' in ast.unparse(x)) for x in body):
                        row['placeholder_functions'].append({'name': n.name, 'line': n.lineno})
                    for dec in n.decorator_list:
                        if isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute) and dec.func.attr in ('get','post','put','patch','delete','websocket'):
                            row['routes'].append({'function': n.name, 'line': n.lineno, 'decorator': ast.unparse(dec),
                                'signature': ast.unparse(n.args)})
        except SyntaxError as error:
            row['syntax'] = str(error)
    records.append(row)
output = ROOT / 'audit/evidence/inventory.json'
output.write_text(json.dumps({'commit': subprocess.check_output(['git','rev-parse','HEAD'], cwd=ROOT).decode().strip(),
    'scope': 'All tracked files in checkout; submodule contents unavailable', 'files': records}, indent=2) + '\n')
summary = {'tracked_entries': len(records), 'python_files': sum('syntax' in r for r in records),
    'python_route_declarations': sum(len(r.get('routes', [])) for r in records),
    'placeholder_functions': sum(len(r.get('placeholder_functions', [])) for r in records)}
print(json.dumps(summary, indent=2))
