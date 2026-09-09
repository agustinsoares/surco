"use client";

import { useEffect } from "react";
import { useCart } from "./CartContext";

export default function ClearCartOnMount() {
  const { vaciar } = useCart();
  useEffect(() => {
    vaciar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
