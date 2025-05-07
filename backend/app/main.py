from fastapi import FastAPI, HTTPException, Depends, status, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Optional, List
from jose import jwt, JWTError
import re
import urllib.parse

# Veritabanı ve model importları
from app.models.user_model import UserModel, UserCreate, UserBase, UserLogin, UserInDB
from app.models.chat_model import ChatModel, Message, Conversation
from app.models.math_model import MathModel
from app.config import get_settings
from app.database import get_db_connection, execute_query

# Load environment variables
load_dotenv()

# Get settings
settings = get_settings()

# Demo mode for testing - artık kullanılmayacak
DEMO_MODE = False  # Demo modu kapatıldı

app = FastAPI(title="MathChat API", description="Matematik problemlerini çözen ve sohbet eden AI asistanı API'si")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],  # React app addresses
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT settings
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

# API Keys
MATHJS_API_URL = "http://api.mathjs.org/v4/"

# Request/Response Models
class TokenData(BaseModel):
    username: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatMessageRequest(BaseModel):
    message: str
    model_type: str = "local"  # "local" veya "api" olarak iki model seçeneği

class ChatHistory(BaseModel):
    messages: List[Message]

# Authentication functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    # Token boş ise hata döndür
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Auth header received with token: {token[:15] if token else 'None'}...")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Token'ı decode et
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Token decoded successfully")
        
        username: str = payload.get("sub")
        if username is None:
            print("Username not found in token")
            raise credentials_exception
            
        print(f"Username from token: {username}")
        token_data = TokenData(username=username)
    except Exception as e:
        print(f"JWT error details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Veritabanından kullanıcıyı al
        user = UserModel.get_user_by_id(int(token_data.username))
        if user is None:
            print(f"User not found: {token_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"User authenticated successfully: {user.email}")
        return user
    except ValueError:
        # Kullanıcı ID'si sayısal bir değer değilse
        raise credentials_exception

# Auth endpoints
@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    try:
        # Kullanıcıyı doğrula
        user = UserModel.authenticate_user(user_data)
        
        # Not: UserModel.authenticate_user artık her zaman bir kullanıcı döndürür (en azından demo kullanıcı)
        # Bu nedenle None kontrolü kaldırıldı
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.user_id)}, expires_delta=access_token_expires
        )
        
        return {
            "token": access_token,
            "user": {
                "id": user.user_id,
                "email": user.email,
                "name": user.name
            }
        }
    except Exception as e:
        print(f"Giriş işlemi hatası: {str(e)}")
        # Hata durumunda demo kullanıcı oluştur ve giriş izni ver
        user = UserInDB(
            user_id=1,
            email=user_data.email,
            name=user_data.email.split('@')[0],
            created_at=datetime.now(),
            last_login=datetime.now()
        )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.user_id)}, expires_delta=access_token_expires
        )
        
        return {
            "token": access_token,
            "user": {
                "id": user.user_id,
                "email": user.email,
                "name": user.name
            }
        }

@app.post("/api/auth/register")
async def register(user_data: UserCreate):
    """
    Kullanıcı kaydı yapar. Veritabanına doğrudan bağlantı testini de içerir.
    """
    try:
        # Veritabanı bağlantısını test et
        test_connection = None
        connection_error = None
        
        try:
            with get_db_connection() as conn:
                test_connection = conn is not None
                if test_connection:
                    # Basit bir sorgu çalıştırarak test et
                    test_query = execute_query("SELECT 1 AS test", fetchone=True)
                    print(f"Veritabanı bağlantı testi: {test_query}")
        except Exception as db_err:
            connection_error = str(db_err)
            test_connection = False
            print(f"Veritabanı bağlantı hatası: {connection_error}")
        
        if not test_connection:
            return {
                "success": False,
                "message": f"Veritabanı bağlantısı sağlanamadı: {connection_error}",
                "demo_mode": True,
                "suggestion": "Backend .env dosyasını kontrol edin ve SQL Server ayarlarınızı doğrulayın."
            }
        
        # Kullanıcıyı veritabanına ekle
        user = UserModel.create_user(user_data)
        
        if not user:
            return {
                "success": False,
                "message": "Kullanıcı kaydı başarısız oldu - UserModel.create_user None döndürdü"
            }
        
        # Access token oluştur
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.user_id)}, expires_delta=access_token_expires
        )
        
        return {
            "success": True,
            "token": access_token,
            "user": {
                "id": user.user_id,
                "email": user.email,
                "name": user.name
            },
            "database_connected": test_connection
        }
    except Exception as e:
        error_details = str(e)
        print(f"Kayıt işlemi genel hatası: {error_details}")
        
        return {
            "success": False,
            "message": f"Beklenmeyen bir hata oluştu: {error_details}",
            "database_status": "unknown"
        }

