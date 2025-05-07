import pyodbc
import sys
import os
import traceback

# Results will be written to this file
log_file = "db_test_results.txt"

try:
    with open(log_file, 'w', encoding='utf-8') as f:
        f.write("Veritabanı bağlantı testi başlatılıyor...\n")
        
        try:
            from app.config import get_settings
            settings = get_settings()
            
            f.write("SQL Server Sürücüleri:\n")
            f.write(str(pyodbc.drivers()) + "\n")
            
            f.write("\nVeritabanı Bağlantı Ayarları:\n")
            f.write(f"Server: {settings.db_server}\n")
            f.write(f"Database: {settings.db_database}\n")
            f.write(f"Driver: {settings.db_driver}\n")
            f.write(f"Username: {settings.db_username}\n")
            f.write(f"Password: {'*' * len(settings.db_password) if settings.db_password else 'None'}\n")
            f.write(f"Trusted Connection: {settings.db_trusted_connection}\n")
            
            # Windows Authentication bağlantı denemesi
            win_auth_string = f"DRIVER={{{settings.db_driver}}};SERVER={settings.db_server};DATABASE={settings.db_database};Trusted_Connection=yes"
            f.write("\nWindows Authentication bağlantısı deneniyor...\n")
            f.write(f"Connection string: {win_auth_string}\n")
            try:
                win_conn = pyodbc.connect(win_auth_string, timeout=5)
                f.write("✓ Windows Authentication başarılı!\n")
                win_conn.close()
            except Exception as e:
                f.write(f"✗ Windows Authentication hatası: {str(e)}\n")
            
            # SQL Server Authentication bağlantı denemesi
            sql_auth_string = f"DRIVER={{{settings.db_driver}}};SERVER={settings.db_server};DATABASE={settings.db_database};UID={settings.db_username};PWD={settings.db_password}"
            f.write("\nSQL Server Authentication bağlantısı deneniyor...\n")
            f.write(f"Connection string (password gizli): DRIVER={{{settings.db_driver}}};SERVER={settings.db_server};DATABASE={settings.db_database};UID={settings.db_username};PWD=******\n")
            try:
                sql_conn = pyodbc.connect(sql_auth_string, timeout=5)
                f.write("✓ SQL Server Authentication başarılı!\n")
                sql_conn.close()
            except Exception as e:
                f.write(f"✗ SQL Server Authentication hatası: {str(e)}\n")
            
            f.write("\nVeritabanı bağlantısı testi tamamlandı.\n")
        except Exception as e:
            f.write(f"Genel hata: {str(e)}\n")
            f.write(traceback.format_exc())
except Exception as file_error:
    print(f"Log dosyası yazma hatası: {str(file_error)}")
    
print(f"Test tamamlandı. Sonuçlar {log_file} dosyasına yazıldı.") 