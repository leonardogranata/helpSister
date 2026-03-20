import styles from './Navbar.module.css'
import logo from '../../../assets/logo.png'

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <a href="/" className={styles.logo}>
          <img src={logo} alt="Help Sister" />
        </a>

        <ul className={styles.links}>
          <li><a href="#solucao">Nossa Solução</a></li>
          <li><a href="#como-funciona">Como Funciona</a></li>
          <li><a href="#conversar">Conversar</a></li>
          <li><a href="#contratar">Contratar</a></li>
        </ul>

        <div className={styles.actions}>
          <a href="/entrar" className={styles.btnOutline}>Entrar</a>
          <a href="/cadastro" className={styles.btnPrimary}>Começar Agora</a>
        </div>
      </div>
    </nav>
  )
}