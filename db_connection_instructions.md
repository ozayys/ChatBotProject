# SQL Server Veritabanı Kurulumu ve Kullanımı

Bu talimatlar, projenizin SQL Server veritabanı ile entegrasyonu için gerekli adımları içerir.

## Önkoşullar

1. SQL Server Management Studio (SSMS) kurulu olmalı
2. SQL Server 2019 veya daha yeni bir sürüm kurulu olmalı
3. Python 3.8+ ve gerekli paketler (requirements.txt dosyasında belirtilmiştir)

## Veritabanı Oluşturma

1. SQL Server Management Studio'yu açın
2. SQL Server'a bağlanın
3. `database_schema.sql` dosyasını SSMS'de açın
4. Execute (F5) ile SQL komutlarını çalıştırın
   - Bu işlem, veritabanını ve tüm tabloları oluşturacaktır
   - Ayrıca örnek veriler ve saklı prosedürler de eklenecektir

## Bağlantı Ayarları

Backend projesinde, aşağıdaki ortam değişkenleri kullanılmaktadır. Bu değişkenleri `.env` dosyasında tanımlayabilirsiniz:

```
# Database Connection
DB_SERVER=localhost            # SQL Server'ın adresi
DB_DATABASE=ChatbotDB          # Oluşturduğunuz veritabanının adı
DB_USERNAME=sa                 # SQL Server kullanıcı adı
DB_PASSWORD=StrongPassword123! # SQL Server şifresi
DB_DRIVER=ODBC Driver 17 for SQL Server  # SQL Server ODBC sürücüsü
```

Not: Bu değerleri kendi ortamınıza göre değiştirmeniz gerekecektir.

## ODBC Sürücüsü Kurulumu

SQL Server ile bağlantı kurmak için ODBC sürücüsü gereklidir:

### Windows için:
1. [Microsoft ODBC Driver for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server) adresinden ODBC sürücüsünü indirin
2. İndirilen dosyayı çalıştırarak kurulumu tamamlayın

### Linux için:
```bash
curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list
apt-get update
apt-get install -y unixodbc-dev
apt-get install -y msodbcsql17
```

## Veritabanı Şeması

Veritabanı şu tabloları içermektedir:

1. **Users** - Kullanıcı bilgileri
2. **Models** - AI modelleri
3. **Conversations** - Sohbet oturumları
4. **Messages** - Sohbet mesajları

## Saklı Prosedürler

Veritabanında aşağıdaki saklı prosedürler tanımlanmıştır:

1. **CreateUser** - Yeni kullanıcı oluşturur
2. **AuthenticateUser** - Kullanıcı girişi doğrular
3. **GetConversationHistory** - Sohbet geçmişini getirir
4. **AddMessage** - Yeni mesaj ekler

## Veritabanını Uygulama ile Test Etme

Kurulumu tamamladıktan sonra, aşağıdaki adımları izleyerek uygulamanın veritabanıyla doğru bir şekilde çalıştığını test edebilirsiniz:

1. Backend sunucusunu başlatın: `cd backend && python run.py`
2. Frontend uygulamasını başlatın: `cd frontend && npm start`
3. Tarayıcıda `http://localhost:3000` adresine gidin
4. Kaydolun veya giriş yapın
5. Sohbet özelliğini kullanın ve mesajların veritabanında saklandığını doğrulayın

## Sorun Giderme

### Bağlantı Sorunları
- SQL Server'ın çalıştığını doğrulayın
- Bağlantı bilgilerinin doğru olduğunu kontrol edin
- Firewall ayarlarını kontrol edin
- Windows kimlik doğrulaması yerine SQL kimlik doğrulaması kullanılıyorsa, SQL Server'da "Mixed Mode Authentication" etkinleştirildiğinden emin olun

### ODBC Hataları
- ODBC sürücüsünün doğru kurulduğunu doğrulayın
- Doğru sürücü adını kullandığınızdan emin olun (örn. "ODBC Driver 17 for SQL Server")
- Windows'ta ODBC Veri Kaynağı Yöneticisi'ni açarak sürücüleri kontrol edin

## Faydalı SSMS Komutları

- Veritabanı listesini görmek için: `SELECT name FROM sys.databases`
- Mevcut veritabanının tablolarını görmek için: `SELECT name FROM sys.tables`
- Bir tablonun yapısını görmek için: `sp_help 'TableName'`
- Bir saklı prosedürün kodunu görmek için: `sp_helptext 'ProcedureName'`