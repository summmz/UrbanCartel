import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Categories from "./pages/Categories";
import NewDrops from "./pages/NewDrops";
import Sale from "./pages/Sale";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import ReviewModeration from "./pages/admin/ReviewModeration";
import AdminReturns from "./pages/admin/AdminReturns";
import Help from "./pages/Help";
import Returns from "./pages/Returns";
import InitiateReturn from "./pages/InitiateReturn";
import Login from "./pages/Login";
import CustomCursor from "./components/CustomCursor";
import InteractiveBackground from "./components/InteractiveBackground";
import CategoryPage from "./pages/CategoryPage";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <PageLoader />
      <div className="w-full flex flex-col min-h-screen">
        <Switch>
          <Route path="/"                          component={Home} />
          <Route path="/shop"                      component={Shop} />
          <Route path="/categories"                component={Categories} />
          <Route path="/category/:slug"            component={CategoryPage} />
          <Route path="/new-drops"                 component={NewDrops} />
          <Route path="/sale"                      component={Sale} />
          <Route path="/login"                     component={Login} />
          <Route path="/product/:id"               component={ProductDetail} />
          <Route path="/cart"                      component={Cart} />
          <Route path="/checkout/:id"              component={Checkout} />
          <Route path="/orders"                    component={Orders} />
          <Route path="/orders/:id"                component={OrderDetail} />
          <Route path="/profile"                   component={Profile} />
          <Route path="/help"                      component={Help} />
          <Route path="/returns"                   component={Returns} />
          <Route path="/returns/initiate/:orderId" component={InitiateReturn} />
          <Route path="/admin"                     component={AdminDashboard} />
          <Route path="/admin/reviews"             component={ReviewModeration} />
          <Route path="/admin/returns"             component={AdminReturns} />
          <Route path="/404"                       component={NotFound} />
          <Route                                   component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <InteractiveBackground />
        <div className="relative z-0 min-h-screen">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </div>
        <CustomCursor />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
