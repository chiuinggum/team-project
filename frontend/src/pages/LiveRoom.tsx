import React, { useState, useEffect } from 'react';
import "@livekit/components-styles";
import { Chat } from "@livekit/components-react";
import { useUser } from "../contexts/UserContext";
import { backendurl } from "../constants/urls";
import { Room, Participant, TrackPublication, RoomEvent } from "livekit-client";
import styled from 'styled-components';
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { frontendurl } from "../constants/urls";
import { socketurl } from "../constants/urls";
import io from 'socket.io-client';
import { FaTicketAlt, FaShoppingCart } from 'react-icons/fa';


import { FaExternalLinkAlt } from 'react-icons/fa';
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  VideoConference,
  useLiveKitRoom,
  useTracks,
} from '@livekit/components-react';

import { Track } from "livekit-client";

const serverUrl = 'wss://stylish-ij2vs7me.livekit.cloud';
//const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDM3MDM1OTgsImlzcyI6IkFQSTIySGpHVVBiSktacSIsIm5iZiI6MTcwMzY5NDU5OCwic3ViIjoicGluZSIsInZpZGVvIjp7ImNhblB1Ymxpc2giOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsInJvb20iOiJwaW5lX3Rlc3QiLCJyb29tSm9pbiI6dHJ1ZX19.HXxfiSmwHgyD3Vg0ego_5ZT-On9Qx-ytChNVA6M0CwA';


const StyledChatContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  height: 100%;
  z-index: 2000; 
`;


const VideoContainer = styled.div`
  position: relative;
  height: 100vh;
`;

const StyledControlBar = styled(ControlBar)`
  position: absolute;
  bottom: 0;
  width: 100%;
  margin-left:-230px;
`;

const StyledJoinMessages = styled.div`
  position: absolute;
  top: 100px;
  left: 100px;
  z-index: 5000; 
  color: white;
  //background-color: rgba(0, 0, 0, 0.5); // 半透明背景
  padding-left: 10px;
`;

const VideoContainerWithMargin = styled(VideoContainer)`
  margin-top: 111px; 
  height: 85vh; 
  overflow: hidden;
  
`;

const LiveHostInfo = styled.div`
  position: absolute;
  bottom: 38px;
  left: 20px;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5); 
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.5;
`;


const TitleBar = styled.div`
  position: absolute;
  top: 0;
  margin-top:2%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background-color: rgba(50, 50, 50, 0.7);
  color: #FFFFFF; 
  //color: #333;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 18px;
  line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  text-align: center;
  width: 98.5%; 
`;


function MyVideoConference({ showInput, productID, setProductID, handleSubmitProductID, cartLink, showCartButton }) {
  const [showCoupon, setShowCoupon] = useState(true);

  const { user } = useUser();


  const tracks = useTracks(
    [

      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const initiatorIdentity = 'user-yh';
  const initiatorTrack = tracks.find(track => track?.participant?.identity === initiatorIdentity);



  // If the initiator's track is not found, show a loading message or a placeholder
  if (!initiatorTrack) {
    return <div>直播尚未開始 請稍候...</div>;
  }


  const handleCouponClick = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    const userId = user.id;
    console.log('user get reward is ', userId)
    const rewardId = 7;

    try {
      const response = await fetch(`${backendurl}/user/reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, reward_id: rewardId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Successfully received response:', data);
      setShowCoupon(false);
    } catch (error) {
      console.error('Error during fetching:', error);
    }
  };


  return (

    <div style={{ position: 'relative', height: '100%' }}>

      <TitleBar>
        Stylish試衣間 | 限時特惠中
      </TitleBar>

      {showInput && (
        <div style={{ position: 'absolute', bottom: '100px', left: '180px', zIndex: 6000, backgroundColor: 'white', padding: '1px', borderRadius: '5px', opacity: 0.7 }}>
          <input
            type="text"
            value={productID}
            onChange={(e) => setProductID(e.target.value)}
            placeholder="Enter Product ID"
            style={{ padding: '5px', margin: '5px' }}
          />
          <button onClick={handleSubmitProductID} style={{ padding: '5px', margin: '5px' }}>Create Cart Link</button>
          {cartLink && <a href={cartLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '10px' }}>Go to Cart</a>}
        </div>
      )}


      <GridLayout tracks={[initiatorTrack]} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
        {initiatorTrack && <ParticipantTile key={initiatorTrack.sid} track={initiatorTrack} />}
      </GridLayout>

      <LiveHostInfo>
        <div>主播主: yh</div>
        <div>身高: 155 cm</div>
        <div>體重: 50 kg</div>
      </LiveHostInfo>

      {showCoupon && (
        <img
          src="coupon6.png"
          alt="優惠卷"
          style={{ position: 'absolute', top: 100, right: 30, width: '140px', height: '90px', zIndex: 10, opacity: 0.8 }}
          onClick={handleCouponClick}
        />
      )}

      {showCartButton && (
        <a href={cartLink} target="_blank" rel="noopener noreferrer"
          style={{ position: 'absolute', top: 200, right: 30, zIndex: 10, opacity: 0.9 }}>
          <img src="order3.png" alt="購物連結" style={{ width: '130px', height: '130px' }} />
        </a>
      )}




    </div>

  );
}









