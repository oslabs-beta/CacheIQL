import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import combIcon from '../assets/afro-comb.png';
import MarkerClusterGroup from 'react-leaflet-cluster';

const MapPanner = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center.length == 2) {
      map.panTo(new L.LatLng(center[0], center[1]));
    }
  }, [center, map]);
  return null;
};
const Map = ({ markers, center, radius, pan }) => {
  if (center.length == 0) {
    return;
  }

  const createCustomClusterIcon = (cluster) => {
    return new divIcon({
      html: `<div class="clusterIcon"'>${cluster.getChildCount()}</div>`,
      iconSize: [40, 40],
      className: 'customClusterIcon',
    });
  };
  const customIcon = new Icon({
    iconUrl: combIcon,
    iconSize: [40, 40],
  });

  return (
    <MapContainer center={center} zoom={8}>
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createCustomClusterIcon}
      >
        {markers.map((marker, i) => (
          <Marker
            position={marker.geocode}
            icon={customIcon}
            key={`${i} ` + marker.geocode}
          >
            <Popup color='#ad6a6c'>{marker.popup}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      <Circle
        center={center}
        color='#ad6a6c'
        fillColor='#d0ada7'
        radius={radius + 10000}
      />
      <MapPanner center={center} />
      {pan.length > 0 && <MapPanner center={pan} />}
    </MapContainer>
  );
};
export default Map;
