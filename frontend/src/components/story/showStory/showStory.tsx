import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import getData from "./showStoryAPI";

interface SlideshowProps {
  images: string[];
  duration: number;
}

const WholeContainer = styled.div`
  position: relative;
  /* display: flex; */
  /* align-items: end; */
`;
const AlignPorgressBar = styled.div`
  display: flex;
  align-items: center;
`;

const progressBarAnimation = keyframes`
  0% {
    width: 0;
    background-color: white;
  }
  100% {
    width: 100%;
    background-color: white;
  }
`;

const progressBarAnimationFinished = keyframes`
  0% {
    width: 100%;
    background-color: white;
  }
  100% {
    width: 100%;
    background-color: white;
  }
`;

const ProgressBarContainer = styled.div` 
  width: ${(props) => (props.imageCount ? `${100 / props.imageCount}%` : "0")};
  height: 0.7rem;
  background-color: #6c6c6c;
  border-radius: 5px;
  margin 0 5px;

`;
// index === currentImageIndex ? progressBarAnimation : "none"}

const ProgressBar = styled.div<{ index: number; currentImageIndex: number }>`
  height: 100%;
  border: 3px solid #464646;
  border-radius: 5px;
  animation: ${({ index, currentImageIndex }) => {
      if (index < currentImageIndex) {
        return progressBarAnimationFinished;
      } else if (index === currentImageIndex) {
        return progressBarAnimation;
      } else {
        return "none";
      }
    }}
    10s linear both;
`;

const ToggleSliderContainer = styled.div`
  display: flex;

  position: absolute;
  top: 0%;
`;
const ToggleSlider = styled.div`
  width: 14vw;
  height: 70vh;
  background-color: transparent;
  z-index: 4;
`;
const PurchaseButton = styled.button`
  width: 7rem;
  height: 3rem;
  border-radius: 10px;
  background-color: #1c1c1c;
  color: #ffffff;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  margin-top: 0.5rem;
  z-index: 3;
  border: solid 1px #ffffff;
  align-self: center;
`;

const ImageContainer = styled.div`
  background-color: #ffffff;
`;

const ShowStory: React.FC = () => {
  //   const [timeRemaining, setTimeRemaining] = useState<number>(60); // 初始时间，单位：秒

  // const images = [
  //   "/assets/images/story-images/cloth.png",
  //   "https://pic.52112.com/180130/180130_6/UVGxaq4GN8.jpg",
  //   "https://static.wixstatic.com/media/1c59e0_fbfeae6a72d8422881380f8429e02947~mv2.jpg/v1/crop/x_0,y_34,w_450,h_611/fill/w_540,h_733,al_c,lg_1,q_85,enc_auto/trashion%20main%20image%20mobile81.jpg",
  //   "https://media.karousell.com/media/photos/products/2023/10/31/_______1698759363_32047f7f_progressive.jpg",
  // ];
  const [stories, setStories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getData();
        setStories(data);
        console.log("asd", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // 立即調用 async 函數
  }, []);

  const imageCount = stories.length;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => {
    const slideshowTimer = setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % stories.length);
    }, 10000);

    return () => {
      clearTimeout(slideshowTimer);
    };
  }, [currentImageIndex, stories]);

  const handleDecreaseSlider = () => {
    if (currentImageIndex === 0)
      return setCurrentImageIndex((prevIndex) => prevIndex);
    setCurrentImageIndex((prevIndex) => prevIndex - 1);
  };
  const handleIncreaseSlider = () => {
    if (currentImageIndex === stories.length - 1)
      return setCurrentImageIndex((prevIndex) => prevIndex);
    setCurrentImageIndex((prevIndex) => prevIndex + 1);
  };

  const handlePurchaseButtonClick = () => {
    console.log("currentStory", stories);

    const currentStory = stories[currentImageIndex];
    // console.log("currentStory", currentStory);
    if (currentStory && currentStory.purchase_url) {
      window.location.href = currentStory.purchase_url;
    }
  };

  return (
    <WholeContainer>
      <AlignPorgressBar>
        {stories.map((stories, index) => (
          <ProgressBarContainer imageCount={imageCount} key={index}>
            <ProgressBar index={index} currentImageIndex={currentImageIndex} />
          </ProgressBarContainer>
        ))}
      </AlignPorgressBar>
      <ImageContainer>
        <img
          src={stories[currentImageIndex]?.picUrl}
          style={{ border: "4px solid #464646", width: "28vw", height: "70vh" }}
          alt={"images"}
        />
        <ToggleSliderContainer>
          <ToggleSlider onClick={handleDecreaseSlider} />
          <ToggleSlider onClick={handleIncreaseSlider} />
        </ToggleSliderContainer>
      </ImageContainer>
      <PurchaseButton onClick={handlePurchaseButtonClick}>
        按此購買
      </PurchaseButton>
    </WholeContainer>
  );
};

export default ShowStory;
