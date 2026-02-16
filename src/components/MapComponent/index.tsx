import { useMemo, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRequestCreationStore } from "../../store";

// --- Custom Icon Helpers ---
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const icons = {
  start: createIcon("green"),
  end: createIcon("red"),
  intermediate: createIcon("blue"),
};

interface Stop {
  id: string;
  lat?: number;
  lon?: number;
  address?: string;
}

// Automatically fits the map view to show all markers
const MapAutoCenter = ({ stops }: { stops: Stop[] }) => {
  const map = useMap();
  useEffect(() => {
    const valid = stops.filter((s) => s.lat && s.lon);
    if (valid.length > 0) {
      const coords = valid.map((s) => [s.lat!, s.lon!] as [number, number]);
      map.fitBounds(coords, { padding: [50, 50], maxZoom: 14 });
    }
  }, [stops, map]);
  return null;
};

const MapViewer = ({ stops }: { stops: Stop[] }) => {
  const [roadPath, setRoadPath] = useState<[number, number][]>([]);
  const setRouteMetrics = useRequestCreationStore(
    (state) => state.setRouteMetrics,
  );

  useEffect(() => {
    const fetchRoute = async () => {
      const validStops = stops.filter(
        (s) => s.lat !== undefined && s.lon !== undefined,
      );
      if (validStops.length < 2) return;

      const coordsString = validStops.map((s) => `${s.lon},${s.lat}`).join(";");

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`,
        );
        const data = await response.json();

        if (data.code === "Ok" && data.routes.length > 0) {
          const route = data.routes[0];

          const routeCoords = route.geometry.coordinates.map(
            (coord: [number, number]) =>
              [coord[1], coord[0]] as [number, number],
          );
          setRoadPath(routeCoords);

          // Correct way to update the store with actual OSRM data
          setRouteMetrics(route.distance, route.duration);
        }
      } catch (error) {
        console.error("Routing error:", error);
      }
    };

    fetchRoute();
  }, [stops, setRouteMetrics]);

  return (
    <MapContainer
      center={[11.4965, 77.2764]}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

      {/* Draw the Actual Road Route Line */}
      {roadPath.length > 0 && (
        <Polyline
          positions={roadPath}
          color="#4f46e5"
          weight={5}
          opacity={0.8}
        />
      )}

      {/* Render Markers */}
      {stops.map((stop, idx) => {
        if (!stop.lat || !stop.lon) return null;

        let icon = icons.intermediate;
        if (idx === 0) icon = icons.start;
        else if (idx === stops.length - 1) icon = icons.end;

        return (
          <Marker key={stop.id} position={[stop.lat, stop.lon]} icon={icon} />
        );
      })}

      <MapAutoCenter stops={stops} />
    </MapContainer>
  );
};

export default MapViewer;
