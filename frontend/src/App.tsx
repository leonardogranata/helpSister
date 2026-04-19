import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import BabysitterProfilePage from './pages/BabysitterProfilePage/BabysitterProfilePage'
import ChatPage from './pages/ChatPage/ChatPage'
import FindBabysittersPage from './pages/FindBabysittersPage/FindBabysittersPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<LandingPage />} />
        <Route path="/entrar"      element={<LoginPage />} />
        <Route path="/cadastro"    element={<RegisterPage />} />
        <Route path="/contratar"   element={<FindBabysittersPage />} />
        <Route path="/baba/perfil" element={<BabysitterProfilePage />} />
        <Route path="/baba/:id"    element={<BabysitterProfilePage />} />
        <Route path="/conversas" element={<ChatPage />} />
        <Route path="/conversas/:conversationId" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
