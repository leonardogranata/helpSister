import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage    from './pages/LandingPage/LandingPage'
import LoginPage      from './pages/LoginPage/LoginPage'
import RegisterPage   from './pages/RegisterPage/RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/entrar"  element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App