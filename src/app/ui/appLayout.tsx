"use client";

import { useState } from "react";
import Nav from "./nav";
import Display from "./display";

export default function AppLayout() {
  const views = ["stopwatch", "24H", "weekly"];
  const [viewIndex, setViewIndex] = useState(0);

  const toggleView = () => {
    setViewIndex((prev) => (prev + 1) % views.length);
  };

  const view = views[viewIndex];

  return (
    <>
      <Nav activeView={view} onToggleView={toggleView} />
      <Display view={view} />
    </>
  );
}