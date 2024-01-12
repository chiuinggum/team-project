import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useUser } from "../../../contexts/UserContext";
import { backendurl } from "../../../constants/urls";
import Product from "../../../types/Product";

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);

  //console.log('who am i ',user?.id )

  const toggleFavorite = () => {
    if (!user || !user.id) {
      console.log("還沒登入喔");
      return;
    }

    const url = isFavorited
      ? `${backendurl}/api/1.0/user/deleteFavorite`
      : `${backendurl}/api/1.0/user/favorite`;

    const payload = {
      user_id: user.id,
      product_id: product.id
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setIsFavorited(data.favorited);
      })
      .catch(error => {
        console.error('處理收藏error:', error);
      });
  };


  useEffect(() => {
    if (user && user.id && product.id) {
      fetch(`${backendurl}/api/1.0/user/getFavorite?user_id=${user.id}&product_id=${product.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      })
        .then(res => {
          if (!res.ok) {
            if (res.status === 429) {
              console.error('請求次數過多');
            } else {
              console.error(`error code：${res.status}`);
            }
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data) {
            setIsFavorited(data.favorited);
          }
        })
        .catch(error => {
          console.error('獲取收藏狀態error:', error);
        });
    }
  }, [user, product.id]);

  return (
    <div className="flex flex-col justify-center justify-between m-3">
      <div className="flex flex-col justify-center w-full h-full">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.main_image}
            className="object-cover w-full h-full transition-transform duration-300 cursor-pointer hover:scale-110 hover:shadow-2xl"
          ></img>
        </Link>
      </div>
      <div>
        <div className="flex my-2 mt-2 justify-left items-center">
          <div className="flex flex-grow"> {/* Flex container for color squares */}
            {product.colors.length > 0 &&
              product.colors.map((color) => (
                <div
                  key={color.code}
                  className="w-6 h-6 mr-2 border border-black"
                  style={{ backgroundColor: `#${color.code}` }}
                ></div>
              ))}
          </div>
          <button onClick={toggleFavorite} style={{ all: 'unset', cursor: 'pointer' }}>
            {isFavorited ? <FaHeart color="red" size={24} /> : <FaRegHeart size={24} />}
          </button>
        </div>
        <div className="text-gray-500">{product.title}</div>
        <div className="text-gray-500">TWD:{product.price}</div>
      </div>
    </div>
  );
}
