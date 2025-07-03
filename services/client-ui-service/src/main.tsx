import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import App from './App'
import './index.css'
import { Providers } from "./store/provider";
import ScrollToTop from './components/common/ScrollToTo'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router basename="/">
     <Providers>
      <UserProvider>
        <ScrollToTop />
        <App />
      </UserProvider>
     </Providers>
      
    </Router>
  </React.StrictMode>,
) 