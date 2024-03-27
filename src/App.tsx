import "./App.css";
import Footer from "./components/Footer/Footer";
import Table from "./components/Table/Table";

const tableWidth = 1000;
const tableHeight = 500;

function App() {
  return (
    <>
      <h1>KPR Test Task: Pool game</h1>
      <Table width={tableWidth} height={tableHeight} />
      <p>Left mouse button - throw balls, right mouse button - edit color.</p>
      <Footer />
    </>
  );
}

export default App;
