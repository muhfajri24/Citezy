"use client";
import { createContext, useContext } from "react";
// About and QA examples remain fictional even when the research adapter is real.
export const DemoDataContext = createContext(true);
export const useDemoData = () => useContext(DemoDataContext);
