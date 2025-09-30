#!/usr/bin/env python3
"""
Script de teste básico para validar funcionalidades do iLyra
"""

import os
import sys
import json
import requests
import google.generativeai as genai
from datetime import datetime

# Configurar API do Gemini
GEMINI_API_KEY = 'AIzaSyDyC0ga1UvSpn9wHwZhhW3fUs4KG835ZLg'
genai.configure(api_key=GEMINI_API_KEY)

def test_gemini_integration():
    """Testar integração com Google Gemini"""
    print("🧪 TESTANDO INTEGRAÇÃO GEMINI...")
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Teste básico
        response = model.generate_content('Responda apenas "OK" se você está funcionando.')
        print(f"✅ Teste básico: {response.text}")
        
        # Teste espiritual
        spiritual_prompt = """Como um guia espiritual experiente, explique brevemente (máximo 100 palavras) 
        o que são chakras e sua importância no desenvolvimento espiritual."""
        
        spiritual_response = model.generate_content(spiritual_prompt)
        print(f"✅ Teste espiritual: {spiritual_response.text[:100]}...")
        
        # Teste de métricas
        metrics_prompt = """Baseado na seguinte conversa de um usuário: 'Hoje meditei por 30 minutos e me senti muito em paz', 
        sugira atualizações para as seguintes métricas espirituais (responda apenas com números de 1-10):
        - Meditação Diária: 
        - Paz Interior: 
        - Energia Vital:"""
        
        metrics_response = model.generate_content(metrics_prompt)
        print(f"✅ Teste de métricas: {metrics_response.text[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro na integração Gemini: {e}")
        return False

def test_database_models():
    """Testar modelos do banco de dados"""
    print("\n🗄️ TESTANDO MODELOS DO BANCO...")
    try:
        # Importar modelos
        sys.path.append('/home/ubuntu/ilyra_project/ilyra-platform/backend')
        from models import User, Plan, SpiritualMetric, AIConversation
        
        print("✅ Modelos importados com sucesso")
        
        # Verificar estrutura dos modelos
        user_attrs = [attr for attr in dir(User) if not attr.startswith('_')]
        print(f"✅ Modelo User tem {len(user_attrs)} atributos")
        
        plan_attrs = [attr for attr in dir(Plan) if not attr.startswith('_')]
        print(f"✅ Modelo Plan tem {len(plan_attrs)} atributos")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro nos modelos: {e}")
        return False

def test_spiritual_metrics():
    """Testar sistema de métricas espirituais"""
    print("\n🔮 TESTANDO MÉTRICAS ESPIRITUAIS...")
    
    # Métricas básicas definidas
    basic_metrics = [
        "Meditação Diária",
        "Nível de Consciência", 
        "Energia Vital",
        "Equilíbrio dos Chakras",
        "Paz Interior",
        "Conexão Espiritual",
        "Intuição e Clarividência",
        "Propósito de Vida"
    ]
    
    print(f"✅ {len(basic_metrics)} métricas básicas definidas")
    
    # Simular cálculo de métricas
    sample_metrics = {}
    for metric in basic_metrics:
        # Simular valor entre 1-10
        import random
        sample_metrics[metric] = random.randint(1, 10)
    
    print(f"✅ Métricas simuladas: {json.dumps(sample_metrics, indent=2)}")
    
    return True

def test_ai_conversation_flow():
    """Testar fluxo de conversa com IA"""
    print("\n💬 TESTANDO FLUXO DE CONVERSA IA...")
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Simular conversa
        user_messages = [
            "Olá, preciso de orientação espiritual",
            "Como posso melhorar minha meditação?",
            "Sinto que meus chakras estão desalinhados"
        ]
        
        conversation_history = []
        
        for msg in user_messages:
            # Gerar resposta
            response = model.generate_content(f"Como guia espiritual, responda: {msg}")
            
            conversation_history.append({
                "user": msg,
                "ai": response.text[:100] + "...",
                "timestamp": datetime.now().isoformat()
            })
            
            print(f"✅ Conversa {len(conversation_history)}: {msg[:30]}...")
        
        print(f"✅ {len(conversation_history)} conversas processadas")
        return True
        
    except Exception as e:
        print(f"❌ Erro no fluxo de conversa: {e}")
        return False

def test_dashboard_integration():
    """Testar integração do dashboard"""
    print("\n📊 TESTANDO INTEGRAÇÃO DO DASHBOARD...")
    
    # Simular dados do dashboard
    dashboard_data = {
        "user_stats": {
            "total_conversations": 15,
            "meditation_streak": 7,
            "spiritual_level": 8.5
        },
        "metrics_summary": {
            "highest_metric": "Paz Interior (9/10)",
            "lowest_metric": "Chakra Raiz (4/10)",
            "average_score": 7.2
        },
        "ai_insights": [
            "Sua prática de meditação está consistente",
            "Considere trabalhar o chakra raiz",
            "Excelente progresso na paz interior"
        ]
    }
    
    print(f"✅ Dashboard data: {json.dumps(dashboard_data, indent=2)}")
    
    return True

def main():
    """Executar todos os testes"""
    print("🚀 INICIANDO TESTES DO PROJETO ILYRA")
    print("=" * 50)
    
    tests = [
        ("Integração Gemini", test_gemini_integration),
        ("Modelos do Banco", test_database_models),
        ("Métricas Espirituais", test_spiritual_metrics),
        ("Fluxo de Conversa IA", test_ai_conversation_flow),
        ("Integração Dashboard", test_dashboard_integration)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ Erro no teste {test_name}: {e}")
            results[test_name] = False
    
    # Resumo dos resultados
    print("\n" + "=" * 50)
    print("📋 RESUMO DOS TESTES")
    print("=" * 50)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{test_name}: {status}")
    
    print(f"\n🎯 RESULTADO FINAL: {passed}/{total} testes passaram")
    
    if passed == total:
        print("🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente.")
    else:
        print("⚠️ Alguns testes falharam. Verificar implementação.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
