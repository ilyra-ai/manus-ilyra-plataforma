import google.generativeai as genai
import openai
import anthropic
import requests
import json
import os
import time
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Optional, Any
import asyncio
import aiohttp
from models import User, db

class AIProvider(Enum):
    """Provedores de IA disponíveis"""
    GEMINI_PRO = "gemini-pro"
    GEMINI_VISION = "gemini-pro-vision"
    GPT_4 = "gpt-4"
    GPT_3_5_TURBO = "gpt-3.5-turbo"
    CLAUDE_3_OPUS = "claude-3-opus"
    CLAUDE_3_SONNET = "claude-3-sonnet"
    CLAUDE_3_HAIKU = "claude-3-haiku"
    LLAMA_2_70B = "llama-2-70b"
    PALM_2 = "palm-2"
    DALL_E_3 = "dall-e-3"
    MIDJOURNEY = "midjourney"
    STABLE_DIFFUSION = "stable-diffusion"
    RUNWAY_ML = "runway-ml"
    SORA = "sora"
    PIKA_LABS = "pika-labs"

@dataclass
class AIModel:
    """Configuração de modelo de IA"""
    provider: AIProvider
    name: str
    type: str  # text, image, video
    cost_per_token: float
    max_tokens: int
    rate_limit: int  # requests per minute
    quality_score: float  # 0-1
    availability: bool = True
    fallback_models: List[AIProvider] = None

