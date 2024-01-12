import * as React from "react";
import styled from "styled-components";
import EditStory from "./editStory";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  position: relative;
  background-color: #000000;
  width: 28vw;
  height: 70vh;
`;
const Font = styled.div`
  font-size: 1rem;
  color: #ffffff;
  /* margin-top: auto; */
  margin-bottom: 0.5rem;
  z-index: 1;
`;
const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: auto;
  z-index: 5;
`;
const Icon = styled.img<{ hasSelectedFile: boolean }>`
  position: absolute;
  top: 0;
  left: 0;

  background-color: ${({ hasSelectedFile }) =>
    hasSelectedFile ? "#808080" : "#000000"};
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  margin: 0.5rem;
  cursor: pointer;
  padding: 2px;
  z-index: 5;
`;
const SettingIcon = styled.img<{ hasSelectedFile: boolean }>`
position: absolute;
  top: 0;
  right: 0;
  background-color: ${({ hasSelectedFile }) =>
    hasSelectedFile ? "#808080" : "#000000"};
  border-radius: 50%;
  color: #ffffff;
  width: 2rem;
  height: 2rem;
  margin: 0.5rem;
  cursor: pointer;
  padding: 2px;
  z-index: 5;
`;
const SelectedFile = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  /* width: 40vw;
  height: 100%; */
  /* color: #ffffff;
  background-color: #ba2727; */
`;

// const SelectedFileImage = styled.img`
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
// `;

const SelectedVideo = styled.video`
  width: 100%;
  height: 100%;
`;
const FilterAndText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  z-index: 1;
`;

const FilterContainer = styled.div`
  position: relative;
  cursor: pointer;
  margin: 1rem;
  z-index: 1;
`;
const Filter = styled.div`
  background-color: #ffffff;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  margin-top: auto;
`;
const CreateStoryButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #ffffff;
  border-radius: 50%;
`;

const CreateStoryInput = styled.input`
  width: 5rem;
  height: 5rem;
  opacity: 0;
  cursor: pointer;
`;

const EditStoryContainer = styled.div`
  position: absolute;
  z-index: 1;
`;

// interface CountdownProps {
//   duration: number;
// }

const CreateStory: React.FC = () => {
  //   const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);
      setSelectedFile(file);
    }
  };
  return (
    <>
      <Container>
        <Icon
          src="/assets/images/story-images/x-icon-white.png"
          alt="hi"
          hasSelectedFile={!!selectedFile}
          onClick={() => window.history.back()}
        />
        <SettingIcon
          src="/assets/images/story-images/setting.png"
          alt="hi"
          hasSelectedFile={!!selectedFile}
        />
        {selectedFile ? (
          <SelectedFile>
            {selectedFile.type.startsWith("image/") ? (
              <>
                {/* <SelectedFileImage
                  src={URL.createObjectURL(selectedFile)}
                  alt="hi"
                /> */}
                <EditStoryContainer>
                  <EditStory storyPicOrVideo={selectedFile} />
                </EditStoryContainer>
              </>
            ) : selectedFile.type.startsWith("video/") ? (
              <>
                <SelectedVideo
                  type={selectedFile.type}
                  src={URL.createObjectURL(selectedFile)}
                  width="100%"
                  height="100%"
                  controls
                ></SelectedVideo>
              </>
            ) : (
              <p>Unsupported file type</p>
            )}
          </SelectedFile>
        ) : (
          <FilterAndText>
            <FilterContainer>
              <CreateStoryButton type="button">
                <CreateStoryInput
                  type="file"
                  accept="image/*, video/*"
                  onChange={handleFileChange}
                />
              </CreateStoryButton>
              <Filter />
            </FilterContainer>
            <Font>限時動態</Font>
          </FilterAndText>
        )}
      </Container>
    </>
  );
};

export default CreateStory;
