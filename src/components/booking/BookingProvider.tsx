"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { emptyBookingState, type BookingState } from "@/lib/booking";

const STORAGE_KEY = "mm-booking";

type Ctx = {
  state: BookingState;
  /** True once we've loaded any persisted booking state from sessionStorage.
   *  Step pages must wait for this before deciding to redirect — otherwise
   *  a refresh on step 3 would reset state to empty (during the brief window
   *  before hydration) and bounce the user back to step 1. */
  hydrated: boolean;
  setField: <K extends keyof BookingState>(k: K, v: BookingState[K]) => void;
  reset: () => void;
};

const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(emptyBookingState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BookingState;
        setState({ ...emptyBookingState, ...parsed });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const setField = useCallback(
    <K extends keyof BookingState>(k: K, v: BookingState[K]) => {
      setState((prev) => ({ ...prev, [k]: v }));
    },
    [],
  );

  const reset = useCallback(() => {
    setState(emptyBookingState);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <BookingContext.Provider value={{ state, hydrated, setField, reset }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
