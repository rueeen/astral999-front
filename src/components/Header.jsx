import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'
export default function Header(){const {user,logout}=useAuth();return <header className="header"><div className="container header-inner"><NavLink className="brand" to="/">Astral<span>999</span></NavLink><nav><NavLink to="/cartas">Cartas</NavLink>{user&&<><NavLink to="/historial">Historial</NavLink><NavLink to="/perfil">Perfil</NavLink><button onClick={logout}>Salir</button></>}{!user&&<NavLink to="/login">Entrar</NavLink>}</nav></div></header>}
