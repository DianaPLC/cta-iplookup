import { useState } from 'react'
import './App.scss'

function App() {
  const [ip, setIp] = useState('');
  const [field, setField] = useState('');
  const [data, setData] = useState({});
  const [status, setStatus] = useState(null);
  const [respError, setRespError] = useState('');
  const [ipError, setIpError] = useState(null);
  const [fieldError, setFieldError] = useState(null);

  const BASE_URL = `http://ip-api.com/json/`;
  const IPV4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
  // not a perfect ipv6 check, but errors will be reported back by the API
  const IPV6 = /^(([0-9a-f]{1,4}\:){7}[0-9a-f]{1,4})|([0-9a-f]{1,4}\:)*(\:\:)([0-9a-f]{1,4}\:)*([0-9a-f]{1,4}){0,1}$/i
  const IPV6_DUAL = /^(([0-9a-f]{1,4}\:){7}[0-9a-f]{1,4})|([0-9a-f]{1,4}\:)*(\:\:)([0-9a-f]{1,4}\:)*([0-9]{1,3}\.){3}([0-9]){1,3}$/i

  const FIELDS = new Map([
    ['country', 'Country'],
    ['countryCode', 'Country Code'],
    ['region', 'Region Code'],
    ['regionName', 'Region Name'],
    ['city', 'City'],
    ['zip', 'Zip Code'],
    ['lat', 'Latitude'],
    ['lon', 'Longitude'],
    ['timezone', 'Time Zone'],
    ['isp', 'ISP'],
    ['org', 'Organization Name'],
    ['as', 'AS Number and Organization']
  ]);

  const updateIp = (val) => {
    setIp(val);
    setIpError(null);
    setRespError(null);
  }

  const updateField = (val) => {
    if (FIELDS.has(val)) {
      setFieldError(null);
      setField(val);
    } else {
      setFieldError('Please select info from the list provided');
      setField('');
    }
  }

  const retrieveData = () => {
    if (!ip.length) {
      setIpError('Please enter a value for the IP address');
      return;
    }
    if (!IPV4.test(ip) && !IPV6.test(ip) && !IPV6_DUAL.test(ip)) {
      setIpError(`
        ${ip} is not in a valid format.
        Acceptable formats include:
        IPv4 (eg. 1.234.5.67)
        IPv6 (eg. ffff::01234)
        IPv6 dual (eg. ffff::01234:1.234.5.67)
      `)
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
          console.log(parsed)
      })
      .catch(error => {
        // Should get more fine-grained here
        setStatus(error.message);
        setRespError(`
          Unable to look up data for ${ip};
          please double-check the address.
        `)
      });
  }

  return (
    <>
      <h1>IP Address Data Lookup</h1>
      <div className='input-container'>
        <label htmlFor='ip' className={ipError ? 'error' : ''}>
          Enter an IP address:
        </label>
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

        <label htmlFor='field' className={fieldError ? 'error' : ''}>
          Select the address info to view:
        </label>
        <select
          id='field'
          name='field'
          className={fieldError ? 'error' : ''}
          onChange={(e) => updateField(e.target.value)}
          defaultValue={field}
        >
          <option value='' disabled></option>
          {Array.of(...FIELDS).map((entry, index) => 
            <option key={index} value={entry[0]}>{entry[1]}</option>
          )}
        </select>
        {fieldError && <div className='error'>{fieldError}</div>}
      </div>

      { (status && field) && 
        <div className='data'>
          <h2>{respError ? status : FIELDS.get(field)}</h2>
          {status == 'success' ?
            (data[field].length > 0 ? data[field] : 'unknown')
            : respError
          }
        </div>
      }
    </>
  )
}

export default App
