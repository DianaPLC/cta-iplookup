import { useState } from 'react'
import './App.css'

function App() {
  const [ip, setIp] = useState('');
  // Preload standard ones?
  const [fieldList, setFieldList] = useState([]);
  // Is there a good default here? Or require selection before any data is displayed?
  // Maybe disable this on error
  const [field, setField] = useState('region');
  const [data, setData] = useState({});
  const [status, setStatus] = useState(null);
  const [respError, setRespError] = useState('');
  // add field errors, text, labels, etc.

  const BASE_URL = `http://ip-api.com/json/`;

  function retrieveData() {
    fetch(BASE_URL + ip)
      .then(response => {
        if (!response.ok) throw new Error(response);
        return response.json()
      })
      .then(parsed => {
          if (parsed.status != 'success') throw new Error(parsed.message);
          setData(parsed);
          setStatus(parsed.status)
          // Filter out the redundant/unhelpful ones?
          setFieldList(Object.keys(parsed));
      })
      .catch(error => {
        // Should get more fine-grained here
        setStatus(error.message);
        setRespError(`Unable to look up data for ${ip}; please double-check the address.`)
      });
  }

  return (
    <>
      <input type='text' onChange={(e) => {setIp(e.target.value)}} onBlur={retrieveData}/>
      <select onChange={(e) => setField(e.target.value)}>
        {fieldList.map((f,i) => <option key={i} value={f}>{f}</option>)}
      </select>
      {status && <div>{status}</div>}
      <div>{status == 'success' ? data[field] : respError}</div>
    </>
  )
}

export default App
