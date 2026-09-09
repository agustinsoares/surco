"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "surco-carrito";

function leerStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [lineas, setLineas] = useState([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // Hidratamos desde localStorage recién en el cliente (el server no
    // tiene acceso) para evitar un mismatch de hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLineas(leerStorage());
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lineas));
    window.dispatchEvent(new Event("surco-carrito-cambio"));
  }, [lineas, listo]);

  useEffect(() => {
    function onStorage() {
      setLineas(leerStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const agregar = useCallback((producto, cantidad = 1) => {
    setLineas((prev) => {
      const existente = prev.find((l) => l.codigo === producto.id);
      if (existente) {
        const nuevaCantidad = Math.min(existente.cantidad + cantidad, producto.existencias);
        return prev.map((l) => (l.codigo === producto.id ? { ...l, cantidad: nuevaCantidad } : l));
      }
      return [
        ...prev,
        {
          codigo: producto.id,
          nombre: producto.nombre,
          autor: producto.autor,
          imagen: producto.imagen,
          precio: producto.precio,
          existencias: producto.existencias,
          cantidad: Math.min(cantidad, producto.existencias),
        },
      ];
    });
  }, []);

  const modificarCantidad = useCallback((codigo, delta) => {
    setLineas((prev) =>
      prev
        .map((l) => {
          if (l.codigo !== codigo) return l;
          const cantidad = Math.min(Math.max(l.cantidad + delta, 0), l.existencias);
          return { ...l, cantidad };
        })
        .filter((l) => l.cantidad > 0)
    );
  }, []);

  const eliminar = useCallback((codigo) => {
    setLineas((prev) => prev.filter((l) => l.codigo !== codigo));
  }, []);

  const vaciar = useCallback(() => setLineas([]), []);

  const total = useMemo(() => lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0), [lineas]);
  const cantidadTotal = useMemo(() => lineas.reduce((acc, l) => acc + l.cantidad, 0), [lineas]);

  const value = useMemo(
    () => ({ lineas, agregar, modificarCantidad, eliminar, vaciar, total, cantidadTotal, listo }),
    [lineas, agregar, modificarCantidad, eliminar, vaciar, total, cantidadTotal, listo]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
