import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import webSocket from "socket.io-client";

import { useUser } from "../../../contexts/UserContext";

import { socketurl, backendurl, frontendurl } from "../../../constants/urls";

import { IoMdSend } from "react-icons/io";
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";
import { IoChatbox } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";

import Button from "@mui/material/Button";

import { generateTimestamp, getTimeDiff } from "../../../utils/tools";
import ImageDetailDialog from "./dialogs/ImageDetailDialog";

export default function MessageBox({
  messageOpen,
  messageCurrentRoom,
}: {
  messageOpen: boolean;
  messageCurrentRoom: number;
}) {
  const scrollRef = useRef(null);
  const sendButtonRef = useRef(null);
  const imageInputRef = useRef(null);

  const { user } = useUser();

  const [ws, setWs] = useState(null);

  const [active, setActive] = useState(false);
  const [messages, setMessages] = useState({});
  const [rooms, setRooms] = useState([]);

  const [currentRoom, setCurrentRoom] = useState(0);
  const [currentRoomName, setCurrentRoomName] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentProductDetail, setCurrentProductDetail] = useState(null);

  const [userMessage, setUserMessage] = useState("");
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [update, setUpdate] = useState(false);

  const [openImageDialog, setOpenImageDialog] = useState(false);

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
  };

  const handleUploadImageButtonClick = () => {
    imageInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    console.log("change");

    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageMessageUpload = async () => {
    const formData = new FormData();
    formData.append("image", imageInputRef.current.files[0]);

    console.log("1231232322332");

    console.log(typeof imageInputRef.current.files[0]);
    console.log(imageInputRef.current.files[0]);

    let res = await fetch(`${backendurl}/api/1.0/message/uploadImage`, {
      method: "POST",
      body: formData,
    });
    let { url } = await res.json();

    let payload = {
      sender_id: user.id,
      room_id: currentRoom,
      message_content: userMessage,
      message_image: url,
      image: user?.picture,
      timestamp: generateTimestamp(),
    };

    sendMessage("getMessageRoom", JSON.stringify(payload));
    setImage(null);
    setUserMessage("");
  };

  const changeRoom = (id: number) => {
    const room = id;
    console.log("change room", room);
    ws.emit("joinRoom", room);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const sendMessage = (name: string, message: string) => {
    ws.emit(name, message);
  };

  const handleGetMessage = (message: string) => {
    // message = JSON.parse(message);
    message.id = Math.floor(Math.random() * 100000);
    console.log("123123");

    console.log(messages);

    // const newMessages = {
    //   ...messages,
    //   [message.room_id]: [...messages[message.room_id], message],
    // };
    // setMessages(newMessages);
    // setUpdate(!update);
    setMessages((m) => ({
      ...m,
      [message.room_id]:
        m[message.room_id] === undefined
          ? [message]
          : [...m[message.room_id], message],
    }));
  };

  useEffect(() => {
    if (!messageCurrentRoom || messageCurrentRoom == -1) return;
    fetch(`${backendurl}/api/1.0/message/rooms/${user.id}`, {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${storage.getItem("token")}`,
      // },
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        if (!data) return;
        console.log("in");

        for (let i = 0; i < data.rooms.length; i++) {
          const maxLen = 5;
          if (data.rooms[i].room_name.length > maxLen) {
            data.rooms[i].sliced_room_name =
              data.rooms[i].room_name.slice(0, maxLen) + "...";
          }
          if (data.rooms[i].id === messageCurrentRoom) {
            setCurrentProductId(data.rooms[i].product_id);
          }
        }
        setRooms(data.rooms);
        setUpdate(!update);
      });
    setCurrentRoom(messageCurrentRoom);
  }, [messageCurrentRoom]);

  useEffect(() => {
    // if (!messageOpen) return;
    if (!active) setActive(true);
  }, [messageOpen]);

  useEffect(() => {
    if (!user) return;
    console.log(user);

    fetch(`${backendurl}/api/1.0/message/rooms/${user.id}`, {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${storage.getItem("token")}`,
      // },
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        if (!data) return;
        console.log("in");

        for (let i = 0; i < data.rooms.length; i++) {
          const maxLen = 5;
          if (data.rooms[i].room_name.length > maxLen) {
            data.rooms[i].sliced_room_name =
              data.rooms[i].room_name.slice(0, maxLen) + "...";
          }
        }
        setRooms(data.rooms);
        setUpdate(!update);
      });

    const connectWebSocket = () => {
      setWs(webSocket(socketurl));
    };

    connectWebSocket();
  }, [user]);

  useEffect(() => {
    if (!currentRoom) return;

    fetch(`${backendurl}/api/1.0/message/${currentRoom}`, {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${storage.getItem("token")}`,
      // },
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        if (!data) return;

        changeRoom(currentRoom);
        setMessages((m) => ({ ...m, [currentRoom]: data.messages }));
      });
  }, [currentRoom]);

  useEffect(() => {
    if (!currentProductId) return;
    setCurrentProductDetail(null);

    fetch(`${backendurl}/api/1.0/products/${currentProductId}`, {
      method: "GET",
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        if (!data) return;
        setCurrentProductDetail(data.data);
        setUpdate(!update);
      });
  }, [currentProductId]);

  useEffect(() => {
    if (messageCurrentRoom > 0) return;
    if (!rooms || rooms.length === 0) return;
    setCurrentRoom(rooms[0].id);
    setCurrentProductId(rooms[0].product_id);
    changeRoom(rooms[0].id);
  }, [rooms]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!ws) return;

    const initWebSocket = () => {
      ws.on("getMessage", (message) => {
        console.log(message);
      });
      ws.on("getMessageRoomReceive", (message) => {
        console.log("get message");
        console.log(message);
        handleGetMessage(message);
      });
    };
    initWebSocket();
    console.log("success connect!");

    return () => {
      ws.close();
    };
  }, [ws]);

  useEffect(() => {
    if (!ws) return;
    ws.on("message", (data) => {
      setMessages([...messages, data]);
    });
  }, [ws]);

  return (
    <>
      {active ? (
        <div className="fixed flex flex-col w-1/3 bg-gray-200 rounded-lg bottom-6 right-3 shadow-3xl h-1/2">
          <div
            className="w-full cursor-pointer h-1/6"
            onClick={() => {
              setActive(!active);
            }}
          >
            <div className="flex justify-between p-5 ">
              <div className="text-3xl">客服</div>
              <div className="flex items-end">
                <div className="text-m">{currentRoomName}</div>
              </div>
            </div>
          </div>
          <div className="flex w-full h-5/6 rounded-xl">
            <div className="flex-col w-1/3 overflow-y-scroll">
              {rooms &&
                rooms.map((room) => (
                  <div key={room.id}>
                    <div
                      className={
                        "flex items-center w-full h-20 p-3" +
                        (currentRoom === room.id ? " bg-white" : "")
                      }
                      onClick={() => {
                        setCurrentRoom(room.id);
                        setCurrentRoomName(room.room_name);
                        setCurrentProductId(room.product_id);
                      }}
                    >
                      <div className="w-12 h-12">
                        <img
                          className="object-cover w-full h-full rounded-full"
                          src={room.image}
                        ></img>
                      </div>
                      <div className="flex flex-col ml-3">
                        <div className="text-l">{room.sliced_room_name}</div>
                        {/* <div></div> */}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="w-2/3 h-full bg-white">
              <div
                className={
                  "overflow-y-scroll h-5/6" + (image ? " h-4/6" : " h-5/6")
                }
                ref={scrollRef}
              >
                <div className="flex-col items-center justify-center w-full p-3">
                  <div className="flex-col w-full p-3 bg-gray-200 rounded-lg">
                    <div className="flex items-center mb-2 text-sm">
                      <div>{`您目前正在與客服詢問此商品`}</div>
                    </div>
                    <Link
                      to={`/products/${currentProductDetail?.id}`}
                      target="_blank"
                      className="flex"
                    >
                      <div className="overflow-hidden w-14 h-14 rounded-xl">
                        <img
                          className="object-cover w-full h-full"
                          src={currentProductDetail?.main_image}
                        ></img>
                      </div>
                      <div className="flex-col ml-2 text-sm">
                        <div>{currentProductDetail?.title}</div>
                        <div className="text-red-800">
                          ${currentProductDetail?.price}
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
                {currentRoom && messages[currentRoom] ? (
                  messages[currentRoom].map((message) => (
                    <div
                      className={`flex w-full p-3 ${
                        message.sender_id === user.id ? "justify-end" : ""
                      }`}
                      key={message.id}
                    >
                      {message.sender_id === user.id && (
                        <div className="flex-col">
                          {message.message_image && (
                            <div className="overflow-hidden max-h-[200px] max-w-[200px] rounded-xl mb-1">
                              <img
                                className="object-cover w-full h-full cursor-pointer"
                                src={message.message_image}
                                onClick={() => {
                                  setSelectedImage(message.message_image);
                                  setOpenImageDialog(true);
                                }}
                              ></img>
                            </div>
                          )}
                          <div className="flex flex-col justify-end">
                            <div>
                              <div className="flex w-full">
                                <div className="w-full"></div>
                                <div className="flex items-center justify-end flex-1 px-5 mr-2 text-black bg-gray-200 text-l h-14 rounded-2xl">
                                  <div>{message.message_content}</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end w-full">
                              <div className="mt-2 text-xs">
                                {getTimeDiff(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* <div className="w-12 h-12">
                        <img
                          className="object-cover w-full h-full rounded-full"
                          src={message.image}
                        ></img>
                      </div> */}
                      {message.sender_id !== user.id && (
                        <div className="flex flex-col justify-begin">
                          <div>
                            <div className="flex items-center flex-1 px-5 ml-2 text-black bg-gray-200 text-l h-14 rounded-2xl">
                              {message.message_image && (
                                <div className="overflow-hidden w-14 h-14 rounded-xl">
                                  <img
                                    className="object-cover w-full h-full"
                                    src={message.message_image}
                                  ></img>
                                </div>
                              )}
                              <div>{message.message_content}</div>
                            </div>
                          </div>
                          <div className="flex w-full justify-begin">
                            <div className="mt-2 text-xs">
                              {getTimeDiff(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center w-full h-full p-3">
                    {/* <div className="text-2xl">No Message</div> */}
                  </div>
                )}
              </div>
              {image && (
                <div className="relative flex items-center px-2 border-t border-gray-300 h-1/6">
                  <img
                    src={image}
                    className="object-cover w-12 h-12 rounded-lg"
                  ></img>
                  <button
                    className="absolute top-1 right-2"
                    onClick={() => {
                      setImage(null);
                    }}
                  >
                    <RxCross1 />
                  </button>
                </div>
              )}

              <div className="flex flex-col border-t border-gray-300 h-1/6">
                <div className="flex items-center">
                  <button
                    className="flex w-8 h-8"
                    onClick={handleUploadImageButtonClick}
                  >
                    <CiImageOn className="w-8 h-8 ml-2" />
                  </button>

                  <BsEmojiSmile className="w-6 h-6 ml-2" />
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => {
                      setUserMessage(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendButtonRef.current.click();
                      }
                    }}
                    className="w-full px-2 rounded-l outline-none"
                    placeholder="輸入訊息"
                  />
                  <button
                    ref={sendButtonRef}
                    onClick={async () => {
                      if (userMessage === "" && !image) return;
                      console.log(user);

                      if (image) {
                        await handleImageMessageUpload();
                        return;
                      }

                      let payload = {
                        sender_id: user.id,
                        room_id: currentRoom,
                        message_content: userMessage,
                        image: user?.picture,
                        timestamp: generateTimestamp(),
                      };

                      sendMessage("getMessageRoom", JSON.stringify(payload));
                      setUserMessage("");
                    }}
                    className="w-12 h-12 px-2 rounded-r"
                  >
                    <IoMdSend className="w-6 h-6" />
                  </button>
                </div>
                {/* <div className="flex items-center ml-2 h-1/3">
                  <CiImageOn className="w-8 h-8" />
                  <BsEmojiSmile className="w-6 h-6 ml-2" />
                </div> */}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`fixed flex items-center justify-center p-4 m-4 rounded-lg shadow-md cursor-pointer ${
            active
              ? "bg-red-200 scale-125 top-0 left-0"
              : "bg-gray-200 w-36 text-2xl bottom-0 right-0"
          }`}
          onClick={() => {
            setActive(!active);
          }}
        >
          <div>
            <IoChatbox className="w-6 h-6 mr-2" />
          </div>
          <div>客服</div>
        </div>
      )}
      <input
        type="file"
        ref={imageInputRef}
        style={{ display: "none" }}
        onChange={handleImageChange}
        accept="image/*"
      />
      <ImageDetailDialog
        open={openImageDialog}
        handleClose={handleCloseImageDialog}
        image={selectedImage}
      />
    </>
  );
}