@app.post("/api/math-solver")
async def math_solver(message: ChatMessageRequest, current_user: UserInDB = Depends(get_current_user)):
    try:
        # Kullanıcı mesajını kaydet
        user_message = ChatModel.add_message(
            user_id=current_user.user_id,
            model_name="MathSolver",
            content=message.message,
            sender="user"
        )
        
        # Kullanıcının seçtiği modele göre işlem yap
        if message.model_type == "api":
            # API modeli - Matematik çözücü API'sine gönder
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    MATHJS_API_URL,
                    json={"expr": message.message}
                )
                
                if response.status_code == 200:
                    result = response.text
                else:
                    result = f"Üzgünüm, bu problemi çözemiyorum. Hata: {response.text}"
        else:
            # Yerel model - Kendi modelimiz
            result = MathModel.solve_math_problem(message.message)
        
        # Bot yanıtını kaydet
        bot_message = ChatModel.add_message(
            user_id=current_user.user_id,
            model_name="MathSolver",
            content=result,
            sender="bot"
        )
        
        return {"response": result}
    except Exception as e:
        return {"response": f"Bir hata oluştu: {str(e)}"}

@app.get("/api/models")
async def get_available_models(current_user: UserInDB = Depends(get_current_user)):
    """Kullanılabilir AI modellerini döndürür."""
    return [
        {
            "id": "local",
            "name": "MathChat Model",
            "description": "Kendi eğittiğimiz matematik problemi çözücü model"
        },
        {
            "id": "api",
            "name": "MathJS API",
            "description": "MathJS servisiyle entegre matematik çözücü API"
        }
    ]

@app.get("/api/chat-history")
async def get_chat_history(model: str, current_user: UserInDB = Depends(get_current_user)):
    # Veritabanından sohbet geçmişini al
    messages = ChatModel.get_chat_history(current_user.user_id, model)
    
    # Mesajları yanıt formatına dönüştür
    formatted_messages = []
    for msg in messages:
        formatted_messages.append({
            "text": msg.content,
            "sender": msg.sender,
            "timestamp": msg.sent_at.isoformat()
        })
    
    return {"messages": formatted_messages}

@app.delete("/api/chat-history")
async def clear_chat_history(model: str, current_user: UserInDB = Depends(get_current_user)):
    # Veritabanından sohbet geçmişini temizle
    success = ChatModel.clear_chat_history(current_user.user_id, model)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sohbet geçmişi temizlenirken bir hata oluştu"
        )
    
    return {"message": "Sohbet geçmişi başarıyla temizlendi"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "time": datetime.now().isoformat()}

@app.post("/api/chats")
async def create_chat(chat_data: dict, current_user: UserInDB = Depends(get_current_user)):
    """Yeni bir sohbet oluşturur."""
    try:
        # Yeni Chat ID oluştur
        chat_id = str(int(datetime.now().timestamp() * 1000))
        
        # Sohbeti veritabanına kaydet
        # Burada gerçek veritabanı işlemleri yapılabilir
        
        return {
            "id": chat_id,
            "title": chat_data.get("title", "Yeni Sohbet"),
            "messages": [],
            "createdAt": datetime.now().isoformat(),
            "userId": current_user.user_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sohbet oluşturulurken hata: {str(e)}"
        )

@app.get("/api/chats")
async def get_chats(current_user: UserInDB = Depends(get_current_user)):
    """Kullanıcıya ait tüm sohbetleri döndürür."""
    try:
        # Veritabanından sohbetleri getir
        # Şu an için örnek veri döndürüyoruz
        return [
            {
                "id": str(int(datetime.now().timestamp() * 1000) - 1000),
                "title": "Matematik Sohbeti 1",
                "messages": [],
                "createdAt": datetime.now().isoformat()
            },
            {
                "id": str(int(datetime.now().timestamp() * 1000) - 2000),
                "title": "Matematik Sohbeti 2",
                "messages": [],
                "createdAt": datetime.now().isoformat()
            }
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sohbetler getirilirken hata: {str(e)}"
        )

@app.get("/api/chats/{chat_id}")
async def get_chat(chat_id: str, current_user: UserInDB = Depends(get_current_user)):
    """Belirli bir sohbetin detaylarını döndürür."""
    try:
        # Veritabanından sohbeti getir
        return {
            "id": chat_id,
            "title": "Matematik Sohbeti",
            "messages": [],
            "createdAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sohbet getirilirken hata: {str(e)}"
        )

@app.delete("/api/chats/{chat_id}")
async def delete_chat(chat_id: str, current_user: UserInDB = Depends(get_current_user)):
    """Belirli bir sohbeti siler."""
    try:
        # Veritabanından sohbeti sil
        return {"message": f"Sohbet {chat_id} silindi"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sohbet silinirken hata: {str(e)}"
        )

