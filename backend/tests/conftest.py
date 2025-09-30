import pytest
import os
from app_integrated import create_app, db
from models import User, Plan

# Definir variáveis de ambiente de teste
os.environ["MERCADOPAGO_ACCESS_TOKEN"] = "TEST_MP_ACCESS_TOKEN"
os.environ["STRIPE_SECRET_KEY"] = "TEST_STRIPE_SECRET_KEY"
os.environ["STRIPE_WEBHOOK_SECRET"] = "TEST_STRIPE_WEBHOOK_SECRET"
os.environ["GEMINI_API_KEY"] = "TEST_GEMINI_API_KEY"
os.environ["FRONTEND_URL"] = "http://localhost:3000"

@pytest.fixture(scope='module')
def test_app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope='module')
def test_client(test_app):
    return test_app.test_client()

@pytest.fixture(scope='function')
def init_database(test_app):
    with test_app.app_context():
        db.create_all()
        # Create a test user
        user = User(username='testuser', email='test@example.com', password_hash='testpassword')
        db.session.add(user)
        # Create a test plan
        plan = Plan(name='Test Plan', price=10.0, features=['Feature 1'])
        db.session.add(plan)
        db.session.commit()
        yield db
        db.session.remove()
        db.drop_all()

