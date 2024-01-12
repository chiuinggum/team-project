
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "../components/common/Header";
import Banner from "../components/homepage/Banner";
import ProductGrid from "../components/homepage/ProductGrid";
import Footer from "../components/common/Footer";
import MessageBox from "../components/common/MessageBox";
import { frontendurl } from "../constants/urls";

type SelectInfo = [number, string];

export default function HomePage() {
  const [selectInfo, setSelectInfo] = useState<SelectInfo>([0, ""]);

  const { category } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!category) {
      navigate("/all");
      console.log("redirect");
    }
  }, []);

  useEffect(() => {
    if (category) {
      setSelectInfo([1, category]);
    }
  }, [category]);

  const navigateToLiveRoom = () => {
    navigate("/live");
    //window.location.href = `${frontendurl}/live`;
  };


  return (
    <div>
      <Header />
      <Banner />
      <ProductGrid selectInfo={selectInfo} />
      <MessageBox />
      <Footer />

      <div 
        style={{ 
          position: 'fixed', 
          left: '1%', 
          top: '75%', 
          transform: 'translateY(-50%)', 
          zIndex: 1000,
          cursor: 'pointer' 
        }} 
        onClick={navigateToLiveRoom}
      >
        <img 
          src="live3.png" 
          alt="進入直播間" 
          style={{ width: '100px', height: '100px' }}
        />
          <p style={{ 
    margin: '-18% 0 0 15%', 
    fontSize: '14px', 
    color: '#333', 
    fontFamily: 'Microsoft YaHei, Arial, sans-serif'
  }}>進入直播間</p>
      </div>

    </div>
  );
}
