import { useState } from 'react'
import './App.scss'

function App() {
  const [ip, setIp] = useState('');
  // Preload standard ones?
  const [fieldList, setFieldList] = useState(['country','countryCode','region','regionName','city','zip','lat','lon','timezone','isp','org','as']);
  // Is there a good default here? Or require selection before any data is displayed?
  // Maybe disable this on error
  const [field, setField] = useState('');
  const [data, setData] = useState({});
  const [status, setStatus] = useState(null);
  const [respError, setRespError] = useState('');
  // add field errors, text, labels, etc.
  const [ipError, setIpError] = useState(null);
  const [fieldError, setFieldError] = useState(null);

  const BASE_URL = `http://ip-api.com/json/`;
  const IPV4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
  // modify the following to ensure it can't end in a singular colon
  // also require the right number of possible segments? ie total can't exceed 8
  const IPV6 = /^(([0-9a-f]\:){7}[0-9a-f])|([0-9a-f]\:)*(\:\:)([0-9a-f]\:)*([0-9a-f]){0,1}$/i
  const IPV6_DUAL = /^(([0-9a-f]\:){7}[0-9a-f])|([0-9a-f]\:)*(\:\:)([0-9a-f]\:)*([0-9]{1,3}\.){3}([0-9]){1,3}$/

  const updateIp = (val) => {
    setIp(val);
    setIpError(null);
  }

  const updateField = (val) => {
    if (fieldList.indexOf(val) == -1) {
      setFieldError('Please select info from the list provided')
      setField('')
    } else {
      setFieldError(null);
      setField(val);
    }
  }

  const retrieveData = () => {
    if (!IPV4.test(ip) && !IPV6.test(ip) && !IPV6_DUAL.test(ip)) {
      setIpError(`${ip} is not in a valid format. Acceptable formats include IPv4 (eg. 1.234.5.67), IPv6 (eg. ffff::01234), and IPv6 dual (eg. ffff::01234:1.234.5.67)`)
      return;
    }
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
      <h1>IP Address Data Lookup</h1>
      <div className='input-container'>
        <label htmlFor='ip' className={ipError ? 'error' : ''}>Enter an IP address:</label>
        <input
          id='ip'
          name='ip'
          type='text'
          className={ipError ? 'error' : ''}
          aria-invalid={ipError ? true : false}
          onChange={(e) => {updateIp(e.target.value)}}
          onBlur={retrieveData}
        />
        {ipError && <div className='error'>{ipError}</div>}

        <label htmlFor='field' className={fieldError ? 'error' : ''}>Select the address info to view:</label>
        <select
          id='field'
          name='field'
          className={fieldError ? 'error' : ''}
          onChange={(e) => updateField(e.target.value)}
          defaultValue={field}
        >
          <option value='' disabled></option>
          {fieldList.map((f,i) => 
            <option key={i} value={f}>{f}</option>
          )}
        </select>
        {fieldError && <div className='error'>{fieldError}</div>}
      </div>

      {/* {status && <div className='status'>{status}</div>} */}
      <div className='data'>
        <h2>{respError ? status : field}</h2>
        {status == 'success' ? data[field] : respError}
      </div>
    </>
  )
}

export default App