class MultiAISystem:
    """Sistema de múltiplos modelos de IA com fallback automático"""
    
    def __init__(self):
        self.models = self._initialize_models()
        self.usage_stats = {}
        self.rate_limits = {}
        self.model_health = {}
        
        # Configurar APIs
        self._setup_api_clients()
    
    def _initialize_models(self) -> Dict[AIProvider, AIModel]:
        """Inicializar configurações dos modelos"""
        return {
            # Modelos de Texto
            AIProvider.GEMINI_PRO: AIModel(
                provider=AIProvider.GEMINI_PRO,
                name="Google Gemini Pro",
                type="text",
                cost_per_token=0.0005,
                max_tokens=32000,
                rate_limit=60,
                quality_score=0.95,
                fallback_models=[AIProvider.GPT_4, AIProvider.CLAUDE_3_SONNET]
            ),
            AIProvider.GPT_4: AIModel(
                provider=AIProvider.GPT_4,
                name="OpenAI GPT-4",
                type="text",
                cost_per_token=0.03,
                max_tokens=8192,
                rate_limit=40,
                quality_score=0.98,
                fallback_models=[AIProvider.GEMINI_PRO, AIProvider.CLAUDE_3_OPUS]
            ),
            AIProvider.CLAUDE_3_OPUS: AIModel(
                provider=AIProvider.CLAUDE_3_OPUS,
                name="Anthropic Claude 3 Opus",
                type="text",
                cost_per_token=0.015,
                max_tokens=200000,
                rate_limit=50,
                quality_score=0.97,
                fallback_models=[AIProvider.CLAUDE_3_SONNET, AIProvider.GEMINI_PRO]
            ),
            AIProvider.CLAUDE_3_SONNET: AIModel(
                provider=AIProvider.CLAUDE_3_SONNET,
                name="Anthropic Claude 3 Sonnet",
                type="text",
                cost_per_token=0.003,
                max_tokens=200000,
                rate_limit=60,
                quality_score=0.93,
                fallback_models=[AIProvider.CLAUDE_3_HAIKU, AIProvider.GPT_3_5_TURBO]
            ),
            AIProvider.GPT_3_5_TURBO: AIModel(
                provider=AIProvider.GPT_3_5_TURBO,
                name="OpenAI GPT-3.5 Turbo",
                type="text",
                cost_per_token=0.0015,
                max_tokens=4096,
                rate_limit=90,
                quality_score=0.85,
                fallback_models=[AIProvider.GEMINI_PRO, AIProvider.CLAUDE_3_HAIKU]
            ),
            
            # Modelos de Imagem
            AIProvider.DALL_E_3: AIModel(
                provider=AIProvider.DALL_E_3,
                name="OpenAI DALL-E 3",
                type="image",
                cost_per_token=0.04,  # per image
                max_tokens=1,
                rate_limit=50,
                quality_score=0.95,
                fallback_models=[AIProvider.MIDJOURNEY, AIProvider.STABLE_DIFFUSION]
            ),
            AIProvider.MIDJOURNEY: AIModel(
                provider=AIProvider.MIDJOURNEY,
                name="Midjourney",
                type="image",
                cost_per_token=0.03,
                max_tokens=1,
                rate_limit=30,
                quality_score=0.98,
                fallback_models=[AIProvider.DALL_E_3, AIProvider.STABLE_DIFFUSION]
            ),
            AIProvider.STABLE_DIFFUSION: AIModel(
                provider=AIProvider.STABLE_DIFFUSION,
                name="Stable Diffusion XL",
                type="image",
                cost_per_token=0.02,
                max_tokens=1,
                rate_limit=100,
                quality_score=0.88,
                fallback_models=[AIProvider.DALL_E_3]
            ),
            
            # Modelos de Vídeo
            AIProvider.SORA: AIModel(
                provider=AIProvider.SORA,
                name="OpenAI Sora",
                type="video",
                cost_per_token=0.50,  # per video
                max_tokens=1,
                rate_limit=10,
                quality_score=0.95,
                fallback_models=[AIProvider.RUNWAY_ML, AIProvider.PIKA_LABS]
            ),
            AIProvider.RUNWAY_ML: AIModel(
                provider=AIProvider.RUNWAY_ML,
                name="Runway ML",
                type="video",
                cost_per_token=0.30,
                max_tokens=1,
                rate_limit=20,
                quality_score=0.90,
                fallback_models=[AIProvider.PIKA_LABS]
            ),
            AIProvider.PIKA_LABS: AIModel(
                provider=AIProvider.PIKA_LABS,
                name="Pika Labs",
                type="video",
                cost_per_token=0.25,
                max_tokens=1,
                rate_limit=15,
                quality_score=0.85,
                fallback_models=[]
            )
        }
    
    def _setup_api_clients(self):
        """Configurar clientes das APIs"""
        # Google Gemini
        if os.environ.get('GOOGLE_API_KEY'):
            genai.configure(api_key=os.environ.get('GOOGLE_API_KEY'))
        
        # OpenAI
        if os.environ.get('OPENAI_API_KEY'):
            openai.api_key = os.environ.get('OPENAI_API_KEY')
        
        # Anthropic Claude
        if os.environ.get('ANTHROPIC_API_KEY'):
            self.anthropic_client = anthropic.Anthropic(
                api_key=os.environ.get('ANTHROPIC_API_KEY')
            )
    
    def get_best_model_for_task(self, task_type: str, user_plan: str = "free") -> AIProvider:
        """Selecionar o melhor modelo para a tarefa"""
        available_models = [
            model for provider, model in self.models.items()
            if model.type == task_type and model.availability
        ]
        
        # Filtrar por plano do usuário
        if user_plan == "free":
            # Usuários gratuitos têm acesso limitado
            available_models = [m for m in available_models if m.cost_per_token <= 0.01]
        elif user_plan == "premium":
            # Usuários premium têm acesso a modelos de custo médio
            available_models = [m for m in available_models if m.cost_per_token <= 0.05]
        # Usuários enterprise têm acesso a todos os modelos
        
        if not available_models:
            return None
        
        # Ordenar por qualidade e disponibilidade
        available_models.sort(key=lambda x: (x.quality_score, -x.cost_per_token), reverse=True)
        
        # Verificar rate limits
        for model in available_models:
            if self._check_rate_limit(model.provider):
                return model.provider
        
        return available_models[0].provider if available_models else None
    
    def _check_rate_limit(self, provider: AIProvider) -> bool:
        """Verificar se o modelo está dentro do rate limit"""
        current_time = datetime.now()
        minute_ago = current_time - timedelta(minutes=1)
        
        if provider not in self.rate_limits:
            self.rate_limits[provider] = []
        
        # Limpar requests antigos
        self.rate_limits[provider] = [
            timestamp for timestamp in self.rate_limits[provider]
            if timestamp > minute_ago
        ]
        
        model = self.models[provider]
        return len(self.rate_limits[provider]) < model.rate_limit
    
    def _record_request(self, provider: AIProvider):
        """Registrar request para rate limiting"""
        if provider not in self.rate_limits:
            self.rate_limits[provider] = []
        
        self.rate_limits[provider].append(datetime.now())
    
    async def generate_text(self, prompt: str, user_id: int = None, max_retries: int = 3) -> Dict[str, Any]:
        """Gerar texto usando o melhor modelo disponível"""
        user_plan = self._get_user_plan(user_id) if user_id else "free"
        primary_model = self.get_best_model_for_task("text", user_plan)
        
        if not primary_model:
            return {"error": "Nenhum modelo de texto disponível"}
        
        models_to_try = [primary_model]
        if self.models[primary_model].fallback_models:
            models_to_try.extend(self.models[primary_model].fallback_models)
        
        for attempt, model_provider in enumerate(models_to_try):
            try:
                if not self._check_rate_limit(model_provider):
                    continue
                
                self._record_request(model_provider)
                
                # Tentar gerar com o modelo atual
                result = await self._call_text_model(model_provider, prompt)
                
                if result.get("success"):
                    # Registrar uso bem-sucedido
                    self._record_usage(model_provider, user_id, "text", result.get("tokens", 0))
                    return {
                        "success": True,
                        "text": result["text"],
                        "model_used": model_provider.value,
                        "tokens_used": result.get("tokens", 0),
                        "cost": self._calculate_cost(model_provider, result.get("tokens", 0))
                    }
                
            except Exception as e:
                print(f"Erro com modelo {model_provider.value}: {e}")
                self._mark_model_unhealthy(model_provider)
                continue
        
        return {"error": "Todos os modelos de texto falharam"}
    
    async def _call_text_model(self, provider: AIProvider, prompt: str) -> Dict[str, Any]:
        """Chamar modelo específico de texto"""
        try:
            if provider == AIProvider.GEMINI_PRO:
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(prompt)
                return {
                    "success": True,
                    "text": response.text,
                    "tokens": len(response.text.split()) * 1.3  # Estimativa
                }
            
            elif provider in [AIProvider.GPT_4, AIProvider.GPT_3_5_TURBO]:
                model_name = "gpt-4" if provider == AIProvider.GPT_4 else "gpt-3.5-turbo"
                response = await openai.ChatCompletion.acreate(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=self.models[provider].max_tokens
                )
                return {
                    "success": True,
                    "text": response.choices[0].message.content,
                    "tokens": response.usage.total_tokens
                }
            
            elif provider in [AIProvider.CLAUDE_3_OPUS, AIProvider.CLAUDE_3_SONNET, AIProvider.CLAUDE_3_HAIKU]:
                model_map = {
                    AIProvider.CLAUDE_3_OPUS: "claude-3-opus-20240229",
                    AIProvider.CLAUDE_3_SONNET: "claude-3-sonnet-20240229",
                    AIProvider.CLAUDE_3_HAIKU: "claude-3-haiku-20240307"
                }
                
                response = self.anthropic_client.messages.create(
                    model=model_map[provider],
                    max_tokens=self.models[provider].max_tokens,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                return {
                    "success": True,
                    "text": response.content[0].text,
                    "tokens": response.usage.input_tokens + response.usage.output_tokens
                }
            
            else:
                return {"success": False, "error": f"Modelo {provider.value} não implementado"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def generate_image(self, prompt: str, user_id: int = None) -> Dict[str, Any]:
        """Gerar imagem usando o melhor modelo disponível"""
        user_plan = self._get_user_plan(user_id) if user_id else "free"
        primary_model = self.get_best_model_for_task("image", user_plan)
        
        if not primary_model:
            return {"error": "Nenhum modelo de imagem disponível"}
        
        models_to_try = [primary_model]
        if self.models[primary_model].fallback_models:
            models_to_try.extend(self.models[primary_model].fallback_models)
        
        for model_provider in models_to_try:
            try:
                if not self._check_rate_limit(model_provider):
                    continue
                
                self._record_request(model_provider)
                result = await self._call_image_model(model_provider, prompt)
                
                if result.get("success"):
                    self._record_usage(model_provider, user_id, "image", 1)
                    return {
                        "success": True,
                        "image_url": result["image_url"],
                        "model_used": model_provider.value,
                        "cost": self._calculate_cost(model_provider, 1)
                    }
                
            except Exception as e:
                print(f"Erro com modelo de imagem {model_provider.value}: {e}")
                continue
        
        return {"error": "Todos os modelos de imagem falharam"}
    
    async def _call_image_model(self, provider: AIProvider, prompt: str) -> Dict[str, Any]:
        """Chamar modelo específico de imagem"""
        try:
            if provider == AIProvider.DALL_E_3:
                response = await openai.Image.acreate(
                    model="dall-e-3",
                    prompt=prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1
                )
                return {
                    "success": True,
                    "image_url": response.data[0].url
                }
            
            elif provider == AIProvider.STABLE_DIFFUSION:
                # Implementar chamada para Stable Diffusion API
                # Esta é uma implementação placeholder
                return {
                    "success": True,
                    "image_url": "https://placeholder-image-url.com"
                }
            
            else:
                return {"success": False, "error": f"Modelo de imagem {provider.value} não implementado"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _get_user_plan(self, user_id: int) -> str:
        """Obter plano do usuário"""
        try:
            user = User.query.get(user_id)
            if user and hasattr(user, 'subscription'):
                return user.subscription.plan_name.lower()
            return "free"
        except:
            return "free"
    
    def _calculate_cost(self, provider: AIProvider, tokens: int) -> float:
        """Calcular custo da requisição"""
        model = self.models[provider]
        return model.cost_per_token * tokens
    
    def _record_usage(self, provider: AIProvider, user_id: int, task_type: str, tokens: int):
        """Registrar uso do modelo"""
        if provider not in self.usage_stats:
            self.usage_stats[provider] = {
                "total_requests": 0,
                "total_tokens": 0,
                "total_cost": 0,
                "by_user": {},
                "by_type": {}
            }
        
        stats = self.usage_stats[provider]
        stats["total_requests"] += 1
        stats["total_tokens"] += tokens
        stats["total_cost"] += self._calculate_cost(provider, tokens)
        
        if user_id:
            if user_id not in stats["by_user"]:
                stats["by_user"][user_id] = {"requests": 0, "tokens": 0, "cost": 0}
            stats["by_user"][user_id]["requests"] += 1
            stats["by_user"][user_id]["tokens"] += tokens
            stats["by_user"][user_id]["cost"] += self._calculate_cost(provider, tokens)
        
        if task_type not in stats["by_type"]:
            stats["by_type"][task_type] = {"requests": 0, "tokens": 0}
        stats["by_type"][task_type]["requests"] += 1
        stats["by_type"][task_type]["tokens"] += tokens
    
    def _mark_model_unhealthy(self, provider: AIProvider):
        """Marcar modelo como não saudável"""
        self.model_health[provider] = {
            "healthy": False,
            "last_error": datetime.now(),
            "error_count": self.model_health.get(provider, {}).get("error_count", 0) + 1
        }
        
        # Desabilitar temporariamente se muitos erros
        if self.model_health[provider]["error_count"] >= 3:
            self.models[provider].availability = False
    
    def get_usage_statistics(self) -> Dict[str, Any]:
        """Obter estatísticas de uso"""
        total_cost = sum(stats["total_cost"] for stats in self.usage_stats.values())
        total_requests = sum(stats["total_requests"] for stats in self.usage_stats.values())
        
        return {
            "total_cost": total_cost,
            "total_requests": total_requests,
            "by_model": {
                provider.value: stats for provider, stats in self.usage_stats.items()
            },
            "model_health": {
                provider.value: health for provider, health in self.model_health.items()
            }
        }
    
    def reset_model_health(self):
        """Resetar status de saúde dos modelos"""
        for provider in self.models:
            self.models[provider].availability = True
            if provider in self.model_health:
                del self.model_health[provider]

# Instância global do sistema
multi_ai_system = MultiAISystem()

# Funções para integração com as rotas
async def generate_spiritual_response(prompt: str, user_id: int = None) -> Dict[str, Any]:
    """Gerar resposta espiritual usando IA"""
    spiritual_prompt = f"""
    Como um guia espiritual experiente e compassivo, responda à seguinte pergunta 
    com sabedoria, amor e insights práticos para o crescimento espiritual:
    
    {prompt}
    
    Forneça uma resposta que seja:
    - Acolhedora e inspiradora
    - Prática e aplicável
    - Baseada em princípios espirituais universais
    - Respeitosa a todas as tradições espirituais
    
    Responda em português brasileiro.
    """
    
    return await multi_ai_system.generate_text(spiritual_prompt, user_id)

async def generate_spiritual_image(description: str, user_id: int = None) -> Dict[str, Any]:
    """Gerar imagem espiritual usando IA"""
    spiritual_image_prompt = f"""
    Create a beautiful, serene spiritual image: {description}
    Style: peaceful, ethereal, with soft lighting and calming colors
    Include elements like: soft light, nature, sacred geometry, or spiritual symbols
    Mood: tranquil, uplifting, mystical
    """
    
    return await multi_ai_system.generate_image(spiritual_image_prompt, user_id)

def get_ai_usage_stats() -> Dict[str, Any]:
    """Obter estatísticas de uso da IA"""
    return multi_ai_system.get_usage_statistics()
