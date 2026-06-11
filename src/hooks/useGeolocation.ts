import { useCallback, useEffect, useState } from "react";

export type GeoCoords = {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
};

export type GeoState = {
  coords: GeoCoords | null;
  status: "idle" | "prompt" | "loading" | "granted" | "denied" | "unavailable" | "error";
  error: string | null;
};

const STORAGE_KEY = "jabal_geo_v1";

function readCache(): GeoCoords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeoCoords;
    // expire after 30 minutes
    if (Date.now() - parsed.timestamp > 30 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useGeolocation(autoRequest = false) {
  const [state, setState] = useState<GeoState>({
    coords: null,
    status: "idle",
    error: null,
  });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ coords: null, status: "unavailable", error: "Geolocation not supported" });
      return;
    }
    setState((s) => ({ ...s, status: "loading", error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: GeoCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
        } catch {
          /* ignore */
        }
        setState({ coords, status: "granted", error: null });
      },
      (err) => {
        const status = err.code === err.PERMISSION_DENIED ? "denied" : "error";
        setState({ coords: null, status, error: err.message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setState({ coords: cached, status: "granted", error: null });
      return;
    }
    if (autoRequest) request();
  }, [autoRequest, request]);

  return { ...state, request };
}
