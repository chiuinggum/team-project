import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import ProductPage from "./pages/ProductPage";
import SearchResultPage from "./pages/SearchResultPage";
import ThankYouPage from "./pages/ThankYouPage";
import Loginpage from "./pages/LoginPage";
import Registerpage from "./pages/RegisterPage";
import ReviewPage from "./pages/ReviewPage";

import { UserProvider } from "./contexts/UserContext";
import UserAuthInitializer from "./utils/UserAuthInitializer";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});
function App() {
  return (
    <UserProvider>
      <div className="flex flex-col min-h-screen">
        {
          <QueryClientProvider client={queryClient}>
            <UserAuthInitializer />
            <BrowserRouter>
              <Routes>
                <Route path="/search" element={<SearchResultPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/:category" element={<HomePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/products/:productId" element={<ProductPage />} />
                <Route path="/thankyou" element={<ThankYouPage />} />
                <Route path="/login" element={<Loginpage />} />
                <Route path="/register" element={<Registerpage />} />
                <Route path="/review" element={<ReviewPage />} />
              </Routes>
            </BrowserRouter>
          </QueryClientProvider>
        }
      </div>
    </UserProvider>
  );
}

export default App;
