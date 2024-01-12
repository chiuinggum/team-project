import CreateStory from "./postStory";
import Header from "../../common/Header/index";
import Footer from "../../common/Footer/index";
import styled from "styled-components";

const WholePage = styled.div`
  background-color: #1c1c1c;
`;

const CreateStoryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10rem;
  margin-bottom: 4rem;
`;

export default function PostStory() {
  return (
    <WholePage>
      <Header />
      <CreateStoryContainer>
        <CreateStory />
      </CreateStoryContainer>
      <Footer />
    </WholePage>
  );
}
