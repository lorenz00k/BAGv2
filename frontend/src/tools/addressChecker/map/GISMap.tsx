"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { AggregatedResult } from "@/types/viennagis";
import { RISK_COLORS, HIGHLIGHT_COLORS } from "./layerStyles";
import {
  buildLayerFeatures,
  buildPOIFeatures,
} from "./buildGeoJSON";

// ── Constants ───────────────────────────────────────────────────────────

const VIENNA_CENTER: [number, number] = [16.3738, 48.2082];
const DEFAULT_ZOOM = 14;

/** Free raster tile style – no API key needed */
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster" as const,
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// ── Props ───────────────────────────────────────────────────────────────

interface GISMapProps {
  data: AggregatedResult | undefined;
  /** layerId of the currently highlighted layer (hover/select) */
  highlightedLayer?: string | null;
  className?: string;
}

// ── Component ───────────────────────────────────────────────────────────

export default function GISMap({
  data,
  highlightedLayer,
  className,
}: GISMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // ---- Initialize map once ----
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: VIENNA_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ---- Update layers when data changes ----
  const updateLayers = useCallback(
    (map: maplibregl.Map, result: AggregatedResult) => {
      // Remove old sources/layers
      cleanupSources(map);

      // 1. Add polygon layers (zoning, noise, flood, etc.)
      const layerFC = buildLayerFeatures(result.layers);

      if (layerFC.features.length > 0) {
        map.addSource("gis-layers", {
          type: "geojson",
          data: layerFC as GeoJSON.GeoJSON,
        });

        // One fill + stroke layer per color category
        for (const layer of result.layers) {
          if (!layer.geometry || !layer.available) continue;

          const colors = RISK_COLORS[layer.color];

          // Fill
          map.addLayer({
            id: `layer-fill-${layer.layerId}`,
            type: "fill",
            source: "gis-layers",
            filter: ["==", ["get", "layerId"], layer.layerId],
            paint: {
              "fill-color": colors.fill,
              "fill-opacity": colors.fillOpacity,
            },
          });

          // Outline
          map.addLayer({
            id: `layer-stroke-${layer.layerId}`,
            type: "line",
            source: "gis-layers",
            filter: ["==", ["get", "layerId"], layer.layerId],
            paint: {
              "line-color": colors.stroke,
              "line-width": 2,
            },
          });
        }
      }

      // 2. Add POI markers
      const poiFC = buildPOIFeatures(result.pois);
      if (poiFC.features.length > 0) {
        map.addSource("pois", {
          type: "geojson",
          data: poiFC as GeoJSON.GeoJSON,
        });

        map.addLayer({
          id: "poi-circles",
          type: "circle",
          source: "pois",
          paint: {
            "circle-radius": 6,
            "circle-color": "#6366f1",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      // 3. Add address marker
      if (result.address) {
        // Remove old marker
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        const { lng, lat } = result.address.coordinates;

        markerRef.current = new maplibregl.Marker({ color: "#1e40af" })
          .setLngLat([lng, lat])
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(
              `<strong>${result.address.fullAddress}</strong>`,
            ),
          )
          .addTo(map);

        // Fly to address
        map.flyTo({ center: [lng, lat], zoom: DEFAULT_ZOOM, duration: 1200 });
      }
    },
    [],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;

    const applyData = () => updateLayers(map, data);

    if (map.isStyleLoaded()) {
      applyData();
    } else {
      map.once("load", applyData);
    }
  }, [data, updateLayers]);

  // ---- Highlight layer on hover/select ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;

    for (const layer of data.layers) {
      if (!layer.geometry || !layer.available) continue;

      const fillId = `layer-fill-${layer.layerId}`;
      const strokeId = `layer-stroke-${layer.layerId}`;

      if (!map.getLayer(fillId)) continue;

      const isHighlighted = highlightedLayer === layer.layerId;
      const palette = isHighlighted
        ? HIGHLIGHT_COLORS[layer.color]
        : RISK_COLORS[layer.color];

      map.setPaintProperty(fillId, "fill-opacity", palette.fillOpacity);
      map.setPaintProperty(fillId, "fill-color", palette.fill);
      map.setPaintProperty(strokeId, "line-color", palette.stroke);
      map.setPaintProperty(
        strokeId,
        "line-width",
        isHighlighted ? 3.5 : 2,
      );
    }
  }, [highlightedLayer, data]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-full w-full min-h-[400px] rounded-lg"}
    />
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────

/** Remove all GIS sources/layers so we can re-add fresh data. */
function cleanupSources(map: maplibregl.Map) {
  const sourceIds = ["gis-layers", "pois"];

  for (const sourceId of sourceIds) {
    // Remove layers first
    const style = map.getStyle();
    if (style?.layers) {
      for (const layer of style.layers) {
        if ("source" in layer && layer.source === sourceId) {
          map.removeLayer(layer.id);
        }
      }
    }
    // Then remove source
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  }
}
