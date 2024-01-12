import ShowStory from "./showStory";
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
`;

export default function ShowStoryPage() {
  return (
    <WholePage>
      <Header />
      <CreateStoryContainer>
        <ShowStory />
      </CreateStoryContainer>
      <Footer />
    </WholePage>
  );
}
