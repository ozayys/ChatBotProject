import pyodbc
import sys

try:
    print("SQL Server Sürücüleri:")
    drivers = pyodbc.drivers()
    print(drivers)
    
    # Config values (doğrudan buraya yazıyorum config.py'dan çekmeden)
    server = "DESKTOP-V4SPMG3"
    database = "ChatbotDB"
    username = r"DESKTOP-V4SPMG3\ali"
    password = "YeniSifre123"
    driver = "ODBC Driver 17 for SQL Server"
    
    print("\nVeritabanı Bağlantı Ayarları:")
    print(f"Server: {server}")
    print(f"Database: {database}")
    print(f"Driver: {driver}")
    print(f"Username: {username}")
    print(f"Password: {'*' * len(password)}")
    
    # Windows Authentication bağlantı denemesi
    win_auth_string = f"DRIVER={{{driver}}};SERVER={server};DATABASE={database};Trusted_Connection=yes"
    print("\nWindows Authentication bağlantısı deneniyor...")
    print(f"Connection string: {win_auth_string}")
    try:
        win_conn = pyodbc.connect(win_auth_string, timeout=5)
        print("✓ Windows Authentication başarılı!")
        win_conn.close()
    except Exception as e:
        print(f"✗ Windows Authentication hatası: {str(e)}")
    
    # SQL Server Authentication bağlantı denemesi
    sql_auth_string = f"DRIVER={{{driver}}};SERVER={server};DATABASE={database};UID={username};PWD={password}"
    print("\nSQL Server Authentication bağlantısı deneniyor...")
    print(f"Connection string (password gizli): DRIVER={{{driver}}};SERVER={server};DATABASE={database};UID={username};PWD=******")
    try:
        sql_conn = pyodbc.connect(sql_auth_string, timeout=5)
        print("✓ SQL Server Authentication başarılı!")
        sql_conn.close()
    except Exception as e:
        print(f"✗ SQL Server Authentication hatası: {str(e)}")
    
    print("\nVeritabanı bağlantısı testi tamamlandı.")
except Exception as e:
    print(f"Genel hata: {str(e)}") 