import { useRuta } from './lib/nav.js';
import Lista from './pages/Lista.jsx';
import Receta from './pages/Receta.jsx';
import Formulario from './pages/Formulario.jsx';
import Cocina from './pages/Cocina.jsx';
import Compras from './pages/Compras.jsx';
import Ajustes from './pages/Ajustes.jsx';

export default function App() {
  const [a, id] = useRuta();
  const cocina = a === 'cocina';

  let pagina;
  if (a === 'r' && id) pagina = <Receta key={id} id={id} />;
  else if (a === 'nueva') pagina = <Formulario />;
  else if (a === 'editar' && id) pagina = <Formulario key={id} id={id} />;
  else if (a === 'cocina' && id) pagina = <Cocina key={id} id={id} />;
  else if (a === 'compras') pagina = <Compras />;
  else if (a === 'ajustes') pagina = <Ajustes />;
  else pagina = <Lista />;

  const sec = a === 'compras' ? 'compras' : a === 'ajustes' ? 'ajustes' : 'recetas';
  return (
    <>
      {!cocina && <header className="barra"><a href="#/" className="marca">Recetario</a></header>}
      <main className={cocina ? 'cocina-main' : ''}>{pagina}</main>
      {!cocina && (
        <nav className="pestanas" aria-label="Secciones">
          <a href="#/" aria-current={sec === 'recetas' ? 'page' : undefined}>Recetas</a>
          <a href="#/compras" aria-current={sec === 'compras' ? 'page' : undefined}>Compras</a>
          <a href="#/ajustes" aria-current={sec === 'ajustes' ? 'page' : undefined}>Ajustes</a>
        </nav>
      )}
    </>
  );
}
