import React, { useState, useEffect } from "react";

import MessageBox from "../../common/MessageBox";
import Product from "../../../types/Product";
import useWindowWidth from "../../../hooks/useWindowWidth";
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useUser } from "../../../contexts/UserContext";
import { backendurl } from "../../../constants/urls";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { useParams } from 'react-router-dom';


export default function ProductDetail({ product }: { product: Product }) {
  const { user } = useUser();
  const { productId } = useParams();

  const [amount, setAmount] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedColorCode, setSelectedColorCode] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeRemain, setSizeRemain] = useState<string[]>([]);
  const [amountRemain, setAmountRemain] = useState(-1);
  const [isFavorited, setIsFavorited] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageCurrentRoom, setMessageCurrentRoom] = useState(-1);

  const storage = window.localStorage;
  const windowWidth = useWindowWidth();



  const toggleFavorite = () => {
    const payload = {
      user_id: user?.id, // 從用戶上下文獲取用戶 ID
      product_id: productId, // 從產品 prop 獲取產品 ID
    };
    console.log('payload to favorite', payload);

    // 確定使用哪個 API 端點
    const url = isFavorited ? `${backendurl}/api/1.0/user/deleteFavorite` : `${backendurl}/api/1.0/user/favorite`;
    
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    .then((res) => res.json())
    .then((res) => {
      setIsFavorited(!isFavorited); // 根據回應更新狀態
    })
    .catch((error) => {
      console.error('處理收藏時出錯:', error);
    });
  };

  const checkFavoriteStatus = () => {
    if (!user?.id || !productId) {
      console.log("User ID or Product ID is undefined.");
      return;
    }
    console.log('fetch api is ',`${backendurl}/api/1.0/user/getFavorite?user_id=${user?.id}&product_id=${productId }`)
    fetch(`${backendurl}/api/1.0/user/getFavorite?user_id=${user?.id}&product_id=${productId }`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then((res) => {
      if (!res.ok) {
        if (res.status === 429) {
          console.error('請求次數過多');
        } else {
          console.error(`HTTP 錯誤！狀態碼：${res.status}`);
        }
        return null;
      }
      return res.json();
    })
    .then((res) => {
      if (res) {
        setIsFavorited(res.favorited);
      }
    })
    .catch((error) => {
      console.error('獲取收藏狀態出錯:', error);
    });
  };

  useEffect(() => {
    if (productId && user?.id) {
      checkFavoriteStatus();
    }
    console.log('id is',user?.id )
    console.log('product  is',productId)
  }, [user?.id, productId]);



  useEffect(() => {
    if (product.variants) {
      let remain: string[] = [];
      for (let i = 0; i < product.variants.length; i++) {
        if (
          product.variants[i].color_code === selectedColorCode &&
          product.variants[i].stock > 0
        ) {
          remain.push(product.variants[i].size);
        }
      }
      setSelectedSize("");
      setAmountRemain(-1);
      setSizeRemain(remain);

      console.log("remain", remain);
    }
  }, [selectedColorCode]);

  useEffect(() => {
    if (product.variants) {
      for (let i = 0; i < product.variants.length; i++) {
        if (
          product.variants[i].color_code === selectedColorCode &&
          product.variants[i].size === selectedSize
        ) {
          setAmountRemain(product.variants[i].stock);
          break;
        }
      }
      setAmount(0);
    }
  }, [selectedSize]);

  function addToCart() {
    const data = {
      product_id: product.id,
      color_name: selectedColor,
      color_code: selectedColorCode,
      size: selectedSize,
      main_image: product.main_image,
      title: product.title,
      price: product.price,
      qty: amount,
      stock: amountRemain,
    };
    const cart = storage.getItem("cart");
    if (cart) {
      const cartArray = JSON.parse(cart);
      // find if the product is already in the cart
      let isExist = false;
      for (let i = 0; i < cartArray.length; i++) {
        if (
          cartArray[i].product_id === data.product_id &&
          cartArray[i].color_name === data.color_name &&
          cartArray[i].size === data.size
        ) {
          cartArray[i].qty += data.qty;
          isExist = true;
          break;
        }
      }
      if (!isExist) cartArray.push(data);
      storage.setItem("cart", JSON.stringify(cartArray));
    } else {
      const cartArray = [];
      cartArray.push(data);
      storage.setItem("cart", JSON.stringify(cartArray));
    }

    const event = new Event("customStorageChange");
    window.dispatchEvent(event);
    setAmount(0);
    setSelectedColor("");
    setSelectedColorCode("");
    setSelectedSize("");

    alert("已加入購物車");
  }

  return (
    <>
      {windowWidth > 1280 ? (
        <>
          {product.colors ? (
            <>
              <div className="flex justify-center mt-28">
                <div className="flex w-2/5">
                  <div className="w-3/5">
                    <img src={product.main_image} className="w-full" alt="" />
                  </div>
                  <div className="w-2/5 p-5 ">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xl font-bold ">{product.title}</div>
                      <button className="flex items-center px-2 py-1 border-2 border-gray-400 rounded-lg">
                        <IoChatbubbleEllipsesSharp />

                        <div
                          className="ml-1"
                          onClick={() => {
                            const payload = {
                              room: {
                                room_name: product.title,
                                image: product.main_image,
                                product_id: product.id,
                                type: "product",
                                user_id: user?.id,
                              },
                            };
                            console.log("payload", payload);

                            fetch(`${backendurl}/api/1.0/message/room`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(payload),
                            })
                              .then((res) => res.json())
                              .then((res) => {
                                console.log("res", res);
                                setMessageOpen(!messageOpen);
                                setMessageCurrentRoom(res.roomId);
                              });
                          }}
                        >
                          聯絡客服
                        </div>
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">{product.id}</div>
                    <div className="my-3 text-xl font-bold">
                      TWD.{product.price}
                      <button onClick={toggleFavorite} style={{ all: 'unset', cursor: 'pointer', marginLeft: '3em' }}>
          {isFavorited ? <FaHeart color="red" /> : <FaRegHeart />}
        </button>
                    </div>
                    <div className="my-3 border-t-2 border-gray-400"></div>
                    <div className="flex items-center my-3">
                      <div className="pr-2 text-sm text-center border-r-2 border-gray-400">
                        顏色
                      </div>
                      <div className="flex ml-3 itmes-center">
                        {product.colors.length > 0 &&
                          product.colors.map((color) => (
                            <div
                              className="flex items-center justify-center p-1 mr-2 cursor-pointer"
                              style={{
                                borderWidth:
                                  selectedColor === color.name ? "2px" : "0px",
                                borderColor:
                                  selectedColor === color.name
                                    ? "gray"
                                    : "transparent",
                              }}
                            >
                              <div
                                key={color.code}
                                className="w-6 h-6 border border-black"
                                onClick={() => {
                                  setSelectedColor(color.name);
                                  setSelectedColorCode(color.code);
                                }}
                                style={{
                                  backgroundColor: `#${color.code}`,
                                }}
                              ></div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="flex items-center my-3">
                      <div className="pr-2 text-sm text-center border-r-2 border-gray-400">
                        尺寸
                      </div>
                      {selectedColor && (
                        <div className="flex ml-3 itmes-center">
                          {sizeRemain.length > 0 &&
                            sizeRemain.map((size) => (
                              <div
                                className="flex items-center justify-center p-1 mr-2 rounded-full cursor-pointer"
                                style={{
                                  borderWidth:
                                    selectedSize === size ? "2px" : "0px",
                                  borderColor:
                                    selectedSize === size
                                      ? "gray"
                                      : "transparent",
                                }}
                              >
                                <div
                                  key={size}
                                  className="flex items-center justify-center w-6 h-6 text-xs font-bold border rounded-full"
                                  onClick={() => {
                                    setSelectedSize(size);
                                  }}
                                  style={{
                                    color:
                                      size === "S"
                                        ? `#FFFFFF`
                                        : size === "M"
                                        ? `#000000`
                                        : `#D0D0D0`,
                                    backgroundColor:
                                      size === "S"
                                        ? `#000000`
                                        : size === "M"
                                        ? `#ECECEC`
                                        : `#F0F0F0`,
                                  }}
                                >
                                  {size}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center my-3">
                      <div className="pr-2 text-sm text-center border-r-2 border-gray-400">
                        數量
                      </div>
                      <div className="flex w-24 ml-3 border-2 select-none">
                        <div
                          className="flex-1 text-center cursor-pointer"
                          onClick={() => {
                            if (amount > 0) setAmount(amount - 1);
                          }}
                        >
                          -
                        </div>
                        <div className="flex-1 text-center">{amount}</div>
                        <div
                          className="flex-1 text-center cursor-pointer select-none"
                          onClick={() => {
                            if (amountRemain > amount) {
                              setAmount(amount + 1);
                            }
                          }}
                        >
                          +
                        </div>
                      </div>
                    </div>
                    剩餘數量 : {amountRemain === -1 ? "未選擇" : amountRemain}
                    <div
                      className={
                        "h-10 text-white justify-center flex items-center" +
                        (amount <= 0
                          ? " bg-gray-300 cursor-not-allowed"
                          : " bg-black  cursor-pointer")
                      }
                      onClick={() => {
                        if (amount > 0) addToCart();
                      }}
                    >
                      加入購物車
                    </div>
                    <div className="my-5">{product.note}</div>
                    <div className="my-5">{product.texture}</div>
                    <div>清洗 : {product.wash}</div>
                    <div>產品 : {product.place}</div>
                    <div className="my-5">{product.description}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-2/5">
                  <div className="flex items-center justify-between my-5">
                    <div className="text-[#8B572A] font-bold">更多產品資訊</div>
                    <div className="h-0.5 w-4/5 bg-[#8B572A]"></div>
                  </div>
                  <div>{product.story}</div>
                  <div className="my-5">
                    {product.images &&
                      product.images.map((image) => (
                        <img src={image} className="w-full my-5" alt="" />
                      ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col w-2/5 gap-5 p-2 mx-auto bg-white select-none my-60 sm:p-4 sm:h-64 rounded-2xl sm:flex-row ">
              <div className="bg-gray-200 h-60 sm:h-full sm:w-72 rounded-xl animate-pulse"></div>
              <div className="flex flex-col flex-1 gap-5 sm:p-2">
                <div className="flex flex-col flex-1 gap-3">
                  <div className="w-full bg-gray-200 animate-pulse h-14 rounded-2xl"></div>
                  <div className="w-full h-3 bg-gray-200 animate-pulse rounded-2xl"></div>
                  <div className="w-full h-3 bg-gray-200 animate-pulse rounded-2xl"></div>
                  <div className="w-full h-3 bg-gray-200 animate-pulse rounded-2xl"></div>
                  <div className="w-full h-3 bg-gray-200 animate-pulse rounded-2xl"></div>
                </div>
                <div className="flex gap-3 mt-auto">
                  <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-20 h-8 ml-auto bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {product.colors ? (
            <>
              <div className="flex justify-center mt-28 ">
                <div className="flex flex-col w-4/5">
                  <div className="w-full">
                    <img src={product.main_image} className="w-full" alt="" />
                  </div>
                  <div className="w-full p-5 ">
                    <div className="mb-2 text-xl font-bold">
                      {product.title}
                    </div>
                    <div className="text-sm text-gray-500">{product.id}</div>
                    
                    <div className="my-3 text-xl font-bold">
                      TWD.{product.price}
                    
                    </div>
                    <div className="my-3 border-t-2 border-gray-400"></div>
                    <div className="flex items-center my-3">
                      <div className="pr-2 text-sm text-center border-r-2 border-gray-400">
                        顏色
                      </div>
                      <div className="flex ml-3 itmes-center">
                        {product.colors.length > 0 &&
                          product.colors.map((color) => (
                            <div
                              className="flex items-center justify-center p-1 mr-2 cursor-pointer"
                              style={{
                                borderWidth:
                                  selectedColor === color.name ? "2px" : "0px",
                                borderColor:
                                  selectedColor === color.name
                                    ? "gray"
                                    : "transparent",
                              }}
                            >
                              <div
                                key={color.code}
                                className="w-6 h-6 border border-black"
                                onClick={() => {
                                  setSelectedColor(color.name);
                                  setSelectedColorCode(color.code);
                                }}
                                style={{
                                  backgroundColor: `#${color.code}`,
                                }}
                              ></div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="flex items-center my-3">
                      <div className="pr-2 text-sm text-center border-r-2 border-gray-400">
                        尺寸
                      </div>
                      {selectedColor && (
                        <div className="flex ml-3 itmes-center">
                          {sizeRemain.length > 0 &&
                            sizeRemain.map((size) => (
                              <div
                                className="flex items-center justify-center p-1 mr-2 rounded-full cursor-pointer"
                                style={{
                                  borderWidth:
                                    selectedSize === size ? "2px" : "0px",
                                  borderColor:
                                    selectedSize === size
                                      ? "gray"
                                      : "transparent",
                                }}
                              >
                                <div
                                  key={size}
                                  className="flex items-center justify-center w-6 h-6 text-xs font-bold border rounded-full"
                                  onClick={() => {
                                    setSelectedSize(size);
                                  }}
                                  style={{
                                    color:
                                      size === "S"
                                        ? `#FFFFFF`
                                        : size === "M"
                                        ? `#000000`
                                        : `#D0D0D0`,
                                    backgroundColor:
                                      size === "S"
                                        ? `#000000`
                                        : size === "M"
                                        ? `#ECECEC`
                                        : `#F0F0F0`,
                                  }}
                                >
                                  {size}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center my-3">
                      <div className="pr-2 text-sm text-center border-r-2 border-gray-400">
                        數量
                      </div>
                      <div className="flex w-24 ml-3 border-2 select-none">
                        <div
                          className="flex-1 text-center cursor-pointer"
                          onClick={() => {
                            if (amount > 0) setAmount(amount - 1);
                          }}
                        >
                          -
                        </div>
                        <div className="flex-1 text-center">{amount}</div>
                        <div
                          className="flex-1 text-center cursor-pointer select-none"
                          onClick={() => {
                            if (amountRemain > amount) {
                              setAmount(amount + 1);
                            }
                          }}
                        >
                          +
                        </div>
                      </div>
                    </div>
                    剩餘數量 : {amountRemain === -1 ? "未選擇" : amountRemain}
                    <div
                      className={
                        "h-10 text-white justify-center flex items-center" +
                        (amount <= 0
                          ? " bg-gray-300 cursor-not-allowed"
                          : " bg-black  cursor-pointer")
                      }
                      onClick={() => {
                        if (amount > 0) addToCart();
                      }}
                    >
                      加入購物車
                    </div>
                    <div className="my-5">{product.note}</div>
                    <div className="my-5">{product.texture}</div>
                    <div>清洗 : {product.wash}</div>
                    <div>產品 : {product.place}</div>
                    <div className="my-5">{product.description}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-4/5">
                  <div className="flex items-center justify-between my-5">
                    <div className="text-[#8B572A] font-bold">更多產品資訊</div>
                    <div className="h-0.5 w-4/5 bg-[#8B572A]"></div>
                  </div>
                  <div>{product.story}</div>
                  <div className="my-5">
                    {product.images &&
                      product.images.map((image) => (
                        <img src={image} className="w-full my-5" alt="" />
                      ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col w-2/5 gap-5 p-2 mx-auto bg-white select-none my-60 sm:p-4 sm:h-64 rounded-2xl sm:flex-row ">
              <div className="bg-gray-200 h-60 sm:h-full sm:w-72 rounded-xl animate-pulse"></div>
              <div className="flex flex-col flex-1 gap-5 sm:p-2">
                <div className="flex flex-col flex-1 gap-3">
                  <div className="w-full bg-gray-200 animate-pulse h-14 rounded-2xl"></div>
                  <div className="w-full h-3 bg-gray-200 animate-pulse rounded-2xl"></div>
                  <div className="w-full h-3 bg-gray-200 animate-pulse rounded-2xl"></div>
                  <div className="w-full h-3 bg-gray-200 animate-pulse rounded-2xl"></div>
                  <div className="w-full h-3 bg-gray-200 animate-pulse rounded-2xl"></div>
                </div>
                <div className="flex gap-3 mt-auto">
                  <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-20 h-8 ml-auto bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <MessageBox
        messageOpen={messageOpen}
        messageCurrentRoom={messageCurrentRoom}
      />
    </>
  );
}
