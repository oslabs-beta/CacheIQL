import React, { useEffect, useState } from 'react';
import LocationCard from './LocationCard.jsx';
import Map from './Map.jsx';
import afro from '../assets/afro.jpg';
import { getBoundsOfDistance } from 'geolib';
const cacheIt = require('cacheiql-client');

const App = () => {
  const [center, setCenter] = useState([43.0, 74.0]);
  const [backendData, setBackendData] = useState([]);
  const [State, setState] = useState('');
  const [City, setCity] = useState('');
  const [Zip, setZip] = useState('');
  const [businessCoords, setBusinessCoords] = useState([]);
  const [radius, setRadius] = useState(24);
  const [pan, setPan] = useState([]);
  const [pannel, setPannel] = useState(true);

  //fetching the api route and whatever the response is, is what gets sent to the component

  const handleState = (e) => {
    setState(() => e.target.value);
  };
  const handleCity = (e) => {
    setCity(() => e.target.value);
  };
  const handleZip = (e) => {
    setZip(() => e.target.value);
  };

  const handlePannel = () => {
    setPannel((value) => (value ? false : true));
    console.log(pannel);
  };
  const handleSlider = (e) => {
    setRadius(() => e.target.value);
  };
  const handleCenter = async () => {
    await fetch(`http://localhost:3000/location/${City} ${State} ${Zip}`)
      .then((response) => response.json())
      .then((data) => {
        setCenter([data.geocode.lat, data.geocode.lng]);
      })
      .catch((error) => {
        console.error('Error fetching API:', error);
      });
  };

  const highlightCenter = (businessName, businessObj) => {
    businessObj.forEach((element) => {
      if (element.popup === businessName) {
        setPan(element.geocode);
      }
    });
  };
  const handleClickGoogle = async () => {
    // const requestBody = {
    //   textQuery: 'Black Owned',
    //   locationBias: {
    //     circle: {
    //       center: {
    //         latitude: center[0],
    //         longitude: center[1],
    //       },
    //       radius: radius * 1609.34,
    //     },
    //   },
    // };
    const bounds = getBoundsOfDistance(
      { latitude: center[0], longitude: center[1] },
      radius * 1609.34
    );
    console.log(bounds);
    const requestBody = {
      textQuery: 'Black Owned',
      locationRestriction: {
        rectangle: {
          low: {
            latitude: bounds[0].latitude,
            longitude: bounds[0].longitude,
          },
          high: {
            latitude: bounds[1].latitude,
            longitude: bounds[1].longitude,
          },
        },
      },
    };
    await fetch(`http://localhost:3000/api/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then(async (data) => {
        setBackendData(data.places);
      })
      .catch((error) => {
        console.error('Error fetching API:', error);
      });
  };

  useEffect(() => {
    if (center.length > 0 && center[0] !== 43.0 && center[1] !== 74.0) {
      //LOOK HERE!///////////////////////////////////
      cacheIt('testingquery', { testing: 'test' });
      ///////////////////////////////////////////////
      handleClickGoogle();
    }
  }, [center]);
  useEffect(() => {
    if (backendData.length > 0) {
      const fetchCoords = async () => {
        const coordsPromises = backendData.map(async (business) => {
          try {
            const response = await fetch(
              `http://localhost:3000/location/${business.formattedAddress}`
            ).catch((error) => {
              console.log('testing error');
            });

            if (!response.ok) {
              throw new Error('HTTP Error');
            }
            const data = await response.json();

            return {
              geocode: [data.geocode.lat, data.geocode.lng],
              popup: business.displayName.text,
            };
          } catch (error) {
            console.error('error fetching coordinates');
            return null;
          }
        });
        const coords = await Promise.all(coordsPromises);
        console.log('finished');
        setBusinessCoords(coords.filter((coord) => coord !== null));
      };

      fetchCoords();
    }
  }, [backendData]);
  return (
    <>
      <h1 className='Title'>
        B.O.B.S, LIST{' '}
        <img src={afro} alt='Afro Picture' className='afroImage' />
      </h1>
      <div className='mainContainer'>
        <div className='leftSide'>
          <div className=' inputBoxes'>
            <div className='inputGroup'>
              <p>State:</p>
              <select value={State} onChange={handleState}>
                <option value=''>Pick a State</option>
                <option value='AL'>AL</option>
                <option value='AK'>AK</option>
                <option value='AZ'>AZ</option>
                <option value='AR'>AR</option>
                <option value='CA'>CA</option>
                <option value='CO'>CO</option>
                <option value='CT'>CT</option>
                <option value='DE'>DE</option>
                <option value='FL'>FL</option>
                <option value='GA'>GA</option>
                <option value='HI'>HI</option>
                <option value='ID'>ID</option>
                <option value='IL'>IL</option>
                <option value='IN'>IN</option>
                <option value='IA'>IA</option>
                <option value='KS'>KS</option>
                <option value='KY'>KY</option>
                <option value='LA'>LA</option>
                <option value='ME'>ME</option>
                <option value='MD'>MD</option>
                <option value='MA'>MA</option>
                <option value='MI'>MI</option>
                <option value='MN'>MN</option>
                <option value='MS'>MS</option>
                <option value='MO'>MO</option>
                <option value='MT'>MT</option>
                <option value='NE'>NE</option>
                <option value='NV'>NV</option>
                <option value='NH'>NH</option>
                <option value='NJ'>NJ</option>
                <option value='NM'>NM</option>
                <option value='NY'>NY</option>
                <option value='NC'>NC</option>
                <option value='ND'>ND</option>
                <option value='OH'>OH</option>
                <option value='OK'>OK</option>
                <option value='OR'>OR</option>
                <option value='PA'>PA</option>
                <option value='RI'>RI</option>
                <option value='SC'>SC</option>
                <option value='SD'>SD</option>
                <option value='TN'>TN</option>
                <option value='TX'>TX</option>
                <option value='UT'>UT</option>
                <option value='VT'>VT</option>
                <option value='WA'>WA</option>
                <option value='WV'>WV</option>
                <option value='WI'>WI</option>
                <option value='WY'>WY</option>
              </select>
            </div>
            <div className='inputGroup'>
              <p>City</p>
              <input type='text' onChange={handleCity} />
            </div>
            <div className='inputGroup'>
              <p>Zip</p>
              <input type='text' onChange={handleZip} />
            </div>

            <input
              type='range'
              min='1'
              max='24'
              className='rangeSlider'
              onChange={handleSlider}
            />

            <button className='searchButton' onClick={handleCenter}>
              Search
            </button>
          </div>
          <div className='locationContainer'>
            <div className='tab-container'>
              <button onClick={handlePannel} className='tab'>
                Results
              </button>
              <button onClick={handlePannel} className='tab'>
                Favorites
              </button>
            </div>
            {backendData.map((business, i) => (
              <div
                key={`${i} ${business.displayName.text}`}
                className='locationCard'
                onClick={() =>
                  highlightCenter(business.displayName.text, businessCoords)
                }
              >
                {pannel === true && (
                  <LocationCard
                    key={i}
                    business={business.displayName.text}
                    rating={business.rating}
                    type={business.primaryTypeDisplayName}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className='mapBox'>
          <Map
            markers={businessCoords}
            center={center}
            radius={radius * 1609.34}
            pan={pan}
          />
        </div>
      </div>
    </>
  );
};

export default App;
