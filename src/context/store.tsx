"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  unit: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  createdAt: number;
  etaMinutes: number;
  address: string;
  payment: string;
  total: number;
  items: CartItem[];
};

type StoreValue = {
  hydrated: boolean;
  cart: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  cartExpiresAt: number | null;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toast: string | null;
  orders: Order[];
  rememberOrder: (order: Order) => void;
  userName: string | null;
  signIn: (name: string) => void;
  signOut: () => void;
};

const KEY = "wazir-store-v2";
const CART_TTL = 4 * 60 * 60 * 1000;
const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartUpdatedAt, setCartUpdatedAt] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          cart?: CartItem[];
          cartUpdatedAt?: number | null;
          orders?: Order[];
          userName?: string | null;
        };
        const stale =
          parsed.cart?.length &&
          parsed.cartUpdatedAt &&
          Date.now() - parsed.cartUpdatedAt > CART_TTL;
        if (parsed.cart && !stale) {
          setCart(parsed.cart);
          setCartUpdatedAt(parsed.cartUpdatedAt ?? Date.now());
        }
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.userName) setUserName(parsed.userName);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify({ cart, cartUpdatedAt, orders, userName }));
  }, [ready, cart, cartUpdatedAt, orders, userName]);

  useEffect(() => {
    if (!cart.length || !cartUpdatedAt) return;
    const remaining = cartUpdatedAt + CART_TTL - Date.now();
    if (remaining <= 0) {
      setCart([]);
      setCartUpdatedAt(null);
      return;
    }
    const timer = window.setTimeout(() => {
      setCart([]);
      setCartUpdatedAt(null);
      flash("عدّت 4 ساعات — السلة اتفضت تلقائيًا");
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [cart.length, cartUpdatedAt]);

  const flash = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  }, []);

  const add = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setCartUpdatedAt(Date.now());
      setCart((prev) => {
        const found = prev.find((line) => line.productId === item.productId);
        if (found) {
          return prev.map((line) =>
            line.productId === item.productId
              ? { ...line, qty: line.qty + qty }
              : line,
          );
        }
        return [...prev, { ...item, qty }];
      });
      flash("انضاف للسلة");
    },
    [flash],
  );

  const setQty = useCallback((productId: string, qty: number) => {
    setCartUpdatedAt(Date.now());
    setCart((prev) => {
      if (qty <= 0) return prev.filter((line) => line.productId !== productId);
      return prev.map((line) =>
        line.productId === productId ? { ...line, qty } : line,
      );
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      hydrated: ready,
      cart,
      add,
      setQty,
      clearCart: () => {
        setCart([]);
        setCartUpdatedAt(null);
      },
      cartCount: cart.reduce((sum, line) => sum + line.qty, 0),
      cartTotal: cart.reduce((sum, line) => sum + line.price * line.qty, 0),
      cartExpiresAt: cart.length && cartUpdatedAt ? cartUpdatedAt + CART_TTL : null,
      drawerOpen,
      setDrawerOpen,
      searchOpen,
      setSearchOpen,
      toast,
      orders,
      rememberOrder: (order) => setOrders((prev) => [order, ...prev]),
      userName,
      signIn: (name) => setUserName(name),
      signOut: () => setUserName(null),
    }),
    [ready, cart, cartUpdatedAt, add, setQty, drawerOpen, searchOpen, toast, orders, userName],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