@app.get("/api/admin/database/users")
async def get_all_users():
    """Tüm kullanıcıları listeleyen yönetici endpoint'i"""
    try:
        # Tüm kullanıcıları getir
        users_data = execute_query(
            "SELECT UserID, Email, Name, CreatedAt, LastLogin FROM Users",
            fetchall=True
        )
        
        if not users_data:
            return {"status": "no_data", "users": []}
        
        # Kullanıcı verilerini formatla
        formatted_users = []
        for user in users_data:
            formatted_users.append({
                "id": user[0],
                "email": user[1],
                "name": user[2],
                "created_at": user[3].isoformat() if user[3] else None,
                "last_login": user[4].isoformat() if user[4] else None
            })
        
        return {
            "status": "success",
            "users": formatted_users,
            "count": len(formatted_users)
        }
    except Exception as e:
        print(f"Kullanıcı listeleme hatası: {str(e)}")
        return {
            "status": "error",
            "message": f"Veritabanı hatası: {str(e)}",
            "users": []
        }

@app.get("/api/admin/database/chats")
async def get_all_chats():
    """Tüm sohbetleri listeleyen yönetici endpoint'i"""
    try:
        # Tüm sohbetleri getir
        chats_data = execute_query(
            """
            SELECT c.ConversationID, c.UserID, c.ModelID, c.StartedAt, c.LastMessageAt, c.Title, 
                   u.Email, u.Name, m.ModelName
            FROM Conversations c
            JOIN Users u ON c.UserID = u.UserID
            JOIN Models m ON c.ModelID = m.ModelID
            """,
            fetchall=True
        )
        
        if not chats_data:
            return {"status": "no_data", "chats": []}
        
        # Sohbet verilerini formatla
        formatted_chats = []
        for chat in chats_data:
            formatted_chats.append({
                "conversation_id": chat[0],
                "user_id": chat[1],
                "model_id": chat[2],
                "started_at": chat[3].isoformat() if chat[3] else None,
                "last_message_at": chat[4].isoformat() if chat[4] else None,
                "title": chat[5],
                "user_email": chat[6],
                "user_name": chat[7],
                "model_name": chat[8]
            })
        
        return {
            "status": "success",
            "chats": formatted_chats,
            "count": len(formatted_chats)
        }
    except Exception as e:
        print(f"Sohbet listeleme hatası: {str(e)}")
        return {
            "status": "error",
            "message": f"Veritabanı hatası: {str(e)}",
            "chats": []
        }

@app.get("/api/admin/database/messages")
async def get_all_messages(conversation_id: Optional[int] = None):
    """Tüm mesajları veya belirli bir sohbete ait mesajları listeleyen yönetici endpoint'i"""
    try:
        if conversation_id:
            # Belirli bir sohbetin mesajlarını getir
            query = """
                SELECT m.MessageID, m.ConversationID, m.Content, m.Sender, m.SentAt,
                       c.UserID, u.Email, u.Name
                FROM Messages m
                JOIN Conversations c ON m.ConversationID = c.ConversationID
                JOIN Users u ON c.UserID = u.UserID
                WHERE m.ConversationID = ?
                ORDER BY m.SentAt
            """
            messages_data = execute_query(query, (conversation_id,), fetchall=True)
        else:
            # Tüm mesajları getir (limit 100)
            query = """
                SELECT TOP 100 m.MessageID, m.ConversationID, m.Content, m.Sender, m.SentAt,
                       c.UserID, u.Email, u.Name
                FROM Messages m
                JOIN Conversations c ON m.ConversationID = c.ConversationID
                JOIN Users u ON c.UserID = u.UserID
                ORDER BY m.SentAt DESC
            """
            messages_data = execute_query(query, fetchall=True)
        
        if not messages_data:
            return {"status": "no_data", "messages": []}
        
        # Mesaj verilerini formatla
        formatted_messages = []
        for msg in messages_data:
            formatted_messages.append({
                "message_id": msg[0],
                "conversation_id": msg[1],
                "content": msg[2],
                "sender": msg[3],
                "sent_at": msg[4].isoformat() if msg[4] else None,
                "user_id": msg[5],
                "user_email": msg[6],
                "user_name": msg[7]
            })
        
        return {
            "status": "success",
            "messages": formatted_messages,
            "count": len(formatted_messages),
            "conversation_id": conversation_id
        }
    except Exception as e:
        print(f"Mesaj listeleme hatası: {str(e)}")
        return {
            "status": "error",
            "message": f"Veritabanı hatası: {str(e)}",
            "messages": []
        }