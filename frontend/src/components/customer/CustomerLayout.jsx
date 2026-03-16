import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const CustomerLayout = () => {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1 pt-24 md:pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
