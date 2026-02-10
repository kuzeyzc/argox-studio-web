import { useOutletContext } from "react-router-dom";
import type { Artist } from "@/data/studio-data";

interface LayoutContext {
  openBooking: (artist?: Artist) => void;
}

export const useLayoutContext = () => useOutletContext<LayoutContext>();
