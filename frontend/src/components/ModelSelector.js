import React from 'react';
import { FaRobot, FaCalculator } from 'react-icons/fa';

const ModelSelector = ({ onSelectModel }) => {
  return (
    <div className="model-selector-container">
      <h1>Matematik ve Günlük Sohbet Chatbot'una Hoş Geldiniz</h1>
      <p>Lütfen kullanmak istediğiniz model türünü seçin:</p>
      
      <div className="model-options">
        <div 
          className="model-option" 
          onClick={() => onSelectModel('api')}
        >
          <FaRobot className="model-icon" />
          <h2>API ile matematik çözümleri</h2>
          <p>DeepSeek API kullanarak matematiksel sorularınız için çözümler</p>
        </div>
        
        <div 
          className="model-option" 
          onClick={() => onSelectModel('custom')}
        >
          <FaCalculator className="model-icon" />
          <h2>Matematik Çözücü</h2>
          <p>Matematiksel problemler ve denklemler için özel çözüm modeli</p>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector; 