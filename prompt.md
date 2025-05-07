# Matematik ve Günlük Sohbet Chatbot Web Uygulaması

## Amaç
Kullanıcıların hem günlük sohbet hem de matematik sorularına cevap alabileceği bir chatbot geliştirilmesi. Bu chatbot, kullanıcıya iki seçenek sunacaktır:

- Hazır bir API modeli (örneğin ChatGPT mini)
- Kullanıcının kendi eğittiği özel model

Chatbot, Gemini (https://gemini.google.com/) benzeri modern ve etkileşimli bir web arayüzü ile sunulacaktır. Tüm butonlar işlevsel olacak ve gerçek zamanlı yanıtlar alınabilecektir.

---

## Genel Özellikler

- Kullanıcı, ChatGPT API modeli veya özel eğitilmiş modeli seçebilir.
- Gemini tarzında, etkileşimli bir frontend arayüzü.
- Sohbet geçmişi, tema geçişi ve diğer UI kontrolleri eksiksiz çalışmalıdır.
- Kullanıcı adı/şifre ile giriş veya Google hesabıyla giriş yapılabilir.
- Proje yönetimi JIRA üzerinden yürütülmektedir.

---

## Epic ve Görevlere Göre Durumlar

### ✅ Tamamlananlar (Done)
- [x] Proje yapısı tanımlandı
- [x] JIRA Epic ve Task yapısı oluşturuldu
- [x] Ana sayfa layout'u belirlendi
- [x] Tema geçişi (dark/light mod) temel düzeyde hazırlandı

---

### 🔄 Yapılmakta Olanlar (In Progress)
- [ ] Mesaj kutusu ve gönderme işlevi
- [ ] Sohbet geçmişi paneli
- [ ] Model seçim arayüzü (UI tarafı)
- [ ] FastAPI tabanlı backend kurulumu
- [ ] Hazır model (ChatGPT mini) için API bağlantısı testi

---

### 🛠 Yapılacaklar (To Do)
- [ ] Model seçim sonrası yönlendirme mantığı (API mi, özel model mi?)
- [ ] Özel model için tahmin endpoint'i (POST /predict)
- [ ] Modelin input/output formatlarının belirlenmesi ve belgelenmesi
- [ ] Yanıtların normalize edilmesi (görsel dilin tutarlılığı)
- [ ] Fallback hata mesajları için yapı kurulması
- [ ] Sohbet geçmişi silme butonu ve işlevselliği
- [ ] Kullanıcı kayıt sistemi (email + şifre)
- [ ] Google ile giriş (OAuth 2.0)
- [ ] JWT veya benzeri ile oturum yönetimi
- [ ] Kullanıcı oturum bilgisine göre sohbet geçmişi yönetimi
- [ ] Docker ile backend deploy (opsiyonel)

---

## Teknik Detaylar

### Frontend

- Modern web arayüzü (React/Vue/Angular)
- Google Gemini benzeri temiz ve etkileşimli UI
- Tema geçişi (dark/light mod)
- Sohbet geçmişi yönetimi
- Giriş/Kayıt ekranları
- Google ile giriş butonu (OAuth)

### Backend

- FastAPI veya Flask tabanlı API
- İki farklı model entegrasyonu:
  1. Hazır API modeli (ChatGPT mini vb.)
  2. Özel eğitilmiş model (matematik odaklı)
- Standartlaştırılmış input/output formatları
- Hata yönetimi ve fallback mekanizmaları
- Kullanıcı kayıt ve giriş sistemi
- JWT tabanlı oturum kontrolü
- Kullanıcıya özel sohbet geçmişi veritabanı bağlantısı

### Giriş/Kayıt Sistemi

- Siteye özel kayıt ve giriş (email/şifre)
- Google ile OAuth 2.0 üzerinden giriş
- JWT ile güvenli oturum yönetimi
- Giriş yapmış kullanıcıların geçmiş sohbetlerini saklama ve yönetme

---

## İş Akışı

1. Kullanıcı web arayüzünü açar
2. Kullanıcı giriş yapar (email/şifre ya da Google ile)
3. Model seçimi yapılır (hazır API veya özel model)
4. Kullanıcı mesajını girer ve gönderir
5. Backend, seçilen modele göre işlemi yönlendirir
6. Model yanıtı hesaplanır ve kullanıcıya gösterilir
7. Sohbet geçmişi güncellenir
8. Kullanıcı temayı değiştirebilir veya sohbeti temizleyebilir

---

## Notlar
