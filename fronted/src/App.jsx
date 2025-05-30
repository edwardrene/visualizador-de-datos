import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [exampleAPI, setExampleAPI] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const registerUsername = () => {
      // PETICIONES TIPO POST
      fetch("http://127.0.0.1:8000/username", {
        method: "POST",
        body: inputValue
      })
        .then((res) => res.json())
        .then((response) => setInputValue(response))
        .catch((error) => console.error("Error:", error))
  }

  // PETICIONES TIPO GET
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => response.json())
      .then((json) => setExampleAPI(json));
  }, []);

  return (
    <div className="text-center">
      {JSON.stringify(inputValue)}

      <section>
        <input type="text" onChange={(e) => setInputValue(e.target.value)} />
        <button onClick={registerUsername}>Registrar</button>
      </section>
    </div>
  );
}



export default App
