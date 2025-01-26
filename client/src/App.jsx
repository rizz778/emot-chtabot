import { useState } from 'react'
import LandingPage from './components/LandingPage'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <LandingPage/>
    </>
  )
}

export default App
