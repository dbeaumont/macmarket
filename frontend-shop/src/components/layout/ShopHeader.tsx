import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { ShoppingCart, Apple, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function ShopHeader() {
  const auth = useAuth();
  const { fetchCart, itemCount } = useCartStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const prevCountRef = useRef(0);
  const count = itemCount();

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchCart();
    }
  }, [auth.isAuthenticated, fetchCart]);

  useEffect(() => {
    if (count > prevCountRef.current && prevCountRef.current >= 0) {
      setBadgeBounce(true);
      const timer = setTimeout(() => setBadgeBounce(false), 300);
      prevCountRef.current = count;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Apple className="h-6 w-6" />
            <span>MacMarket</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Catalogue
            </Link>
            {auth.isAuthenticated && (
              <Link to="/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Mes commandes
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="inline-flex items-center justify-center rounded-lg h-8 w-8 hover:bg-muted transition-colors md:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button
              onClick={() => auth.isAuthenticated ? setCartOpen(true) : auth.signinRedirect()}
              className="relative inline-flex items-center justify-center rounded-lg h-8 w-8 hover:bg-muted transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold transition-transform duration-300 ${badgeBounce ? 'scale-125' : 'scale-100'}`}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {auth.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/account" className="inline-flex items-center gap-1.5 rounded-lg px-3 h-8 text-sm hover:bg-muted transition-colors">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{auth.user?.profile?.name || 'Compte'}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => auth.signoutRedirect()} className="text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => auth.signinRedirect()}>
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="border-b bg-background md:hidden">
          <nav className="container mx-auto flex flex-col px-4 py-3 gap-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Catalogue
            </Link>
            {auth.isAuthenticated && (
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Mes commandes
              </Link>
            )}
          </nav>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
