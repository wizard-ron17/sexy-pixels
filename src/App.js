import React, { useState } from 'react';
import './App.css';
import { AlephiumWalletProvider, AlephiumConnectButton } from '@alephium/web3-react';

const colors = [
  '#FF5733', '#33FF57', '#3357FF', '#FFFF33',
  '#FF33FF', '#33FFFF', '#FFFFFF', '#000000',
  '#888888', '#FF8800', '#0088FF', '#00FF88',
  '#8800FF', '#FF0088', '#888800', '#008888'
];

function App() {
  const [pixels, setPixels] = useState(Array(10000).fill('#333'));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const handlePixelClick = (index) => {
    if (pixels[index] === '#333') {
      setSelectedPixel(index);
      setModalVisible(true);
    }
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleColorSubmit = () => {
    if (selectedPixel !== null && selectedColor) {
      const newPixels = [...pixels];
      newPixels[selectedPixel] = selectedColor;
      setPixels(newPixels);
      setModalVisible(false);
      setSelectedColor(null);
      setSelectedPixel(null);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedColor(null);
    setSelectedPixel(null);
  };

  const getGridCoordinates = (index) => {
    const row = Math.floor(index / 100) + 1;
    const col = getColumnLabel(index % 100);
    return `${col}:${row}`;
  };

  const getColumnLabel = (colIndex) => {
    let label = '';
    while (colIndex >= 0) {
      label = String.fromCharCode((colIndex % 26) + 65) + label;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return label;
  };

  return (
    <AlephiumWalletProvider useTheme="retro">
      <div className="App">
        <header>
          <h1>Alph Wall</h1>
          <nav>
            <span className="nav-text" onClick={() => alert('Docs')}>Docs</span>
            <span className="nav-text" onClick={() => alert('Activity')}>Activity</span>
            <AlephiumConnectButton />
          </nav>
        </header>
        <main>
          <div id="grid-container">
            <div id="grid">
              {pixels.map((color, index) => (
                <div
                  key={index}
                  className="pixel"
                  style={{ backgroundColor: color }}
                  onClick={() => handlePixelClick(index)}
                  title={getGridCoordinates(index)}  // Add the tooltip here
                />
              ))}
            </div>
          </div>
        </main>
        {modalVisible && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <h2>Select a color for pixel at {getGridCoordinates(selectedPixel)} - Cost: 0.2 ALPH</h2>
              <div id="colorOptions">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorClick(color)}
                  />
                ))}
              </div>
              <button id="submitColor" onClick={handleColorSubmit}>Submit</button>
            </div>
          </div>
        )}
      </div>
    </AlephiumWalletProvider>
  );
}

export default App;
