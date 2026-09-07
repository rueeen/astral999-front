import { Link } from 'react-router-dom'
export default function NotFound(){return <main className="page container empty"><span className="eyebrow">404</span><h1 className="page-title">Este camino no aparece en las cartas</h1><p>La página que buscas no existe.</p><Link className="button" to="/">Volver al inicio</Link></main>}
