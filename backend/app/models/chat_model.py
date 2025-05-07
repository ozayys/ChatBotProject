from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import execute_stored_procedure, execute_query

class Message(BaseModel):
    id: Optional[int] = None
    content: str
    sender: str  # 'user' veya 'bot'
    sent_at: datetime

class Conversation(BaseModel):
    id: int
    user_id: int
    model_id: int
    started_at: datetime
    last_message_at: datetime
    title: Optional[str] = None
    messages: Optional[List[Message]] = None

class ChatModel:
    @staticmethod
    def get_chat_history(user_id: int, model_name: str) -> List[Message]:
        """
        Belirtilen kullanıcı ve model için sohbet geçmişini getirir.
        
        Args:
            user_id (int): Kullanıcı ID'si
            model_name (str): Model adı
            
        Returns:
            List[Message]: Mesaj listesi
        """
        try:
            message_rows = execute_stored_procedure(
                "GetConversationHistory",
                {"UserID": user_id, "ModelName": model_name},
                fetchall=True
            )
            
            messages = []
            if message_rows:
                for row in message_rows:
                    content, sender, sent_at = row
                    messages.append(Message(
                        content=content,
                        sender=sender,
                        sent_at=sent_at
                    ))
            
            return messages
        except Exception as e:
            print(f"Sohbet geçmişi getirme hatası: {str(e)}")
            return []
    
    @staticmethod
    def add_message(user_id: int, model_name: str, content: str, sender: str) -> Optional[Message]:
        """
        Sohbete yeni bir mesaj ekler.
        
        Args:
            user_id (int): Kullanıcı ID'si
            model_name (str): Model adı
            content (str): Mesaj içeriği
            sender (str): Gönderen ('user' veya 'bot')
            
        Returns:
            Message: Eklenen mesaj
        """
        try:
            result = execute_stored_procedure(
                "AddMessage",
                {
                    "UserID": user_id,
                    "ModelName": model_name,
                    "Content": content,
                    "Sender": sender
                },
                fetchone=True
            )
            
            if result and result[0]:  # MessageID döndüyse
                # Mesaj oluşturuldu, bilgilerini döndür
                return Message(
                    id=result[0],
                    content=content,
                    sender=sender,
                    sent_at=datetime.now()
                )
            
            return None
        except Exception as e:
            print(f"Mesaj ekleme hatası: {str(e)}")
            return None
    
    @staticmethod
    def clear_chat_history(user_id: int, model_name: str) -> bool:
        """
        Belirtilen kullanıcı ve model için sohbet geçmişini temizler.
        
        Args:
            user_id (int): Kullanıcı ID'si
            model_name (str): Model adı
            
        Returns:
            bool: İşlem başarılı olduysa True
        """
        try:
            # Önce model ID'sini al
            model_row = execute_query(
                "SELECT ModelID FROM Models WHERE ModelName = ?",
                (model_name,),
                fetchone=True
            )
            
            if not model_row:
                return False
            
            model_id = model_row[0]
            
            # Konuşmaları bul
            conversation_rows = execute_query(
                "SELECT ConversationID FROM Conversations WHERE UserID = ? AND ModelID = ?",
                (user_id, model_id),
                fetchall=True
            )
            
            if not conversation_rows:
                return True  # Zaten temiz
            
            # Tüm mesajları ve konuşmaları sil
            for row in conversation_rows:
                conversation_id = row[0]
                
                # Mesajları sil
                execute_query(
                    "DELETE FROM Messages WHERE ConversationID = ?",
                    (conversation_id,),
                    commit=True
                )
                
                # Konuşmayı sil
                execute_query(
                    "DELETE FROM Conversations WHERE ConversationID = ?",
                    (conversation_id,),
                    commit=True
                )
            
            return True
        except Exception as e:
            print(f"Sohbet geçmişi temizleme hatası: {str(e)}")
            return False