export default function LiveRoom() {

  const { user } = useUser();


  const [token, setToken] = useState(null);
  const [joinMessages, setJoinMessages] = useState([]);
  const [displayMessage, setDisplayMessage] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [productID, setProductID] = useState("");
  const [cartLink, setCartLink] = useState("");
  const [showCartButton, setShowCartButton] = useState(false);
  const [socket, setSocket] = useState(null);



  useEffect(() => {
    console.log('User ID:', user?.id);
    if (user?.id === 10243) {
      setShowInput(true);
    } else {
      setShowInput(false);
    }
  }, [user]);



  useEffect(() => {
    console.log('Setting up socket connection...');
    const newSocket = io(socketurl);

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('updateProduct', (productId) => {
      console.log('Received updateProduct event with productId:', productId);
      const cartLink = `${frontendurl}/products/${productId}`;
      //const cartLink = 'http:localhost:5173/products/${productId}';

      setProductID(productId);
      setShowCartButton(true);
      setCartLink(cartLink);
    });

    newSocket.on('userJoined', (userName) => {
      console.log(`User joined: ${userName}`);
      setDisplayMessage(`${userName} joined the room`);
      setTimeout(() => setDisplayMessage(''), 2000);
    });

    newSocket.on('userLeft', (userName) => {
      console.log(`User left: ${userName}`);
      setDisplayMessage(`${userName} left the room`);
      setTimeout(() => setDisplayMessage(''), 2000);
    });


    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket); // Store the socket in the state variable

    return () => {
      console.log('Cleaning up socket...');
      newSocket.disconnect();
    };
  }, []);




  const handleSubmitProductID = () => {
    if (user?.id === 10243 && productID && socket) {
      console.log('Emitting broadcastProductId event with productId:', productID);
      socket.emit('broadcastProductId', productID);
      setShowCartButton(true);
    } else {
      console.log('Socket not available or productID not set');
    }
  };



  useEffect(() => {
    const storage = window.localStorage;
    const token = storage.getItem("token"); // 這是用戶的登入 token，不是 livekit 的 token

    fetch(`${backendurl}/getToken`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // 使用 Bearer token 進行驗證
      },
    })
      .then(response => response.json())
      .then(data => {
        setToken(data.token);
      })
      .catch(error => {
        console.error('獲取令牌時出錯:', error);
      });
  }, []);


  if (!token) {
    return <div>Loading...請登入！！</div>;
  }



  return (
    <div>
      <Header />
      <VideoContainerWithMargin>
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          data-lk-theme="default"
        >
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: 3 }}>
              <MyVideoConference
                showInput={showInput}
                productID={productID}
                setProductID={setProductID}
                handleSubmitProductID={handleSubmitProductID}
                cartLink={cartLink}
                showCartButton={showCartButton}
              />
              <RoomAudioRenderer />
              <StyledControlBar />
            </div>
            <StyledChatContainer>
              <Chat />
            </StyledChatContainer>
          </div>
        </LiveKitRoom>
      </VideoContainerWithMargin>
      <Footer />
    </div>
  );
}