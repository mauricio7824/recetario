import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './styles.css';

registerSW({ immediate: true });
navigator.storage?.persist?.(); // pide que el navegador no borre las recetas por falta de espacio
createRoot(document.getElementById('root')).render(<App />);
