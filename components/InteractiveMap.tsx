"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import React-Leaflet components
const Map = dynamic(() => import("./LeafletMap"), { ssr: false });

export default function InteractiveMap() {
  return <Map />;
}
