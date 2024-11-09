
import { createRoot } from 'react-dom/client'
import '../src/assets/css/index.css'
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <App />
)
