from datetime import datetime, timedelta
import json
import os
from models import User, AIConversation, db
from sqlalchemy import func, text
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
import redis
from enum import Enum

class CostAlert(Enum):
    """Tipos de alertas de custo"""
    DAILY_LIMIT = "daily_limit"
    MONTHLY_LIMIT = "monthly_limit"
    USER_LIMIT = "user_limit"
    MODEL_EXPENSIVE = "model_expensive"
    UNUSUAL_USAGE = "unusual_usage"

@dataclass
class CostThreshold:
    """Limites de custo"""
    daily_limit: float = 100.0
    monthly_limit: float = 2000.0
    user_daily_limit: float = 10.0
    user_monthly_limit: float = 100.0
    expensive_model_threshold: float = 0.05  # por token

class AICostMonitor:
    """Monitor de custos de IA com alertas e controles"""
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        self.thresholds = CostThreshold()
        
        # Custos por modelo (por token/request)
        self.model_costs = {
            'gemini-pro': 0.0005,
            'gpt-4': 0.03,
            'gpt-3.5-turbo': 0.0015,
            'claude-3-opus': 0.015,
            'claude-3-sonnet': 0.003,
            'claude-3-haiku': 0.00025,
            'dall-e-3': 0.04,  # por imagem
            'midjourney': 0.03,
            'stable-diffusion': 0.02,
            'sora': 0.50,  # por vídeo
            'runway-ml': 0.30,
            'pika-labs': 0.25
        }
        
        # Limites por plano
        self.plan_limits = {
            'free': {
                'daily_requests': 10,
                'monthly_cost': 5.0,
                'allowed_models': ['gemini-pro', 'gpt-3.5-turbo', 'claude-3-haiku']
            },
            'premium': {
                'daily_requests': 100,
                'monthly_cost': 50.0,
                'allowed_models': ['gemini-pro', 'gpt-4', 'claude-3-sonnet', 'dall-e-3']
            },
            'enterprise': {
                'daily_requests': 1000,
                'monthly_cost': 500.0,
                'allowed_models': 'all'
            }
        }
    
    def record_ai_usage(self, user_id: int, model_name: str, tokens_used: int, 
                       request_type: str = 'text') -> Dict[str, Any]:
        """Registrar uso de IA e calcular custos"""
        try:
            # Calcular custo
            cost = self.calculate_cost(model_name, tokens_used, request_type)
            
            # Registrar no Redis para monitoramento em tempo real
            current_date = datetime.now().strftime('%Y-%m-%d')
            current_month = datetime.now().strftime('%Y-%m')
            
            # Chaves para diferentes agregações
            keys = {
                'daily_total': f'ai_cost:daily:{current_date}',
                'monthly_total': f'ai_cost:monthly:{current_month}',
                'user_daily': f'ai_cost:user_daily:{user_id}:{current_date}',
                'user_monthly': f'ai_cost:user_monthly:{user_id}:{current_month}',
                'model_daily': f'ai_cost:model_daily:{model_name}:{current_date}',
                'requests_daily': f'ai_requests:daily:{current_date}',
                'user_requests_daily': f'ai_requests:user_daily:{user_id}:{current_date}'
            }
            
            # Incrementar contadores
            pipe = self.redis_client.pipeline()
            for key in keys.values():
                if 'requests' in key:
                    pipe.incr(key)
                else:
                    pipe.incrbyfloat(key, cost)
                pipe.expire(key, 86400 * 31)  # 31 dias
            pipe.execute()
            
            # Registrar detalhes da transação
            transaction = {
                'user_id': user_id,
                'model': model_name,
                'tokens': tokens_used,
                'cost': cost,
                'type': request_type,
                'timestamp': datetime.now().isoformat()
            }
            
            transaction_key = f'ai_transaction:{datetime.now().timestamp()}'
            self.redis_client.setex(transaction_key, 86400 * 7, json.dumps(transaction))
            
            # Verificar limites e alertas
            alerts = self.check_cost_limits(user_id, cost)
            
            return {
                'cost': cost,
                'total_daily_cost': float(self.redis_client.get(keys['daily_total']) or 0),
                'user_daily_cost': float(self.redis_client.get(keys['user_daily']) or 0),
                'alerts': alerts,
                'within_limits': len(alerts) == 0
            }
            
        except Exception as e:
            print(f"Erro ao registrar uso de IA: {e}")
            return {'error': str(e)}
    
    def calculate_cost(self, model_name: str, tokens_used: int, request_type: str) -> float:
        """Calcular custo baseado no modelo e uso"""
        base_cost = self.model_costs.get(model_name, 0.001)  # Custo padrão se modelo não encontrado
        
        if request_type in ['image', 'video']:
            # Para imagens e vídeos, o custo é por item, não por token
            return base_cost
        else:
            # Para texto, custo por token
            return base_cost * tokens_used
    
    def check_cost_limits(self, user_id: int, current_cost: float) -> List[Dict[str, Any]]:
        """Verificar se os limites de custo foram excedidos"""
        alerts = []
        current_date = datetime.now().strftime('%Y-%m-%d')
        current_month = datetime.now().strftime('%Y-%m')
        
        try:
            # Obter custos atuais
            daily_total = float(self.redis_client.get(f'ai_cost:daily:{current_date}') or 0)
            monthly_total = float(self.redis_client.get(f'ai_cost:monthly:{current_month}') or 0)
            user_daily = float(self.redis_client.get(f'ai_cost:user_daily:{user_id}:{current_date}') or 0)
            user_monthly = float(self.redis_client.get(f'ai_cost:user_monthly:{user_id}:{current_month}') or 0)
            
            # Obter plano do usuário
            user_plan = self.get_user_plan(user_id)
            plan_limits = self.plan_limits.get(user_plan, self.plan_limits['free'])
            
            # Verificar limite diário total
            if daily_total > self.thresholds.daily_limit:
                alerts.append({
                    'type': CostAlert.DAILY_LIMIT.value,
                    'message': f'Limite diário total excedido: ${daily_total:.2f}',
                    'severity': 'high',
                    'current_value': daily_total,
                    'limit': self.thresholds.daily_limit
                })
            
            # Verificar limite mensal total
            if monthly_total > self.thresholds.monthly_limit:
                alerts.append({
                    'type': CostAlert.MONTHLY_LIMIT.value,
                    'message': f'Limite mensal total excedido: ${monthly_total:.2f}',
                    'severity': 'critical',
                    'current_value': monthly_total,
                    'limit': self.thresholds.monthly_limit
                })
            
            # Verificar limite do usuário
            if user_monthly > plan_limits['monthly_cost']:
                alerts.append({
                    'type': CostAlert.USER_LIMIT.value,
                    'message': f'Limite mensal do usuário excedido: ${user_monthly:.2f}',
                    'severity': 'high',
                    'current_value': user_monthly,
                    'limit': plan_limits['monthly_cost'],
                    'user_id': user_id
                })
            
            # Verificar uso incomum (aumento súbito)
            if current_cost > 1.0:  # Transação cara
                alerts.append({
                    'type': CostAlert.UNUSUAL_USAGE.value,
                    'message': f'Transação de alto custo detectada: ${current_cost:.2f}',
                    'severity': 'medium',
                    'current_value': current_cost,
                    'user_id': user_id
                })
            
            return alerts
            
        except Exception as e:
            print(f"Erro ao verificar limites: {e}")
            return []
    
    def get_user_plan(self, user_id: int) -> str:
        """Obter plano do usuário"""
        try:
            user = User.query.get(user_id)
            if user and hasattr(user, 'subscription'):
                return user.subscription.plan_name.lower()
            return 'free'
        except:
            return 'free'
    
    def can_user_use_model(self, user_id: int, model_name: str) -> Dict[str, Any]:
        """Verificar se usuário pode usar o modelo"""
        user_plan = self.get_user_plan(user_id)
        plan_limits = self.plan_limits.get(user_plan, self.plan_limits['free'])
        
        # Verificar se modelo é permitido no plano
        allowed_models = plan_limits['allowed_models']
        if allowed_models != 'all' and model_name not in allowed_models:
            return {
                'allowed': False,
                'reason': f'Modelo {model_name} não disponível no plano {user_plan}',
                'upgrade_required': True
            }
        
        # Verificar limites de requests diários
        current_date = datetime.now().strftime('%Y-%m-%d')
        user_requests = int(self.redis_client.get(f'ai_requests:user_daily:{user_id}:{current_date}') or 0)
        
        if user_requests >= plan_limits['daily_requests']:
            return {
                'allowed': False,
                'reason': f'Limite diário de {plan_limits["daily_requests"]} requests excedido',
                'requests_used': user_requests,
                'daily_limit': plan_limits['daily_requests']
            }
        
        # Verificar limite mensal de custo
        current_month = datetime.now().strftime('%Y-%m')
        user_monthly_cost = float(self.redis_client.get(f'ai_cost:user_monthly:{user_id}:{current_month}') or 0)
        
        if user_monthly_cost >= plan_limits['monthly_cost']:
            return {
                'allowed': False,
                'reason': f'Limite mensal de ${plan_limits["monthly_cost"]} excedido',
                'cost_used': user_monthly_cost,
                'monthly_limit': plan_limits['monthly_cost']
            }
        
        return {'allowed': True}
    
    def get_cost_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Obter análises de custo"""
        try:
            analytics = {
                'total_cost': 0,
                'daily_costs': {},
                'model_costs': {},
                'user_costs': {},
                'cost_trends': {},
                'top_users': [],
                'top_models': []
            }
            
            # Obter dados dos últimos N dias
            for i in range(days):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                daily_cost = float(self.redis_client.get(f'ai_cost:daily:{date}') or 0)
                analytics['daily_costs'][date] = daily_cost
                analytics['total_cost'] += daily_cost
            
            # Obter custos por modelo
            for model in self.model_costs.keys():
                model_cost = 0
                for i in range(days):
                    date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                    cost = float(self.redis_client.get(f'ai_cost:model_daily:{model}:{date}') or 0)
                    model_cost += cost
                
                if model_cost > 0:
                    analytics['model_costs'][model] = model_cost
            
            # Top modelos por custo
            analytics['top_models'] = sorted(
                analytics['model_costs'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
            
            # Calcular tendências
            if len(analytics['daily_costs']) >= 7:
                recent_week = sum(list(analytics['daily_costs'].values())[:7])
                previous_week = sum(list(analytics['daily_costs'].values())[7:14])
                
                if previous_week > 0:
                    trend = ((recent_week - previous_week) / previous_week) * 100
                    analytics['cost_trends']['weekly_change'] = trend
            
            return analytics
            
        except Exception as e:
            print(f"Erro ao obter analytics: {e}")
            return {}
    
    def get_user_usage_summary(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Obter resumo de uso do usuário"""
        try:
            summary = {
                'total_cost': 0,
                'total_requests': 0,
                'daily_usage': {},
                'model_usage': {},
                'plan': self.get_user_plan(user_id),
                'limits': self.plan_limits.get(self.get_user_plan(user_id), self.plan_limits['free'])
            }
            
            # Obter dados dos últimos N dias
            for i in range(days):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                daily_cost = float(self.redis_client.get(f'ai_cost:user_daily:{user_id}:{date}') or 0)
                daily_requests = int(self.redis_client.get(f'ai_requests:user_daily:{user_id}:{date}') or 0)
                
                summary['daily_usage'][date] = {
                    'cost': daily_cost,
                    'requests': daily_requests
                }
                summary['total_cost'] += daily_cost
                summary['total_requests'] += daily_requests
            
            # Obter uso atual do mês
            current_month = datetime.now().strftime('%Y-%m')
            summary['current_month_cost'] = float(
                self.redis_client.get(f'ai_cost:user_monthly:{user_id}:{current_month}') or 0
            )
            
            # Calcular porcentagem dos limites
            summary['usage_percentage'] = {
                'monthly_cost': (summary['current_month_cost'] / summary['limits']['monthly_cost']) * 100,
                'daily_requests': 0  # Será calculado no frontend para o dia atual
            }
            
            return summary
            
        except Exception as e:
            print(f"Erro ao obter resumo do usuário: {e}")
            return {}
    
    def set_cost_alert(self, alert_type: str, threshold: float, user_id: int = None):
        """Configurar alerta de custo personalizado"""
        alert_config = {
            'type': alert_type,
            'threshold': threshold,
            'user_id': user_id,
            'created_at': datetime.now().isoformat(),
            'active': True
        }
        
        alert_key = f'cost_alert:{alert_type}:{user_id or "global"}'
        self.redis_client.setex(alert_key, 86400 * 30, json.dumps(alert_config))
    
    def send_cost_alert(self, alert: Dict[str, Any]):
        """Enviar alerta de custo (integrar com sistema de notificações)"""
        print(f"🚨 ALERTA DE CUSTO: {alert['message']}")
        
        # Aqui você integraria com:
        # - Sistema de email
        # - Slack/Discord webhooks
        # - Dashboard de monitoramento
        # - Sistema de notificações push
    
    def optimize_model_selection(self, task_type: str, user_plan: str, 
                                quality_preference: str = 'balanced') -> str:
        """Otimizar seleção de modelo baseada em custo-benefício"""
        available_models = self.plan_limits[user_plan]['allowed_models']
        
        if available_models == 'all':
            available_models = list(self.model_costs.keys())
        
        # Filtrar por tipo de tarefa
        if task_type == 'text':
            text_models = [m for m in available_models if m in [
                'gemini-pro', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 
                'claude-3-sonnet', 'claude-3-haiku'
            ]]
            available_models = text_models
        
        if not available_models:
            return 'gemini-pro'  # Fallback
        
        # Otimizar baseado na preferência
        if quality_preference == 'cost_effective':
            # Escolher o mais barato
            return min(available_models, key=lambda m: self.model_costs[m])
        elif quality_preference == 'high_quality':
            # Escolher o melhor (assumindo que mais caro = melhor)
            return max(available_models, key=lambda m: self.model_costs[m])
        else:  # balanced
            # Escolher um meio termo
            costs = [(m, self.model_costs[m]) for m in available_models]
            costs.sort(key=lambda x: x[1])
            mid_index = len(costs) // 2
            return costs[mid_index][0]

# Instância global do monitor
cost_monitor = AICostMonitor()

# Funções para integração com as rotas
def record_ai_usage(user_id: int, model_name: str, tokens_used: int, 
                   request_type: str = 'text') -> Dict[str, Any]:
    """Registrar uso de IA"""
    return cost_monitor.record_ai_usage(user_id, model_name, tokens_used, request_type)

def check_user_can_use_ai(user_id: int, model_name: str) -> Dict[str, Any]:
    """Verificar se usuário pode usar IA"""
    return cost_monitor.can_user_use_model(user_id, model_name)

def get_cost_analytics(days: int = 30) -> Dict[str, Any]:
    """Obter análises de custo"""
    return cost_monitor.get_cost_analytics(days)

def get_user_usage_summary(user_id: int, days: int = 30) -> Dict[str, Any]:
    """Obter resumo de uso do usuário"""
    return cost_monitor.get_user_usage_summary(user_id, days)
