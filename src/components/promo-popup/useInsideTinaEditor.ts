import { useEffect, useState } from "react";
import { insideTinaEditor } from "../../utils/reveal";

export function useInsideTinaEditor(): boolean {
  const [inside, setInside] = useState(false);

  useEffect(() => setInside(insideTinaEditor()), []);

  return inside;
}
