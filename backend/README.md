# Chatbot Backend

Bu proje, matematik ve günlük sohbet chatbot'u için FastAPI tabanlı backend uygulamasıdır.

## Özellikler

- FastAPI tabanlı REST API
- ChatGPT API entegrasyonu
- Özel matematik modeli desteği
- CORS yapılandırması
- Çevre değişkenleri yönetimi
- Async/await desteği

## Kurulum

1. Python 3.8+ yüklü olmalıdır.

2. Sanal ortam oluşturun ve aktifleştirin:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

4. `.env` dosyasını oluşturun:
```bash
cp .env.example .env
```

5. `.env` dosyasını düzenleyin ve OpenAI API anahtarınızı ekleyin.

## Çalıştırma

Geliştirme sunucusunu başlatmak için:

```bash
python run.py
```

Sunucu varsayılan olarak `http://localhost:8000` adresinde çalışacaktır.

## API Endpoints

- `POST /api/chat`: ChatGPT API ile sohbet
- `POST /api/custom-model`: Özel matematik modeli ile sohbet
- `GET /health`: Sağlık kontrolü

## Geliştirme

- `app/main.py`: Ana uygulama ve route'lar
- `app/config.py`: Uygulama yapılandırması
- `app/models/`: Model implementasyonları

## Notlar

- Özel matematik modeli şu an için geliştirme aşamasındadır
- Üretim ortamında CORS ayarlarını güvenli bir şekilde yapılandırın
- API anahtarlarını güvenli bir şekilde saklayın 