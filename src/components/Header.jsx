import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'
export default function Header() {
  const { user, logout, loggingOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const closeMenu = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuRef.current?.querySelector('button')?.focus()
      } else if (event.type === 'pointerdown' && !menuRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', closeMenu)
    document.addEventListener('pointerdown', closeMenu)
    return () => {
      document.removeEventListener('keydown', closeMenu)
      document.removeEventListener('pointerdown', closeMenu)
    }
  }, [menuOpen])

  const close = () => setMenuOpen(false)
  return (
    <header className="header">
      <div className="container header-inner">
        <NavLink className="brand" to="/">
          Astral<span>999</span>
        </NavLink>
        <nav aria-label="Navegación principal">
          <NavLink to="/cartas">Cartas</NavLink>
          {user && (
            <div className="nav-menu" ref={menuRef}>
              <button
                className="nav-menu-trigger"
                type="button"
                aria-expanded={menuOpen}
                aria-controls="account-menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                Mi cuenta <span aria-hidden="true">⌄</span>
              </button>
              {menuOpen && (
                <div className="nav-menu-panel" id="account-menu">
                  <NavLink to="/historial" onClick={close}>
                    Historial
                  </NavLink>
                  <NavLink to="/perfil" onClick={close}>
                    Perfil
                  </NavLink>
                  <button
                    onClick={() => {
                      close()
                      logout()
                    }}
                    disabled={loggingOut}
                  >
                    {loggingOut ? 'Saliendo…' : 'Salir'}
                  </button>
                </div>
              )}
            </div>
          )}
          {!user && <NavLink to="/login">Entrar</NavLink>}
        </nav>
      </div>
    </header>
  )
}
