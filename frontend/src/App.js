import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";

function App() {

    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/test/')
            .then(res => res.json())
            .then(data => setData(data.data));
    })

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>


                <p>JSON data verkregen door api (zie App.js): <strong>{data}</strong></p>


            </header>
        </div>
    );
}

export default App;
