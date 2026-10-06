import nextVitals from 'eslint-config-next/core-web-vitals';
export default [...nextVitals, {ignores:['.next/**','audit/**','tests/**','mobile/**']}];
