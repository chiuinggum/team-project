import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import styled from "styled-components";
import postData from "./createStroyAPI";

const Button = styled.button`
  border: solid 1px #000000;
  border-radius: 5px;
  padding: 5px;
  margin: 0 2px;
  background-color: #ffffff;
`;

const FunctionIcon = styled.img`
  background-color: #ffffff;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: auto;
  z-index: 1;
  width: 100%;
`;

const InputUrlAndSavePicButton = styled.button`
  width: 7rem;
  height: 3rem;
  border-radius: 10px;
  background-color: #1c1c1c;
  color: #ffffff;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  margin: 0 1rem;
  z-index: 3;
  border: solid 1px #ffffff;
`;

const UrlAndPicbuttonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  /* position: absolute;
  bottom: 3%;
  right: 0%; */
`;

const UrlConfirmButton = styled.button`
  width: 3rem;
  height: 1.5rem;
  border-radius: 10px;
  background-color: #ffffff;
  color: #000000;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  margin-top: 2px;
  z-index: 3;
  border: solid 1px #000000;
`;

export default function EditStory({ storyPicOrVideo }) {
  const { editor, onReady } = useFabricJSEditor();

  const history = [];
  const [color, setColor] = useState("#35363a");
  const [cropImage, setCropImage] = useState(true);
  const [url, setUrl] = useState("");


  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }

    if (cropImage) {
      editor.canvas.__eventListeners = {};
      return;
    }

    if (!editor.canvas.__eventListeners["mouse:wheel"]) {
      editor.canvas.on("mouse:wheel", function (opt) {
        var delta = opt.e.deltaY;
        var zoom = editor.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        editor.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    }

    if (!editor.canvas.__eventListeners["mouse:down"]) {
      editor.canvas.on("mouse:down", function (opt) {
        var evt = opt.e;
        if (evt.ctrlKey === true) {
          this.isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      });
    }

    if (!editor.canvas.__eventListeners["mouse:move"]) {
      editor.canvas.on("mouse:move", function (opt) {
        if (this.isDragging) {
          var e = opt.e;
          var vpt = this.viewportTransform;
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
      });
    }

    if (!editor.canvas.__eventListeners["mouse:up"]) {
      editor.canvas.on("mouse:up", function (opt) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      });
    }

    editor.canvas.renderAll();
  }, [editor]);

  const addBackground = () => {
    if (!editor || !fabric) {
      return;
    }
    const isImage = storyPicOrVideo.type.startsWith("image/");
    const isVideo = storyPicOrVideo.type.startsWith("video/");

    if (isImage) {
      // 处理图片
      const imageUrl = URL.createObjectURL(storyPicOrVideo);
      fabric.Image.fromURL(imageUrl, (image) => {
        const canvas = editor.canvas;
        const canvasCenter = { x: canvas.width / 2, y: canvas.height / 2 };
        image.set({
          left: canvasCenter.x - image.width / 2,
          top: canvasCenter.y - image.height / 2,
        });

        canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas));
      });
    } else if (isVideo) {
      // 处理视频
      const videoElement = document.createElement("video");
      videoElement.src = URL.createObjectURL(storyPicOrVideo);
      videoElement.crossOrigin = "anonymous"; // 如果视频跨域，需要设置跨域属性

      // 等待视频加载完成
      videoElement.addEventListener("loadeddata", () => {
        const fabricVideo = new fabric.Image.fromVideo(videoElement, {
          left: 0,
          top: 0,
          width: videoElement.width,
          height: videoElement.height,
        });

        // 将视频对象添加到画布
        editor.canvas.setBackgroundImage(
          fabricVideo,
          editor.canvas.renderAll.bind(editor.canvas)
        );
      });

      // 开始加载视频
      videoElement.load();
    } else {
      console.error("Unsupported file type");
    }
  };

  const fromSvg = () => {
    fabric.loadSVGFromString(
      `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="500" height="500" viewBox="0 0 500 500" xml:space="preserve">
    <desc>Created with Fabric.js 5.3.0</desc>
    <defs>
    </defs>
    <g transform="matrix(1 0 0 1 662.5 750)"  >
      <image style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  xlink:href="https://thegraphicsfairy.com/wp-content/uploads/2019/02/Anatomical-Heart-Illustration-Black-GraphicsFairy.jpg" x="-662.5" y="-750" width="1325" height="1500"></image>
    </g>
    <g transform="matrix(1 0 0 1 120.5 120.5)"  >
    <circle style="stroke: rgb(53,54,58); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-opacity: 0; fill-rule: nonzero; opacity: 1;"  cx="0" cy="0" r="20" />
    </g>
    <g transform="matrix(1 0 0 1 245.5 200.5)"  >
    <line style="stroke: rgb(53,54,58); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  x1="-75" y1="-50" x2="75" y2="50" />
    </g>
    <g transform="matrix(1 0 0 1 141.4 220.03)" style=""  >
        <text xml:space="preserve" font-family="Arial" font-size="16" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(53,54,58); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-16.9" y="-5.46" >inset</tspan><tspan x="-16.9" y="15.51" >text</tspan></text>
    </g>
    <g transform="matrix(1 0 0 1 268.5 98.5)"  >
    <rect style="stroke: rgb(53,54,58); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-opacity: 0; fill-rule: nonzero; opacity: 1;"  x="-20" y="-20" rx="0" ry="0" width="40" height="40" />
    </g>
    </svg>`,
      (objects, options) => {
        editor.canvas._objects.splice(0, editor.canvas._objects.length);
        editor.canvas.backgroundImage = objects[0];
        const newObj = objects.filter((_, index) => index !== 0);
        newObj.forEach((object) => {
          editor.canvas.add(object);
        });

        editor.canvas.renderAll();
      }
    );
  };

  useEffect(() => {
    if (!editor || !fabric || !storyPicOrVideo) {
      return;
    }
    const windowHeight = window.innerHeight * 0.65;
    const windowWidth = window.innerWidth * 0.28;

    editor.canvas.setHeight(windowHeight);
    editor.canvas.setWidth(windowWidth);
    addBackground();
    editor.canvas.renderAll();
  }, [editor?.canvas.backgroundImage, storyPicOrVideo]);

  const toggleSize = () => {
    editor.canvas.freeDrawingBrush.width === 12
      ? (editor.canvas.freeDrawingBrush.width = 5)
      : (editor.canvas.freeDrawingBrush.width = 12);
  };

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    editor.canvas.freeDrawingBrush.color = color;
    editor.setStrokeColor(color);
  }, [color]);

  const toggleDraw = () => {
    editor.canvas.isDrawingMode = !editor.canvas.isDrawingMode;
  };
  const undo = () => {
    if (editor.canvas._objects.length > 0) {
      history.push(editor.canvas._objects.pop());
    }
    editor.canvas.renderAll();
  };
  const redo = () => {
    if (history.length > 0) {
      editor.canvas.add(history.pop());
    }
  };
  const clear = () => {
    editor.canvas._objects.splice(0, editor.canvas._objects.length);
    history.splice(0, history.length);
    editor.canvas.renderAll();
  };
  const removeSelectedObject = () => {
    editor.canvas.remove(editor.canvas.getActiveObject());
  };
  const onAddCircle = () => {
    editor.addCircle();
  };
  const onAddRectangle = () => {
    editor.addRectangle();
  };
  const addText = () => {
    editor.addText("inset text");
  };
  const exportSVG = () => {
    const svg = editor.canvas.toSVG();
    console.info(svg);
  };

  const saveCanvasAsImage = async () => {
    if (!editor || !fabric) {
      return;
    }
    const canvasDataURL = editor.canvas.toDataURL({
      format: "png", // 指定保存的图像格式，可以是 'png', 'jpeg', 'webp' 等
      quality: 0.8,
    });
    const tempImage = new Image();
    tempImage.src = canvasDataURL;
    //test
    const visibleWidth = editor.canvas.width;
    const visibleHeight = editor.canvas.height;
    editor.canvas.setWidth(visibleWidth);
    editor.canvas.setHeight(visibleHeight);
    // 渲染临时图像到画布上
    editor.canvas.add(new fabric.Image(tempImage, { left: 0, top: 0 }));

    const visibleCanvasDataUrl = editor.canvas.toDataURL({
      format: "png",
      quality: 0.8,
    });
    // 将 Data URL 转换为 Blob 对象
    const blob = await fetch(visibleCanvasDataUrl).then((res) => res.blob());
    // 创建一个模拟的 File 对象
    const file = new File([blob], "visible-canvas-image.png", {
      type: "image/png",
    });
    console.log(file);

    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(
      `http://localhost:3000/api/1.0/message/uploadImage`,
      {
        method: "POST",
        body: formData,
      }
    );
    const picUrl = (await res.json()).url;
    console.log(picUrl);

    const postDatares = await postData(picUrl, url);
    console.log(postDatares);
    window.history.back();
  };

  const imageInputRef = useRef(null);
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    console.log("change");

    reader.onloadend = () => {};
    reader.readAsDataURL(file);
    const formData = new FormData();
    formData.append("image", imageInputRef.current.files[0]);
    console.log(imageInputRef.current.files[0]);

    const res = await fetch(
      `http://13.236.23.10:3000/api/1.0/message/uploadImage`,
      {
        method: "POST",
        body: formData,
      }
    );
    const { url } = await res.json();
  };

  const [showInput, setShowInput] = useState(false);
  const handleButtonClick = () => {
    setShowInput(!showInput); // 切換輸入框的顯示狀態
  };
  const handleConfirmClick = () => {
    // 存下url送到資料庫
    setShowInput(false);
  };

  return (
    <div>
      <ButtonContainer>
        <Button onClick={onAddCircle}>
          <FunctionIcon src="/assets/images/story-images/circle.png" />
        </Button>
        <Button onClick={onAddRectangle} disabled={!cropImage}>
          <FunctionIcon src="/assets/images/story-images/rectangle.png" />
        </Button>
        <Button onClick={addText} disabled={!cropImage}>
          <FunctionIcon src="/assets/images/story-images/addText.png" />
        </Button>
        <Button onClick={toggleDraw} disabled={!cropImage}>
          <FunctionIcon src="/assets/images/story-images/draw.png" />
        </Button>
        <Button onClick={toggleSize} disabled={!cropImage}>
          <FunctionIcon src="/assets/images/story-images/toggle.png" />
        </Button>
      </ButtonContainer>
      <ButtonContainer>
        <Button onClick={clear} disabled={!cropImage}>
          <FunctionIcon src="/assets/images/story-images/clear.png" />
        </Button>
        <Button onClick={undo} disabled={!cropImage}>
          <FunctionIcon src="/assets/images/story-images/undo.png" />
        </Button>
        <Button onClick={redo} disabled={!cropImage}>
          <FunctionIcon src="/assets/images/story-images/redo.png" />
        </Button>
        <Button onClick={removeSelectedObject} disabled={!cropImage}>
          <FunctionIcon src="/assets/images/story-images/delete.png" />
        </Button>
        <Button onClick={(e) => setCropImage(!cropImage)}>
          <FunctionIcon src="/assets/images/story-images/resize.png" />
        </Button>
        <label disabled={!cropImage}>
          <input
            disabled={!cropImage}
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        {/* <Button onClick={exportSVG} disabled={!cropImage}>
          ToSVG
        </Button>
        <Button onClick={fromSvg} disabled={!cropImage}>
          fromsvg
        </Button> */}
      </ButtonContainer>

      <FabricJSCanvas className="sample-canvas" onReady={onReady} />
      <UrlAndPicbuttonContainer>
        <InputUrlAndSavePicButton onClick={handleButtonClick}>
          {showInput ? "取消" : "輸入網址"}
        </InputUrlAndSavePicButton>
        {showInput && (
          <div>
            <input
              type="text"
              placeholder="請輸入網址"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ border: "1px solid #ccc" }}
            />
            <UrlConfirmButton onClick={handleConfirmClick}>
              確認
            </UrlConfirmButton>
          </div>
        )}
        <InputUrlAndSavePicButton
          onClick={saveCanvasAsImage}
          disabled={!cropImage}
        >
          發佈動態
        </InputUrlAndSavePicButton>
      </UrlAndPicbuttonContainer>
      {/* <input type="file" onChange={handleImageChange} ref={imageInputRef} /> */}
    </div>
  );
}
